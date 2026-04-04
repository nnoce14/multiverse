import { describe, expect, it } from "vitest";

import { createProvidersWithResourceValidateRefusal } from "@multiverse/providers-testkit";

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
});
