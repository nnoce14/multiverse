/**
 * CLI error surfacing acceptance tests.
 *
 * Verifies that actionable underlying error details reach the user when
 * provider module load or config file read fails. A second author following
 * the provider authoring guide needs more than an opaque file-path echo
 * to diagnose and fix their own mistakes.
 */
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runCli } from "../../apps/cli/src/index";

describe("CLI error surfacing", () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(
      tempDirs.map((dir) => rm(dir, { recursive: true, force: true }))
    );
    tempDirs.length = 0;
  });

  async function writeTempFile(name: string, content: string): Promise<string> {
    const tempDir = await mkdtemp(path.join(tmpdir(), "multiverse-error-test-"));
    tempDirs.push(tempDir);
    const filePath = path.join(tempDir, name);
    await writeFile(filePath, content);
    return filePath;
  }

  describe("providers module load failure", () => {
    it("includes the underlying error when the providers module path does not exist", async () => {
      const configPath = await writeTempFile(
        "multiverse.json",
        JSON.stringify({
          resources: [],
          endpoints: []
        })
      );

      const outcome = await runCli([
        "derive",
        "--config",
        configPath,
        "--worktree-id",
        "wt-error-test",
        "--providers",
        "/tmp/does-not-exist-multiverse-providers.ts"
      ]);

      expect(outcome.exitCode).toBe(1);
      expect(outcome.stdout).toEqual([]);
      // The file path is present (existing behavior)
      expect(outcome.stderr[0]).toMatch(/does-not-exist-multiverse-providers/);
      // The underlying Node.js error is also present (new behavior)
      expect(outcome.stderr[0]).toMatch(/ENOENT|Cannot find module|not found/i);
    });
  });

  describe("config file read failure", () => {
    it("includes the underlying error when the config file contains invalid JSON", async () => {
      const configPath = await writeTempFile(
        "multiverse.json",
        "{ this is not valid json }"
      );

      const outcome = await runCli([
        "derive",
        "--config",
        configPath,
        "--worktree-id",
        "wt-error-test",
        "--providers",
        "/tmp/placeholder-providers.ts"
      ]);

      expect(outcome.exitCode).toBe(1);
      expect(outcome.stdout).toEqual([]);
      // The file path is present (existing behavior)
      expect(outcome.stderr[0]).toMatch(/multiverse\.json/);
      // The underlying JSON parse error is also present (new behavior)
      expect(outcome.stderr[0]).toMatch(/JSON|Unexpected token|invalid/i);
    });
  });
});
