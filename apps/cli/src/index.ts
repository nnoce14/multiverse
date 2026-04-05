import { readFile } from "node:fs/promises";
import process from "node:process";

import {
  validateRepositoryConfiguration,
  validateWorktreeIdentity
} from "@multiverse/core";
import type { RepositoryConfiguration } from "@multiverse/provider-contracts";

export interface CliResult {
  exitCode: number;
  stdout: string[];
  stderr: string[];
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

async function validateRepositoryFromFile(configPath: string): Promise<CliResult> {
  const raw = await readFile(configPath, "utf8");
  const parsed = JSON.parse(raw) as RepositoryConfiguration;
  const result = validateRepositoryConfiguration(parsed);

  return result.ok ? success(result) : failure(result);
}

export async function runCli(args: string[]): Promise<CliResult> {
  const [command] = args;

  if (command === "validate-worktree") {
    const worktreeId = readOption(args, "--worktree-id");

    if (worktreeId === undefined) {
      return usage("Missing required option --worktree-id");
    }

    const result = validateWorktreeIdentity({
      worktreeId
    });

    return result.ok ? success(result) : failure(result);
  }

  if (command === "validate-repository") {
    const configPath = readOption(args, "--config");

    if (configPath === undefined) {
      return usage("Missing required option --config");
    }

    return validateRepositoryFromFile(configPath);
  }

  return usage(
    "Usage: multiverse <validate-worktree --worktree-id VALUE | validate-repository --config PATH>"
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
