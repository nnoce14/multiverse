/**
 * Acceptance tests for ADR-0018 and ADR-0019: explicit app-native env mapping for `multiverse run`.
 *
 * Behavior under test:
 *   - `appEnv` on a resource declaration causes `run` to inject both the canonical
 *     MULTIVERSE_RESOURCE_<NAME> var and an alias under the declared app-native name
 *   - `appEnv` on an endpoint declaration supports alias-only or explicit typed mapping behavior
 *   - Typed endpoint mapping can inject both `url` and `port` values
 *   - Declarations without `appEnv` inject only the canonical var (no regression)
 *   - `run` refuses when a declared `appEnv` name already exists in the parent environment
 *   - `run` refuses when a typed endpoint value cannot be extracted
 *   - Declaration validation refuses invalid, empty, reserved, unsupported, and duplicate `appEnv` values
 *   - `derive --format=env` is unaffected (canonical-only output)
 */

import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { runCli, type ChildProcessRunner } from "../../apps/cli/src/index";

describe("CLI run — appEnv mapping (ADR-0018)", () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(
      tempDirs.map((dir) => rm(dir, { recursive: true, force: true }))
    );
    tempDirs.length = 0;
  });

  const providersModulePath = fileURLToPath(
    new URL("./fixtures/explicit-test-providers.ts", import.meta.url)
  );

  async function writeConfig(config: unknown): Promise<string> {
    const tempDir = await mkdtemp(path.join(tmpdir(), "multiverse-cli-appenv-"));
    tempDirs.push(tempDir);
    const configPath = path.join(tempDir, "multiverse.json");
    await writeFile(configPath, JSON.stringify(config));
    return configPath;
  }

  // ---------------------------------------------------------------------------
  // Resource appEnv injection
  // ---------------------------------------------------------------------------

  it("injects an alias var alongside the canonical var when a resource declares appEnv", async () => {
    const configPath = await writeConfig({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider",
          isolationStrategy: "name-scoped",
          scopedValidate: false,
          scopedReset: false,
          scopedCleanup: false,
          appEnv: "DATABASE_URL"
        }
      ],
      endpoints: []
    });

    let capturedEnv: Record<string, string> = {};
    const runner: ChildProcessRunner = async ({ env }) => {
      capturedEnv = { ...env };
      return { exitCode: 0 };
    };

    const outcome = await runCli(
      ["run", "--config", configPath, "--providers", providersModulePath,
       "--worktree-id", "wt-appenv-resource", "--", "node", "-e", "0"],
      { runner }
    );

    expect(outcome.exitCode).toBe(0);
    // canonical var present
    expect(capturedEnv["MULTIVERSE_RESOURCE_PRIMARY_DB"]).toBe("primary-db--wt-appenv-resource");
    // alias injected with same value
    expect(capturedEnv["DATABASE_URL"]).toBe("primary-db--wt-appenv-resource");
  });

  // ---------------------------------------------------------------------------
  // Endpoint appEnv injection
  // ---------------------------------------------------------------------------

  it("injects an alias var alongside the canonical var when an endpoint declares appEnv", async () => {
    const configPath = await writeConfig({
      resources: [],
      endpoints: [
        {
          name: "app-base-url",
          role: "application-base-url",
          provider: "test-endpoint-provider",
          appEnv: "APP_URL"
        }
      ]
    });

    let capturedEnv: Record<string, string> = {};
    const runner: ChildProcessRunner = async ({ env }) => {
      capturedEnv = { ...env };
      return { exitCode: 0 };
    };

    const outcome = await runCli(
      ["run", "--config", configPath, "--providers", providersModulePath,
       "--worktree-id", "wt-appenv-endpoint", "--", "node", "-e", "0"],
      { runner }
    );

    expect(outcome.exitCode).toBe(0);
    // canonical var present — test provider derives "http://{worktreeId}.local/{endpointName}"
    expect(capturedEnv["MULTIVERSE_ENDPOINT_APP_BASE_URL"]).toBe("http://wt-appenv-endpoint.local/app-base-url");
    // alias injected with the same string value
    expect(capturedEnv["APP_URL"]).toBe("http://wt-appenv-endpoint.local/app-base-url");
  });

  it("injects typed endpoint appEnv values for both url and port", async () => {
    const configPath = await writeConfig({
      resources: [],
      endpoints: [
        {
          name: "http",
          role: "application-http",
          provider: "test-port-endpoint-provider",
          appEnv: {
            APP_HTTP_URL: "url",
            PORT: "port"
          }
        }
      ]
    });

    let capturedEnv: Record<string, string> = {};
    const runner: ChildProcessRunner = async ({ env }) => {
      capturedEnv = { ...env };
      return { exitCode: 0 };
    };

    const outcome = await runCli(
      ["run", "--config", configPath, "--providers", providersModulePath,
       "--worktree-id", "wt-typed-endpoint", "--", "node", "-e", "0"],
      { runner, parentEnv: {} }
    );

    expect(outcome.exitCode).toBe(0);
    expect(capturedEnv["MULTIVERSE_ENDPOINT_HTTP"]).toBe("http://127.0.0.1:5500");
    expect(capturedEnv["APP_HTTP_URL"]).toBe("http://127.0.0.1:5500");
    expect(capturedEnv["PORT"]).toBe("5500");
  });

  // ---------------------------------------------------------------------------
  // Alias value equals canonical value (alias-only semantics)
  // ---------------------------------------------------------------------------

  it("alias value equals the canonical derived string — no extraction or transformation", async () => {
    const configPath = await writeConfig({
      resources: [],
      endpoints: [
        {
          name: "http",
          role: "application-http",
          provider: "test-endpoint-provider",
          appEnv: "MY_HTTP_URL"
        }
      ]
    });

    let capturedEnv: Record<string, string> = {};
    const runner: ChildProcessRunner = async ({ env }) => {
      capturedEnv = { ...env };
      return { exitCode: 0 };
    };

    await runCli(
      ["run", "--config", configPath, "--providers", providersModulePath,
       "--worktree-id", "wt-alias-value", "--", "node", "-e", "0"],
      { runner }
    );

    expect(capturedEnv["MY_HTTP_URL"]).toBe(capturedEnv["MULTIVERSE_ENDPOINT_HTTP"]);
  });

  // ---------------------------------------------------------------------------
  // Both resource and endpoint appEnv in one config
  // ---------------------------------------------------------------------------

  it("injects aliases for both a resource and an endpoint when both declare appEnv", async () => {
    const configPath = await writeConfig({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider",
          isolationStrategy: "name-scoped",
          scopedValidate: false,
          scopedReset: false,
          scopedCleanup: false,
          appEnv: "DB_HANDLE"
        }
      ],
      endpoints: [
        {
          name: "app-base-url",
          role: "application-base-url",
          provider: "test-endpoint-provider",
          appEnv: "BASE_URL"
        }
      ]
    });

    let capturedEnv: Record<string, string> = {};
    const runner: ChildProcessRunner = async ({ env }) => {
      capturedEnv = { ...env };
      return { exitCode: 0 };
    };

    const outcome = await runCli(
      ["run", "--config", configPath, "--providers", providersModulePath,
       "--worktree-id", "wt-both-appenv", "--", "node", "-e", "0"],
      { runner, parentEnv: {} }
    );

    expect(outcome.exitCode).toBe(0);
    expect(capturedEnv["DB_HANDLE"]).toBe(capturedEnv["MULTIVERSE_RESOURCE_PRIMARY_DB"]);
    expect(capturedEnv["BASE_URL"]).toBe(capturedEnv["MULTIVERSE_ENDPOINT_APP_BASE_URL"]);
    // canonical vars still present
    expect(capturedEnv["MULTIVERSE_RESOURCE_PRIMARY_DB"]).toBeDefined();
    expect(capturedEnv["MULTIVERSE_ENDPOINT_APP_BASE_URL"]).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // No appEnv — no regression
  // ---------------------------------------------------------------------------

  it("does not inject any alias when no declaration includes appEnv", async () => {
    const configPath = await writeConfig({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider",
          isolationStrategy: "name-scoped",
          scopedValidate: false,
          scopedReset: false,
          scopedCleanup: false
        }
      ],
      endpoints: [
        {
          name: "app-base-url",
          role: "application-base-url",
          provider: "test-endpoint-provider"
        }
      ]
    });

    let capturedEnv: Record<string, string> = {};
    const runner: ChildProcessRunner = async ({ env }) => {
      capturedEnv = { ...env };
      return { exitCode: 0 };
    };

    const outcome = await runCli(
      ["run", "--config", configPath, "--providers", providersModulePath,
       "--worktree-id", "wt-no-appenv", "--", "node", "-e", "0"],
      { runner }
    );

    expect(outcome.exitCode).toBe(0);
    expect(capturedEnv["MULTIVERSE_RESOURCE_PRIMARY_DB"]).toBeDefined();
    expect(capturedEnv["MULTIVERSE_ENDPOINT_APP_BASE_URL"]).toBeDefined();
    // no unexpected extra vars (spot-check that no alias appeared)
    expect(capturedEnv["DATABASE_URL"]).toBeUndefined();
    expect(capturedEnv["APP_URL"]).toBeUndefined();
  });

  // ---------------------------------------------------------------------------
  // Conflict: appEnv name already in parent environment
  // ---------------------------------------------------------------------------

  it("refuses when a declared appEnv name already exists in the parent environment", async () => {
    const configPath = await writeConfig({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider",
          isolationStrategy: "name-scoped",
          scopedValidate: false,
          scopedReset: false,
          scopedCleanup: false,
          appEnv: "CONFLICTING_VAR"
        }
      ],
      endpoints: []
    });

    let runnerCalled = false;
    const runner: ChildProcessRunner = async () => {
      runnerCalled = true;
      return { exitCode: 0 };
    };

    const parentEnv = { CONFLICTING_VAR: "already-set" };

    const outcome = await runCli(
      ["run", "--config", configPath, "--providers", providersModulePath,
       "--worktree-id", "wt-conflict", "--", "node", "-e", "0"],
      { runner, parentEnv }
    );

    expect(outcome.exitCode).toBe(1);
    expect(outcome.stdout).toEqual([]);
    expect(outcome.stderr).toHaveLength(1);
    const parsed = JSON.parse(outcome.stderr[0]!) as { ok: boolean; refusal?: { category: string; reason: string } };
    expect(parsed.ok).toBe(false);
    expect(parsed.refusal?.category).toBe("invalid_configuration");
    expect(parsed.refusal?.reason).toMatch(/CONFLICTING_VAR/);
    expect(runnerCalled).toBe(false);
  });

  it("refuses when an endpoint appEnv name already exists in the parent environment", async () => {
    const configPath = await writeConfig({
      resources: [],
      endpoints: [
        {
          name: "app-base-url",
          role: "application-base-url",
          provider: "test-endpoint-provider",
          appEnv: "PORT_CONFLICT"
        }
      ]
    });

    let runnerCalled = false;
    const runner: ChildProcessRunner = async () => {
      runnerCalled = true;
      return { exitCode: 0 };
    };

    const parentEnv = { PORT_CONFLICT: "3000" };

    const outcome = await runCli(
      ["run", "--config", configPath, "--providers", providersModulePath,
       "--worktree-id", "wt-endpoint-conflict", "--", "node", "-e", "0"],
      { runner, parentEnv }
    );

    expect(outcome.exitCode).toBe(1);
    expect(runnerCalled).toBe(false);
    const parsed = JSON.parse(outcome.stderr[0]!) as { ok: boolean; refusal?: { category: string } };
    expect(parsed.ok).toBe(false);
    expect(parsed.refusal?.category).toBe("invalid_configuration");
  });

  it("refuses when a typed endpoint appEnv name already exists in the parent environment", async () => {
    const configPath = await writeConfig({
      resources: [],
      endpoints: [
        {
          name: "http",
          role: "application-http",
          provider: "test-port-endpoint-provider",
          appEnv: {
            PORT: "port",
            APP_HTTP_URL: "url"
          }
        }
      ]
    });

    let runnerCalled = false;
    const runner: ChildProcessRunner = async () => {
      runnerCalled = true;
      return { exitCode: 0 };
    };

    const outcome = await runCli(
      ["run", "--config", configPath, "--providers", providersModulePath,
       "--worktree-id", "wt-typed-endpoint-conflict", "--", "node", "-e", "0"],
      { runner, parentEnv: { PORT: "3000" } }
    );

    expect(outcome.exitCode).toBe(1);
    expect(runnerCalled).toBe(false);
    const parsed = JSON.parse(outcome.stderr[0]!) as { ok: boolean; refusal?: { category: string; reason: string } };
    expect(parsed.ok).toBe(false);
    expect(parsed.refusal?.category).toBe("invalid_configuration");
    expect(parsed.refusal?.reason).toMatch(/PORT/);
  });

  it("refuses when typed endpoint port extraction cannot be performed", async () => {
    const configPath = await writeConfig({
      resources: [],
      endpoints: [
        {
          name: "app-base-url",
          role: "application-base-url",
          provider: "test-endpoint-provider",
          appEnv: {
            PORT: "port"
          }
        }
      ]
    });

    let runnerCalled = false;
    const runner: ChildProcessRunner = async () => {
      runnerCalled = true;
      return { exitCode: 0 };
    };

    const outcome = await runCli(
      ["run", "--config", configPath, "--providers", providersModulePath,
       "--worktree-id", "wt-port-extraction-refusal", "--", "node", "-e", "0"],
      { runner, parentEnv: {} }
    );

    expect(outcome.exitCode).toBe(1);
    expect(runnerCalled).toBe(false);
    const parsed = JSON.parse(outcome.stderr[0]!) as { ok: boolean; refusal?: { category: string; reason: string } };
    expect(parsed.ok).toBe(false);
    expect(parsed.refusal?.category).toBe("invalid_configuration");
    expect(parsed.refusal?.reason).toMatch(/PORT/);
  });

  // ---------------------------------------------------------------------------
  // Declaration validation — appEnv field
  // ---------------------------------------------------------------------------

  it("refuses derive when appEnv is an empty string", async () => {
    const configPath = await writeConfig({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider",
          isolationStrategy: "name-scoped",
          scopedValidate: false,
          scopedReset: false,
          scopedCleanup: false,
          appEnv: ""
        }
      ],
      endpoints: []
    });

    const outcome = await runCli(
      ["run", "--config", configPath, "--providers", providersModulePath,
       "--worktree-id", "wt-empty-appenv", "--", "node", "-e", "0"],
      { runner: async () => ({ exitCode: 0 }) }
    );

    expect(outcome.exitCode).toBe(1);
    const parsed = JSON.parse(outcome.stderr[0]!) as { ok: boolean };
    expect(parsed.ok).toBe(false);
  });

  it("refuses derive when appEnv is not a valid env var name", async () => {
    const configPath = await writeConfig({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider",
          isolationStrategy: "name-scoped",
          scopedValidate: false,
          scopedReset: false,
          scopedCleanup: false,
          appEnv: "has-hyphen"
        }
      ],
      endpoints: []
    });

    const outcome = await runCli(
      ["run", "--config", configPath, "--providers", providersModulePath,
       "--worktree-id", "wt-invalid-name", "--", "node", "-e", "0"],
      { runner: async () => ({ exitCode: 0 }) }
    );

    expect(outcome.exitCode).toBe(1);
    const parsed = JSON.parse(outcome.stderr[0]!) as { ok: boolean };
    expect(parsed.ok).toBe(false);
  });

  it("refuses derive when appEnv uses the reserved MULTIVERSE_ prefix", async () => {
    const configPath = await writeConfig({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider",
          isolationStrategy: "name-scoped",
          scopedValidate: false,
          scopedReset: false,
          scopedCleanup: false,
          appEnv: "MULTIVERSE_MY_VAR"
        }
      ],
      endpoints: []
    });

    const outcome = await runCli(
      ["run", "--config", configPath, "--providers", providersModulePath,
       "--worktree-id", "wt-reserved-prefix", "--", "node", "-e", "0"],
      { runner: async () => ({ exitCode: 0 }) }
    );

    expect(outcome.exitCode).toBe(1);
    const parsed = JSON.parse(outcome.stderr[0]!) as { ok: boolean };
    expect(parsed.ok).toBe(false);
  });

  it("refuses derive when the same appEnv name appears on two declarations", async () => {
    const configPath = await writeConfig({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider",
          isolationStrategy: "name-scoped",
          scopedValidate: false,
          scopedReset: false,
          scopedCleanup: false,
          appEnv: "SHARED_NAME"
        }
      ],
      endpoints: [
        {
          name: "app-base-url",
          role: "application-base-url",
          provider: "test-endpoint-provider",
          appEnv: "SHARED_NAME"
        }
      ]
    });

    const outcome = await runCli(
      ["run", "--config", configPath, "--providers", providersModulePath,
       "--worktree-id", "wt-dup-appenv", "--", "node", "-e", "0"],
      { runner: async () => ({ exitCode: 0 }) }
    );

    expect(outcome.exitCode).toBe(1);
    const parsed = JSON.parse(outcome.stderr[0]!) as { ok: boolean };
    expect(parsed.ok).toBe(false);
  });

  it("refuses derive when endpoint typed appEnv uses an unsupported value kind", async () => {
    const configPath = await writeConfig({
      resources: [],
      endpoints: [
        {
          name: "http",
          role: "application-http",
          provider: "test-endpoint-provider",
          appEnv: {
            PORT: "hostname"
          }
        }
      ]
    });

    const outcome = await runCli(
      ["run", "--config", configPath, "--providers", providersModulePath,
       "--worktree-id", "wt-invalid-kind", "--", "node", "-e", "0"],
      { runner: async () => ({ exitCode: 0 }) }
    );

    expect(outcome.exitCode).toBe(1);
    const parsed = JSON.parse(outcome.stderr[0]!) as { ok: boolean };
    expect(parsed.ok).toBe(false);
  });

  it("refuses derive when endpoint typed appEnv is an empty object", async () => {
    const configPath = await writeConfig({
      resources: [],
      endpoints: [
        {
          name: "http",
          role: "application-http",
          provider: "test-endpoint-provider",
          appEnv: {}
        }
      ]
    });

    const outcome = await runCli(
      ["run", "--config", configPath, "--providers", providersModulePath,
       "--worktree-id", "wt-empty-object", "--", "node", "-e", "0"],
      { runner: async () => ({ exitCode: 0 }) }
    );

    expect(outcome.exitCode).toBe(1);
    const parsed = JSON.parse(outcome.stderr[0]!) as { ok: boolean };
    expect(parsed.ok).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // derive --format=env is unaffected
  // ---------------------------------------------------------------------------

  it("does not include appEnv aliases in derive --format=env output", async () => {
    const configPath = await writeConfig({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider",
          isolationStrategy: "name-scoped",
          scopedValidate: false,
          scopedReset: false,
          scopedCleanup: false,
          appEnv: "DATABASE_URL"
        }
      ],
      endpoints: []
    });

    const outcome = await runCli(
      ["derive", "--format", "env", "--config", configPath,
       "--providers", providersModulePath, "--worktree-id", "wt-env-format"]
    );

    expect(outcome.exitCode).toBe(0);
    // only canonical var in output
    expect(outcome.stdout).toContain("MULTIVERSE_RESOURCE_PRIMARY_DB=primary-db--wt-env-format");
    // alias must NOT appear
    const hasAlias = outcome.stdout.some((line) => line.startsWith("DATABASE_URL="));
    expect(hasAlias).toBe(false);
  });
});
