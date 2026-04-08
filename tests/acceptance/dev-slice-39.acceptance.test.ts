import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { runCli } from "../../apps/cli/src/index";

/**
 * Acceptance tests for Slice 39: equals-form CLI argument parsing.
 *
 * Proving:
 * - --flag=value equals form works for --format and --worktree-id
 * - --flag value space form continues to work (no regression)
 */
describe("CLI equals-form argument parsing (Slice 39)", () => {
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

  const minimalConfig = {
    resources: [
      {
        name: "app-db",
        provider: "test-resource-provider",
        isolationStrategy: "name-scoped",
        scopedValidate: false,
        scopedReset: false,
        scopedCleanup: false
      }
    ],
    endpoints: []
  };

  async function makeConfig(): Promise<string> {
    const tempDir = await mkdtemp(path.join(tmpdir(), "multiverse-slice39-"));
    tempDirs.push(tempDir);
    const configPath = path.join(tempDir, "multiverse.json");
    await writeFile(configPath, JSON.stringify(minimalConfig));
    return configPath;
  }

  // --- --format=env equals form ---

  it("--format=env produces KEY=VALUE output (not JSON)", async () => {
    const configPath = await makeConfig();

    const outcome = await runCli([
      "derive",
      "--config", configPath,
      "--providers", providersModulePath,
      "--worktree-id", "test-wt",
      "--format=env"
    ]);

    expect(outcome.exitCode).toBe(0);
    // Should be KEY=VALUE lines, not a JSON object
    expect(outcome.stdout[0]).toMatch(/^MULTIVERSE_RESOURCE_/);
    expect(outcome.stdout[0]).not.toMatch(/^\{/);
  });

  it("--format json (space form) still produces JSON (no regression)", async () => {
    const configPath = await makeConfig();

    const outcome = await runCli([
      "derive",
      "--config", configPath,
      "--providers", providersModulePath,
      "--worktree-id", "test-wt",
      "--format", "json"
    ]);

    expect(outcome.exitCode).toBe(0);
    const parsed = JSON.parse(outcome.stdout[0]!) as { ok: boolean };
    expect(parsed.ok).toBe(true);
  });

  // --- --worktree-id=value equals form ---

  it("--worktree-id=X overrides auto-discovery when passed with equals form", async () => {
    const configPath = await makeConfig();
    const repoCwd = process.cwd(); // inside a git repo, auto-discovery would fire without explicit id

    const outcome = await runCli([
      "derive",
      "--config", configPath,
      "--providers", providersModulePath,
      "--worktree-id=explicit-equals-id"
    ], { cwd: repoCwd });

    expect(outcome.exitCode).toBe(0);
    const parsed = JSON.parse(outcome.stdout[0]!) as {
      ok: boolean;
      resourcePlans: Array<{ worktreeId: string }>;
    };
    expect(parsed.ok).toBe(true);
    expect(parsed.resourcePlans[0]?.worktreeId).toBe("explicit-equals-id");
  });

  it("--worktree-id value (space form) still overrides auto-discovery (no regression)", async () => {
    const configPath = await makeConfig();
    const repoCwd = process.cwd();

    const outcome = await runCli([
      "derive",
      "--config", configPath,
      "--providers", providersModulePath,
      "--worktree-id", "explicit-space-id"
    ], { cwd: repoCwd });

    expect(outcome.exitCode).toBe(0);
    const parsed = JSON.parse(outcome.stdout[0]!) as {
      ok: boolean;
      resourcePlans: Array<{ worktreeId: string }>;
    };
    expect(parsed.ok).toBe(true);
    expect(parsed.resourcePlans[0]?.worktreeId).toBe("explicit-space-id");
  });
});
