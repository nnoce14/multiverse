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
  ProviderRegistry,
  RepositoryConfiguration
} from "@multiverse/provider-contracts";

export interface CliResult {
  exitCode: number;
  stdout: string[];
  stderr: string[];
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

function usage(message: string): CliResult {
  return {
    exitCode: 1,
    stdout: [],
    stderr: [message]
  };
}

function readOption(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
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

async function validateRepositoryFromFile(configPath: string): Promise<CliResult> {
  const parsed = await readRepositoryConfiguration(configPath);
  const result = validateRepositoryConfiguration(parsed);

  return result.ok ? success(result) : failure(result);
}

async function readRepositoryConfiguration(
  configPath: string
): Promise<RepositoryConfiguration> {
  const raw = await readFile(configPath, "utf8");
  return JSON.parse(raw) as RepositoryConfiguration;
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

async function loadProviderRegistry(
  providersModulePath: string
): Promise<ProviderRegistry | CliResult> {
  const moduleUrl = pathToFileURL(path.resolve(providersModulePath)).href;
  const moduleExports = (await import(moduleUrl)) as {
    default?: unknown;
    providers?: unknown;
  };
  const candidate = moduleExports.providers ?? moduleExports.default;

  if (!isProviderRegistry(candidate)) {
    return usage(
      'Providers module must export a ProviderRegistry as named export "providers" or default export'
    );
  }

  return candidate;
}

async function deriveFromFiles(input: {
  configPath: string;
  worktreeId: string;
  providersModulePath: string;
}): Promise<CliResult> {
  return executeOperationFromFiles({
    ...input,
    operation: deriveOne
  });
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

async function handleDerive(args: string[]): Promise<CliResult> {
  const configPath = readRequiredOption(args, "--config");
  if (isCliResult(configPath)) {
    return configPath;
  }

  const worktreeId = readRequiredOption(args, "--worktree-id");
  if (isCliResult(worktreeId)) {
    return worktreeId;
  }

  const providersModulePath = readRequiredOption(args, "--providers");
  if (isCliResult(providersModulePath)) {
    return providersModulePath;
  }

  return deriveFromFiles({
    configPath,
    worktreeId,
    providersModulePath
  });
}

async function handleValidate(args: string[]): Promise<CliResult> {
  const configPath = readRequiredOption(args, "--config");
  if (isCliResult(configPath)) {
    return configPath;
  }

  const worktreeId = readRequiredOption(args, "--worktree-id");
  if (isCliResult(worktreeId)) {
    return worktreeId;
  }

  const providersModulePath = readRequiredOption(args, "--providers");
  if (isCliResult(providersModulePath)) {
    return providersModulePath;
  }

  return validateFromFiles({
    configPath,
    worktreeId,
    providersModulePath
  });
}

async function handleReset(args: string[]): Promise<CliResult> {
  const configPath = readRequiredOption(args, "--config");
  if (isCliResult(configPath)) {
    return configPath;
  }

  const worktreeId = readRequiredOption(args, "--worktree-id");
  if (isCliResult(worktreeId)) {
    return worktreeId;
  }

  const providersModulePath = readRequiredOption(args, "--providers");
  if (isCliResult(providersModulePath)) {
    return providersModulePath;
  }

  return resetFromFiles({
    configPath,
    worktreeId,
    providersModulePath
  });
}

async function handleCleanup(args: string[]): Promise<CliResult> {
  const configPath = readRequiredOption(args, "--config");
  if (isCliResult(configPath)) {
    return configPath;
  }

  const worktreeId = readRequiredOption(args, "--worktree-id");
  if (isCliResult(worktreeId)) {
    return worktreeId;
  }

  const providersModulePath = readRequiredOption(args, "--providers");
  if (isCliResult(providersModulePath)) {
    return providersModulePath;
  }

  return cleanupFromFiles({
    configPath,
    worktreeId,
    providersModulePath
  });
}

export async function runCli(args: string[]): Promise<CliResult> {
  const [command] = args;

  if (command === "validate-worktree") {
    return handleValidateWorktree(args);
  }

  if (command === "validate-repository") {
    return handleValidateRepository(args);
  }

  if (command === "derive") {
    return handleDerive(args);
  }

  if (command === "validate") {
    return handleValidate(args);
  }

  if (command === "reset") {
    return handleReset(args);
  }

  if (command === "cleanup") {
    return handleCleanup(args);
  }

  return usage(
    "Usage: multiverse <validate-worktree --worktree-id VALUE | validate-repository --config PATH | derive --config PATH --worktree-id VALUE --providers MODULE | validate --config PATH --worktree-id VALUE --providers MODULE | reset --config PATH --worktree-id VALUE --providers MODULE | cleanup --config PATH --worktree-id VALUE --providers MODULE>"
  );
}

async function main(): Promise<void> {
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
