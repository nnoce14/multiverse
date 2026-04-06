import { describe, it, expect, afterEach } from "vitest";
import { mkdtemp, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resetOneResource, cleanupOneResource } from "@multiverse/core";
import { createProcessScopedProvider } from "@multiverse/provider-process-scoped";

const tmpDirs: string[] = [];

async function makeTmpDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "mv-slice22-"));
  tmpDirs.push(dir);
  return dir;
}

afterEach(async () => {
  // best-effort cleanup of any leftover state dirs from this test
  const { rm } = await import("node:fs/promises");
  for (const dir of tmpDirs.splice(0)) {
    await rm(dir, { recursive: true, force: true });
  }
});

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

describe("dev-slice-22: process-scoped provider lifecycle", () => {
  it("reset launches the declared process and writes a PID file", async () => {
    const baseDir = await makeTmpDir();
    const provider = createProcessScopedProvider({
      baseDir,
      command: ["node", "-e", "setTimeout(() => {}, 60000)"]
    });

    const repository = {
      resources: [
        {
          name: "cache",
          provider: "process-scoped",
          isolationStrategy: "process-scoped" as const,
          scopedValidate: false,
          scopedReset: true,
          scopedCleanup: true
        }
      ],
      endpoints: []
    };

    const result = await resetOneResource({
      repository,
      worktree: { id: "feature-login" },
      providers: { resources: { "process-scoped": provider }, endpoints: {} }
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const [plan] = result.resourcePlans;
    const stateDir = plan.handle;
    expect(stateDir).toBe(join(baseDir, "cache", "feature-login") + "/");

    const pid = await readPid(stateDir);
    expect(pid).not.toBeNull();
    expect(isProcessAlive(pid!)).toBe(true);

    // cleanup after test
    await cleanupOneResource({
      repository,
      worktree: { id: "feature-login" },
      providers: { resources: { "process-scoped": provider }, endpoints: {} }
    });
  });

  it("cleanup terminates the process and removes the state directory", async () => {
    const baseDir = await makeTmpDir();
    const provider = createProcessScopedProvider({
      baseDir,
      command: ["node", "-e", "setTimeout(() => {}, 60000)"]
    });

    const repository = {
      resources: [
        {
          name: "cache",
          provider: "process-scoped",
          isolationStrategy: "process-scoped" as const,
          scopedValidate: false,
          scopedReset: true,
          scopedCleanup: true
        }
      ],
      endpoints: []
    };

    const providers = { resources: { "process-scoped": provider }, endpoints: {} };

    const resetResult = await resetOneResource({ repository, worktree: { id: "feature-login" }, providers });
    expect(resetResult.ok).toBe(true);
    if (!resetResult.ok) return;

    const [plan] = resetResult.resourcePlans;
    const stateDir = plan.handle;
    const pid = await readPid(stateDir);
    expect(pid).not.toBeNull();

    const cleanupResult = await cleanupOneResource({ repository, worktree: { id: "feature-login" }, providers });
    expect(cleanupResult.ok).toBe(true);

    // process should be dead and state directory removed
    expect(isProcessAlive(pid!)).toBe(false);
    expect(existsSync(stateDir)).toBe(false);
  });

  it("cleanup with no prior process is idempotent", async () => {
    const baseDir = await makeTmpDir();
    const provider = createProcessScopedProvider({
      baseDir,
      command: ["node", "-e", "setTimeout(() => {}, 60000)"]
    });

    const repository = {
      resources: [
        {
          name: "cache",
          provider: "process-scoped",
          isolationStrategy: "process-scoped" as const,
          scopedValidate: false,
          scopedReset: false,
          scopedCleanup: true
        }
      ],
      endpoints: []
    };

    const result = await cleanupOneResource({
      repository,
      worktree: { id: "feature-login" },
      providers: { resources: { "process-scoped": provider }, endpoints: {} }
    });

    expect(result.ok).toBe(true);
  });

  it("two worktrees remain isolated across reset and cleanup", async () => {
    const baseDir = await makeTmpDir();
    const provider = createProcessScopedProvider({
      baseDir,
      command: ["node", "-e", "setTimeout(() => {}, 60000)"]
    });

    const repository = {
      resources: [
        {
          name: "cache",
          provider: "process-scoped",
          isolationStrategy: "process-scoped" as const,
          scopedValidate: false,
          scopedReset: true,
          scopedCleanup: true
        }
      ],
      endpoints: []
    };

    const providers = { resources: { "process-scoped": provider }, endpoints: {} };

    const resetA = await resetOneResource({ repository, worktree: { id: "worktree-a" }, providers });
    const resetB = await resetOneResource({ repository, worktree: { id: "worktree-b" }, providers });

    expect(resetA.ok).toBe(true);
    expect(resetB.ok).toBe(true);
    if (!resetA.ok || !resetB.ok) return;

    const stateDirA = resetA.resourcePlans[0].handle;
    const stateDirB = resetB.resourcePlans[0].handle;
    expect(stateDirA).not.toBe(stateDirB);

    const pidA = await readPid(stateDirA);
    expect(pidA).not.toBeNull();

    // cleanup worktree-a only
    await cleanupOneResource({ repository, worktree: { id: "worktree-a" }, providers });

    // worktree-a state removed, worktree-b state intact
    expect(existsSync(stateDirA)).toBe(false);
    expect(existsSync(stateDirB)).toBe(true);

    const pidB = await readPid(stateDirB);
    expect(pidB).not.toBeNull();
    expect(isProcessAlive(pidB!)).toBe(true);

    // cleanup worktree-b
    await cleanupOneResource({ repository, worktree: { id: "worktree-b" }, providers });
  });

  it("reset refuses with unsafe_scope when worktree ID is absent", async () => {
    const baseDir = await makeTmpDir();
    const provider = createProcessScopedProvider({
      baseDir,
      command: ["node", "-e", "setTimeout(() => {}, 60000)"]
    });

    const repository = {
      resources: [
        {
          name: "cache",
          provider: "process-scoped",
          isolationStrategy: "process-scoped" as const,
          scopedValidate: false,
          scopedReset: true,
          scopedCleanup: false
        }
      ],
      endpoints: []
    };

    const result = await resetOneResource({
      repository,
      worktree: {},
      providers: { resources: { "process-scoped": provider }, endpoints: {} }
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.refusal.category).toBe("unsafe_scope");
  });

  it("reset refuses with provider_failure when the process exits immediately", async () => {
    const baseDir = await makeTmpDir();
    const provider = createProcessScopedProvider({
      baseDir,
      command: ["node", "-e", "process.exit(0)"]
    });

    const repository = {
      resources: [
        {
          name: "cache",
          provider: "process-scoped",
          isolationStrategy: "process-scoped" as const,
          scopedValidate: false,
          scopedReset: true,
          scopedCleanup: false
        }
      ],
      endpoints: []
    };

    const result = await resetOneResource({
      repository,
      worktree: { id: "feature-login" },
      providers: { resources: { "process-scoped": provider }, endpoints: {} }
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.refusal.category).toBe("provider_failure");
  });
});
