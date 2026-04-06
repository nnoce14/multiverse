/**
 * Integration tests for process-scoped provider lifecycle.
 *
 * These tests exercise the full process management path using real OS processes:
 *
 *   1. Derivation assigns distinct isolated state directories to different worktrees.
 *   2. Reset launches a real process and writes a PID file in the state directory.
 *   3. Two worktrees can run concurrent process instances without interference.
 *   4. Cleanup terminates the tracked process and removes the state directory.
 *   5. Cleanup of one worktree does not affect another worktree's process.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { deriveOne, resetOneResource, cleanupOneResource } from "@multiverse/core";
import { createProcessScopedProvider } from "@multiverse/provider-process-scoped";

// ---------------------------------------------------------------------------
// Shared provider configuration
// ---------------------------------------------------------------------------

const TEST_BASE_DIR = join(tmpdir(), "multiverse-integration-process-scoped");

const provider = createProcessScopedProvider({
  baseDir: TEST_BASE_DIR,
  command: ["node", "-e", "setTimeout(() => {}, 60000)"]
});

const providers = {
  resources: {
    "process-scoped": provider
  },
  endpoints: {}
};

const repository = {
  resources: [
    {
      name: "background-worker",
      provider: "process-scoped",
      isolationStrategy: "process-scoped" as const,
      scopedValidate: false,
      scopedReset: true,
      scopedCleanup: true
    }
  ],
  endpoints: []
};

// ---------------------------------------------------------------------------

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function readPid(stateDir: string): Promise<number | null> {
  const pidPath = join(stateDir, "pid");
  if (!existsSync(pidPath)) return null;
  try {
    const raw = await readFile(pidPath, "utf8");
    const pid = parseInt(raw.trim(), 10);
    return isNaN(pid) ? null : pid;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------

describe("process-scoped provider integration", () => {
  afterAll(async () => {
    // Ensure no leaked processes or state directories
    await rm(TEST_BASE_DIR, { recursive: true, force: true });
  });

  // -------------------------------------------------------------------------
  describe("derivation: isolated state directories", () => {
    it("two worktrees derive distinct state directories", () => {
      const resultA = deriveOne({ repository, worktree: { id: "ps-int-wt-a" }, providers });
      const resultB = deriveOne({ repository, worktree: { id: "ps-int-wt-b" }, providers });

      expect(resultA.ok).toBe(true);
      expect(resultB.ok).toBe(true);
      if (!resultA.ok || !resultB.ok) return;

      const handleA = resultA.resourcePlans[0].handle;
      const handleB = resultB.resourcePlans[0].handle;
      expect(handleA).not.toBe(handleB);
      expect(handleA).toContain("ps-int-wt-a");
      expect(handleB).toContain("ps-int-wt-b");
    });

    it("derivation is deterministic across calls", () => {
      const first = deriveOne({ repository, worktree: { id: "ps-int-det" }, providers });
      const second = deriveOne({ repository, worktree: { id: "ps-int-det" }, providers });

      expect(first.ok).toBe(true);
      expect(second.ok).toBe(true);
      if (!first.ok || !second.ok) return;

      expect(first.resourcePlans[0].handle).toBe(second.resourcePlans[0].handle);
    });
  });

  // -------------------------------------------------------------------------
  describe("lifecycle: reset and cleanup", () => {
    it("reset launches a process and writes a PID file in the state directory", async () => {
      const result = await resetOneResource({
        repository,
        worktree: { id: "ps-int-reset" },
        providers
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const [plan] = result.resourcePlans;
      const stateDir = plan.handle;

      const pid = await readPid(stateDir);
      expect(pid).not.toBeNull();
      expect(isProcessAlive(pid!)).toBe(true);

      // cleanup
      await cleanupOneResource({ repository, worktree: { id: "ps-int-reset" }, providers });
    });

    it("cleanup terminates the process and removes the state directory", async () => {
      await resetOneResource({ repository, worktree: { id: "ps-int-cleanup" }, providers });

      const deriveResult = deriveOne({ repository, worktree: { id: "ps-int-cleanup" }, providers });
      expect(deriveResult.ok).toBe(true);
      if (!deriveResult.ok) return;
      const stateDir = deriveResult.resourcePlans[0].handle;

      const pid = await readPid(stateDir);
      expect(pid).not.toBeNull();

      const cleanupResult = await cleanupOneResource({
        repository,
        worktree: { id: "ps-int-cleanup" },
        providers
      });
      expect(cleanupResult.ok).toBe(true);

      expect(isProcessAlive(pid!)).toBe(false);
      expect(existsSync(stateDir)).toBe(false);
    });

    it("cleanup is idempotent when no process was started", async () => {
      const result = await cleanupOneResource({
        repository,
        worktree: { id: "ps-int-idempotent" },
        providers
      });

      expect(result.ok).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  describe("isolation: concurrent worktree instances", () => {
    it("two worktrees can run processes simultaneously without interference", async () => {
      const resetA = await resetOneResource({
        repository,
        worktree: { id: "ps-int-iso-a" },
        providers
      });
      const resetB = await resetOneResource({
        repository,
        worktree: { id: "ps-int-iso-b" },
        providers
      });

      expect(resetA.ok).toBe(true);
      expect(resetB.ok).toBe(true);
      if (!resetA.ok || !resetB.ok) return;

      const stateDirA = resetA.resourcePlans[0].handle;
      const stateDirB = resetB.resourcePlans[0].handle;

      const pidA = await readPid(stateDirA);
      const pidB = await readPid(stateDirB);

      expect(pidA).not.toBeNull();
      expect(pidB).not.toBeNull();
      expect(pidA).not.toBe(pidB);
      expect(isProcessAlive(pidA!)).toBe(true);
      expect(isProcessAlive(pidB!)).toBe(true);

      // Cleanup A; B must remain running
      await cleanupOneResource({ repository, worktree: { id: "ps-int-iso-a" }, providers });

      expect(isProcessAlive(pidA!)).toBe(false);
      expect(existsSync(stateDirA)).toBe(false);

      expect(isProcessAlive(pidB!)).toBe(true);
      expect(existsSync(stateDirB)).toBe(true);

      // Cleanup B
      await cleanupOneResource({ repository, worktree: { id: "ps-int-iso-b" }, providers });
    });
  });
});
