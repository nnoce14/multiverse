/**
 * Integration tests for mixed-provider composition.
 *
 * Proves that one application can consume three Multiverse-managed seams simultaneously:
 *
 *   1. path-scoped resource  — per-worktree SQLite directory; reset clears it
 *   2. process-port-scoped resource — per-worktree in-memory cache sidecar; reset restarts it
 *   3. local-port endpoint   — per-worktree HTTP listener port
 *
 * Composition behaviors verified:
 *   - Three-seam derivation in one deriveOne call
 *   - Cross-seam isolation: all three seams are distinct across two concurrent worktrees
 *   - Reset clears the SQLite store and restarts the sidecar at the same derived address
 *   - After reset, sidecar is reachable again with empty state
 *   - Cleanup stops the sidecar and removes the db directory in one call
 *   - Operations on one worktree do not affect the other
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { spawn, type ChildProcess } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

import { deriveOne, resetOneResource, cleanupOneResource } from "@multiverse/core";
import { createPathScopedProvider } from "@multiverse/provider-path-scoped";
import { createLocalPortProvider } from "@multiverse/provider-local-port";
import { createProcessPortScopedProvider } from "@multiverse/provider-process-port-scoped";

import { runCli, type ChildProcessRunner } from "../../apps/cli/src/index";
import { startApp, type AppHandle } from "../../apps/sample-compose/src/app.js";

// ---------------------------------------------------------------------------
// Shared configuration
// ---------------------------------------------------------------------------

const TEST_BASE_DIR = join(tmpdir(), "multiverse-integration-compose");
const TEST_BASE_PORT_HTTP = 5400;
const TEST_BASE_PORT_SIDECAR = 6400;

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../");
const tsx = resolve(root, "node_modules/.bin/tsx");
const sidecarPath = resolve(root, "apps/sample-compose/src/sidecar.ts");
const sampleComposeConfigPath = resolve(root, "apps/sample-compose/multiverse.json");
const sampleComposeEntrypointPath = resolve(root, "apps/sample-compose/src/index.ts");

const providers = {
  resources: {
    "path-scoped": createPathScopedProvider({
      baseDir: join(TEST_BASE_DIR, "db")
    }),
    "process-port-scoped": createProcessPortScopedProvider({
      baseDir: join(TEST_BASE_DIR, "sidecar"),
      basePort: TEST_BASE_PORT_SIDECAR,
      command: [tsx, sidecarPath, "--port", "{PORT}"]
    })
  },
  endpoints: {
    "local-port": createLocalPortProvider({ basePort: TEST_BASE_PORT_HTTP })
  }
};

const repository = {
  resources: [
    {
      name: "app-db",
      provider: "path-scoped",
      isolationStrategy: "path-scoped" as const,
      scopedValidate: false,
      scopedReset: true,
      scopedCleanup: true,
      appEnv: "DATABASE_PATH"
    },
    {
      name: "cache-sidecar",
      provider: "process-port-scoped",
      isolationStrategy: "process-port-scoped" as const,
      scopedValidate: false,
      scopedReset: true,
      scopedCleanup: true,
      appEnv: "CACHE_ADDR"
    }
  ],
  endpoints: [
    {
      name: "http",
      role: "application-http",
      provider: "local-port",
      appEnv: "APP_HTTP_URL"
    }
  ]
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractPort(address: string): number {
  return parseInt(new URL(address).port, 10);
}

async function waitForSidecar(cacheAddr: string, timeoutMs = 3000): Promise<void> {
  const url = `http://${cacheAddr}/health`;
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch (err) {
      lastError = err;
    }
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error(`Sidecar at ${cacheAddr} did not become ready within ${timeoutMs}ms: ${String(lastError)}`);
}

async function waitForApp(address: string, timeoutMs = 3000): Promise<void> {
  const url = `${address}/health`;
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch (err) {
      lastError = err;
    }
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error(`App at ${address} did not become ready within ${timeoutMs}ms: ${String(lastError)}`);
}

async function writeTestProvidersModule(): Promise<string> {
  const tempDir = await mkdtemp(join(tmpdir(), "multiverse-sample-compose-providers-"));
  const modulePath = join(tempDir, "providers.ts");
  await writeFile(
    modulePath,
    `import { join } from "node:path";
import { createPathScopedProvider } from "@multiverse/provider-path-scoped";
import { createLocalPortProvider } from "@multiverse/provider-local-port";
import { createProcessPortScopedProvider } from "@multiverse/provider-process-port-scoped";

export const providers = {
  resources: {
    "path-scoped": createPathScopedProvider({
      baseDir: join(${JSON.stringify(TEST_BASE_DIR)}, "db")
    }),
    "process-port-scoped": createProcessPortScopedProvider({
      baseDir: join(${JSON.stringify(TEST_BASE_DIR)}, "sidecar"),
      basePort: ${TEST_BASE_PORT_SIDECAR},
      command: [${JSON.stringify(tsx)}, ${JSON.stringify(sidecarPath)}, "--port", "{PORT}"]
    })
  },
  endpoints: {
    "local-port": createLocalPortProvider({ basePort: ${TEST_BASE_PORT_HTTP} })
  }
};
`
  );
  return modulePath;
}

async function readSampleComposeRepository() {
  return JSON.parse(await readFile(sampleComposeConfigPath, "utf8")) as typeof repository;
}

async function terminateChildProcess(child: ChildProcess | undefined): Promise<void> {
  if (!child || child.exitCode !== null || child.killed) {
    return;
  }

  await new Promise<void>((resolve) => {
    child.once("exit", () => resolve());
    child.kill("SIGTERM");
  });
}

// ---------------------------------------------------------------------------
// Derivation
// ---------------------------------------------------------------------------

const derivedA = deriveOne({ repository, worktree: { id: "wt-compose-a" }, providers });
const derivedB = deriveOne({ repository, worktree: { id: "wt-compose-b" }, providers });

if (!derivedA.ok || !derivedB.ok) {
  throw new Error("Derivation failed during test setup");
}

const dbPlanA = derivedA.resourcePlans.find((p) => p.resourceName === "app-db")!;
const cachePlanA = derivedA.resourcePlans.find((p) => p.resourceName === "cache-sidecar")!;
const httpMappingA = derivedA.endpointMappings[0];

const dbPlanB = derivedB.resourcePlans.find((p) => p.resourceName === "app-db")!;
const cachePlanB = derivedB.resourcePlans.find((p) => p.resourceName === "cache-sidecar")!;
const httpMappingB = derivedB.endpointMappings[0];

const dbPathA = dbPlanA.handle;
const cacheAddrA = cachePlanA.handle;
const portA = extractPort(httpMappingA.address);

const dbPathB = dbPlanB.handle;
const cacheAddrB = cachePlanB.handle;
const portB = extractPort(httpMappingB.address);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("sample-compose: mixed-provider composition", () => {
  describe("derivation", () => {
    it("produces three seam values per worktree", () => {
      expect(dbPathA).toMatch(/app-db/);
      expect(cacheAddrA).toMatch(/^localhost:\d+$/);
      expect(portA).toBeGreaterThan(0);
    });

    it("all three seams are distinct across two worktrees", () => {
      expect(dbPathA).not.toBe(dbPathB);
      expect(cacheAddrA).not.toBe(cacheAddrB);
      expect(portA).not.toBe(portB);
    });

    it("cache-sidecar handles are scheme-free localhost addresses", () => {
      expect(cacheAddrA).toMatch(/^localhost:\d+$/);
      expect(cacheAddrB).toMatch(/^localhost:\d+$/);
    });
  });

  describe("app-native env consumer path", () => {
    const worktreeId = "wt-compose-appenv";
    let child: ChildProcess | undefined;
    let providersModulePath: string | undefined;
    let appAddress = "";
    let repositoryConfig: typeof repository;

    beforeAll(async () => {
      repositoryConfig = await readSampleComposeRepository();
      providersModulePath = await writeTestProvidersModule();

      const derived = deriveOne({ repository: repositoryConfig, worktree: { id: worktreeId }, providers });
      if (!derived.ok) {
        throw new Error("Derivation failed during appEnv test setup");
      }

      const cacheAddr = derived.resourcePlans.find((plan) => plan.resourceName === "cache-sidecar")!.handle;
      appAddress = derived.endpointMappings.find((mapping) => mapping.endpointName === "http")!.address;

      const resetResult = await resetOneResource({
        repository: repositoryConfig,
        worktree: { id: worktreeId },
        providers
      });
      expect(resetResult.ok).toBe(true);
      await waitForSidecar(cacheAddr);

      const runner: ChildProcessRunner = async ({ cmd, args, env }) => {
        child = spawn(cmd, args, {
          env,
          stdio: ["ignore", "ignore", "pipe"]
        });

        let stderr = "";
        child.stderr?.on("data", (chunk) => {
          stderr += String(chunk);
        });

        try {
          await waitForApp(appAddress);
        } catch (error) {
          throw new Error(
            `sample-compose did not start through multiverse run: ${String(error)} stderr=${stderr}`
          );
        }
        return { exitCode: 0 };
      };

      const outcome = await runCli(
        [
          "run",
          "--config",
          sampleComposeConfigPath,
          "--providers",
          providersModulePath,
          "--worktree-id",
          worktreeId,
          "--",
          tsx,
          sampleComposeEntrypointPath
        ],
        {
          cwd: root,
          parentEnv: {},
          runner
        }
      );

      expect(outcome.exitCode).toBe(0);
    });

    afterAll(async () => {
      await terminateChildProcess(child);
      if (repositoryConfig) {
        await cleanupOneResource({
          repository: repositoryConfig,
          worktree: { id: worktreeId },
          providers
        });
      }
      if (providersModulePath) {
        await rm(dirname(providersModulePath), { recursive: true, force: true });
      }
    });

    it("launches sample-compose through app-native env aliases instead of raw MULTIVERSE_* reads", async () => {
      const res = await fetch(`${appAddress}/health`);
      const body = await res.json() as { ok: boolean; dbPath: string; cacheAddr: string; port: number };
      expect(body.ok).toBe(true);

      const derived = deriveOne({ repository: repositoryConfig, worktree: { id: worktreeId }, providers });
      if (!derived.ok) {
        throw new Error("Derivation failed during appEnv assertions");
      }

      expect(body.dbPath).toBe(
        derived.resourcePlans.find((plan) => plan.resourceName === "app-db")!.handle
      );
      expect(body.cacheAddr).toBe(
        derived.resourcePlans.find((plan) => plan.resourceName === "cache-sidecar")!.handle
      );
      expect(body.port).toBe(
        extractPort(derived.endpointMappings.find((mapping) => mapping.endpointName === "http")!.address)
      );
    });
  });

  describe("lifecycle and application behavior", () => {
    let appA: AppHandle | undefined;
    let appB: AppHandle | undefined;

    beforeAll(async () => {
      // Reset both worktrees: starts both sidecars, initialises db directories
      await resetOneResource({ repository, worktree: { id: "wt-compose-a" }, providers });
      await resetOneResource({ repository, worktree: { id: "wt-compose-b" }, providers });

      // Wait for both sidecars to be reachable
      await waitForSidecar(cacheAddrA);
      await waitForSidecar(cacheAddrB);

      // Start both application instances
      appA = await startApp({ dbPath: dbPathA, cacheAddr: cacheAddrA, port: portA });
      appB = await startApp({ dbPath: dbPathB, cacheAddr: cacheAddrB, port: portB });
    });

    afterAll(async () => {
      await appA?.close();
      await appB?.close();
      await cleanupOneResource({ repository, worktree: { id: "wt-compose-a" }, providers });
      await cleanupOneResource({ repository, worktree: { id: "wt-compose-b" }, providers });
      await rm(TEST_BASE_DIR, { recursive: true, force: true });
    });

    it("sidecar is reachable at the derived address after reset", async () => {
      const res = await fetch(`http://${cacheAddrA}/health`);
      const body = await res.json() as { ok: boolean };
      expect(body.ok).toBe(true);
    });

    it("app health reports all three seam values", async () => {
      const res = await fetch(`${appA!.address}/health`);
      const body = await res.json() as { ok: boolean; dbPath: string; cacheAddr: string; port: number };
      expect(body.ok).toBe(true);
      expect(body.dbPath).toBe(dbPathA);
      expect(body.cacheAddr).toBe(cacheAddrA);
      expect(body.port).toBe(portA);
    });

    it("app can write and read items from SQLite (path-scoped seam)", async () => {
      await fetch(`${appA!.address}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "test-item" })
      });

      const res = await fetch(`${appA!.address}/items`);
      const items = await res.json() as Array<{ name: string }>;
      expect(items.map((i) => i.name)).toContain("test-item");
    });

    it("app can write and read values from the cache sidecar (process-port-scoped seam)", async () => {
      await fetch(`${appA!.address}/cache/greeting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: "hello-compose" })
      });

      const res = await fetch(`${appA!.address}/cache/greeting`);
      const body = await res.json() as { key: string; value: string | null };
      expect(body.value).toBe("hello-compose");
    });

    it("worktree A state does not appear in worktree B", async () => {
      // Write to A
      await fetch(`${appA!.address}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "only-in-a" })
      });
      await fetch(`${appA!.address}/cache/marker`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: "a-side" })
      });

      // Verify B does not see A's state
      const itemsB = await fetch(`${appB!.address}/items`).then((r) => r.json()) as Array<{ name: string }>;
      expect(itemsB.map((i) => i.name)).not.toContain("only-in-a");

      const cacheB = await fetch(`${appB!.address}/cache/marker`).then((r) => r.json()) as { value: string | null };
      expect(cacheB.value).toBeNull();
    });

    it("reset clears SQLite state and restarts the sidecar with empty state", async () => {
      // Seed state in worktree A
      await fetch(`${appA!.address}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "before-reset" })
      });
      await fetch(`${appA!.address}/cache/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: "active" })
      });

      // Verify state exists
      const itemsBefore = await fetch(`${appA!.address}/items`).then((r) => r.json()) as Array<{ name: string }>;
      expect(itemsBefore.map((i) => i.name)).toContain("before-reset");
      const cacheBefore = await fetch(`${appA!.address}/cache/session`).then((r) => r.json()) as { value: string | null };
      expect(cacheBefore.value).toBe("active");

      // Close the app before resetting (SQLite must not have open connections)
      await appA!.close();

      // Reset both seams
      const resetResult = await resetOneResource({ repository, worktree: { id: "wt-compose-a" }, providers });
      expect(resetResult.ok).toBe(true);

      // Wait for the new sidecar process to be ready
      await waitForSidecar(cacheAddrA);

      // Restart the app
      appA = await startApp({ dbPath: dbPathA, cacheAddr: cacheAddrA, port: portA });

      // SQLite state is gone
      const itemsAfter = await fetch(`${appA!.address}/items`).then((r) => r.json()) as Array<{ name: string }>;
      expect(itemsAfter).toHaveLength(0);

      // Cache sidecar state is gone (new process, empty map)
      const cacheAfter = await fetch(`${appA!.address}/cache/session`).then((r) => r.json()) as { value: string | null };
      expect(cacheAfter.value).toBeNull();
    });

    it("sidecar is reachable at the same derived address after reset", async () => {
      // cacheAddrA is deterministic — same address, new process
      const res = await fetch(`http://${cacheAddrA}/health`);
      const body = await res.json() as { ok: boolean; port: number };
      expect(body.ok).toBe(true);
      expect(body.port).toBe(parseInt(cacheAddrA.split(":")[1], 10));
    });

    it("reset result includes both resources that declared scopedReset: true", async () => {
      await appA!.close();
      const result = await resetOneResource({ repository, worktree: { id: "wt-compose-a" }, providers });
      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.resourceResets).toHaveLength(2);
      const resetNames = result.resourceResets.map((r) => r.resourceName);
      expect(resetNames).toContain("app-db");
      expect(resetNames).toContain("cache-sidecar");

      await waitForSidecar(cacheAddrA);
      appA = await startApp({ dbPath: dbPathA, cacheAddr: cacheAddrA, port: portA });
    });
  });

  describe("cleanup", () => {
    beforeAll(async () => {
      // Ensure worktrees are reset and running for cleanup tests
      await resetOneResource({ repository, worktree: { id: "wt-compose-cleanup" }, providers });
    });

    it("cleanup stops the sidecar and removes the db directory", async () => {
      const derivedC = deriveOne({ repository, worktree: { id: "wt-compose-cleanup" }, providers });
      if (!derivedC.ok) throw new Error("derivation failed");

      const dbPath = derivedC.resourcePlans.find((p) => p.resourceName === "app-db")!.handle;
      const cacheAddr = derivedC.resourcePlans.find((p) => p.resourceName === "cache-sidecar")!.handle;

      await waitForSidecar(cacheAddr);

      // Sidecar is reachable before cleanup
      const healthBefore = await fetch(`http://${cacheAddr}/health`);
      expect((await healthBefore.json() as { ok: boolean }).ok).toBe(true);

      const result = await cleanupOneResource({ repository, worktree: { id: "wt-compose-cleanup" }, providers });
      expect(result.ok).toBe(true);

      // db directory is removed (path-scoped cleanup removes it; reset had already cleared it
      // so it may not have existed — either way it must not be present after cleanup)
      expect(existsSync(dbPath.replace(/\/$/, ""))).toBe(false);

      // sidecar process is gone — health check should fail
      let sidecarGone = false;
      try {
        await fetch(`http://${cacheAddr}/health`);
      } catch {
        sidecarGone = true;
      }
      expect(sidecarGone).toBe(true);
    });

    it("cleanup result includes both resources that declared scopedCleanup: true", async () => {
      // Use a fresh worktree for a clean cleanup result
      await resetOneResource({ repository, worktree: { id: "wt-compose-cleanup2" }, providers });
      const derivedC2 = deriveOne({ repository, worktree: { id: "wt-compose-cleanup2" }, providers });
      if (!derivedC2.ok) throw new Error("derivation failed");
      await waitForSidecar(derivedC2.resourcePlans.find((p) => p.resourceName === "cache-sidecar")!.handle);

      const result = await cleanupOneResource({ repository, worktree: { id: "wt-compose-cleanup2" }, providers });
      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.resourceCleanups).toHaveLength(2);
      const cleanedNames = result.resourceCleanups.map((r) => r.resourceName);
      expect(cleanedNames).toContain("app-db");
      expect(cleanedNames).toContain("cache-sidecar");
    });

    it("second cleanup is idempotent", async () => {
      const result = await cleanupOneResource({ repository, worktree: { id: "wt-compose-cleanup" }, providers });
      expect(result.ok).toBe(true);
    });
  });
});
