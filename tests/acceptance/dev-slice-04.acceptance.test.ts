import { describe, expect, it, vi } from "vitest";

import { resolveSlice01 } from "@multiverse/core";
import {
  createExplicitTestProviders,
  createValidRepositoryConfiguration,
  createWorktreeInstance
} from "@multiverse/providers-testkit";

describe("Development Slice 04 acceptance", () => {
  it("accepts valid raw repository configuration through the current orchestration path", () => {
    const outcome = resolveSlice01({
      repository: createValidRepositoryConfiguration(),
      worktree: createWorktreeInstance({
        id: "wt-valid-raw-repository"
      }),
      providers: createExplicitTestProviders()
    });

    expect(outcome.ok).toBe(true);
  });

  it("rejects a resource missing a provider", () => {
    const outcome = resolveSlice01({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: false
          }
        ]
      }),
      worktree: createWorktreeInstance({
        id: "wt-missing-resource-provider"
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

  it("rejects a resource missing a primary isolation strategy", () => {
    const outcome = resolveSlice01({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider",
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: false
          }
        ]
      }),
      worktree: createWorktreeInstance({
        id: "wt-missing-isolation-strategy"
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

  it("rejects an endpoint missing a role", () => {
    const outcome = resolveSlice01({
      repository: createValidRepositoryConfiguration({
        endpoints: [
          {
            name: "app-base-url",
            provider: "test-endpoint-provider"
          }
        ]
      }),
      worktree: createWorktreeInstance({
        id: "wt-missing-endpoint-role"
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

  it("does not invoke orchestration for invalid raw repository configuration", () => {
    const providers = createExplicitTestProviders();
    const deriveResource = vi.spyOn(
      providers.resources["test-resource-provider"],
      "deriveResource"
    );
    const deriveEndpoint = vi.spyOn(
      providers.endpoints["test-endpoint-provider"],
      "deriveEndpoint"
    );

    const outcome = resolveSlice01({
      repository: createValidRepositoryConfiguration({
        endpoints: [
          {
            name: "app-base-url",
            provider: "test-endpoint-provider"
          }
        ]
      }),
      worktree: createWorktreeInstance({
        id: "wt-invalid-raw-repository"
      }),
      providers
    });

    expect(outcome).toMatchObject({
      ok: false,
      refusal: {
        category: "invalid_configuration"
      }
    });
    expect(deriveResource).not.toHaveBeenCalled();
    expect(deriveEndpoint).not.toHaveBeenCalled();
  });
});
