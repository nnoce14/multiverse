import { describe, expect, it, vi } from "vitest";

import { resetOneResource, deriveOne } from "@multiverse/core";
import {
  createExplicitTestProviders,
  createProvidersWithResourceResetRefusal,
  createValidRepositoryConfiguration,
  createWorktreeInstance
} from "@multiverse/providers-testkit";

describe("Development Slice 08 acceptance", () => {
  it("executes one explicit scoped reset when reset is supported", async () => {
    const outcome = await resetOneResource({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider-with-reset",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: true,
            scopedCleanup: false
          }
        ]
      }),
      worktree: createWorktreeInstance({
        id: "wt-reset-supported"
      }),
      providers: createExplicitTestProviders()
    });

    expect(outcome).toEqual({
      ok: true,
      resourcePlans: [
        {
          resourceName: "primary-db",
          provider: "test-resource-provider-with-reset",
          isolationStrategy: "name-scoped",
          worktreeId: "wt-reset-supported",
          handle: "primary-db--wt-reset-supported"
        }
      ],
      resourceResets: [
        {
          resourceName: "primary-db",
          provider: "test-resource-provider-with-reset",
          worktreeId: "wt-reset-supported",
          capability: "reset"
        }
      ]
    });
  });

  it("refuses unsupported reset intent explicitly", async () => {
    const providers = createExplicitTestProviders();
    const deriveResource = vi.spyOn(
      providers.resources["test-resource-provider"],
      "deriveResource"
    );

    const outcome = await resetOneResource({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: true,
            scopedCleanup: false
          }
        ]
      }),
      worktree: createWorktreeInstance({
        id: "wt-reset-unsupported"
      }),
      providers
    });

    expect(outcome).toMatchObject({
      ok: false,
      refusal: {
        category: "unsupported_capability"
      }
    });
    expect(deriveResource).not.toHaveBeenCalled();
  });

  it("refuses reset when repository intent does not enable scoped reset", async () => {
    const providers = createExplicitTestProviders();
    const deriveResource = vi.spyOn(
      providers.resources["test-resource-provider-with-reset"],
      "deriveResource"
    );

    const outcome = await resetOneResource({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider-with-reset",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: false
          }
        ]
      }),
      worktree: createWorktreeInstance({
        id: "wt-reset-not-intended"
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
  });

  it("refuses reset when safe scope cannot be established", async () => {
    const outcome = await resetOneResource({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider-with-reset",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: true,
            scopedCleanup: false
          }
        ]
      }),
      worktree: createWorktreeInstance({
        label: "reset-unsafe-scope"
      }),
      providers: createExplicitTestProviders()
    });

    expect(outcome).toMatchObject({
      ok: false,
      refusal: {
        category: "unsafe_scope"
      }
    });
  });

  it("does not perform reset implicitly during derive-only resolution", () => {
    const providers = createExplicitTestProviders();
    const resetResource = vi.spyOn(
      providers.resources["test-resource-provider-with-reset"],
      "resetResource"
    );

    const outcome = deriveOne({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider-with-reset",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: true,
            scopedCleanup: false
          }
        ]
      }),
      worktree: createWorktreeInstance({
        id: "wt-no-implicit-reset"
      }),
      providers
    });

    expect(outcome.ok).toBe(true);
    expect(resetResource).not.toHaveBeenCalled();
  });

  it("returns provider-originated unsafe scope during reset unchanged", async () => {
    const outcome = await resetOneResource({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider-with-reset",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: true,
            scopedCleanup: false
          }
        ]
      }),
      worktree: createWorktreeInstance({
        id: "wt-provider-unsafe-reset"
      }),
      providers: createProvidersWithResourceResetRefusal({
        category: "unsafe_scope",
        reason: "Provider could not verify owning scope for reset."
      })
    });

    expect(outcome).toEqual({
      ok: false,
      refusal: {
        category: "unsafe_scope",
        reason: "Provider could not verify owning scope for reset."
      }
    });
  });

  it("returns provider-originated provider failure during reset unchanged", async () => {
    const outcome = await resetOneResource({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider-with-reset",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: true,
            scopedCleanup: false
          }
        ]
      }),
      worktree: createWorktreeInstance({
        id: "wt-provider-failure-reset"
      }),
      providers: createProvidersWithResourceResetRefusal({
        category: "provider_failure",
        reason: "Provider reset failed after safe scope was established."
      })
    });

    expect(outcome).toEqual({
      ok: false,
      refusal: {
        category: "provider_failure",
        reason: "Provider reset failed after safe scope was established."
      }
    });
  });
});
