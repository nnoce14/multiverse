import { describe, expect, it, vi } from "vitest";

import { cleanupOneResource, resolveSlice01 } from "@multiverse/core";
import {
  createExplicitTestProviders,
  createProvidersWithResourceCleanupRefusal,
  createValidRepositoryConfiguration,
  createWorktreeInstance
} from "@multiverse/providers-testkit";

describe("Development Slice 09 acceptance", () => {
  it("executes one explicit scoped cleanup when cleanup is supported", () => {
    const outcome = cleanupOneResource({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider-with-cleanup",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: true
          }
        ]
      }),
      worktree: createWorktreeInstance({
        id: "wt-cleanup-supported"
      }),
      providers: createExplicitTestProviders()
    });

    expect(outcome).toEqual({
      ok: true,
      resourcePlans: [
        {
          resourceName: "primary-db",
          provider: "test-resource-provider-with-cleanup",
          isolationStrategy: "name-scoped",
          worktreeId: "wt-cleanup-supported",
          handle: "primary-db--wt-cleanup-supported"
        }
      ],
      resourceCleanups: [
        {
          resourceName: "primary-db",
          provider: "test-resource-provider-with-cleanup",
          worktreeId: "wt-cleanup-supported",
          capability: "cleanup"
        }
      ]
    });
  });

  it("refuses unsupported cleanup intent explicitly", () => {
    const providers = createExplicitTestProviders();
    const deriveResource = vi.spyOn(
      providers.resources["test-resource-provider"],
      "deriveResource"
    );

    const outcome = cleanupOneResource({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: true
          }
        ]
      }),
      worktree: createWorktreeInstance({
        id: "wt-cleanup-unsupported"
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

  it("refuses cleanup when repository intent does not enable scoped cleanup", () => {
    const providers = createExplicitTestProviders();
    const deriveResource = vi.spyOn(
      providers.resources["test-resource-provider-with-cleanup"],
      "deriveResource"
    );

    const outcome = cleanupOneResource({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider-with-cleanup",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: false
          }
        ]
      }),
      worktree: createWorktreeInstance({
        id: "wt-cleanup-not-intended"
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

  it("refuses cleanup when safe scope cannot be established", () => {
    const outcome = cleanupOneResource({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider-with-cleanup",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: true
          }
        ]
      }),
      worktree: createWorktreeInstance({
        label: "cleanup-unsafe-scope"
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

  it("does not perform cleanup implicitly during derive-only resolution", () => {
    const providers = createExplicitTestProviders();
    const cleanupResource = vi.spyOn(
      providers.resources["test-resource-provider-with-cleanup"],
      "cleanupResource"
    );

    const outcome = resolveSlice01({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider-with-cleanup",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: true
          }
        ]
      }),
      worktree: createWorktreeInstance({
        id: "wt-no-implicit-cleanup"
      }),
      providers
    });

    expect(outcome.ok).toBe(true);
    expect(cleanupResource).not.toHaveBeenCalled();
  });

  it("returns provider-originated unsafe scope during cleanup unchanged", () => {
    const outcome = cleanupOneResource({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider-with-cleanup",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: true
          }
        ]
      }),
      worktree: createWorktreeInstance({
        id: "wt-provider-unsafe-cleanup"
      }),
      providers: createProvidersWithResourceCleanupRefusal({
        category: "unsafe_scope",
        reason: "Provider could not verify owning scope for cleanup."
      })
    });

    expect(outcome).toEqual({
      ok: false,
      refusal: {
        category: "unsafe_scope",
        reason: "Provider could not verify owning scope for cleanup."
      }
    });
  });

  it("returns provider-originated provider failure during cleanup unchanged", () => {
    const outcome = cleanupOneResource({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider-with-cleanup",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: true
          }
        ]
      }),
      worktree: createWorktreeInstance({
        id: "wt-provider-failure-cleanup"
      }),
      providers: createProvidersWithResourceCleanupRefusal({
        category: "provider_failure",
        reason: "Provider cleanup failed after safe scope was established."
      })
    });

    expect(outcome).toEqual({
      ok: false,
      refusal: {
        category: "provider_failure",
        reason: "Provider cleanup failed after safe scope was established."
      }
    });
  });
});
