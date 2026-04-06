import { describe, it, expect, afterEach } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { DerivedResourcePlan, ResourceReset, ResourceCleanup, Refusal } from "@multiverse/provider-contracts";
import { createProcessScopedProvider } from "@multiverse/provider-process-scoped";

function isDerivedResourcePlan(value: DerivedResourcePlan | Refusal): value is DerivedResourcePlan {
  return "resourceName" in value && "handle" in value;
}

describe("resource provider contract: process-scoped derive", () => {
  const provider = createProcessScopedProvider({
    baseDir: "/var/multiverse",
    command: ["node", "-e", "setTimeout(() => {}, 60000)"]
  });

  const validInput = {
    resource: {
      name: "cache",
      provider: "process-scoped",
      isolationStrategy: "process-scoped" as const,
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

    expect(result.resourceName).toBe(validInput.resource.name);
    expect(result.provider).toBe(validInput.resource.provider);
    expect(result.isolationStrategy).toBe("process-scoped");
    expect(result.worktreeId).toBe(validInput.worktree.id);
    expect(typeof result.handle).toBe("string");
    expect(result.handle.length).toBeGreaterThan(0);
  });

  it("derives a handle containing the base directory, resource name, and worktree ID", () => {
    const result = provider.deriveResource(validInput);

    expect(isDerivedResourcePlan(result)).toBe(true);
    if (!isDerivedResourcePlan(result)) return;

    expect(result.handle).toContain("/var/multiverse");
    expect(result.handle).toContain(validInput.resource.name);
    expect(result.handle).toContain(validInput.worktree.id);
  });
});

describe("resource provider contract: process-scoped reset", () => {
  let tmpDir: string;

  afterEach(async () => {
    if (tmpDir) {
      await rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("declares reset capability", () => {
    const provider = createProcessScopedProvider({
      baseDir: "/var/multiverse",
      command: ["node", "-e", "setTimeout(() => {}, 60000)"]
    });

    expect(provider.capabilities?.reset).toBe(true);
  });

  it("returns a ResourceReset for a long-running process", async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "mv-contract-reset-"));
    const provider = createProcessScopedProvider({
      baseDir: tmpDir,
      command: ["node", "-e", "setTimeout(() => {}, 60000)"]
    });

    const stateDir = join(tmpDir, "cache", "feature-login") + "/";
    const derived: DerivedResourcePlan = {
      resourceName: "cache",
      provider: "process-scoped",
      isolationStrategy: "process-scoped",
      worktreeId: "feature-login",
      handle: stateDir
    };

    expect(provider.resetResource).toBeDefined();
    if (!provider.resetResource) return;

    const result = await provider.resetResource({
      resource: {
        name: "cache",
        provider: "process-scoped",
        isolationStrategy: "process-scoped",
        scopedValidate: false,
        scopedReset: true,
        scopedCleanup: false
      },
      derived,
      worktree: { id: "feature-login" }
    });

    const reset = result as ResourceReset;
    expect(reset.capability).toBe("reset");
    expect(reset.resourceName).toBe("cache");
    expect(reset.worktreeId).toBe("feature-login");

    // cleanup: terminate launched process
    if (provider.cleanupResource) {
      await provider.cleanupResource({
        resource: { name: "cache", provider: "process-scoped", isolationStrategy: "process-scoped", scopedValidate: false, scopedReset: false, scopedCleanup: true },
        derived,
        worktree: { id: "feature-login" }
      });
    }
  });
});

describe("resource provider contract: process-scoped cleanup", () => {
  let tmpDir: string;

  afterEach(async () => {
    if (tmpDir) {
      await rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("declares cleanup capability", () => {
    const provider = createProcessScopedProvider({
      baseDir: "/var/multiverse",
      command: ["node", "-e", "setTimeout(() => {}, 60000)"]
    });

    expect(provider.capabilities?.cleanup).toBe(true);
  });

  it("returns a ResourceCleanup for valid input", async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "mv-contract-cleanup-"));
    const provider = createProcessScopedProvider({
      baseDir: tmpDir,
      command: ["node", "-e", "setTimeout(() => {}, 60000)"]
    });

    const stateDir = join(tmpDir, "cache", "feature-login") + "/";
    const derived: DerivedResourcePlan = {
      resourceName: "cache",
      provider: "process-scoped",
      isolationStrategy: "process-scoped",
      worktreeId: "feature-login",
      handle: stateDir
    };

    // launch first so there's something to clean up
    if (provider.resetResource) {
      await provider.resetResource({
        resource: { name: "cache", provider: "process-scoped", isolationStrategy: "process-scoped", scopedValidate: false, scopedReset: true, scopedCleanup: false },
        derived,
        worktree: { id: "feature-login" }
      });
    }

    expect(provider.cleanupResource).toBeDefined();
    if (!provider.cleanupResource) return;

    const result = await provider.cleanupResource({
      resource: {
        name: "cache",
        provider: "process-scoped",
        isolationStrategy: "process-scoped",
        scopedValidate: false,
        scopedReset: false,
        scopedCleanup: true
      },
      derived,
      worktree: { id: "feature-login" }
    });

    const cleanup = result as ResourceCleanup;
    expect(cleanup.capability).toBe("cleanup");
    expect(cleanup.resourceName).toBe("cache");
    expect(cleanup.worktreeId).toBe("feature-login");
  });
});
