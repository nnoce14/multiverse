import { describe, expect, it } from "vitest";

import { createExplicitTestProviders } from "@multiverse/providers-testkit";

describe("resource provider validate contract", () => {
  it("declares validate support explicitly and validates one worktree instance", () => {
    const providers = createExplicitTestProviders();
    const resourceProvider = providers.resources["test-resource-provider"];

    expect(resourceProvider.capabilities).toEqual({
      validate: true
    });

    if (!resourceProvider.validateResource) {
      throw new Error("Expected validateResource to be defined.");
    }

    const validation = resourceProvider.validateResource({
      resource: {
        name: "primary-db",
        provider: "test-resource-provider",
        isolationStrategy: "name-scoped",
        scopedReset: false,
        scopedCleanup: false,
        scopedValidate: true
      },
      derived: {
        resourceName: "primary-db",
        provider: "test-resource-provider",
        isolationStrategy: "name-scoped",
        worktreeId: "wt-contract",
        handle: "primary-db--wt-contract"
      },
      worktree: {
        id: "wt-contract",
        label: "contract"
      }
    });

    expect(validation).toEqual({
      resourceName: "primary-db",
      provider: "test-resource-provider",
      worktreeId: "wt-contract",
      capability: "validate"
    });
  });

  it("refuses validation when provider-level scope safety cannot be established", () => {
    const providers = createExplicitTestProviders();
    const resourceProvider = providers.resources["test-resource-provider"];

    if (!resourceProvider.validateResource) {
      throw new Error("Expected validateResource to be defined.");
    }

    const validation = resourceProvider.validateResource({
      resource: {
        name: "primary-db",
        provider: "test-resource-provider",
        isolationStrategy: "name-scoped",
        scopedReset: false,
        scopedCleanup: false,
        scopedValidate: true
      },
      derived: {
        resourceName: "primary-db",
        provider: "test-resource-provider",
        isolationStrategy: "name-scoped",
        worktreeId: "wt-contract",
        handle: "primary-db--wt-contract"
      },
      worktree: {
        label: "contract-unsafe-scope"
      }
    });

    expect(validation).toMatchObject({
      category: "unsafe_scope"
    });
  });
});
