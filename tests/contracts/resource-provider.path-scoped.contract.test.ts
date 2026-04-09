import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { DerivedResourcePlan, ResourceReset, ResourceCleanup, ResourceValidation, Refusal } from "@multiverse/provider-contracts";
import { createPathScopedProvider } from "@multiverse/provider-path-scoped";

function isDerivedResourcePlan(value: DerivedResourcePlan | Refusal): value is DerivedResourcePlan {
  return "resourceName" in value && "handle" in value;
}

describe("resource provider contract: path-scoped derive", () => {
  const provider = createPathScopedProvider({ baseDir: "/var/multiverse" });

  const validInput = {
    resource: {
      name: "sqlite-db",
      provider: "path-scoped",
      isolationStrategy: "path-scoped" as const,
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
    expect(result.isolationStrategy).toBe("path-scoped");
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

describe("resource provider contract: path-scoped reset", () => {
  const provider = createPathScopedProvider({ baseDir: "/var/multiverse" });

  const resourceInput = {
    name: "sqlite-db",
    provider: "path-scoped",
    isolationStrategy: "path-scoped" as const,
    scopedValidate: false,
    scopedReset: true,
    scopedCleanup: false
  };

  const derived = {
    resourceName: "sqlite-db",
    provider: "path-scoped",
    isolationStrategy: "path-scoped" as const,
    worktreeId: "feature-login",
    handle: "/var/multiverse/sqlite-db/feature-login"
  };

  it("declares reset capability", () => {
    expect(provider.capabilities?.reset).toBe(true);
  });

  it("returns a ResourceReset for valid input", async () => {
    expect(provider.resetResource).toBeDefined();
    if (!provider.resetResource) return;

    const result = await provider.resetResource({
      resource: resourceInput,
      derived,
      worktree: { id: "feature-login" }
    });

    const reset = result as ResourceReset;
    expect(reset.capability).toBe("reset");
    expect(reset.resourceName).toBe("sqlite-db");
    expect(reset.worktreeId).toBe("feature-login");
  });
});

describe("resource provider contract: path-scoped cleanup", () => {
  const provider = createPathScopedProvider({ baseDir: "/var/multiverse" });

  const resourceInput = {
    name: "sqlite-db",
    provider: "path-scoped",
    isolationStrategy: "path-scoped" as const,
    scopedValidate: false,
    scopedReset: false,
    scopedCleanup: true
  };

  const derived = {
    resourceName: "sqlite-db",
    provider: "path-scoped",
    isolationStrategy: "path-scoped" as const,
    worktreeId: "feature-login",
    handle: "/var/multiverse/sqlite-db/feature-login"
  };

  it("declares cleanup capability", () => {
    expect(provider.capabilities?.cleanup).toBe(true);
  });

  it("returns a ResourceCleanup for valid input", async () => {
    expect(provider.cleanupResource).toBeDefined();
    if (!provider.cleanupResource) return;

    const result = await provider.cleanupResource({
      resource: resourceInput,
      derived,
      worktree: { id: "feature-login" }
    });

    const cleanup = result as ResourceCleanup;
    expect(cleanup.capability).toBe("cleanup");
    expect(cleanup.resourceName).toBe("sqlite-db");
    expect(cleanup.worktreeId).toBe("feature-login");
  });
});

describe("resource provider contract: path-scoped validate", () => {
  let tmpDir: string;
  let existingPath: string;

  beforeAll(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "multiverse-validate-test-"));
    existingPath = tmpDir;
  });

  afterAll(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it("declares validate capability", () => {
    const provider = createPathScopedProvider({ baseDir: "/var/multiverse" });
    expect(provider.capabilities?.validate).toBe(true);
  });

  it("returns a ResourceValidation when the derived path exists", () => {
    const provider = createPathScopedProvider({ baseDir: tmpDir });
    const resourceInput = {
      name: "sqlite-db",
      provider: "path-scoped",
      isolationStrategy: "path-scoped" as const,
      scopedValidate: true,
      scopedReset: false,
      scopedCleanup: false
    };
    const derived = {
      resourceName: "sqlite-db",
      provider: "path-scoped",
      isolationStrategy: "path-scoped" as const,
      worktreeId: "feature-login",
      handle: existingPath
    };

    expect(provider.validateResource).toBeDefined();
    if (!provider.validateResource) return;

    const result = provider.validateResource({
      resource: resourceInput,
      derived,
      worktree: { id: "feature-login" }
    });

    const validation = result as ResourceValidation;
    expect(validation.capability).toBe("validate");
    expect(validation.resourceName).toBe("sqlite-db");
    expect(validation.worktreeId).toBe("feature-login");
  });

  it("returns a provider_failure Refusal when the derived path is not accessible", () => {
    const provider = createPathScopedProvider({ baseDir: "/var/multiverse" });
    const resourceInput = {
      name: "sqlite-db",
      provider: "path-scoped",
      isolationStrategy: "path-scoped" as const,
      scopedValidate: true,
      scopedReset: false,
      scopedCleanup: false
    };
    const derived = {
      resourceName: "sqlite-db",
      provider: "path-scoped",
      isolationStrategy: "path-scoped" as const,
      worktreeId: "feature-login",
      handle: "/var/multiverse/sqlite-db/feature-login/does-not-exist"
    };

    expect(provider.validateResource).toBeDefined();
    if (!provider.validateResource) return;

    const result = provider.validateResource({
      resource: resourceInput,
      derived,
      worktree: { id: "feature-login" }
    }) as Refusal;

    expect(result.category).toBe("provider_failure");
    expect(result.reason).toContain("sqlite-db");
    expect(result.reason).toContain(derived.handle);
  });

  it("returns an unsafe_scope Refusal when worktree.id is absent", () => {
    const provider = createPathScopedProvider({ baseDir: "/var/multiverse" });
    const resourceInput = {
      name: "sqlite-db",
      provider: "path-scoped",
      isolationStrategy: "path-scoped" as const,
      scopedValidate: true,
      scopedReset: false,
      scopedCleanup: false
    };
    const derived = {
      resourceName: "sqlite-db",
      provider: "path-scoped",
      isolationStrategy: "path-scoped" as const,
      worktreeId: "feature-login",
      handle: "/var/multiverse/sqlite-db/feature-login"
    };

    expect(provider.validateResource).toBeDefined();
    if (!provider.validateResource) return;

    const result = provider.validateResource({
      resource: resourceInput,
      derived,
      worktree: { id: "" }
    }) as Refusal;

    expect(result.category).toBe("unsafe_scope");
  });
});
