import { describe, expect, it, vi } from "vitest";

import { deriveOne } from "@multiverse/core";
import {
  createExplicitTestProviders,
  createValidRepositoryConfiguration,
  createWorktreeInstance
} from "@multiverse/providers-testkit";

describe("Development Slice 05 acceptance", () => {
  it("accepts valid raw endpoint declarations through the current orchestration path", () => {
    const outcome = deriveOne({
      repository: createValidRepositoryConfiguration(),
      worktree: createWorktreeInstance({
        id: "wt-valid-endpoint-declaration"
      }),
      providers: createExplicitTestProviders()
    });

    expect(outcome.ok).toBe(true);
  });

  it("rejects an endpoint missing a name", () => {
    const outcome = deriveOne({
      repository: createValidRepositoryConfiguration({
        endpoints: [
          {
            role: "application-base-url",
            provider: "test-endpoint-provider"
          }
        ]
      }),
      worktree: createWorktreeInstance({
        id: "wt-missing-endpoint-name"
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

  it("rejects an endpoint missing a provider", () => {
    const outcome = deriveOne({
      repository: createValidRepositoryConfiguration({
        endpoints: [
          {
            name: "app-base-url",
            role: "application-base-url"
          }
        ]
      }),
      worktree: createWorktreeInstance({
        id: "wt-missing-endpoint-provider"
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

  it("does not invoke endpoint derivation for invalid raw endpoint declarations", () => {
    const providers = createExplicitTestProviders();
    const deriveEndpoint = vi.spyOn(
      providers.endpoints["test-endpoint-provider"],
      "deriveEndpoint"
    );

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
        id: "wt-invalid-endpoint-declaration"
      }),
      providers
    });

    expect(outcome).toMatchObject({
      ok: false,
      refusal: {
        category: "invalid_configuration"
      }
    });
    expect(deriveEndpoint).not.toHaveBeenCalled();
  });
});
