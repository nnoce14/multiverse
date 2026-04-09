import { describe, expect, it } from "vitest";

import { runCli } from "../../apps/cli/src/index";

/**
 * Acceptance tests for Slice 41: stale usage string fix.
 *
 * Proving:
 * - The fallback usage output shown on unknown command reflects that
 *   --worktree-id is optional (not required) for derive, validate, reset,
 *   cleanup, and run — as introduced by Slice 37 auto-discovery.
 * - validate-worktree still shows --worktree-id as required (it is).
 *
 * Slice 50 update: usage output is now multi-line. Tests join stderr lines
 * before pattern matching instead of searching for a single usage line.
 */
describe("CLI usage string accuracy (Slice 41)", () => {
  it("unknown command usage shows --worktree-id as optional for derive", async () => {
    const outcome = await runCli(["not-a-command"]);

    expect(outcome.exitCode).toBe(1);
    const stderrText = outcome.stderr.join("\n");
    expect(stderrText).toContain("Usage:");
    // derive should show [--worktree-id VALUE] (optional, bracketed)
    expect(stderrText).toMatch(/derive\s+\[.*\[--worktree-id VALUE\]/);
    // must NOT show the old required form: derive ... --worktree-id VALUE without brackets
    expect(stderrText).not.toMatch(/derive \[--config PATH\] \[--providers MODULE\] --worktree-id VALUE[^\]]/);
  });

  it("unknown command usage shows --worktree-id as optional for run", async () => {
    const outcome = await runCli(["not-a-command"]);

    expect(outcome.exitCode).toBe(1);
    const stderrText = outcome.stderr.join("\n");
    expect(stderrText).toContain("Usage:");
    // run should show [--worktree-id VALUE] (optional, bracketed)
    expect(stderrText).toMatch(/run\s+\[.*\[--worktree-id VALUE\]/);
  });

  it("unknown command usage still shows --worktree-id as required for validate-worktree", async () => {
    const outcome = await runCli(["not-a-command"]);

    expect(outcome.exitCode).toBe(1);
    const stderrText = outcome.stderr.join("\n");
    expect(stderrText).toContain("Usage:");
    // validate-worktree still requires --worktree-id
    expect(stderrText).toMatch(/validate-worktree\s+--worktree-id VALUE/);
  });
});
