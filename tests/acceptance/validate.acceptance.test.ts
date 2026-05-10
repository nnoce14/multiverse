import { describe, expect, it } from "vitest";

import { deriveAndValidateOne } from "@multiverse/core";
import {
  createExplicitTestProviders,
  createProvidersWithResourceValidateRefusal,
  createValidRepositoryConfiguration,
  createWorktreeInstance
} from "@multiverse/providers-testkit";

describe("validate: derive and validate resources", () => {
  it("derives and validates resources that declare scopedValidate: true", () => {
    const outcome = deriveAndValidateOne({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider",
            isolationStrategy: "name-scoped",
            scopedValidate: true,
            scopedReset: false,
            scopedCleanup: false
          }
        ]
      }),
      worktree: createWorktreeInstance({ id: "wt-validate", label: "validate" }),
      providers: createExplicitTestProviders()
    });

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;

    expect(outcome.resourcePlans).toHaveLength(1);
    expect(outcome.resourceValidations).toHaveLength(1);
    expect(outcome.resourceValidations[0]).toMatchObject({
      resourceName: "primary-db",
      provider: "test-resource-provider",
      worktreeId: "wt-validate",
      capability: "validate"
    });
  });

  it("produces an empty resourceValidations array when no resource declares scopedValidate", () => {
    const outcome = deriveAndValidateOne({
      repository: createValidRepositoryConfiguration(),
      worktree: createWorktreeInstance({ id: "wt-no-validate" }),
      providers: createExplicitTestProviders()
    });

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;

    expect(outcome.resourceValidations).toHaveLength(0);
  });

  it("refuses when provider does not declare validate capability", () => {
    const outcome = deriveAndValidateOne({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider-no-validate",
            isolationStrategy: "name-scoped",
            scopedValidate: true,
            scopedReset: false,
            scopedCleanup: false
          }
        ]
      }),
      worktree: createWorktreeInstance({ id: "wt-unsupported-validate" }),
      providers: createExplicitTestProviders()
    });

    expect(outcome).toMatchObject({
      ok: false,
      refusal: { category: "unsupported_capability" }
    });
  });

  it("surfaces a provider validate refusal", () => {
    const outcome = deriveAndValidateOne({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider",
            isolationStrategy: "name-scoped",
            scopedValidate: true,
            scopedReset: false,
            scopedCleanup: false
          }
        ]
      }),
      worktree: createWorktreeInstance({ id: "wt-validate-refusal" }),
      providers: createProvidersWithResourceValidateRefusal({
        category: "provider_failure",
        reason: "validation check failed"
      })
    });

    expect(outcome).toMatchObject({ ok: false, refusal: { category: "provider_failure" } });
  });
});
