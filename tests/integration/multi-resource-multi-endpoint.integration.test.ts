/**
 * Integration tests for multi-resource and multi-endpoint configurations.
 *
 * These tests prove that multiverse handles realistic configs with:
 *   1. Two resources with different isolation strategies (path-scoped + name-scoped)
 *   2. Two endpoints per worktree
 *   3. Independent isolation for each resource across worktrees
 *   4. Independent lifecycle (reset/cleanup) per resource, not affecting peers
 *   5. All endpoint addresses are unique across worktrees and endpoints
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  deriveOne,
  resetOneResource,
  cleanupOneResource
} from "@multiverse/core";
import { createPathScopedProvider } from "@multiverse/provider-path-scoped";
import { createNameScopedProvider } from "@multiverse/provider-name-scoped";
import { createLocalPortProvider } from "@multiverse/provider-local-port";

import { startApp, type AppHandle } from "../../apps/sample-express/src/app.js";

// ---------------------------------------------------------------------------
// Shared configuration
// ---------------------------------------------------------------------------

const TEST_BASE_DIR = join(tmpdir(), "multiverse-integration-multi");
const TEST_BASE_PORT = 5300;

const providers = {
  resources: {
    "path-scoped": createPathScopedProvider({ baseDir: TEST_BASE_DIR }),
    "name-scoped": createNameScopedProvider()
  },
  endpoints: {
    "local-port": createLocalPortProvider({ basePort: TEST_BASE_PORT })
  }
};

const repository = {
  resources: [
    {
      name: "primary-db",
      provider: "path-scoped",
      isolationStrategy: "path-scoped" as const,
      scopedValidate: false,
      scopedReset: true,
      scopedCleanup: true
    },
    {
      name: "secondary-cache",
      provider: "name-scoped",
      isolationStrategy: "name-scoped" as const,
      scopedValidate: false,
      scopedReset: false,
      scopedCleanup: false
    }
  ],
  endpoints: [
    {
      name: "app-http",
      role: "application-http",
      provider: "local-port"
    },
    {
      name: "admin-http",
      role: "admin-http",
      provider: "local-port"
    }
  ]
};

// ---------------------------------------------------------------------------
// Derive for two worktrees
// ---------------------------------------------------------------------------

const derivedA = deriveOne({ repository, worktree: { id: "wt-multi-a" }, providers });
const derivedB = deriveOne({ repository, worktree: { id: "wt-multi-b" }, providers });

if (!derivedA.ok) throw new Error(`Derivation A failed: ${JSON.stringify(derivedA)}`);
if (!derivedB.ok) throw new Error(`Derivation B failed: ${JSON.stringify(derivedB)}`);

const primaryDbPathA = derivedA.resourcePlans.find((p) => p.resourceName === "primary-db")!.handle;
const primaryDbPathB = derivedB.resourcePlans.find((p) => p.resourceName === "primary-db")!.handle;
const cacheHandleA = derivedA.resourcePlans.find((p) => p.resourceName === "secondary-cache")!.handle;
const cacheHandleB = derivedB.resourcePlans.find((p) => p.resourceName === "secondary-cache")!.handle;

const appAddrA = derivedA.endpointMappings.find((e) => e.endpointName === "app-http")!.address;
const appAddrB = derivedB.endpointMappings.find((e) => e.endpointName === "app-http")!.address;
const adminAddrA = derivedA.endpointMappings.find((e) => e.endpointName === "admin-http")!.address;
const adminAddrB = derivedB.endpointMappings.find((e) => e.endpointName === "admin-http")!.address;

const appPortA = parseInt(new URL(appAddrA).port, 10);
const appPortB = parseInt(new URL(appAddrB).port, 10);

// ---------------------------------------------------------------------------

describe("multi-resource + multi-endpoint integration", () => {
  let serverA: AppHandle;
  let serverB: AppHandle;

  beforeAll(async () => {
    serverA = await startApp({ dbPath: primaryDbPathA, port: appPortA });
    serverB = await startApp({ dbPath: primaryDbPathB, port: appPortB });
  });

  afterAll(async () => {
    await serverA.close();
    await serverB.close();
    await rm(TEST_BASE_DIR, { recursive: true, force: true });
  });

  // -------------------------------------------------------------------------
  describe("derivation: multi-resource", () => {
    it("primary-db handles are different for each worktree", () => {
      expect(primaryDbPathA).not.toBe(primaryDbPathB);
    });

    it("secondary-cache handles are different for each worktree", () => {
      expect(cacheHandleA).not.toBe(cacheHandleB);
    });

    it("path-scoped handle contains the worktree ID in the path", () => {
      expect(primaryDbPathA).toContain("wt-multi-a");
      expect(primaryDbPathB).toContain("wt-multi-b");
    });

    it("name-scoped handle contains the worktree ID in the name", () => {
      expect(cacheHandleA).toContain("wt-multi-a");
      expect(cacheHandleB).toContain("wt-multi-b");
    });

    it("path-scoped and name-scoped handles for the same worktree are different", () => {
      expect(primaryDbPathA).not.toBe(cacheHandleA);
      expect(primaryDbPathB).not.toBe(cacheHandleB);
    });

    it("all four resource handles are distinct", () => {
      const handles = new Set([primaryDbPathA, primaryDbPathB, cacheHandleA, cacheHandleB]);
      expect(handles.size).toBe(4);
    });
  });

  // -------------------------------------------------------------------------
  describe("derivation: multi-endpoint", () => {
    it("app-http and admin-http addresses for worktree A are different", () => {
      expect(appAddrA).not.toBe(adminAddrA);
    });

    it("app-http and admin-http addresses for worktree B are different", () => {
      expect(appAddrB).not.toBe(adminAddrB);
    });

    it("app-http address is different for each worktree", () => {
      expect(appAddrA).not.toBe(appAddrB);
    });

    it("admin-http address is different for each worktree", () => {
      expect(adminAddrA).not.toBe(adminAddrB);
    });

    it("all four endpoint addresses are distinct", () => {
      const addrs = new Set([appAddrA, appAddrB, adminAddrA, adminAddrB]);
      expect(addrs.size).toBe(4);
    });
  });

  // -------------------------------------------------------------------------
  describe("runtime isolation: primary-db (path-scoped)", () => {
    it("state written to worktree A primary-db does not appear in worktree B", async () => {
      await fetch(`${appAddrA}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "a-item" })
      });

      const itemsA = await fetch(`${appAddrA}/items`).then((r) => r.json()) as Array<{ name: string }>;
      const itemsB = await fetch(`${appAddrB}/items`).then((r) => r.json()) as Array<{ name: string }>;

      expect(itemsA.map((i) => i.name)).toContain("a-item");
      expect(itemsB.map((i) => i.name)).not.toContain("a-item");
    });

    it("state written to worktree B primary-db does not appear in worktree A", async () => {
      await fetch(`${appAddrA}/items`, { method: "DELETE" });
      await fetch(`${appAddrB}/items`, { method: "DELETE" });

      await fetch(`${appAddrB}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "b-item" })
      });

      const itemsA = await fetch(`${appAddrA}/items`).then((r) => r.json()) as Array<{ name: string }>;
      const itemsB = await fetch(`${appAddrB}/items`).then((r) => r.json()) as Array<{ name: string }>;

      expect(itemsA.map((i) => i.name)).not.toContain("b-item");
      expect(itemsB.map((i) => i.name)).toContain("b-item");
    });
  });

  // -------------------------------------------------------------------------
  describe("runtime isolation: secondary-cache (name-scoped)", () => {
    it("secondary-cache handles name-encode the worktree ID without collision", () => {
      // Name-scoped isolation: handles are deterministic name strings
      expect(cacheHandleA).toMatch(/secondary-cache.+wt-multi-a/);
      expect(cacheHandleB).toMatch(/secondary-cache.+wt-multi-b/);
    });

    it("writing a cache file to each handle produces isolated on-disk state", async () => {
      // Use the name-scoped handle as a file path for a simple cache file
      const cacheFileA = `${cacheHandleA}.json`;
      const cacheFileB = `${cacheHandleB}.json`;
      const cacheDir = join(TEST_BASE_DIR, "caches");
      await mkdir(cacheDir, { recursive: true });

      await writeFile(join(cacheDir, `${cacheHandleA}.json`), JSON.stringify({ key: "value-a" }));
      await writeFile(join(cacheDir, `${cacheHandleB}.json`), JSON.stringify({ key: "value-b" }));

      const contentA = JSON.parse(await readFile(join(cacheDir, `${cacheHandleA}.json`), "utf-8")) as { key: string };
      const contentB = JSON.parse(await readFile(join(cacheDir, `${cacheHandleB}.json`), "utf-8")) as { key: string };

      expect(contentA.key).toBe("value-a");
      expect(contentB.key).toBe("value-b");
      // File names differ because handles differ
      expect(cacheFileA).not.toBe(cacheFileB);
    });
  });

  // -------------------------------------------------------------------------
  describe("lifecycle: independent resource reset", () => {
    it("resetting primary-db for worktree A does not affect worktree B primary-db", async () => {
      // Write data to both
      await fetch(`${appAddrA}/items`, { method: "DELETE" });
      await fetch(`${appAddrB}/items`, { method: "DELETE" });
      await fetch(`${appAddrA}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "before-reset-a" })
      });
      await fetch(`${appAddrB}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "survives-reset" })
      });

      // Reset A's primary-db
      const result = await resetOneResource({ repository, worktree: { id: "wt-multi-a" }, providers });
      expect(result.ok).toBe(true);
      if (!result.ok) return;

      // Only primary-db was reset (not secondary-cache, which has scopedReset: false)
      expect(result.resourceResets).toHaveLength(1);
      expect(result.resourceResets[0].resourceName).toBe("primary-db");

      // A's items are gone; B's are intact
      const itemsA = await fetch(`${appAddrA}/items`).then((r) => r.json()) as unknown[];
      const itemsB = await fetch(`${appAddrB}/items`).then((r) => r.json()) as Array<{ name: string }>;

      expect(itemsA).toHaveLength(0);
      expect(itemsB.map((i) => i.name)).toContain("survives-reset");
    });

    it("reset result includes only resources that declared scopedReset: true", async () => {
      const result = await resetOneResource({ repository, worktree: { id: "wt-multi-b" }, providers });
      expect(result.ok).toBe(true);
      if (!result.ok) return;

      // Only primary-db declares scopedReset: true; secondary-cache does not
      expect(result.resourceResets).toHaveLength(1);
      expect(result.resourceResets[0].resourceName).toBe("primary-db");
    });

    it("cleanup result includes only resources that declared scopedCleanup: true", async () => {
      const result = await cleanupOneResource({ repository, worktree: { id: "wt-multi-a" }, providers });
      expect(result.ok).toBe(true);
      if (!result.ok) return;

      // Only primary-db declares scopedCleanup: true; secondary-cache does not
      expect(result.resourceCleanups).toHaveLength(1);
      expect(result.resourceCleanups[0].resourceName).toBe("primary-db");
    });
  });
});
