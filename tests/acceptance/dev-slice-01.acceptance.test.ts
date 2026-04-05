import { describe, expect, it, vi } from "vitest";

import { deriveOne } from "@multiverse/core";
import {
  createExplicitTestProviders,
  createValidRepositoryConfiguration,
  createWorktreeInstance
} from "@multiverse/providers-testkit";

describe("Development Slice 01 acceptance", () => {
  it("resolves successfully for a valid declared worktree instance", () => {
    const outcome = deriveOne({
      repository: createValidRepositoryConfiguration(),
      worktree: createWorktreeInstance({
        id: "wt-feature-a",
        label: "feature-a",
        branch: "feature/shared"
      }),
      providers: createExplicitTestProviders()
    });

    expect(outcome.ok).toBe(true);

    if (!outcome.ok) {
      return;
    }

    expect(outcome.resourcePlans).toHaveLength(1);
    expect(outcome.endpointMappings).toHaveLength(1);
    expect(outcome.resourcePlans[0]).toMatchObject({
      resourceName: "primary-db",
      provider: "test-resource-provider",
      isolationStrategy: "name-scoped",
      worktreeId: "wt-feature-a"
    });
    expect(typeof outcome.resourcePlans[0].handle).toBe("string");
    expect(outcome.endpointMappings[0]).toMatchObject({
      endpointName: "app-base-url",
      provider: "test-endpoint-provider",
      role: "application-base-url",
      worktreeId: "wt-feature-a"
    });
    expect(typeof outcome.endpointMappings[0].address).toBe("string");
  });

  it("resolves deterministically for the same worktree instance", () => {
    const repository = createValidRepositoryConfiguration();
    const worktree = createWorktreeInstance({
      id: "wt-repeatable",
      label: "repeatable",
      branch: "feature/repeatable"
    });
    const providers = createExplicitTestProviders();

    const first = deriveOne({ repository, worktree, providers });
    const second = deriveOne({ repository, worktree, providers });

    expect(first).toEqual(second);
  });

  it("resolves successfully for the reserved main worktree identity", () => {
    const outcome = deriveOne({
      repository: createValidRepositoryConfiguration(),
      worktree: createWorktreeInstance({
        id: "main",
        label: "main"
      }),
      providers: createExplicitTestProviders()
    });

    expect(outcome.ok).toBe(true);

    if (!outcome.ok) {
      return;
    }

    expect(outcome.resourcePlans[0]).toMatchObject({
      worktreeId: "main"
    });
    expect(outcome.endpointMappings[0]).toMatchObject({
      worktreeId: "main"
    });
  });

  it("resolves different isolated outputs for different worktree instances", () => {
    const repository = createValidRepositoryConfiguration();
    const providers = createExplicitTestProviders();

    const first = deriveOne({
      repository,
      worktree: createWorktreeInstance({
        id: "wt-first",
        label: "first",
        branch: "feature/shared"
      }),
      providers
    });
    const second = deriveOne({
      repository,
      worktree: createWorktreeInstance({
        id: "wt-second",
        label: "second",
        branch: "feature/shared"
      }),
      providers
    });

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);

    if (!first.ok || !second.ok) {
      return;
    }

    expect(first.resourcePlans[0].handle).not.toBe(second.resourcePlans[0].handle);
    expect(first.endpointMappings[0].address).not.toBe(second.endpointMappings[0].address);
  });

  it("refuses when provider assignment is missing", () => {
    const outcome = deriveOne({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            isolationStrategy: "name-scoped",
            scopedReset: false,
            scopedCleanup: false
          }
        ]
      }),
      worktree: createWorktreeInstance({
        id: "wt-missing-provider",
        label: "missing-provider"
      }),
      providers: createExplicitTestProviders()
    });

    expect(outcome).toMatchObject({
      ok: false,
      refusal: {
        category: "invalid_configuration"
      }
    });
  });

  it("refuses when required declaration data is invalid or missing", () => {
    const outcome = deriveOne({
      repository: createValidRepositoryConfiguration({
        endpoints: [
          {
            name: "app-base-url",
            provider: "test-endpoint-provider"
          }
        ]
      }),
      worktree: createWorktreeInstance({
        id: "wt-invalid-declaration",
        label: "invalid-declaration"
      }),
      providers: createExplicitTestProviders()
    });

    expect(outcome).toMatchObject({
      ok: false,
      refusal: {
        category: "invalid_configuration"
      }
    });
  });

  it("refuses when safe scope is ambiguous or unsafe", () => {
    const outcome = deriveOne({
      repository: createValidRepositoryConfiguration(),
      worktree: {
        label: "ambiguous-scope",
        branch: "feature/shared"
      },
      providers: createExplicitTestProviders()
    });

    expect(outcome).toMatchObject({
      ok: false,
      refusal: {
        category: "unsafe_scope"
      }
    });
  });

  it("refuses whitespace-only worktree identity before provider invocation", () => {
    const providers = createExplicitTestProviders();
    const deriveResource = vi.spyOn(
      providers.resources["test-resource-provider"],
      "deriveResource"
    );
    const deriveEndpoint = vi.spyOn(
      providers.endpoints["test-endpoint-provider"],
      "deriveEndpoint"
    );

    const outcome = deriveOne({
      repository: createValidRepositoryConfiguration(),
      worktree: createWorktreeInstance({
        id: "   ",
        label: "invalid-worktree-id"
      }),
      providers
    });

    expect(outcome).toMatchObject({
      ok: false,
      refusal: {
        category: "unsafe_scope"
      }
    });
    expect(deriveResource).not.toHaveBeenCalled();
    expect(deriveEndpoint).not.toHaveBeenCalled();
  });
});
