import { describe, expect, it } from "vitest";

import { resetOneResource } from "@multiverse/core";
import {
  createExplicitTestProviders,
  createProvidersWithResourceResetRefusal,
  createValidRepositoryConfiguration,
  createWorktreeInstance
} from "@multiverse/providers-testkit";

describe("reset: scoped resource reset", () => {
  it("resets resources that declare scopedReset: true", async () => {
    const outcome = await resetOneResource({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider-with-reset",
            isolationStrategy: "name-scoped",
            scopedReset: true,
            scopedCleanup: false
          }
        ]
      }),
      worktree: createWorktreeInstance({ id: "wt-reset", label: "reset" }),
      providers: createExplicitTestProviders()
    });

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;

    expect(outcome.resourcePlans).toHaveLength(1);
    expect(outcome.resourceResets).toHaveLength(1);
    expect(outcome.resourceResets[0]).toMatchObject({
      resourceName: "primary-db",
      provider: "test-resource-provider-with-reset",
      worktreeId: "wt-reset",
      capability: "reset"
    });
  });

  it("refuses when no resources declare scopedReset", async () => {
    const outcome = await resetOneResource({
      repository: createValidRepositoryConfiguration(),
      worktree: createWorktreeInstance({ id: "wt-no-reset" }),
      providers: createExplicitTestProviders()
    });

    expect(outcome).toMatchObject({
      ok: false,
      refusal: { category: "invalid_configuration" }
    });
  });

  it("refuses when provider does not declare reset capability", async () => {
    const outcome = await resetOneResource({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider",
            isolationStrategy: "name-scoped",
            scopedReset: true,
            scopedCleanup: false
          }
        ]
      }),
      worktree: createWorktreeInstance({ id: "wt-unsupported-reset" }),
      providers: createExplicitTestProviders()
    });

    expect(outcome).toMatchObject({
      ok: false,
      refusal: { category: "unsupported_capability" }
    });
  });

  it("surfaces a provider reset refusal", async () => {
    const outcome = await resetOneResource({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider-with-reset",
            isolationStrategy: "name-scoped",
            scopedReset: true,
            scopedCleanup: false
          }
        ]
      }),
      worktree: createWorktreeInstance({ id: "wt-reset-refusal" }),
      providers: createProvidersWithResourceResetRefusal({
        category: "provider_failure",
        reason: "reset failed"
      })
    });

    expect(outcome).toMatchObject({ ok: false, refusal: { category: "provider_failure" } });
  });
});
