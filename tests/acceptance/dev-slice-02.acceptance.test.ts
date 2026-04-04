import { describe, expect, it, vi } from "vitest";

import { resolveSlice02 } from "@multiverse/core";
import {
  createExplicitTestProviders,
  createValidRepositoryConfiguration,
  createWorktreeInstance
} from "@multiverse/providers-testkit";

describe("Development Slice 02 acceptance", () => {
  it("accepts an explicitly supported validate capability request", () => {
    const outcome = resolveSlice02({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider",
            isolationStrategy: "name-scoped",
            scopedReset: false,
            scopedCleanup: false,
            scopedValidate: true
          }
        ]
      }),
      worktree: createWorktreeInstance({
        id: "wt-validate-supported",
        label: "validate-supported",
        branch: "feature/validate-supported"
      }),
      providers: createExplicitTestProviders()
    });

    expect(outcome.ok).toBe(true);

    if (!outcome.ok) {
      return;
    }

    expect(outcome.resourcePlans).toHaveLength(1);
    expect(outcome.endpointMappings).toHaveLength(1);
    expect(outcome.resourceValidations).toEqual([
      {
        resourceName: "primary-db",
        provider: "test-resource-provider",
        worktreeId: "wt-validate-supported",
        capability: "validate"
      }
    ]);
  });

  it("refuses unsupported validate intent explicitly", () => {
    const providers = createExplicitTestProviders();
    const deriveResource = vi.spyOn(
      providers.resources["test-resource-provider-no-validate"],
      "deriveResource"
    );

    const outcome = resolveSlice02({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider-no-validate",
            isolationStrategy: "name-scoped",
            scopedReset: false,
            scopedCleanup: false,
            scopedValidate: true
          }
        ]
      }),
      worktree: createWorktreeInstance({
        id: "wt-validate-unsupported",
        label: "validate-unsupported"
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

  it("refuses validation when safe scope cannot be established", () => {
    const outcome = resolveSlice02({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider",
            isolationStrategy: "name-scoped",
            scopedReset: false,
            scopedCleanup: false,
            scopedValidate: true
          }
        ]
      }),
      worktree: createWorktreeInstance({
        label: "validate-unsafe-scope",
        branch: "feature/validate-unsafe-scope"
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

  it("refuses unsupported scoped reset intent before derivation", () => {
    const providers = createExplicitTestProviders();
    const deriveResource = vi.spyOn(
      providers.resources["test-resource-provider"],
      "deriveResource"
    );

    const outcome = resolveSlice02({
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

  it("refuses unsupported scoped cleanup intent before derivation", () => {
    const providers = createExplicitTestProviders();
    const deriveResource = vi.spyOn(
      providers.resources["test-resource-provider"],
      "deriveResource"
    );

    const outcome = resolveSlice02({
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
});
