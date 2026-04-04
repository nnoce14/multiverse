import { describe, expect, it } from "vitest";

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
      providers: createExplicitTestProviders()
    });

    expect(outcome).toMatchObject({
      ok: false,
      refusal: {
        category: "unsupported_capability"
      }
    });
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
});
