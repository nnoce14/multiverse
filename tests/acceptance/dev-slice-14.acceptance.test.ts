import { describe, it, expect } from "vitest";
import { deriveOne } from "@multiverse/core";
import { createNameScopedProvider } from "@multiverse/provider-name-scoped";
import { createLocalPortProvider } from "@multiverse/provider-local-port";

describe("dev-slice-14: name-scoped resource provider", () => {
  const nameScopedProvider = createNameScopedProvider();
  const localPortProvider = createLocalPortProvider({ basePort: 5000 });

  function makeProviders() {
    return {
      resources: {
        "name-scoped": nameScopedProvider
      },
      endpoints: {
        "local-port": localPortProvider
      }
    };
  }

  const repository = {
    resources: [
      {
        name: "primary-db",
        provider: "name-scoped",
        isolationStrategy: "name-scoped" as const,
        scopedValidate: false,
        scopedReset: false,
        scopedCleanup: false
      }
    ],
    endpoints: [
      {
        name: "app-base-url",
        role: "application-base-url",
        provider: "local-port"
      }
    ]
  };

  it("derives a handle in {resourceName}_{worktreeId} format", () => {
    const result = deriveOne({
      repository,
      worktree: { id: "feature-login" },
      providers: makeProviders()
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const [plan] = result.resourcePlans;
    expect(plan.handle).toBe("primary-db_feature-login");
  });

  it("derives the same handle on repeated calls with the same input", () => {
    const first = deriveOne({
      repository,
      worktree: { id: "feature-payments" },
      providers: makeProviders()
    });

    const second = deriveOne({
      repository,
      worktree: { id: "feature-payments" },
      providers: makeProviders()
    });

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (!first.ok || !second.ok) return;

    expect(first.resourcePlans[0].handle).toBe(second.resourcePlans[0].handle);
  });

  it("derives distinct handles for distinct worktree IDs", () => {
    const resultA = deriveOne({
      repository,
      worktree: { id: "worktree-a" },
      providers: makeProviders()
    });

    const resultB = deriveOne({
      repository,
      worktree: { id: "worktree-b" },
      providers: makeProviders()
    });

    expect(resultA.ok).toBe(true);
    expect(resultB.ok).toBe(true);
    if (!resultA.ok || !resultB.ok) return;

    expect(resultA.resourcePlans[0].handle).not.toBe(resultB.resourcePlans[0].handle);
  });

  it("returns a refusal when worktree ID is absent", () => {
    const result = deriveOne({
      repository,
      worktree: {},
      providers: makeProviders()
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.refusal.category).toBe("unsafe_scope");
  });

  it("derives both a resource handle and an endpoint address in one call", () => {
    const result = deriveOne({
      repository,
      worktree: { id: "feature-auth" },
      providers: makeProviders()
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.resourcePlans[0].handle).toBe("primary-db_feature-auth");
    expect(result.endpointMappings[0].address).toMatch(/^http:\/\/localhost:\d+$/);
  });
});
