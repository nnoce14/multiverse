import { describe, it, expect, afterEach } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { DerivedResourcePlan, ResourceReset, ResourceCleanup, Refusal } from "@multiverse/provider-contracts";
import { createProcessPortScopedProvider } from "@multiverse/provider-process-port-scoped";

function isDerivedResourcePlan(value: DerivedResourcePlan | Refusal): value is DerivedResourcePlan {
  return "resourceName" in value && "handle" in value;
}

describe("resource provider contract: process-port-scoped derive", () => {
  const provider = createProcessPortScopedProvider({
    baseDir: "/var/multiverse",
    basePort: 7000,
    command: ["node", "-e", "setTimeout(() => {}, 60000)"]
  });

  const validInput = {
    resource: {
      name: "cache",
      provider: "process-port-scoped",
      isolationStrategy: "process-port-scoped" as const,
      scopedValidate: false,
      scopedReset: false,
      scopedCleanup: false
    },
    worktree: {
      id: "feature-login",
      label: "feature/login",
      branch: "feature/login"
    }
  };

  it("returns a DerivedResourcePlan for valid input", () => {
    const result = provider.deriveResource(validInput);
    expect(isDerivedResourcePlan(result)).toBe(true);
  });

  it("returns a result with the expected shape", () => {
    const result = provider.deriveResource(validInput);
    expect(isDerivedResourcePlan(result)).toBe(true);
    if (!isDerivedResourcePlan(result)) return;

    expect(result.resourceName).toBe("cache");
    expect(result.provider).toBe("process-port-scoped");
    expect(result.isolationStrategy).toBe("process-port-scoped");
    expect(result.worktreeId).toBe("feature-login");
    expect(typeof result.handle).toBe("string");
    expect(result.handle.length).toBeGreaterThan(0);
  });

  it("derives a handle in localhost:{port} format with port in configured range", () => {
    const result = provider.deriveResource(validInput);
    expect(isDerivedResourcePlan(result)).toBe(true);
    if (!isDerivedResourcePlan(result)) return;

    const match = result.handle.match(/^localhost:(\d+)$/);
    expect(match).not.toBeNull();
    const port = parseInt(match![1], 10);
    expect(port).toBeGreaterThanOrEqual(7000);
    expect(port).toBeLessThan(8000);
  });
});

describe("resource provider contract: process-port-scoped reset", () => {
  let tmpDir: string;

  afterEach(async () => {
    if (tmpDir) await rm(tmpDir, { recursive: true, force: true });
  });

  it("declares reset capability", () => {
    const provider = createProcessPortScopedProvider({
      baseDir: "/var/multiverse",
      basePort: 7000,
      command: ["node", "-e", "setTimeout(() => {}, 60000)"]
    });
    expect(provider.capabilities?.reset).toBe(true);
  });

  it("returns a ResourceReset for a long-running process", async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "mv-pps-contract-reset-"));
    const provider = createProcessPortScopedProvider({
      baseDir: tmpDir,
      basePort: 7000,
      command: ["node", "-e", "setTimeout(() => {}, 60000)"]
    });

    const resourceInput = {
      name: "cache",
      provider: "process-port-scoped",
      isolationStrategy: "process-port-scoped" as const,
      scopedValidate: false,
      scopedReset: true,
      scopedCleanup: false
    };
    const derived: DerivedResourcePlan = {
      resourceName: "cache",
      provider: "process-port-scoped",
      isolationStrategy: "process-port-scoped",
      worktreeId: "feature-login",
      handle: "localhost:7042"
    };

    expect(provider.resetResource).toBeDefined();
    if (!provider.resetResource) return;

    const result = await provider.resetResource({
      resource: resourceInput,
      derived,
      worktree: { id: "feature-login" }
    });

    const reset = result as ResourceReset;
    expect(reset.capability).toBe("reset");
    expect(reset.resourceName).toBe("cache");
    expect(reset.worktreeId).toBe("feature-login");

    if (provider.cleanupResource) {
      await provider.cleanupResource({
        resource: { ...resourceInput, scopedCleanup: true },
        derived,
        worktree: { id: "feature-login" }
      });
    }
  });
});

describe("resource provider contract: process-port-scoped cleanup", () => {
  let tmpDir: string;

  afterEach(async () => {
    if (tmpDir) await rm(tmpDir, { recursive: true, force: true });
  });

  it("declares cleanup capability", () => {
    const provider = createProcessPortScopedProvider({
      baseDir: "/var/multiverse",
      basePort: 7000,
      command: ["node", "-e", "setTimeout(() => {}, 60000)"]
    });
    expect(provider.capabilities?.cleanup).toBe(true);
  });

  it("returns a ResourceCleanup for valid input", async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "mv-pps-contract-cleanup-"));
    const provider = createProcessPortScopedProvider({
      baseDir: tmpDir,
      basePort: 7000,
      command: ["node", "-e", "setTimeout(() => {}, 60000)"]
    });

    const resourceInput = {
      name: "cache",
      provider: "process-port-scoped",
      isolationStrategy: "process-port-scoped" as const,
      scopedValidate: false,
      scopedReset: true,
      scopedCleanup: true
    };
    const derived: DerivedResourcePlan = {
      resourceName: "cache",
      provider: "process-port-scoped",
      isolationStrategy: "process-port-scoped",
      worktreeId: "feature-login",
      handle: "localhost:7042"
    };

    if (provider.resetResource) {
      await provider.resetResource({ resource: resourceInput, derived, worktree: { id: "feature-login" } });
    }

    expect(provider.cleanupResource).toBeDefined();
    if (!provider.cleanupResource) return;

    const result = await provider.cleanupResource({
      resource: resourceInput,
      derived,
      worktree: { id: "feature-login" }
    });

    const cleanup = result as ResourceCleanup;
    expect(cleanup.capability).toBe("cleanup");
    expect(cleanup.resourceName).toBe("cache");
    expect(cleanup.worktreeId).toBe("feature-login");
  });
});
