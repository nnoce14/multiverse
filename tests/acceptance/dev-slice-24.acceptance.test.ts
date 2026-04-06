import { describe, it, expect, afterEach } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { deriveOne, resetOneResource, cleanupOneResource } from "@multiverse/core";
import { createProcessPortScopedProvider } from "@multiverse/provider-process-port-scoped";

const tmpDirs: string[] = [];

async function makeTmpDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "mv-slice24-"));
  tmpDirs.push(dir);
  return dir;
}

afterEach(async () => {
  const { rm: rmFs } = await import("node:fs/promises");
  for (const dir of tmpDirs.splice(0)) {
    await rmFs(dir, { recursive: true, force: true });
  }
});

const BASE_PORT = 8100;

function makeRepository(scopedReset = false, scopedCleanup = false) {
  return {
    resources: [
      {
        name: "backend",
        provider: "process-port-scoped",
        isolationStrategy: "process-port-scoped" as const,
        scopedValidate: false,
        scopedReset,
        scopedCleanup
      }
    ],
    endpoints: []
  };
}

describe("dev-slice-24: port-aware process provider", () => {
  it("derives a handle in localhost:{port} format within the configured range", async () => {
    const baseDir = await makeTmpDir();
    const provider = createProcessPortScopedProvider({
      baseDir,
      basePort: BASE_PORT,
      command: ["node", "-e", "setTimeout(() => {}, 60000)"]
    });

    const result = deriveOne({
      repository: makeRepository(),
      worktree: { id: "feature-login" },
      providers: { resources: { "process-port-scoped": provider }, endpoints: {} }
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const handle = result.resourcePlans[0].handle;
    const match = handle.match(/^localhost:(\d+)$/);
    expect(match).not.toBeNull();
    const port = parseInt(match![1], 10);
    expect(port).toBeGreaterThanOrEqual(BASE_PORT);
    expect(port).toBeLessThan(BASE_PORT + 1000);
  });

  it("derives the same handle on repeated calls with the same input", async () => {
    const baseDir = await makeTmpDir();
    const provider = createProcessPortScopedProvider({
      baseDir,
      basePort: BASE_PORT,
      command: ["node", "-e", "setTimeout(() => {}, 60000)"]
    });
    const repo = makeRepository();
    const prov = { resources: { "process-port-scoped": provider }, endpoints: {} };

    const first = deriveOne({ repository: repo, worktree: { id: "wt-det" }, providers: prov });
    const second = deriveOne({ repository: repo, worktree: { id: "wt-det" }, providers: prov });

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (!first.ok || !second.ok) return;

    expect(first.resourcePlans[0].handle).toBe(second.resourcePlans[0].handle);
  });

  it("derives distinct handles for distinct worktree IDs", async () => {
    const baseDir = await makeTmpDir();
    const provider = createProcessPortScopedProvider({
      baseDir,
      basePort: BASE_PORT,
      command: ["node", "-e", "setTimeout(() => {}, 60000)"]
    });
    const repo = makeRepository();
    const prov = { resources: { "process-port-scoped": provider }, endpoints: {} };

    const a = deriveOne({ repository: repo, worktree: { id: "wt-a" }, providers: prov });
    const b = deriveOne({ repository: repo, worktree: { id: "wt-b" }, providers: prov });

    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
    if (!a.ok || !b.ok) return;

    expect(a.resourcePlans[0].handle).not.toBe(b.resourcePlans[0].handle);
  });

  it("returns unsafe_scope when worktree ID is absent", async () => {
    const baseDir = await makeTmpDir();
    const provider = createProcessPortScopedProvider({
      baseDir,
      basePort: BASE_PORT,
      command: ["node", "-e", "setTimeout(() => {}, 60000)"]
    });

    const result = deriveOne({
      repository: makeRepository(),
      worktree: {},
      providers: { resources: { "process-port-scoped": provider }, endpoints: {} }
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.refusal.category).toBe("unsafe_scope");
  });

  it("substitutes {PORT} in the command — process using wrong port exits immediately", async () => {
    const baseDir = await makeTmpDir();
    // Command validates that its argument is a number in the expected range.
    // If {PORT} is NOT substituted, parseInt("{PORT}") = NaN → process.exit(1) → provider_failure.
    // If {PORT} IS substituted, parseInt("8NNN") = valid number → process stays alive → reset succeeds.
    const provider = createProcessPortScopedProvider({
      baseDir,
      basePort: BASE_PORT,
      command: [
        "node",
        "-e",
        `const p = parseInt("{PORT}"); if (isNaN(p) || p < 1 || p > 65535) process.exit(1); setTimeout(() => {}, 60000)`
      ]
    });

    const result = await resetOneResource({
      repository: makeRepository(true, true),
      worktree: { id: "wt-port-sub" },
      providers: { resources: { "process-port-scoped": provider }, endpoints: {} }
    });

    expect(result.ok).toBe(true);

    // cleanup
    await cleanupOneResource({
      repository: makeRepository(true, true),
      worktree: { id: "wt-port-sub" },
      providers: { resources: { "process-port-scoped": provider }, endpoints: {} }
    });
  });

  it("reset returns the connection handle in localhost:{port} format", async () => {
    const baseDir = await makeTmpDir();
    const provider = createProcessPortScopedProvider({
      baseDir,
      basePort: BASE_PORT,
      command: ["node", "-e", "setTimeout(() => {}, 60000)"]
    });

    const result = await resetOneResource({
      repository: makeRepository(true, true),
      worktree: { id: "wt-reset-handle" },
      providers: { resources: { "process-port-scoped": provider }, endpoints: {} }
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const handle = result.resourcePlans[0].handle;
    expect(handle).toMatch(/^localhost:\d+$/);

    await cleanupOneResource({
      repository: makeRepository(true, true),
      worktree: { id: "wt-reset-handle" },
      providers: { resources: { "process-port-scoped": provider }, endpoints: {} }
    });
  });

  it("reset refuses with provider_failure when process exits immediately", async () => {
    const baseDir = await makeTmpDir();
    const provider = createProcessPortScopedProvider({
      baseDir,
      basePort: BASE_PORT,
      command: ["node", "-e", "process.exit(0)"]
    });

    const result = await resetOneResource({
      repository: makeRepository(true, false),
      worktree: { id: "wt-fast-exit" },
      providers: { resources: { "process-port-scoped": provider }, endpoints: {} }
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.refusal.category).toBe("provider_failure");
  });

  it("cleanup terminates the process and removes the state directory", async () => {
    const baseDir = await makeTmpDir();
    const provider = createProcessPortScopedProvider({
      baseDir,
      basePort: BASE_PORT,
      command: ["node", "-e", "setTimeout(() => {}, 60000)"]
    });
    const prov = { resources: { "process-port-scoped": provider }, endpoints: {} };
    const repo = makeRepository(true, true);

    await resetOneResource({ repository: repo, worktree: { id: "wt-cleanup" }, providers: prov });

    // derive the state dir path to check after cleanup
    const derived = deriveOne({ repository: repo, worktree: { id: "wt-cleanup" }, providers: prov });
    expect(derived.ok).toBe(true);

    const cleanupResult = await cleanupOneResource({
      repository: repo,
      worktree: { id: "wt-cleanup" },
      providers: prov
    });
    expect(cleanupResult.ok).toBe(true);

    // state directory should be gone
    const stateDir = join(baseDir, "backend", "wt-cleanup") + "/";
    expect(existsSync(stateDir)).toBe(false);
  });

  it("cleanup with no prior process is idempotent", async () => {
    const baseDir = await makeTmpDir();
    const provider = createProcessPortScopedProvider({
      baseDir,
      basePort: BASE_PORT,
      command: ["node", "-e", "setTimeout(() => {}, 60000)"]
    });

    const result = await cleanupOneResource({
      repository: makeRepository(false, true),
      worktree: { id: "wt-idempotent" },
      providers: { resources: { "process-port-scoped": provider }, endpoints: {} }
    });

    expect(result.ok).toBe(true);
  });

  it("two worktrees remain isolated across reset and cleanup", async () => {
    const baseDir = await makeTmpDir();
    const provider = createProcessPortScopedProvider({
      baseDir,
      basePort: BASE_PORT,
      command: ["node", "-e", "setTimeout(() => {}, 60000)"]
    });
    const prov = { resources: { "process-port-scoped": provider }, endpoints: {} };
    const repo = makeRepository(true, true);

    const resetA = await resetOneResource({ repository: repo, worktree: { id: "wt-iso-a" }, providers: prov });
    const resetB = await resetOneResource({ repository: repo, worktree: { id: "wt-iso-b" }, providers: prov });

    expect(resetA.ok).toBe(true);
    expect(resetB.ok).toBe(true);
    if (!resetA.ok || !resetB.ok) return;

    // handles are distinct
    expect(resetA.resourcePlans[0].handle).not.toBe(resetB.resourcePlans[0].handle);

    // cleanup A only
    await cleanupOneResource({ repository: repo, worktree: { id: "wt-iso-a" }, providers: prov });

    const stateDirA = join(baseDir, "backend", "wt-iso-a") + "/";
    const stateDirB = join(baseDir, "backend", "wt-iso-b") + "/";
    expect(existsSync(stateDirA)).toBe(false);
    expect(existsSync(stateDirB)).toBe(true);

    // cleanup B
    await cleanupOneResource({ repository: repo, worktree: { id: "wt-iso-b" }, providers: prov });
  });
});
