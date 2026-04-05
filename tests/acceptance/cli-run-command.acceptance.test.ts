import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { runCli, type ChildProcessRunner } from "../../apps/cli/src/index";

describe("CLI run command", () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(
      tempDirs.map((dir) => rm(dir, { recursive: true, force: true }))
    );
    tempDirs.length = 0;
  });

  const providersModulePath = fileURLToPath(
    new URL("./fixtures/explicit-test-providers.ts", import.meta.url)
  );

  async function writeRepositoryConfig(config: unknown): Promise<string> {
    const tempDir = await mkdtemp(path.join(tmpdir(), "multiverse-cli-run-"));
    tempDirs.push(tempDir);
    const configPath = path.join(tempDir, "repository.json");
    await writeFile(configPath, JSON.stringify(config));
    return configPath;
  }

  const baseConfig = {
    resources: [
      {
        name: "primary-db",
        provider: "test-resource-provider",
        isolationStrategy: "name-scoped",
        scopedValidate: false,
        scopedReset: false,
        scopedCleanup: false
      }
    ],
    endpoints: [
      {
        name: "app-base-url",
        role: "application-base-url",
        provider: "test-endpoint-provider"
      }
    ]
  };

  it("injects MULTIVERSE_RESOURCE_* and MULTIVERSE_ENDPOINT_* env vars into the child process", async () => {
    const configPath = await writeRepositoryConfig(baseConfig);
    const capturedEnv: Record<string, string> = {};

    const runner: ChildProcessRunner = async ({ env }) => {
      Object.assign(capturedEnv, env);
      return { exitCode: 0 };
    };

    const outcome = await runCli(
      ["run", "--config", configPath, "--providers", providersModulePath, "--worktree-id", "wt-run-test", "--", "node", "-e", "process.exit(0)"],
      { runner }
    );

    expect(outcome.exitCode).toBe(0);
    expect(capturedEnv["MULTIVERSE_WORKTREE_ID"]).toBe("wt-run-test");
    expect(capturedEnv["MULTIVERSE_RESOURCE_PRIMARY_DB"]).toBe("primary-db--wt-run-test");
    expect(capturedEnv["MULTIVERSE_ENDPOINT_APP_BASE_URL"]).toBe("http://wt-run-test.local/app-base-url");
  });

  it("propagates the child process exit code", async () => {
    const configPath = await writeRepositoryConfig(baseConfig);

    const runner: ChildProcessRunner = async () => ({ exitCode: 42 });

    const outcome = await runCli(
      ["run", "--config", configPath, "--providers", providersModulePath, "--worktree-id", "wt-exit-code", "--", "node", "-e", "process.exit(42)"],
      { runner }
    );

    expect(outcome.exitCode).toBe(42);
    expect(outcome.stdout).toEqual([]);
    expect(outcome.stderr).toEqual([]);
  });

  it("emits refusal JSON to stderr and exits non-zero when derive fails, child is never started", async () => {
    const configPath = await writeRepositoryConfig(baseConfig);
    let runnerCalled = false;

    const runner: ChildProcessRunner = async () => {
      runnerCalled = true;
      return { exitCode: 0 };
    };

    const outcome = await runCli(
      ["run", "--config", configPath, "--providers", providersModulePath, "--worktree-id", "", "--", "node", "-e", "process.exit(0)"],
      { runner }
    );

    expect(outcome.exitCode).toBe(1);
    expect(outcome.stdout).toEqual([]);
    expect(outcome.stderr).toHaveLength(1);
    const parsed = JSON.parse(outcome.stderr[0]!);
    expect(parsed.ok).toBe(false);
    expect(parsed.refusal).toBeDefined();
    expect(runnerCalled).toBe(false);
  });

  it("returns usage error when no command is provided after --", async () => {
    const configPath = await writeRepositoryConfig(baseConfig);

    const outcome = await runCli(
      ["run", "--config", configPath, "--providers", providersModulePath, "--worktree-id", "wt-no-cmd", "--"],
      { runner: async () => ({ exitCode: 0 }) }
    );

    expect(outcome.exitCode).toBe(1);
    expect(outcome.stdout).toEqual([]);
    expect(outcome.stderr[0]).toMatch(/command/i);
  });

  it("returns usage error when -- separator is absent", async () => {
    const configPath = await writeRepositoryConfig(baseConfig);

    const outcome = await runCli(
      ["run", "--config", configPath, "--providers", providersModulePath, "--worktree-id", "wt-no-sep"],
      { runner: async () => ({ exitCode: 0 }) }
    );

    expect(outcome.exitCode).toBe(1);
    expect(outcome.stdout).toEqual([]);
    expect(outcome.stderr[0]).toMatch(/--/);
  });

  it("merges derived env vars into the parent environment for the child", async () => {
    const configPath = await writeRepositoryConfig(baseConfig);
    let childEnv: Record<string, string> = {};

    const runner: ChildProcessRunner = async ({ env }) => {
      childEnv = { ...env };
      return { exitCode: 0 };
    };

    const outcome = await runCli(
      ["run", "--config", configPath, "--providers", providersModulePath, "--worktree-id", "wt-env-merge", "--", "node"],
      { runner }
    );

    expect(outcome.exitCode).toBe(0);
    // MULTIVERSE vars are present
    expect(childEnv["MULTIVERSE_WORKTREE_ID"]).toBe("wt-env-merge");
    // PATH from parent env should also be present (merge, not replace)
    expect(childEnv["PATH"]).toBeDefined();
  });
});
