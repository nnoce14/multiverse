import { describe, it, expect } from "vitest";
import type { DerivedResourcePlan, ResourceReset, ResourceCleanup, Refusal } from "@multiverse/provider-contracts";
import { createNameScopedProvider } from "@multiverse/provider-name-scoped";

function isDerivedResourcePlan(value: DerivedResourcePlan | Refusal): value is DerivedResourcePlan {
  return "resourceName" in value && "handle" in value;
}

describe("resource provider contract: name-scoped derive", () => {
  const provider = createNameScopedProvider();

  const validInput = {
    resource: {
      name: "primary-db",
      provider: "name-scoped",
      isolationStrategy: "name-scoped" as const,
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
    expect(result.isolationStrategy).toBe("name-scoped");
    expect(result.worktreeId).toBe(validInput.worktree.id);
    expect(typeof result.handle).toBe("string");
    expect(result.handle.length).toBeGreaterThan(0);
  });

  it("derives a handle containing both the resource name and worktree ID", () => {
    const result = provider.deriveResource(validInput);

    expect(isDerivedResourcePlan(result)).toBe(true);
    if (!isDerivedResourcePlan(result)) return;

    expect(result.handle).toContain(validInput.resource.name);
    expect(result.handle).toContain(validInput.worktree.id);
  });
});

describe("resource provider contract: name-scoped reset", () => {
  const provider = createNameScopedProvider();

  const resourceInput = {
    name: "primary-db",
    provider: "name-scoped",
    isolationStrategy: "name-scoped" as const,
    scopedValidate: false,
    scopedReset: true,
    scopedCleanup: false
  };

  const derived = {
    resourceName: "primary-db",
    provider: "name-scoped",
    isolationStrategy: "name-scoped" as const,
    worktreeId: "feature-login",
    handle: "primary-db_feature-login"
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
    expect(reset.resourceName).toBe("primary-db");
    expect(reset.worktreeId).toBe("feature-login");
  });
});

describe("resource provider contract: name-scoped cleanup", () => {
  const provider = createNameScopedProvider();

  const resourceInput = {
    name: "primary-db",
    provider: "name-scoped",
    isolationStrategy: "name-scoped" as const,
    scopedValidate: false,
    scopedReset: false,
    scopedCleanup: true
  };

  const derived = {
    resourceName: "primary-db",
    provider: "name-scoped",
    isolationStrategy: "name-scoped" as const,
    worktreeId: "feature-login",
    handle: "primary-db_feature-login"
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
    expect(cleanup.resourceName).toBe("primary-db");
    expect(cleanup.worktreeId).toBe("feature-login");
  });
});
