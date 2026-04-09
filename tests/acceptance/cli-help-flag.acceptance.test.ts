import { describe, expect, it } from "vitest";

import { runCli } from "../../apps/cli/src/index";

/**
 * Acceptance tests for Slice 50: --help / -h flag behavior.
 *
 * Proving:
 * - --help and -h exit 0 (not 1)
 * - Help text goes to stdout, not stderr
 * - Help text names all primary commands
 * - Unknown command still exits 1 with usage to stderr
 */
describe("CLI --help flag (Slice 50)", () => {
  it("--help exits 0", async () => {
    const outcome = await runCli(["--help"]);
    expect(outcome.exitCode).toBe(0);
  });

  it("-h exits 0", async () => {
    const outcome = await runCli(["-h"]);
    expect(outcome.exitCode).toBe(0);
  });

  it("--help writes to stdout, not stderr", async () => {
    const outcome = await runCli(["--help"]);
    expect(outcome.stdout.length).toBeGreaterThan(0);
    expect(outcome.stderr).toHaveLength(0);
  });

  it("-h writes to stdout, not stderr", async () => {
    const outcome = await runCli(["-h"]);
    expect(outcome.stdout.length).toBeGreaterThan(0);
    expect(outcome.stderr).toHaveLength(0);
  });

  it("--help output contains primary command names", async () => {
    const outcome = await runCli(["--help"]);
    const text = outcome.stdout.join("\n");
    expect(text).toContain("derive");
    expect(text).toContain("validate");
    expect(text).toContain("reset");
    expect(text).toContain("cleanup");
    expect(text).toContain("run");
  });

  it("unknown command still exits 1 with usage to stderr", async () => {
    const outcome = await runCli(["not-a-command"]);
    expect(outcome.exitCode).toBe(1);
    expect(outcome.stderr.length).toBeGreaterThan(0);
    expect(outcome.stderr.join("\n")).toContain("Usage:");
  });
});
