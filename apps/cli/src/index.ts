import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import {
  cleanupOneResource,
  deriveAndValidateOne,
  resetOneResource,
  deriveOne,
  validateRepositoryConfiguration,
  validateWorktreeIdentity
} from "@multiverse/core";
import type {
  DeriveOneResult,
  EndpointAppEnvValueKind,
  ProviderRegistry,
  RepositoryConfiguration
} from "@multiverse/provider-contracts";

export interface CliResult {
  exitCode: number;
  stdout: string[];
  stderr: string[];
}

export type ChildProcessRunner = (input: {
  cmd: string;
  args: string[];
  env: Record<string, string>;
}) => Promise<{ exitCode: number }>;

export interface RunCliOptions {
  cwd?: string;
  runner?: ChildProcessRunner;
  /** Override the parent environment used for conflict checks and env merging. Defaults to process.env. */
  parentEnv?: NodeJS.ProcessEnv;
}

function isCliResult(value: unknown): value is CliResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "exitCode" in value
  );
}

function success(value: unknown): CliResult {
  return {
    exitCode: 0,
    stdout: [JSON.stringify(value)],
    stderr: []
  };
}

function failure(value: unknown): CliResult {
  return {
    exitCode: 1,
    stdout: [JSON.stringify(value)],
    stderr: []
  };
}

function runFailure(value: unknown): CliResult {
  return {
    exitCode: 1,
    stdout: [],
    stderr: [JSON.stringify(value)]
  };
}

function toEnvKey(prefix: string, name: string): string {
  return `${prefix}_${name.toUpperCase().replace(/-/g, "_")}`;
}

function formatEnv(result: Extract<DeriveOneResult, { ok: true }>): CliResult {
  const lines: string[] = [];
  for (const plan of result.resourcePlans) {
    lines.push(`${toEnvKey("MULTIVERSE_RESOURCE", plan.resourceName)}=${plan.handle}`);
  }
  for (const mapping of result.endpointMappings) {
    lines.push(`${toEnvKey("MULTIVERSE_ENDPOINT", mapping.endpointName)}=${mapping.address}`);
  }
  return { exitCode: 0, stdout: lines, stderr: [] };
}

function buildRunEnv(
  worktreeId: string,
  result: Extract<DeriveOneResult, { ok: true }>
): Record<string, string> {
  const env: Record<string, string> = {};
  env["MULTIVERSE_WORKTREE_ID"] = worktreeId;
  for (const plan of result.resourcePlans) {
    env[toEnvKey("MULTIVERSE_RESOURCE", plan.resourceName)] = plan.handle;
  }
  for (const mapping of result.endpointMappings) {
    env[toEnvKey("MULTIVERSE_ENDPOINT", mapping.endpointName)] = mapping.address;
  }
  return env;
}

/**
 * Collect appEnv aliases declared in the raw repository configuration.
 * Correlates each declaration's appEnv name with the derived value from the derive result.
 * Returns a map of appEnv name → derived value.
 */
function extractEndpointAppEnvValue(
  address: string,
  kind: EndpointAppEnvValueKind
): string | undefined {
  if (kind === "url") {
    return address;
  }

  const parsed = new URL(address);
  if (parsed.port) {
    return parsed.port;
  }

  return undefined;
}

function collectAppEnvAliases(
  repository: RepositoryConfiguration,
  result: Extract<DeriveOneResult, { ok: true }>
): Record<string, string> | { refusal: { category: "invalid_configuration"; reason: string } } {
  const aliases: Record<string, string> = {};

  for (const resource of repository.resources) {
    if (!resource.appEnv || !resource.name) continue;
    const plan = result.resourcePlans.find((p) => p.resourceName === resource.name);
    if (plan) aliases[resource.appEnv] = plan.handle;
  }

  for (const endpoint of repository.endpoints) {
    if (!endpoint.appEnv || !endpoint.name) continue;
    const mapping = result.endpointMappings.find((m) => m.endpointName === endpoint.name);
    if (!mapping) continue;

    if (typeof endpoint.appEnv === "string") {
      aliases[endpoint.appEnv] = mapping.address;
      continue;
    }

    for (const [envName, kind] of Object.entries(endpoint.appEnv)) {
      const extracted = extractEndpointAppEnvValue(mapping.address, kind);
      if (extracted === undefined) {
        return {
          refusal: {
            category: "invalid_configuration",
            reason: `Cannot inject app-native env var "${envName}": endpoint value kind "${kind}" could not be extracted from derived endpoint "${mapping.address}".`
          }
        };
      }
      aliases[envName] = extracted;
    }
  }

  return aliases;
}

/**
 * Check whether any appEnv alias name already exists in the parent environment.
 * Returns the first conflicting name, or undefined if there are no conflicts.
 */
function findAppEnvConflict(
  aliases: Record<string, string>,
  parentEnv: NodeJS.ProcessEnv
): string | undefined {
  for (const name of Object.keys(aliases)) {
    if (name in parentEnv) return name;
  }
  return undefined;
}

const USAGE_LINES = [
  "Usage: multiverse <command> [options]",
  "",
  "Commands:",
  "  derive     [--config PATH] [--providers MODULE] [--worktree-id VALUE] [--format json|env]",
  "  validate   [--config PATH] [--providers MODULE] [--worktree-id VALUE]",
  "  reset      [--config PATH] [--providers MODULE] [--worktree-id VALUE]",
  "  cleanup    [--config PATH] [--providers MODULE] [--worktree-id VALUE]",
  "  run        [--config PATH] [--providers MODULE] [--worktree-id VALUE] -- <cmd> [args...]",
  "  validate-worktree    --worktree-id VALUE",
  "  validate-repository  --config PATH",
  "",
  "Options (derive, validate, reset, cleanup, run):",
  "  --config PATH        Repository configuration file (default: ./multiverse.json)",
  "  --providers MODULE   Providers module path (default: ./providers.ts)",
  "  --worktree-id VALUE  Worktree identity (auto-discovered from git state when omitted)",
];

function help(): CliResult {
  return { exitCode: 0, stdout: USAGE_LINES, stderr: [] };
}

function usage(message: string): CliResult {
  return {
    exitCode: 1,
    stdout: [],
    stderr: [message]
  };
}

function readOption(args: string[], name: string): string | undefined {
  // Support both "--flag value" (space form) and "--flag=value" (equals form).
  const equalsPrefix = `${name}=`;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === name) {
      return args[i + 1];
    }
    if (arg.startsWith(equalsPrefix)) {
      return arg.slice(equalsPrefix.length);
    }
  }
  return undefined;
}

function readRequiredOption(
  args: string[],
  name: string
): string | CliResult {
  const value = readOption(args, name);

  if (value === undefined) {
    return usage(`Missing required option ${name}`);
  }

  return value;
}

interface CommonOptions {
  configPath: string;
  worktreeId: string;
  providersModulePath: string;
}

type WorktreeDiscoveryResult = { id: string } | { error: string };

/**
 * Discover worktree identity from git state when --worktree-id is omitted.
 *
 * Algorithm (ADR-0021):
 * 1. Run `git worktree list --porcelain` from cwd.
 * 2. Parse blocks to find the worktree whose path is a prefix of cwd.
 * 3. All matched worktrees — primary checkout included — use path.basename of the worktree path.
 * 4. Any failure → return an error directing the caller to pass --worktree-id explicitly.
 */
function discoverWorktreeId(cwd: string): WorktreeDiscoveryResult {
  let output: string;
  try {
    output = execFileSync("git", ["worktree", "list", "--porcelain"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
  } catch {
    return {
      error:
        "Cannot determine worktree identity from git state: git is unavailable or this is not a git repository. Pass --worktree-id explicitly."
    };
  }

  // Parse porcelain output: blocks separated by blank lines, each starting with "worktree <path>".
  const blocks = output.trim().split(/\n\n+/);
  const worktrees: Array<{ path: string }> = [];

  for (const block of blocks) {
    if (!block) continue;
    const pathLine = block.split("\n").find((l) => l.startsWith("worktree "));
    if (!pathLine) continue;
    const worktreePath = pathLine.slice("worktree ".length).trim();
    worktrees.push({ path: worktreePath });
  }

  if (worktrees.length === 0) {
    return {
      error:
        "Cannot determine worktree identity from git state: no worktrees found. Pass --worktree-id explicitly."
    };
  }

  // Find the worktree whose path is a prefix of (or equal to) cwd — longest match wins.
  const normalizedCwd = path.normalize(cwd);
  let bestMatch: { path: string } | undefined;
  for (const wt of worktrees) {
    const normalizedWtPath = path.normalize(wt.path);
    if (
      normalizedCwd === normalizedWtPath ||
      normalizedCwd.startsWith(normalizedWtPath + path.sep)
    ) {
      if (!bestMatch || normalizedWtPath.length > path.normalize(bestMatch.path).length) {
        bestMatch = wt;
      }
    }
  }

  if (!bestMatch) {
    return {
      error:
        "Cannot determine worktree identity from git state: current directory is not within a known git worktree. Pass --worktree-id explicitly."
    };
  }

  // All worktrees — primary checkout and linked — use the path basename as the discovered id.
  const basename = path.basename(bestMatch.path);
  if (!basename) {
    return {
      error:
        "Cannot determine worktree identity from git state: worktree path basename is empty. Pass --worktree-id explicitly."
    };
  }

  return { id: basename };
}

function readCommonOptions(args: string[], cwd: string): CommonOptions | CliResult {
  const explicitWorktreeId = readOption(args, "--worktree-id");

  let worktreeId: string;
  if (explicitWorktreeId !== undefined) {
    worktreeId = explicitWorktreeId;
  } else {
    const discovery = discoverWorktreeId(cwd);
    if ("error" in discovery) {
      return usage(discovery.error);
    }
    worktreeId = discovery.id;
  }

  return {
    configPath: readOption(args, "--config") ?? path.resolve(cwd, "multiverse.json"),
    worktreeId,
    providersModulePath: readOption(args, "--providers") ?? path.resolve(cwd, "providers.ts")
  };
}

async function validateRepositoryFromFile(configPath: string): Promise<CliResult> {
  const parsed = await readRepositoryConfiguration(configPath);
  if (isCliResult(parsed)) return parsed;
  const result = validateRepositoryConfiguration(parsed);
  return result.ok ? success(result) : failure(result);
}

async function readRepositoryConfiguration(
  configPath: string
): Promise<RepositoryConfiguration | CliResult> {
  try {
    const raw = await readFile(configPath, "utf8");
    return JSON.parse(raw) as RepositoryConfiguration;
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return usage(`Cannot read config file: ${configPath}\n${detail}`);
  }
}

function isProviderRegistry(value: unknown): value is ProviderRegistry {
  return (
    typeof value === "object" &&
    value !== null &&
    "resources" in value &&
    "endpoints" in value &&
    typeof value.resources === "object" &&
    value.resources !== null &&
    typeof value.endpoints === "object" &&
    value.endpoints !== null
  );
}

function isTypeScriptModulePath(modulePath: string): boolean {
  const ext = path.extname(modulePath).toLowerCase();
  return ext === ".ts" || ext === ".mts" || ext === ".cts";
}

async function importTypeScriptModuleWithTsx(
  moduleUrl: string
): Promise<{ default?: unknown; providers?: unknown }> {
  const api = (await import("tsx/esm/api")) as {
    tsImport: (specifier: string, options: string | { parentURL: string }) => Promise<unknown>;
  };

  const loaded = await api.tsImport(moduleUrl, import.meta.url);
  return loaded as { default?: unknown; providers?: unknown };
}

async function loadProviderRegistry(
  providersModulePath: string
): Promise<ProviderRegistry | CliResult> {
  const resolvedModulePath = path.resolve(providersModulePath);
  const moduleUrl = pathToFileURL(resolvedModulePath).href;
  let moduleExports: { default?: unknown; providers?: unknown };

  try {
    moduleExports = (await import(moduleUrl)) as { default?: unknown; providers?: unknown };
  } catch (err) {
    if (isTypeScriptModulePath(resolvedModulePath)) {
      try {
        moduleExports = await importTypeScriptModuleWithTsx(moduleUrl);
      } catch (tsxErr) {
        const detail = tsxErr instanceof Error ? tsxErr.message : String(tsxErr);
        return usage(`Cannot load providers module: ${providersModulePath}\n${detail}`);
      }
    } else {
      const detail = err instanceof Error ? err.message : String(err);
      return usage(`Cannot load providers module: ${providersModulePath}\n${detail}`);
    }
  }

  const candidate = moduleExports.providers ?? moduleExports.default;

  if (!isProviderRegistry(candidate)) {
    return usage(
      'Providers module must export a ProviderRegistry as named export "providers" or default export'
    );
  }

  return candidate;
}

async function executeDeriveOperation(input: {
  configPath: string;
  worktreeId: string;
  providersModulePath: string;
}): Promise<DeriveOneResult | CliResult> {
  const parsed = await readRepositoryConfiguration(input.configPath);
  if (isCliResult(parsed)) return parsed;
  const providers = await loadProviderRegistry(input.providersModulePath);
  if (isCliResult(providers)) return providers;
  return deriveOne({ repository: parsed, worktree: { id: input.worktreeId }, providers });
}

async function validateFromFiles(input: {
  configPath: string;
  worktreeId: string;
  providersModulePath: string;
}): Promise<CliResult> {
  return executeOperationFromFiles({
    ...input,
    operation: deriveAndValidateOne
  });
}

async function resetFromFiles(input: {
  configPath: string;
  worktreeId: string;
  providersModulePath: string;
}): Promise<CliResult> {
  return executeOperationFromFiles({
    ...input,
    operation: resetOneResource
  });
}

async function cleanupFromFiles(input: {
  configPath: string;
  worktreeId: string;
  providersModulePath: string;
}): Promise<CliResult> {
  return executeOperationFromFiles({
    ...input,
    operation: cleanupOneResource
  });
}

async function executeOperationFromFiles(input: {
  configPath: string;
  worktreeId: string;
  providersModulePath: string;
  operation: (input: {
    repository: RepositoryConfiguration;
    worktree: {
      id: string;
    };
    providers: ProviderRegistry;
  }) => { ok: boolean } | Promise<{ ok: boolean }>;
}): Promise<CliResult> {
  const parsed = await readRepositoryConfiguration(input.configPath);
  if (isCliResult(parsed)) return parsed;
  const providers = await loadProviderRegistry(input.providersModulePath);

  if ("exitCode" in providers) {
    return providers;
  }

  const result = await Promise.resolve(
    input.operation({
      repository: parsed,
      worktree: {
        id: input.worktreeId
      },
      providers
    })
  );

  return result.ok ? success(result) : failure(result);
}

async function defaultChildProcessRunner(input: {
  cmd: string;
  args: string[];
  env: Record<string, string>;
}): Promise<{ exitCode: number }> {
  const { spawn } = await import("node:child_process");
  return new Promise((resolve) => {
    const child = spawn(input.cmd, input.args, {
      env: { ...process.env, ...input.env },
      stdio: "inherit"
    });
    child.on("close", (code) => resolve({ exitCode: code ?? 1 }));
  });
}

async function handleValidateWorktree(args: string[]): Promise<CliResult> {
  const worktreeId = readRequiredOption(args, "--worktree-id");
  if (isCliResult(worktreeId)) {
    return worktreeId;
  }

  const result = validateWorktreeIdentity({
    worktreeId
  });

  return result.ok ? success(result) : failure(result);
}

async function handleValidateRepository(args: string[]): Promise<CliResult> {
  const configPath = readRequiredOption(args, "--config");
  if (isCliResult(configPath)) {
    return configPath;
  }

  return validateRepositoryFromFile(configPath);
}

async function handleDerive(args: string[], cwd: string): Promise<CliResult> {
  const opts = readCommonOptions(args, cwd);
  if (isCliResult(opts)) return opts;

  const format = readOption(args, "--format") ?? "json";
  if (format !== "json" && format !== "env") {
    return usage(`Unknown --format value "${format}". Supported values: json, env`);
  }

  const result = await executeDeriveOperation(opts);
  if (isCliResult(result)) return result;

  if (!result.ok) return failure(result);
  if (format === "env") return formatEnv(result);
  return success(result);
}

async function handleValidate(args: string[], cwd: string): Promise<CliResult> {
  const opts = readCommonOptions(args, cwd);
  if (isCliResult(opts)) return opts;
  return validateFromFiles(opts);
}

async function handleReset(args: string[], cwd: string): Promise<CliResult> {
  const opts = readCommonOptions(args, cwd);
  if (isCliResult(opts)) return opts;
  return resetFromFiles(opts);
}

async function handleCleanup(args: string[], cwd: string): Promise<CliResult> {
  const opts = readCommonOptions(args, cwd);
  if (isCliResult(opts)) return opts;
  return cleanupFromFiles(opts);
}

async function handleRun(
  args: string[],
  cwd: string,
  runner: ChildProcessRunner,
  parentEnv: NodeJS.ProcessEnv
): Promise<CliResult> {
  const opts = readCommonOptions(args, cwd);
  if (isCliResult(opts)) return opts;

  const { configPath, worktreeId, providersModulePath } = opts;
  const separatorIndex = args.indexOf("--");
  if (separatorIndex === -1) {
    return usage('Missing -- separator. Usage: multiverse run [options] -- <cmd> [args...]');
  }

  const childArgs = args.slice(separatorIndex + 1);
  if (childArgs.length === 0) {
    return usage('No command provided after --. Usage: multiverse run [options] -- <cmd> [args...]');
  }

  const [cmd, ...restArgs] = childArgs as [string, ...string[]];

  // Read raw config explicitly — needed for appEnv alias lookup after derivation.
  const parsedConfig = await readRepositoryConfiguration(configPath);
  if (isCliResult(parsedConfig)) return parsedConfig;

  const providers = await loadProviderRegistry(providersModulePath);
  if (isCliResult(providers)) return providers;

  const deriveResult = deriveOne({
    repository: parsedConfig,
    worktree: { id: worktreeId },
    providers
  });

  if (!deriveResult.ok) return runFailure(deriveResult);

  // Build canonical MULTIVERSE_* env vars.
  const multiverseEnv = buildRunEnv(worktreeId, deriveResult);

  // Collect appEnv aliases declared in the repository configuration.
  const appEnvAliases = collectAppEnvAliases(parsedConfig, deriveResult);
  if ("refusal" in appEnvAliases) {
    return runFailure({
      ok: false,
      refusal: appEnvAliases.refusal
    });
  }

  // Refuse if any appEnv name already exists in the parent environment.
  const conflict = findAppEnvConflict(appEnvAliases, parentEnv);
  if (conflict !== undefined) {
    return runFailure({
      ok: false,
      refusal: {
        category: "invalid_configuration",
        reason: `Cannot inject app-native env var "${conflict}": it already exists in the parent environment. Multiverse will not silently override existing environment variables.`
      }
    });
  }

  // Build merged env: parent → canonical MULTIVERSE_* → appEnv aliases.
  const mergedEnv: Record<string, string> = {};
  for (const [k, v] of Object.entries(parentEnv)) {
    if (v !== undefined) mergedEnv[k] = v;
  }
  Object.assign(mergedEnv, multiverseEnv);
  Object.assign(mergedEnv, appEnvAliases);

  const { exitCode } = await runner({ cmd, args: restArgs, env: mergedEnv });
  return { exitCode, stdout: [], stderr: [] };
}

export async function runCli(args: string[], options: RunCliOptions = {}): Promise<CliResult> {
  const cwd = options.cwd ?? process.cwd();
  const runner = options.runner ?? defaultChildProcessRunner;
  const parentEnv = options.parentEnv ?? process.env;
  const [command] = args;

  if (command === "--help" || command === "-h") {
    return help();
  }

  if (command === "validate-worktree") {
    return handleValidateWorktree(args);
  }

  if (command === "validate-repository") {
    return handleValidateRepository(args);
  }

  if (command === "derive") {
    return handleDerive(args, cwd);
  }

  if (command === "validate") {
    return handleValidate(args, cwd);
  }

  if (command === "reset") {
    return handleReset(args, cwd);
  }

  if (command === "cleanup") {
    return handleCleanup(args, cwd);
  }

  if (command === "run") {
    return handleRun(args, cwd, runner, parentEnv);
  }

  return { exitCode: 1, stdout: [], stderr: USAGE_LINES };
}

export async function main(): Promise<void> {
  const result = await runCli(process.argv.slice(2));

  for (const line of result.stdout) {
    process.stdout.write(`${line}\n`);
  }

  for (const line of result.stderr) {
    process.stderr.write(`${line}\n`);
  }

  process.exitCode = result.exitCode;
}

const isMainModule =
  process.argv[1] !== undefined &&
  import.meta.url === new URL(`file://${process.argv[1]}`).href;

if (isMainModule) {
  await main();
}
