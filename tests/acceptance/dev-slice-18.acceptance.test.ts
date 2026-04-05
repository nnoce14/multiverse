import { describe, it, expect } from "vitest";
import { deriveOne } from "@multiverse/core";
import { createNameScopedProvider } from "@multiverse/provider-name-scoped";
import { createLocalPortProvider } from "@multiverse/provider-local-port";
import { createProvidersWithResourceDeriveRefusal } from "@multiverse/providers-testkit";

describe("dev-slice-18: multi-resource and multi-endpoint derive", () => {
  const nameScopedProvider = createNameScopedProvider();
  const localPortProvider = createLocalPortProvider({ basePort: 9000 });

  function makeProviders() {
    return {
      resources: { "name-scoped": nameScopedProvider },
      endpoints: { "local-port": localPortProvider }
    };
  }

  it("derives all resources and endpoints when multiple resources are declared", () => {
    const result = deriveOne({
      repository: {
        resources: [
          {
            name: "primary-db",
            provider: "name-scoped",
            isolationStrategy: "name-scoped" as const,
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: false
          },
          {
            name: "cache",
            provider: "name-scoped",
            isolationStrategy: "name-scoped" as const,
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: false
          }
        ],
        endpoints: [
          {
            name: "app-base-url",
            role: "application-base-url",
            provider: "local-port"
          }
        ]
      },
      worktree: { id: "feature-login" },
      providers: makeProviders()
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.resourcePlans).toHaveLength(2);
    expect(result.resourcePlans[0].resourceName).toBe("primary-db");
    expect(result.resourcePlans[0].handle).toBe("primary-db_feature-login");
    expect(result.resourcePlans[1].resourceName).toBe("cache");
    expect(result.resourcePlans[1].handle).toBe("cache_feature-login");
    expect(result.endpointMappings).toHaveLength(1);
  });

  it("derives all resources and endpoints when multiple endpoints are declared", () => {
    const result = deriveOne({
      repository: {
        resources: [
          {
            name: "primary-db",
            provider: "name-scoped",
            isolationStrategy: "name-scoped" as const,
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: false
          }
        ],
        endpoints: [
          {
            name: "app-base-url",
            role: "application-base-url",
            provider: "local-port"
          },
          {
            name: "admin-url",
            role: "admin-base-url",
            provider: "local-port"
          }
        ]
      },
      worktree: { id: "feature-login" },
      providers: makeProviders()
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.resourcePlans).toHaveLength(1);
    expect(result.endpointMappings).toHaveLength(2);
    expect(result.endpointMappings[0].endpointName).toBe("app-base-url");
    expect(result.endpointMappings[1].endpointName).toBe("admin-url");
  });

  it("returns refusal fail-fast when the second resource fails to derive", () => {
    const providers = {
      resources: {
        "name-scoped": nameScopedProvider,
        "failing-provider": createProvidersWithResourceDeriveRefusal({
          category: "provider_failure",
          reason: "Second resource failed."
        }).resources["test-resource-provider"]
      },
      endpoints: { "local-port": localPortProvider }
    };

    const result = deriveOne({
      repository: {
        resources: [
          {
            name: "primary-db",
            provider: "name-scoped",
            isolationStrategy: "name-scoped" as const,
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: false
          },
          {
            name: "cache",
            provider: "failing-provider",
            isolationStrategy: "name-scoped" as const,
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: false
          }
        ],
        endpoints: [
          {
            name: "app-base-url",
            role: "application-base-url",
            provider: "local-port"
          }
        ]
      },
      worktree: { id: "feature-login" },
      providers
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.refusal.category).toBe("provider_failure");
  });

  it("returns resource refusal before any endpoint is evaluated", () => {
    // The endpoint provider would panic if called — proves endpoints are never reached
    const endpointProviderThatMustNotBeCalled = {
      deriveEndpoint(): never {
        throw new Error("Endpoint provider was called — resource refusal did not stop evaluation.");
      }
    };

    const result = deriveOne({
      repository: {
        resources: [
          {
            name: "failing-db",
            provider: "failing-resource",
            isolationStrategy: "name-scoped" as const,
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: false
          }
        ],
        endpoints: [
          {
            name: "app-base-url",
            role: "application-base-url",
            provider: "guarded-endpoint"
          }
        ]
      },
      worktree: { id: "feature-login" },
      providers: {
        resources: {
          "failing-resource": createProvidersWithResourceDeriveRefusal({
            category: "unsafe_scope",
            reason: "Resource failed before endpoint evaluation."
          }).resources["test-resource-provider"]
        },
        endpoints: {
          "guarded-endpoint": endpointProviderThatMustNotBeCalled
        }
      }
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.refusal.category).toBe("unsafe_scope");
  });

  it("returns refusal fail-fast when an endpoint fails to derive", () => {
    const failingEndpointProvider = {
      deriveEndpoint(): never {
        return {
          category: "provider_failure",
          reason: "Endpoint derivation failed."
        } as never;
      }
    };

    const result = deriveOne({
      repository: {
        resources: [
          {
            name: "primary-db",
            provider: "name-scoped",
            isolationStrategy: "name-scoped" as const,
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: false
          }
        ],
        endpoints: [
          {
            name: "app-base-url",
            role: "application-base-url",
            provider: "local-port"
          },
          {
            name: "failing-endpoint",
            role: "secondary-url",
            provider: "failing-endpoint-provider"
          }
        ]
      },
      worktree: { id: "feature-login" },
      providers: {
        resources: { "name-scoped": nameScopedProvider },
        endpoints: {
          "local-port": localPortProvider,
          "failing-endpoint-provider": failingEndpointProvider
        }
      }
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.refusal.category).toBe("provider_failure");
  });

  it("succeeds with empty arrays when no resources or endpoints are declared", () => {
    const result = deriveOne({
      repository: {
        resources: [],
        endpoints: []
      },
      worktree: { id: "feature-login" },
      providers: makeProviders()
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.resourcePlans).toHaveLength(0);
    expect(result.endpointMappings).toHaveLength(0);
  });
});
