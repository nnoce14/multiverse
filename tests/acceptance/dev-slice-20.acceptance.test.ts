import { describe, it, expect } from "vitest";
import { deriveAndValidateOne } from "@multiverse/core";
import { createNameScopedProvider } from "@multiverse/provider-name-scoped";

describe("dev-slice-20: multi-resource derive and validate", () => {
  const nameScopedProvider = createNameScopedProvider();
  const validateCapableProvider = {
    capabilities: { validate: true as const },
    deriveResource(input: { resource: { name: string; provider: string; isolationStrategy: "name-scoped" | "path-scoped" | "process-scoped" }; worktree: { id: string } }) {
      return {
        resourceName: input.resource.name,
        provider: input.resource.provider,
        isolationStrategy: input.resource.isolationStrategy,
        worktreeId: input.worktree.id,
        handle: `${input.resource.name}_${input.worktree.id}`
      };
    },
    validateResource(input: { resource: { name: string; provider: string }; derived: { worktreeId: string } }) {
      return {
        resourceName: input.resource.name,
        provider: input.resource.provider,
        worktreeId: input.derived.worktreeId,
        capability: "validate" as const
      };
    }
  };

  function makeTwoResourceRepository(overrides: {
    firstScopedValidate?: boolean;
    secondScopedValidate?: boolean;
    endpoints?: Array<{ name: string; role: string; provider: string }>;
  } = {}) {
    return {
      resources: [
        {
          name: "primary-db",
          provider: "validate-capable",
          isolationStrategy: "name-scoped" as const,
          scopedValidate: overrides.firstScopedValidate ?? false,
          scopedReset: false,
          scopedCleanup: false
        },
        {
          name: "cache",
          provider: "validate-capable",
          isolationStrategy: "name-scoped" as const,
          scopedValidate: overrides.secondScopedValidate ?? false,
          scopedReset: false,
          scopedCleanup: false
        }
      ],
      endpoints: overrides.endpoints ?? []
    };
  }

  function makeProviders() {
    return {
      resources: { "validate-capable": validateCapableProvider },
      endpoints: {}
    };
  }

  describe("multi-resource derive", () => {
    it("derives all resources when both declare scopedValidate", () => {
      const result = deriveAndValidateOne({
        repository: makeTwoResourceRepository({
          firstScopedValidate: true,
          secondScopedValidate: true
        }),
        worktree: { id: "feature-login" },
        providers: makeProviders()
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.resourcePlans).toHaveLength(2);
      expect(result.resourcePlans[0].resourceName).toBe("primary-db");
      expect(result.resourcePlans[1].resourceName).toBe("cache");
    });

    it("derives all resources even when none declare scopedValidate", () => {
      const result = deriveAndValidateOne({
        repository: makeTwoResourceRepository({
          firstScopedValidate: false,
          secondScopedValidate: false
        }),
        worktree: { id: "feature-login" },
        providers: makeProviders()
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.resourcePlans).toHaveLength(2);
    });
  });

  describe("multi-resource validate", () => {
    it("validates all resources that declare scopedValidate", () => {
      const result = deriveAndValidateOne({
        repository: makeTwoResourceRepository({
          firstScopedValidate: true,
          secondScopedValidate: true
        }),
        worktree: { id: "feature-login" },
        providers: makeProviders()
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.resourceValidations).toHaveLength(2);
      expect(result.resourceValidations[0].resourceName).toBe("primary-db");
      expect(result.resourceValidations[0].capability).toBe("validate");
      expect(result.resourceValidations[1].resourceName).toBe("cache");
      expect(result.resourceValidations[1].capability).toBe("validate");
    });

    it("validates only the resources that declare scopedValidate", () => {
      const result = deriveAndValidateOne({
        repository: makeTwoResourceRepository({
          firstScopedValidate: true,
          secondScopedValidate: false
        }),
        worktree: { id: "feature-login" },
        providers: makeProviders()
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.resourcePlans).toHaveLength(2);
      expect(result.resourceValidations).toHaveLength(1);
      expect(result.resourceValidations[0].resourceName).toBe("primary-db");
    });

    it("succeeds with empty resourceValidations when no resources declare scopedValidate", () => {
      const result = deriveAndValidateOne({
        repository: makeTwoResourceRepository({
          firstScopedValidate: false,
          secondScopedValidate: false
        }),
        worktree: { id: "feature-login" },
        providers: makeProviders()
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.resourcePlans).toHaveLength(2);
      expect(result.resourceValidations).toHaveLength(0);
    });

    it("returns refusal fail-fast when the second resource validation refuses", () => {
      const refusingValidateProvider = {
        capabilities: { validate: true as const },
        deriveResource(input: { resource: { name: string; provider: string; isolationStrategy: "name-scoped" | "path-scoped" | "process-scoped" }; worktree: { id: string } }) {
          return {
            resourceName: input.resource.name,
            provider: input.resource.provider,
            isolationStrategy: input.resource.isolationStrategy,
            worktreeId: input.worktree.id,
            handle: `${input.resource.name}_${input.worktree.id}`
          };
        },
        validateResource() {
          return {
            category: "provider_failure" as const,
            reason: "Validation provider refused."
          };
        }
      };

      const repository = {
        resources: [
          {
            name: "primary-db",
            provider: "validate-capable",
            isolationStrategy: "name-scoped" as const,
            scopedValidate: true,
            scopedReset: false,
            scopedCleanup: false
          },
          {
            name: "cache",
            provider: "refusing-validate",
            isolationStrategy: "name-scoped" as const,
            scopedValidate: true,
            scopedReset: false,
            scopedCleanup: false
          }
        ],
        endpoints: []
      };

      const result = deriveAndValidateOne({
        repository,
        worktree: { id: "feature-login" },
        providers: {
          resources: {
            "validate-capable": validateCapableProvider,
            "refusing-validate": refusingValidateProvider
          },
          endpoints: {}
        }
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.refusal.category).toBe("provider_failure");
    });
  });

  describe("multi-endpoint derive", () => {
    it("derives all endpoints and includes them in result", () => {
      const endpointProvider = {
        deriveEndpoint(input: { endpoint: { name: string; role: string; provider: string }; worktree: { id: string } }) {
          return {
            endpointName: input.endpoint.name,
            provider: input.endpoint.provider,
            role: input.endpoint.role,
            worktreeId: input.worktree.id,
            address: `http://${input.worktree.id}.local/${input.endpoint.name}`
          };
        }
      };

      const result = deriveAndValidateOne({
        repository: {
          resources: [
            {
              name: "primary-db",
              provider: "validate-capable",
              isolationStrategy: "name-scoped" as const,
              scopedValidate: false,
              scopedReset: false,
              scopedCleanup: false
            },
            {
              name: "cache",
              provider: "validate-capable",
              isolationStrategy: "name-scoped" as const,
              scopedValidate: false,
              scopedReset: false,
              scopedCleanup: false
            }
          ],
          endpoints: [
            { name: "app-base-url", role: "application-base-url", provider: "test-endpoint" },
            { name: "admin-url", role: "admin", provider: "test-endpoint" }
          ]
        },
        worktree: { id: "feature-login" },
        providers: {
          resources: { "validate-capable": validateCapableProvider },
          endpoints: { "test-endpoint": endpointProvider }
        }
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.resourcePlans).toHaveLength(2);
      expect(result.endpointMappings).toHaveLength(2);
      expect(result.endpointMappings[0].endpointName).toBe("app-base-url");
      expect(result.endpointMappings[1].endpointName).toBe("admin-url");
    });

    it("succeeds with 0 endpoints (endpoint count not enforced)", () => {
      const result = deriveAndValidateOne({
        repository: makeTwoResourceRepository({ endpoints: [] }),
        worktree: { id: "feature-login" },
        providers: makeProviders()
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.resourcePlans).toHaveLength(2);
      expect(result.endpointMappings).toHaveLength(0);
    });
  });
});
