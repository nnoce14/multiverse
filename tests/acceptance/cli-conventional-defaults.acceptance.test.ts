import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { runCli } from "../../apps/cli/src/index";

describe("CLI conventional defaults", () => {
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

  const deriveConfig = {
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

  const resetConfig = {
    resources: [
      {
        name: "primary-db",
        provider: "test-resource-provider-with-reset",
        isolationStrategy: "name-scoped",
        scopedValidate: false,
        scopedReset: true,
        scopedCleanup: false
      }
    ],
    endpoints: []
  };

  const cleanupConfig = {
    resources: [
      {
        name: "primary-db",
        provider: "test-resource-provider-with-cleanup",
        isolationStrategy: "name-scoped",
        scopedValidate: false,
        scopedReset: false,
        scopedCleanup: true
      }
    ],
    endpoints: []
  };

  async function makeCwdWithConfig(config: unknown = deriveConfig): Promise<string> {
    const tempDir = await mkdtemp(path.join(tmpdir(), "multiverse-defaults-"));
    tempDirs.push(tempDir);
    await writeFile(path.join(tempDir, "multiverse.json"), JSON.stringify(config));
    return tempDir;
  }

  // --- --config default ---

  it("uses ./multiverse.json when --config is omitted from derive", async () => {
    const cwd = await makeCwdWithConfig();

    const outcome = await runCli(
      ["derive", "--providers", providersModulePath, "--worktree-id", "wt-cfg-default"],
      { cwd }
    );

    expect(outcome.exitCode).toBe(0);
    const parsed = JSON.parse(outcome.stdout[0]!);
    expect(parsed.ok).toBe(true);
    expect(parsed.resourcePlans).toHaveLength(1);
  });

  it("uses ./multiverse.json when --config is omitted from validate", async () => {
    const cwd = await makeCwdWithConfig();

    const outcome = await runCli(
      ["validate", "--providers", providersModulePath, "--worktree-id", "wt-validate-default"],
      { cwd }
    );

    expect(outcome.exitCode).toBe(0);
  });

  it("uses ./multiverse.json when --config is omitted from reset", async () => {
    const cwd = await makeCwdWithConfig(resetConfig);

    const outcome = await runCli(
      ["reset", "--providers", providersModulePath, "--worktree-id", "wt-reset-default"],
      { cwd }
    );

    expect(outcome.exitCode).toBe(0);
  });

  it("uses ./multiverse.json when --config is omitted from cleanup", async () => {
    const cwd = await makeCwdWithConfig(cleanupConfig);

    const outcome = await runCli(
      ["cleanup", "--providers", providersModulePath, "--worktree-id", "wt-cleanup-default"],
      { cwd }
    );

    expect(outcome.exitCode).toBe(0);
  });

  // --- --providers default: verify it no longer triggers "Missing required option" ---

  it("does not return 'Missing required option --providers' when --providers is omitted", async () => {
    const cwd = await makeCwdWithConfig();

    const outcome = await runCli(
      ["derive", "--worktree-id", "wt-providers-default"],
      { cwd }
    );

    // The error should be about loading the module, not about a missing required option
    expect(outcome.stderr).not.toContain("Missing required option --providers");
    // It should still fail since ./providers.ts doesn't exist in tempDir
    expect(outcome.exitCode).toBe(1);
  });

  // --- --worktree-id stays required ---

  it("returns error for missing --worktree-id even when config and providers have defaults", async () => {
    const cwd = await makeCwdWithConfig();

    const outcome = await runCli(
      ["derive", "--providers", providersModulePath],
      { cwd }
    );

    expect(outcome.exitCode).toBe(1);
    expect(outcome.stderr[0]).toMatch(/--worktree-id/);
  });

  // --- run command also uses defaults ---

  it("uses ./multiverse.json when --config is omitted from run", async () => {
    const cwd = await makeCwdWithConfig();

    const outcome = await runCli(
      ["run", "--providers", providersModulePath, "--worktree-id", "wt-run-default", "--", "node", "-e", "process.exit(0)"],
      { cwd, runner: async () => ({ exitCode: 0 }) }
    );

    expect(outcome.exitCode).toBe(0);
  });
});
