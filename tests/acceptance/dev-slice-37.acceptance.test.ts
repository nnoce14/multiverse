import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { runCli } from "../../apps/cli/src/index";

/**
 * Acceptance tests for ADR-0021: git-worktree-path conventional default for --worktree-id.
 *
 * Proving:
 * - automatic worktree-id discovery from git state when --worktree-id is omitted
 * - explicit --worktree-id always overrides discovery
 * - refusal with actionable message when discovery cannot safely resolve
 */
describe("worktree-id auto-discovery (ADR-0021)", () => {
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

  async function makeTempConfigFile(config: unknown = minimalConfig): Promise<string> {
    const tempDir = await mkdtemp(path.join(tmpdir(), "multiverse-slice37-"));
    tempDirs.push(tempDir);
    const configPath = path.join(tempDir, "multiverse.json");
    await writeFile(configPath, JSON.stringify(config));
    return configPath;
  }

  // --- Auto-discovery success ---

  it("discovers worktree id from git state when --worktree-id is omitted (main checkout → 'main')", async () => {
    // The test suite runs from the multiverse repo root, which is the main checkout.
    // ADR-0021: main checkout resolves to the reserved identity "main" (ADR-0003).
    const configPath = await makeTempConfigFile();
    const repoCwd = process.cwd(); // multiverse repo root = main worktree

    const outcome = await runCli(
      ["derive", "--config", configPath, "--providers", providersModulePath],
      { cwd: repoCwd }
    );

    expect(outcome.exitCode).toBe(0);
    const parsed = JSON.parse(outcome.stdout[0]!) as { ok: boolean; resourcePlans: Array<{ worktreeId: string }> };
    expect(parsed.ok).toBe(true);
    expect(parsed.resourcePlans[0]?.worktreeId).toBe("main");
  });

  // --- Explicit override ---

  it("uses explicit --worktree-id and does not attempt discovery", async () => {
    const configPath = await makeTempConfigFile();
    const repoCwd = process.cwd();

    const outcome = await runCli(
      ["derive", "--config", configPath, "--providers", providersModulePath, "--worktree-id", "explicit-id"],
      { cwd: repoCwd }
    );

    expect(outcome.exitCode).toBe(0);
    const parsed = JSON.parse(outcome.stdout[0]!) as { ok: boolean; resourcePlans: Array<{ worktreeId: string }> };
    expect(parsed.ok).toBe(true);
    expect(parsed.resourcePlans[0]?.worktreeId).toBe("explicit-id");
  });

  // --- Discovery refusal ---

  it("refuses with actionable message when cwd is not inside a git worktree", async () => {
    const configPath = await makeTempConfigFile();
    // Use a temp directory that is not inside any git repository.
    const outsideGitDir = path.dirname(configPath); // temp dir in /tmp — not a git repo

    const outcome = await runCli(
      ["derive", "--config", configPath, "--providers", providersModulePath],
      { cwd: outsideGitDir }
    );

    expect(outcome.exitCode).toBe(1);
    const errorOutput = outcome.stderr.join("\n");
    expect(errorOutput).toMatch(/--worktree-id/);
  });
});
