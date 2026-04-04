import { describe, expect, it } from "vitest";

import {
  createExplicitTestProviders,
  createProvidersWithResourceCleanupRefusal
} from "@multiverse/providers-testkit";

describe("resource provider cleanup contract", () => {
  it("declares cleanup support explicitly and cleans up one worktree instance", () => {
    const providers = createExplicitTestProviders();
    const resourceProvider = providers.resources["test-resource-provider-with-cleanup"];

    expect(resourceProvider.capabilities).toEqual({
      cleanup: true
    });

    if (!resourceProvider.cleanupResource) {
      throw new Error("Expected cleanupResource to be defined.");
    }

    const cleanup = resourceProvider.cleanupResource({
      resource: {
        name: "primary-db",
        provider: "test-resource-provider-with-cleanup",
        isolationStrategy: "name-scoped",
        scopedReset: false,
        scopedCleanup: true,
        scopedValidate: false
      },
      derived: {
        resourceName: "primary-db",
        provider: "test-resource-provider-with-cleanup",
        isolationStrategy: "name-scoped",
        worktreeId: "wt-cleanup-contract",
        handle: "primary-db--wt-cleanup-contract"
      },
      worktree: {
        id: "wt-cleanup-contract"
      }
    });

    expect(cleanup).toEqual({
      resourceName: "primary-db",
      provider: "test-resource-provider-with-cleanup",
      worktreeId: "wt-cleanup-contract",
      capability: "cleanup"
    });
  });

  it("refuses cleanup when provider-level scope safety cannot be established", () => {
    const providers = createExplicitTestProviders();
    const resourceProvider = providers.resources["test-resource-provider-with-cleanup"];

    if (!resourceProvider.cleanupResource) {
      throw new Error("Expected cleanupResource to be defined.");
    }

    const cleanup = resourceProvider.cleanupResource({
      resource: {
        name: "primary-db",
        provider: "test-resource-provider-with-cleanup",
        isolationStrategy: "name-scoped",
        scopedReset: false,
        scopedCleanup: true,
        scopedValidate: false
      },
      derived: {
        resourceName: "primary-db",
        provider: "test-resource-provider-with-cleanup",
        isolationStrategy: "name-scoped",
        worktreeId: "wt-cleanup-contract",
        handle: "primary-db--wt-cleanup-contract"
      },
      worktree: {
        label: "cleanup-contract-unsafe-scope"
      }
    });

    expect(cleanup).toMatchObject({
      category: "unsafe_scope"
    });
  });

  it("may refuse cleanup with provider failure distinctly from unsafe scope", () => {
    const providers = createProvidersWithResourceCleanupRefusal({
      category: "provider_failure",
      reason: "Provider cleanup failed after safe scope was established."
    });
    const resourceProvider = providers.resources["test-resource-provider-with-cleanup"];

    if (!resourceProvider.cleanupResource) {
      throw new Error("Expected cleanupResource to be defined.");
    }

    const cleanup = resourceProvider.cleanupResource({
      resource: {
        name: "primary-db",
        provider: "test-resource-provider-with-cleanup",
        isolationStrategy: "name-scoped",
        scopedReset: false,
        scopedCleanup: true,
        scopedValidate: false
      },
      derived: {
        resourceName: "primary-db",
        provider: "test-resource-provider-with-cleanup",
        isolationStrategy: "name-scoped",
        worktreeId: "wt-cleanup-provider-failure",
        handle: "primary-db--wt-cleanup-provider-failure"
      },
      worktree: {
        id: "wt-cleanup-provider-failure"
      }
    });

    expect(cleanup).toEqual({
      category: "provider_failure",
      reason: "Provider cleanup failed after safe scope was established."
    });
  });
});
