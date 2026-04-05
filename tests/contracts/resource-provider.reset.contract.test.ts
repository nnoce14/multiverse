import { describe, expect, it } from "vitest";

import { createExplicitTestProviders } from "@multiverse/providers-testkit";

describe("resource provider reset contract", () => {
  it("declares reset support explicitly and resets one worktree instance", async () => {
    const providers = createExplicitTestProviders();
    const resourceProvider = providers.resources["test-resource-provider-with-reset"];

    expect(resourceProvider.capabilities).toEqual({
      reset: true
    });

    if (!resourceProvider.resetResource) {
      throw new Error("Expected resetResource to be defined.");
    }

    const reset = await resourceProvider.resetResource({
      resource: {
        name: "primary-db",
        provider: "test-resource-provider-with-reset",
        isolationStrategy: "name-scoped",
        scopedReset: true,
        scopedCleanup: false,
        scopedValidate: false
      },
      derived: {
        resourceName: "primary-db",
        provider: "test-resource-provider-with-reset",
        isolationStrategy: "name-scoped",
        worktreeId: "wt-reset-contract",
        handle: "primary-db--wt-reset-contract"
      },
      worktree: {
        id: "wt-reset-contract"
      }
    });

    expect(reset).toEqual({
      resourceName: "primary-db",
      provider: "test-resource-provider-with-reset",
      worktreeId: "wt-reset-contract",
      capability: "reset"
    });
  });

  it("refuses reset when provider-level scope safety cannot be established", async () => {
    const providers = createExplicitTestProviders();
    const resourceProvider = providers.resources["test-resource-provider-with-reset"];

    if (!resourceProvider.resetResource) {
      throw new Error("Expected resetResource to be defined.");
    }

    const reset = await resourceProvider.resetResource({
      resource: {
        name: "primary-db",
        provider: "test-resource-provider-with-reset",
        isolationStrategy: "name-scoped",
        scopedReset: true,
        scopedCleanup: false,
        scopedValidate: false
      },
      derived: {
        resourceName: "primary-db",
        provider: "test-resource-provider-with-reset",
        isolationStrategy: "name-scoped",
        worktreeId: "wt-reset-contract",
        handle: "primary-db--wt-reset-contract"
      },
      worktree: {
        label: "reset-contract-unsafe-scope"
      }
    });

    expect(reset).toMatchObject({
      category: "unsafe_scope"
    });
  });
});
