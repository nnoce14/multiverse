import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { runCli } from "../../apps/cli/src/index";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((d) => rm(d, { recursive: true, force: true })));
  tempDirs.length = 0;
});

const providersModulePath = fileURLToPath(
  new URL("./fixtures/process-scoped-test-providers.ts", import.meta.url)
);

const processScopedRepository = {
  resources: [
    {
      name: "background-worker",
      provider: "process-scoped",
      isolationStrategy: "process-scoped",
      scopedValidate: false,
      scopedReset: true,
      scopedCleanup: true
    }
  ],
  endpoints: []
};

async function writeConfig(config: unknown): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "mv-cli-ps-test-"));
  tempDirs.push(dir);
  const configPath = join(dir, "multiverse.json");
  await writeFile(configPath, JSON.stringify(config));
  return configPath;
}

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

describe("CLI process-scoped lifecycle", () => {
  it("reset exits 0 and returns resourceResets for a process-scoped resource", async () => {
    const configPath = await writeConfig(processScopedRepository);

    const result = await runCli([
      "reset",
      "--config", configPath,
      "--providers", providersModulePath,
      "--worktree-id", "wt-ps-reset-test"
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toHaveLength(1);

    const parsed = JSON.parse(result.stdout[0]!) as {
      ok: boolean;
      resourceResets: Array<{ resourceName: string; capability: string }>;
    };
    expect(parsed.ok).toBe(true);
    expect(parsed.resourceResets).toHaveLength(1);
    expect(parsed.resourceResets[0].resourceName).toBe("background-worker");
    expect(parsed.resourceResets[0].capability).toBe("reset");

    // cleanup spawned process
    await runCli([
      "cleanup",
      "--config", configPath,
      "--providers", providersModulePath,
      "--worktree-id", "wt-ps-reset-test"
    ]);
  });

  it("cleanup exits 0 and terminates the running process", async () => {
    const configPath = await writeConfig(processScopedRepository);
    const worktreeId = "wt-ps-cleanup-test";

    // Reset to start the process
    const resetResult = await runCli([
      "reset",
      "--config", configPath,
      "--providers", providersModulePath,
      "--worktree-id", worktreeId
    ]);
    expect(resetResult.exitCode).toBe(0);

    const resetParsed = JSON.parse(resetResult.stdout[0]!) as {
      ok: boolean;
      resourcePlans: Array<{ handle: string }>;
    };
    const stateDir = resetParsed.resourcePlans[0].handle;
    const pid = await readPid(stateDir);
    expect(pid).not.toBeNull();
    expect(isProcessAlive(pid!)).toBe(true);

    // Cleanup to stop the process
    const cleanupResult = await runCli([
      "cleanup",
      "--config", configPath,
      "--providers", providersModulePath,
      "--worktree-id", worktreeId
    ]);
    expect(cleanupResult.exitCode).toBe(0);

    expect(isProcessAlive(pid!)).toBe(false);
    expect(existsSync(stateDir)).toBe(false);
  });

  it("reset exits 1 with a refusal when worktree ID is empty", async () => {
    const configPath = await writeConfig(processScopedRepository);

    const result = await runCli([
      "reset",
      "--config", configPath,
      "--providers", providersModulePath,
      "--worktree-id", ""
    ]);

    expect(result.exitCode).toBe(1);
    const parsed = JSON.parse(result.stdout[0]!) as { ok: boolean; refusal: { category: string } };
    expect(parsed.ok).toBe(false);
    expect(parsed.refusal.category).toBe("unsafe_scope");
  });

  it("two worktree IDs produce distinct process-scoped state directories", async () => {
    const configPath = await writeConfig(processScopedRepository);

    const resultA = await runCli([
      "reset",
      "--config", configPath,
      "--providers", providersModulePath,
      "--worktree-id", "wt-ps-iso-a"
    ]);
    const resultB = await runCli([
      "reset",
      "--config", configPath,
      "--providers", providersModulePath,
      "--worktree-id", "wt-ps-iso-b"
    ]);

    expect(resultA.exitCode).toBe(0);
    expect(resultB.exitCode).toBe(0);

    const parsedA = JSON.parse(resultA.stdout[0]!) as { ok: boolean; resourcePlans: Array<{ handle: string }> };
    const parsedB = JSON.parse(resultB.stdout[0]!) as { ok: boolean; resourcePlans: Array<{ handle: string }> };

    expect(parsedA.resourcePlans[0].handle).not.toBe(parsedB.resourcePlans[0].handle);

    // cleanup both
    await runCli(["cleanup", "--config", configPath, "--providers", providersModulePath, "--worktree-id", "wt-ps-iso-a"]);
    await runCli(["cleanup", "--config", configPath, "--providers", providersModulePath, "--worktree-id", "wt-ps-iso-b"]);
  });
});
