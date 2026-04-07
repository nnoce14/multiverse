import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { runCli, type ChildProcessRunner } from "../../apps/cli/src/index";

describe("fixed-host-port run integration", () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(
      tempDirs.map((dir) => rm(dir, { recursive: true, force: true }))
    );
    tempDirs.length = 0;
  });

  const providersModulePath = fileURLToPath(
    new URL("../acceptance/fixtures/fixed-host-port-test-providers.ts", import.meta.url)
  );

  async function writeConfig(config: unknown): Promise<string> {
    const tempDir = await mkdtemp(path.join(tmpdir(), "multiverse-fixed-host-port-run-"));
    tempDirs.push(tempDir);
    const configPath = path.join(tempDir, "multiverse.json");
    await writeFile(configPath, JSON.stringify(config));
    return configPath;
  }

  async function runChildAndCaptureEnv(
    config: unknown,
    worktreeId: string
  ): Promise<Record<string, string>> {
    const configPath = await writeConfig(config);
    let stdout = "";
    let stderr = "";

    const runner: ChildProcessRunner = async ({ cmd, args, env }) => {
      const exitCode = await new Promise<number>((resolve, reject) => {
        const child = spawn(cmd, args, {
          env,
          stdio: ["ignore", "pipe", "pipe"]
        });

        child.on("error", reject);
        child.stdout?.on("data", (chunk) => {
          stdout += String(chunk);
        });
        child.stderr?.on("data", (chunk) => {
          stderr += String(chunk);
        });
        child.on("close", (code) => resolve(code ?? 1));
      });

      return { exitCode };
    };

    const outcome = await runCli(
      [
        "run",
        "--config",
        configPath,
        "--providers",
        providersModulePath,
        "--worktree-id",
        worktreeId,
        "--",
        process.execPath,
        "-e",
        [
          "process.stdout.write(JSON.stringify({",
          "  MULTIVERSE_WORKTREE_ID: process.env.MULTIVERSE_WORKTREE_ID,",
          "  MULTIVERSE_ENDPOINT_HTTP: process.env.MULTIVERSE_ENDPOINT_HTTP,",
          "  APP_HTTP_URL: process.env.APP_HTTP_URL,",
          "  PORT: process.env.PORT",
          "}));"
        ].join("\n")
      ],
      {
        parentEnv: {},
        runner
      }
    );

    expect(outcome.exitCode).toBe(0);
    expect(stderr).toBe("");

    return JSON.parse(stdout) as Record<string, string>;
  }

  it("injects canonical and typed endpoint env vars into a real child process through run", async () => {
    const config = {
      resources: [],
      endpoints: [
        {
          name: "http",
          role: "application-http",
          provider: "fixed-host-port",
          host: "127.0.0.1",
          basePort: 5400,
          appEnv: {
            APP_HTTP_URL: "url",
            PORT: "port"
          }
        }
      ]
    };

    const envA = await runChildAndCaptureEnv(config, "wt-fixed-host-run-a");
    const envB = await runChildAndCaptureEnv(config, "wt-fixed-host-run-b");

    const httpUrlA = envA["MULTIVERSE_ENDPOINT_HTTP"];
    const httpUrlB = envB["MULTIVERSE_ENDPOINT_HTTP"];

    expect(envA["MULTIVERSE_WORKTREE_ID"]).toBe("wt-fixed-host-run-a");
    expect(envB["MULTIVERSE_WORKTREE_ID"]).toBe("wt-fixed-host-run-b");

    expect(httpUrlA).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
    expect(httpUrlB).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
    // fixed-host-port keeps the configured host stable while deriving distinct worktree ports.
    expect(httpUrlA).not.toBe(httpUrlB);

    expect(envA["APP_HTTP_URL"]).toBe(httpUrlA);
    expect(envB["APP_HTTP_URL"]).toBe(httpUrlB);
    expect(envA["PORT"]).toBe(new URL(httpUrlA).port);
    expect(envB["PORT"]).toBe(new URL(httpUrlB).port);
  });
});
