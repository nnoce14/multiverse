import { describe, expect, it } from "vitest";

import { cleanupOneResource } from "@multiverse/core";
import {
  createExplicitTestProviders,
  createProvidersWithResourceCleanupRefusal,
  createValidRepositoryConfiguration,
  createWorktreeInstance
} from "@multiverse/providers-testkit";

describe("cleanup: scoped resource cleanup", () => {
  it("cleans up resources that declare scopedCleanup: true", async () => {
    const outcome = await cleanupOneResource({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider-with-cleanup",
            isolationStrategy: "name-scoped",
            scopedReset: false,
            scopedCleanup: true
          }
        ]
      }),
      worktree: createWorktreeInstance({ id: "wt-cleanup", label: "cleanup" }),
      providers: createExplicitTestProviders()
    });

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;

    expect(outcome.resourcePlans).toHaveLength(1);
    expect(outcome.resourceCleanups).toHaveLength(1);
    expect(outcome.resourceCleanups[0]).toMatchObject({
      resourceName: "primary-db",
      provider: "test-resource-provider-with-cleanup",
      worktreeId: "wt-cleanup",
      capability: "cleanup"
    });
  });

  it("refuses when no resources declare scopedCleanup", async () => {
    const outcome = await cleanupOneResource({
      repository: createValidRepositoryConfiguration(),
      worktree: createWorktreeInstance({ id: "wt-no-cleanup" }),
      providers: createExplicitTestProviders()
    });

    expect(outcome).toMatchObject({
      ok: false,
      refusal: { category: "invalid_configuration" }
    });
  });

  it("refuses when provider does not declare cleanup capability", async () => {
    const outcome = await cleanupOneResource({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider",
            isolationStrategy: "name-scoped",
            scopedReset: false,
            scopedCleanup: true
          }
        ]
      }),
      worktree: createWorktreeInstance({ id: "wt-unsupported-cleanup" }),
      providers: createExplicitTestProviders()
    });

    expect(outcome).toMatchObject({
      ok: false,
      refusal: { category: "unsupported_capability" }
    });
  });

  it("surfaces a provider cleanup refusal", async () => {
    const outcome = await cleanupOneResource({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider-with-cleanup",
            isolationStrategy: "name-scoped",
            scopedReset: false,
            scopedCleanup: true
          }
        ]
      }),
      worktree: createWorktreeInstance({ id: "wt-cleanup-refusal" }),
      providers: createProvidersWithResourceCleanupRefusal({
        category: "provider_failure",
        reason: "cleanup failed"
      })
    });

    expect(outcome).toMatchObject({ ok: false, refusal: { category: "provider_failure" } });
  });
});
