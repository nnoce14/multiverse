/**
 * Integration tests for the sample-express app.
 *
 * These tests start two live Express instances under different worktree
 * identities and prove the core multiverse guarantees at runtime:
 *
 *   1. Derivation assigns different resource paths and endpoint addresses
 *      to different worktrees.
 *   2. State written through one worktree's server does not appear in the
 *      other worktree's server (runtime isolation).
 *   3. Both instances can run simultaneously without interference.
 *   4. Reset returns the correct resource handle for the target worktree
 *      only, and applying it clears that worktree's state without touching
 *      the other.
 *   5. Cleanup returns the correct resource handle for the target worktree
 *      only, and applying it removes that worktree's data file without
 *      touching the other.
 */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { rm, access } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { deriveOne, resetOneResource, cleanupOneResource } from "@multiverse/core";
import { createPathScopedProvider } from "@multiverse/provider-path-scoped";
import { createLocalPortProvider } from "@multiverse/provider-local-port";

import { startApp, type AppHandle } from "../../apps/sample-express/src/app.js";

// ---------------------------------------------------------------------------
// Shared provider configuration
// ---------------------------------------------------------------------------

const TEST_BASE_DIR = join(tmpdir(), "multiverse-integration-sample-express");
const TEST_BASE_PORT = 5200;

const providers = {
  resources: {
    "path-scoped": createPathScopedProvider({ baseDir: TEST_BASE_DIR })
  },
  endpoints: {
    "local-port": createLocalPortProvider({ basePort: TEST_BASE_PORT })
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
      scopedCleanup: true
    }
  ],
  endpoints: [
    {
      name: "http",
      role: "application-http",
      provider: "local-port"
    }
  ]
};

// ---------------------------------------------------------------------------
// Derive configs for two worktrees
// ---------------------------------------------------------------------------

const derivedA = deriveOne({ repository, worktree: { id: "wt-int-a" }, providers });
const derivedB = deriveOne({ repository, worktree: { id: "wt-int-b" }, providers });

if (!derivedA.ok) throw new Error(`Derivation failed for wt-int-a: ${JSON.stringify(derivedA)}`);
if (!derivedB.ok) throw new Error(`Derivation failed for wt-int-b: ${JSON.stringify(derivedB)}`);

const dbPathA = derivedA.resourcePlans[0].handle;
const dbPathB = derivedB.resourcePlans[0].handle;
const addrA = derivedA.endpointMappings[0].address;
const addrB = derivedB.endpointMappings[0].address;
const portA = parseInt(new URL(addrA).port, 10);
const portB = parseInt(new URL(addrB).port, 10);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getItems(baseUrl: string): Promise<Array<{ id: number; name: string }>> {
  const res = await fetch(`${baseUrl}/items`);
  return res.json() as Promise<Array<{ id: number; name: string }>>;
}

async function postItem(baseUrl: string, name: string): Promise<{ id: number; name: string }> {
  const res = await fetch(`${baseUrl}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  return res.json() as Promise<{ id: number; name: string }>;
}

async function clearItems(baseUrl: string): Promise<void> {
  await fetch(`${baseUrl}/items`, { method: "DELETE" });
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("sample-express integration", () => {
  let serverA: AppHandle;
  let serverB: AppHandle;

  beforeAll(async () => {
    serverA = await startApp({ dbPath: dbPathA, port: portA });
    serverB = await startApp({ dbPath: dbPathB, port: portB });
  });

  afterAll(async () => {
    await serverA.close();
    await serverB.close();
    await rm(TEST_BASE_DIR, { recursive: true, force: true });
  });

  beforeEach(async () => {
    await clearItems(addrA);
    await clearItems(addrB);
  });

  // -------------------------------------------------------------------------
  describe("derivation", () => {
    it("assigns different resource paths to different worktrees", () => {
      expect(dbPathA).not.toBe(dbPathB);
    });

    it("derived path for A contains worktree ID for A", () => {
      expect(dbPathA).toContain("wt-int-a");
    });

    it("derived path for B contains worktree ID for B", () => {
      expect(dbPathB).toContain("wt-int-b");
    });

    it("assigns different endpoint addresses to different worktrees", () => {
      expect(addrA).not.toBe(addrB);
    });

    it("both servers are reachable at their derived addresses", async () => {
      const [healthA, healthB] = await Promise.all([
        fetch(`${addrA}/health`).then((r) => r.json()),
        fetch(`${addrB}/health`).then((r) => r.json())
      ]);

      expect(healthA).toMatchObject({ ok: true, dbPath: dbPathA, port: portA });
      expect(healthB).toMatchObject({ ok: true, dbPath: dbPathB, port: portB });
    });
  });

  // -------------------------------------------------------------------------
  describe("runtime isolation", () => {
    it("state written to worktree A does not appear in worktree B", async () => {
      await postItem(addrA, "item-from-a");

      const itemsA = await getItems(addrA);
      const itemsB = await getItems(addrB);

      expect(itemsA).toHaveLength(1);
      expect(itemsA[0].name).toBe("item-from-a");
      expect(itemsB).toHaveLength(0);
    });

    it("state written to worktree B does not appear in worktree A", async () => {
      await postItem(addrB, "item-from-b");

      const itemsA = await getItems(addrA);
      const itemsB = await getItems(addrB);

      expect(itemsA).toHaveLength(0);
      expect(itemsB).toHaveLength(1);
      expect(itemsB[0].name).toBe("item-from-b");
    });

    it("both worktrees accumulate independent state without interference", async () => {
      // Post to A and B in an interleaved sequence to prove no cross-worktree
      // interference even when writes happen close together.
      await postItem(addrA, "a-one");
      await postItem(addrB, "b-one");
      await postItem(addrA, "a-two");

      const itemsA = await getItems(addrA);
      const itemsB = await getItems(addrB);

      expect(itemsA.map((i) => i.name)).toEqual(["a-one", "a-two"]);
      expect(itemsB.map((i) => i.name)).toEqual(["b-one"]);
    });

    it("both servers persist data to their own separate files on disk", async () => {
      await postItem(addrA, "written-to-a");
      await postItem(addrB, "written-to-b");

      expect(await fileExists(dbPathA)).toBe(true);
      expect(await fileExists(dbPathB)).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  describe("lifecycle: reset", () => {
    it("reset returns a successful result for a worktree with scopedReset declared", () => {
      const result = resetOneResource({
        repository,
        worktree: { id: "wt-int-a" },
        providers
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.resourceResets).toHaveLength(1);
      expect(result.resourceResets[0].capability).toBe("reset");
      expect(result.resourceResets[0].worktreeId).toBe("wt-int-a");
    });

    it("reset returns the same handle that was derived for that worktree", () => {
      const result = resetOneResource({
        repository,
        worktree: { id: "wt-int-a" },
        providers
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.resourcePlans[0].handle).toBe(dbPathA);
    });

    it("reset handle for A and reset handle for B are different", () => {
      const resultA = resetOneResource({ repository, worktree: { id: "wt-int-a" }, providers });
      const resultB = resetOneResource({ repository, worktree: { id: "wt-int-b" }, providers });

      expect(resultA.ok && resultB.ok).toBe(true);
      if (!resultA.ok || !resultB.ok) return;

      expect(resultA.resourcePlans[0].handle).not.toBe(resultB.resourcePlans[0].handle);
    });

    it("resetting A's resource clears A's state and leaves B's state intact", async () => {
      await postItem(addrA, "before-reset-a");
      await postItem(addrB, "stays-in-b");

      // Get the confirmed handle from multiverse reset
      const result = resetOneResource({ repository, worktree: { id: "wt-int-a" }, providers });
      expect(result.ok).toBe(true);
      if (!result.ok) return;

      // The app manager uses the confirmed handle to clear A's resource.
      // Here the test acts as the app manager: it clears A's state via the
      // server's management endpoint (which writes an empty store to the
      // confirmed file path — the same path multiverse just confirmed).
      await clearItems(addrA);

      const itemsA = await getItems(addrA);
      const itemsB = await getItems(addrB);

      expect(itemsA).toHaveLength(0);
      expect(itemsB).toHaveLength(1);
      expect(itemsB[0].name).toBe("stays-in-b");
    });
  });

  // -------------------------------------------------------------------------
  describe("lifecycle: cleanup", () => {
    it("cleanup returns a successful result for a worktree with scopedCleanup declared", () => {
      const result = cleanupOneResource({
        repository,
        worktree: { id: "wt-int-a" },
        providers
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.resourceCleanups).toHaveLength(1);
      expect(result.resourceCleanups[0].capability).toBe("cleanup");
      expect(result.resourceCleanups[0].worktreeId).toBe("wt-int-a");
    });

    it("cleanup returns the same handle that was derived for that worktree", () => {
      const result = cleanupOneResource({
        repository,
        worktree: { id: "wt-int-a" },
        providers
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.resourcePlans[0].handle).toBe(dbPathA);
    });

    it("cleanup handle for A and cleanup handle for B are different", () => {
      const resultA = cleanupOneResource({ repository, worktree: { id: "wt-int-a" }, providers });
      const resultB = cleanupOneResource({ repository, worktree: { id: "wt-int-b" }, providers });

      expect(resultA.ok && resultB.ok).toBe(true);
      if (!resultA.ok || !resultB.ok) return;

      expect(resultA.resourcePlans[0].handle).not.toBe(resultB.resourcePlans[0].handle);
    });

    it("removing A's data file via the confirmed handle does not affect B's data file", async () => {
      // Write data to both — ensures both files exist on disk
      await postItem(addrA, "will-be-cleaned");
      await postItem(addrB, "survives-cleanup");

      expect(await fileExists(dbPathA)).toBe(true);
      expect(await fileExists(dbPathB)).toBe(true);

      // Get cleanup confirmation from multiverse — it tells us A's path
      const result = cleanupOneResource({ repository, worktree: { id: "wt-int-a" }, providers });
      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const confirmedPath = result.resourcePlans[0].handle;
      expect(confirmedPath).toBe(dbPathA);

      // App manager deletes the confirmed file (simulating real cleanup)
      await rm(confirmedPath, { force: true });

      // A's file is gone; B's file is untouched
      expect(await fileExists(dbPathA)).toBe(false);
      expect(await fileExists(dbPathB)).toBe(true);

      // A's server gracefully returns empty items (file missing → empty store)
      const itemsA = await getItems(addrA);
      const itemsB = await getItems(addrB);

      expect(itemsA).toHaveLength(0);
      expect(itemsB).toHaveLength(1);
      expect(itemsB[0].name).toBe("survives-cleanup");
    });
  });
});
