import { execFileSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runCli, type CliResult } from "../../apps/cli/src/index";

interface DeriveSuccessResult {
  ok: true;
  resourcePlans: Array<{ resourceName: string; worktreeId: string; handle: string }>;
  endpointMappings: Array<{ endpointName: string; worktreeId: string; address: string }>;
}

interface DerivedSampleExpressValues {
  worktreeId: string;
  dbHandle: string;
  httpPort: string;
}

function parseDeriveSuccess(outcome: CliResult): DeriveSuccessResult {
  expect(outcome.exitCode).toBe(0);
  const parsed = JSON.parse(outcome.stdout[0]!) as DeriveSuccessResult;
  expect(parsed.ok).toBe(true);
  return parsed;
}

function readSampleExpressValues(result: DeriveSuccessResult): DerivedSampleExpressValues {
  const dbPlan = result.resourcePlans.find((p) => p.resourceName === "app-db");
  const httpMapping = result.endpointMappings.find((m) => m.endpointName === "http");

  expect(dbPlan).toBeDefined();
  expect(httpMapping).toBeDefined();

  return {
    worktreeId: dbPlan!.worktreeId,
    dbHandle: dbPlan!.handle,
    httpPort: new URL(httpMapping!.address).port
  };
}

describe("dev-slice-42: real git worktree proof with auto-discovery", () => {
  const tempDirs: string[] = [];
  const createdWorktrees: string[] = [];
  const primaryCheckout = process.cwd();

  afterEach(async () => {
    for (const worktreePath of createdWorktrees.reverse()) {
      try {
        execFileSync("git", ["worktree", "remove", "--force", worktreePath], {
          cwd: primaryCheckout,
          stdio: ["ignore", "pipe", "pipe"]
        });
      } catch {
        // Best-effort cleanup for test-owned linked worktrees.
      }
    }
    createdWorktrees.length = 0;

    await Promise.all(
      tempDirs.map((dir) => rm(dir, { recursive: true, force: true }))
    );
    tempDirs.length = 0;
  });

  it("derives distinct worktree identities and isolated values from two real git worktree directories without --worktree-id", async () => {
    const tempRoot = await mkdtemp(path.join(tmpdir(), "multiverse-slice42-"));
    tempDirs.push(tempRoot);

    const linkedWorktreePath = path.join(tempRoot, "slice42-linked-worktree");
    execFileSync("git", ["worktree", "add", "--detach", linkedWorktreePath], {
      cwd: primaryCheckout,
      stdio: ["ignore", "pipe", "pipe"]
    });
    createdWorktrees.push(linkedWorktreePath);

    const args = [
      "derive",
      "--config",
      "apps/sample-express/multiverse.json",
      "--providers",
      "apps/sample-express/providers.ts"
    ];

    const primaryOutcome = await runCli(args, { cwd: primaryCheckout });
    const linkedOutcome = await runCli(args, { cwd: linkedWorktreePath });

    const primaryValues = readSampleExpressValues(parseDeriveSuccess(primaryOutcome));
    const linkedValues = readSampleExpressValues(parseDeriveSuccess(linkedOutcome));

    // Auto-discovery resolves identity from each git worktree directory path.
    expect(primaryValues.worktreeId).toBe(path.basename(primaryCheckout));
    expect(linkedValues.worktreeId).toBe(path.basename(linkedWorktreePath));
    expect(primaryValues.worktreeId).not.toBe(linkedValues.worktreeId);

    // Distinct worktree identities produce non-colliding derived values.
    expect(primaryValues.dbHandle).not.toBe(linkedValues.dbHandle);
    expect(primaryValues.httpPort).not.toBe(linkedValues.httpPort);
  });
});
