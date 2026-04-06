import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { runCli, type ChildProcessRunner } from "../../apps/cli/src/index";

describe("dev-slice-31: fixed-host-port endpoint provider", () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(
      tempDirs.map((dir) => rm(dir, { recursive: true, force: true }))
    );
    tempDirs.length = 0;
  });

  const providersModulePath = fileURLToPath(
    new URL("./fixtures/fixed-host-port-test-providers.ts", import.meta.url)
  );

  async function writeConfig(config: unknown): Promise<string> {
    const tempDir = await mkdtemp(path.join(tmpdir(), "multiverse-cli-fixed-host-port-"));
    tempDirs.push(tempDir);
    const configPath = path.join(tempDir, "multiverse.json");
    await writeFile(configPath, JSON.stringify(config));
    return configPath;
  }

  async function captureRunEnv(config: unknown, worktreeId: string): Promise<Record<string, string>> {
    const configPath = await writeConfig(config);
    let capturedEnv: Record<string, string> = {};
    const runner: ChildProcessRunner = async ({ env }) => {
      capturedEnv = { ...env };
      return { exitCode: 0 };
    };

    const outcome = await runCli(
      ["run", "--config", configPath, "--providers", providersModulePath,
       "--worktree-id", worktreeId, "--", "node", "-e", "0"],
      { runner, parentEnv: {} }
    );

    expect(outcome.exitCode).toBe(0);

    return capturedEnv;
  }

  it("injects canonical, alias, and typed endpoint env vars while preserving deterministic worktree scoping", async () => {
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
        },
        {
          name: "admin-api",
          role: "admin-http",
          provider: "fixed-host-port",
          host: "127.0.0.1",
          basePort: 5400,
          appEnv: "ADMIN_API_URL"
        }
      ]
    };

    const worktreeAEnv = await captureRunEnv(config, "wt-fixed-host-a");
    const worktreeBEnv = await captureRunEnv(config, "wt-fixed-host-b");

    const httpUrlA = worktreeAEnv["MULTIVERSE_ENDPOINT_HTTP"];
    const adminUrlA = worktreeAEnv["MULTIVERSE_ENDPOINT_ADMIN_API"];
    const httpUrlB = worktreeBEnv["MULTIVERSE_ENDPOINT_HTTP"];
    const adminUrlB = worktreeBEnv["MULTIVERSE_ENDPOINT_ADMIN_API"];

    expect(httpUrlA).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
    expect(adminUrlA).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
    expect(worktreeAEnv["APP_HTTP_URL"]).toBe(httpUrlA);
    expect(worktreeAEnv["PORT"]).toBe(new URL(httpUrlA).port);
    expect(worktreeAEnv["ADMIN_API_URL"]).toBe(adminUrlA);
    expect(httpUrlA).not.toBe(adminUrlA);
    expect(httpUrlA).not.toBe(httpUrlB);
    expect(adminUrlA).not.toBe(adminUrlB);
  });
});
