import { execFile, execFileSync } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

interface CompiledCliResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

async function runCompiledCli(args: string[]): Promise<CompiledCliResult> {
  const repoRoot = process.cwd();
  const binaryPath = path.join(repoRoot, "apps/cli/bin/multiverse.js");
  const env = { ...process.env };
  delete env.NODE_OPTIONS;

  try {
    const { stdout, stderr } = await execFileAsync("node", [binaryPath, ...args], {
      cwd: repoRoot,
      env
    });
    return { exitCode: 0, stdout, stderr };
  } catch (err) {
    if (!(err instanceof Error)) {
      throw err;
    }
    const failure = err as Error & {
      code?: number;
      stdout?: string;
      stderr?: string;
    };
    return {
      exitCode: failure.code ?? 1,
      stdout: failure.stdout ?? "",
      stderr: failure.stderr ?? failure.message
    };
  }
}

describe("dev-slice-43: compiled binary TypeScript provider loading without manual NODE_OPTIONS", () => {
  it("loads a TypeScript providers module on the compiled binary path without NODE_OPTIONS (workspace scope)", async () => {
    const repoRoot = process.cwd();

    // Ensure the compiled binary reflects current source before invocation.
    execFileSync(
      "node",
      ["node_modules/typescript/bin/tsc", "--project", "apps/cli/tsconfig.build.json"],
      {
        cwd: repoRoot,
        stdio: "pipe"
      }
    );

    const outcome = await runCompiledCli([
      "derive",
      "--config",
      "apps/sample-express/multiverse.json",
      "--providers",
      "apps/sample-express/providers.ts",
      "--worktree-id",
      "wt-slice43"
    ]);

    expect(outcome.exitCode).toBe(0);
    const parsed = JSON.parse(outcome.stdout.trim()) as {
      ok: boolean;
      resourcePlans: Array<{ worktreeId: string }>;
      endpointMappings: Array<{ worktreeId: string }>;
    };
    expect(parsed.ok).toBe(true);
    expect(parsed.resourcePlans[0]?.worktreeId).toBe("wt-slice43");
    expect(parsed.endpointMappings[0]?.worktreeId).toBe("wt-slice43");
    expect(outcome.stderr).toBe("");
  });
});
