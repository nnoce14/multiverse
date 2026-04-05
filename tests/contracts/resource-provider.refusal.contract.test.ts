import { describe, expect, it } from "vitest";

import {
  createProvidersWithResourceResetRefusal,
  createProvidersWithResourceValidateRefusal
} from "@multiverse/providers-testkit";

describe("resource provider refusal contract", () => {
  it("may refuse validate with provider failure distinctly from unsafe scope", () => {
    const providers = createProvidersWithResourceValidateRefusal({
      category: "provider_failure",
      reason: "Provider validation failed after safe scope was established."
    });
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
        worktreeId: "wt-contract-provider-failure",
        handle: "primary-db--wt-contract-provider-failure"
      },
      worktree: {
        id: "wt-contract-provider-failure"
      }
    });

    expect(validation).toEqual({
      category: "provider_failure",
      reason: "Provider validation failed after safe scope was established."
    });
  });

  it("may refuse reset with provider failure distinctly from unsafe scope", async () => {
    const providers = createProvidersWithResourceResetRefusal({
      category: "provider_failure",
      reason: "Provider reset failed after safe scope was established."
    });
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
        worktreeId: "wt-contract-provider-failure",
        handle: "primary-db--wt-contract-provider-failure"
      },
      worktree: {
        id: "wt-contract-provider-failure"
      }
    });

    expect(reset).toEqual({
      category: "provider_failure",
      reason: "Provider reset failed after safe scope was established."
    });
  });
});
