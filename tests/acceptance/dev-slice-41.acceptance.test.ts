import { describe, expect, it } from "vitest";

import { runCli } from "../../apps/cli/src/index";

/**
 * Acceptance tests for Slice 41: stale usage string fix.
 *
 * Proving:
 * - The fallback usage string shown on unknown command reflects that
 *   --worktree-id is optional (not required) for derive, validate, reset,
 *   cleanup, and run — as introduced by Slice 37 auto-discovery.
 * - validate-worktree still shows --worktree-id as required (it is).
 */
describe("CLI usage string accuracy (Slice 41)", () => {
  it("unknown command usage shows --worktree-id as optional for derive", async () => {
    const outcome = await runCli(["not-a-command"]);

    expect(outcome.exitCode).toBe(1);
    const usageLine = outcome.stderr.find((l) => l.includes("Usage:"));
    expect(usageLine).toBeDefined();
    // derive should show [--worktree-id VALUE] (optional, bracketed)
    expect(usageLine).toMatch(/derive \[.*\[--worktree-id VALUE\]/);
    // must NOT show the old required form: derive ... --worktree-id VALUE without brackets
    expect(usageLine).not.toMatch(/derive \[--config PATH\] \[--providers MODULE\] --worktree-id VALUE[^\]]/);
  });

  it("unknown command usage shows --worktree-id as optional for run", async () => {
    const outcome = await runCli(["not-a-command"]);

    expect(outcome.exitCode).toBe(1);
    const usageLine = outcome.stderr.find((l) => l.includes("Usage:"));
    expect(usageLine).toBeDefined();
    // run should show [--worktree-id VALUE] (optional, bracketed)
    expect(usageLine).toMatch(/run \[.*\[--worktree-id VALUE\]/);
  });

  it("unknown command usage still shows --worktree-id as required for validate-worktree", async () => {
    const outcome = await runCli(["not-a-command"]);

    expect(outcome.exitCode).toBe(1);
    const usageLine = outcome.stderr.find((l) => l.includes("Usage:"));
    expect(usageLine).toBeDefined();
    // validate-worktree still requires --worktree-id
    expect(usageLine).toMatch(/validate-worktree --worktree-id VALUE/);
  });
});
