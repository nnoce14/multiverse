import type {
  DerivedResourcePlan,
  ProviderRegistry,
  Refusal,
  ResourceReset,
  ResourceValidation,
  RepositoryConfiguration,
  WorktreeInstanceInput
} from "@multiverse/provider-contracts";

function unsafeScope(reason: string): Refusal {
  return {
    category: "unsafe_scope",
    reason
  };
}

function validateScopedResource(input: {
  resource: {
    name: string;
    provider: string;
  };
  derived: DerivedResourcePlan;
  worktree: WorktreeInstanceInput;
}): ResourceValidation | Refusal {
  if (!input.worktree.id) {
    return unsafeScope("Safe worktree scope cannot be determined.");
  }

  return {
    resourceName: input.resource.name,
    provider: input.resource.provider,
    worktreeId: input.derived.worktreeId,
    capability: "validate"
  };
}

function deriveScopedResource(input: {
  resource: {
    name: string;
    provider: string;
    isolationStrategy: DerivedResourcePlan["isolationStrategy"];
  };
  worktree: WorktreeInstanceInput;
}): DerivedResourcePlan | Refusal {
  if (!input.worktree.id) {
    return unsafeScope("Safe worktree scope cannot be determined.");
  }

  return {
    resourceName: input.resource.name,
    provider: input.resource.provider,
    isolationStrategy: input.resource.isolationStrategy,
    worktreeId: input.worktree.id,
    handle: `${input.resource.name}--${input.worktree.id}`
  };
}

function resetScopedResource(input: {
  resource: {
    name: string;
    provider: string;
  };
  derived: DerivedResourcePlan;
  worktree: WorktreeInstanceInput;
}): ResourceReset | Refusal {
  if (!input.worktree.id) {
    return unsafeScope("Safe worktree scope cannot be determined.");
  }

  return {
    resourceName: input.resource.name,
    provider: input.resource.provider,
    worktreeId: input.derived.worktreeId,
    capability: "reset"
  };
}

export function createExplicitTestProviders(): ProviderRegistry {
  return {
    resources: {
      "test-resource-provider": {
        capabilities: {
          validate: true
        },
        deriveResource({ resource, worktree }) {
          return deriveScopedResource({
            resource,
            worktree
          });
        },
        validateResource({ resource, derived, worktree }) {
          return validateScopedResource({
            resource,
            derived,
            worktree
          });
        }
      },
      "test-resource-provider-with-reset": {
        capabilities: {
          reset: true
        },
        deriveResource({ resource, worktree }) {
          return deriveScopedResource({
            resource,
            worktree
          });
        },
        resetResource({ resource, derived, worktree }) {
          return resetScopedResource({
            resource,
            derived,
            worktree
          });
        }
      },
      "test-resource-provider-no-validate": {
        deriveResource({ resource, worktree }) {
          return deriveScopedResource({
            resource,
            worktree
          });
        }
      }
    },
    endpoints: {
      "test-endpoint-provider": {
        deriveEndpoint({ endpoint, worktree }) {
          if (!worktree.id) {
            return unsafeScope("Safe worktree scope cannot be determined.");
          }

          return {
            endpointName: endpoint.name,
            provider: endpoint.provider,
            role: endpoint.role,
            worktreeId: worktree.id,
            address: `http://${worktree.id}.local/${endpoint.name}`
          };
        }
      }
    }
  };
}

export function createProvidersWithResourceDeriveRefusal(
  refusal: Refusal
): ProviderRegistry {
  const providers = createExplicitTestProviders();

  providers.resources["test-resource-provider"] = {
    ...providers.resources["test-resource-provider"],
    deriveResource() {
      return refusal;
    }
  };

  return providers;
}

export function createProvidersWithEndpointDeriveRefusal(
  refusal: Refusal
): ProviderRegistry {
  const providers = createExplicitTestProviders();

  providers.endpoints["test-endpoint-provider"] = {
    deriveEndpoint() {
      return refusal;
    }
  };

  return providers;
}

export function createProvidersWithResourceValidateRefusal(
  refusal: Refusal
): ProviderRegistry {
  const providers = createExplicitTestProviders();

  providers.resources["test-resource-provider"] = {
    ...providers.resources["test-resource-provider"],
    validateResource() {
      return refusal;
    }
  };

  return providers;
}

export function createProvidersWithResourceResetRefusal(
  refusal: Refusal
): ProviderRegistry {
  const providers = createExplicitTestProviders();

  providers.resources["test-resource-provider-with-reset"] = {
    ...providers.resources["test-resource-provider-with-reset"],
    resetResource() {
      return refusal;
    }
  };

  return providers;
}

export function createValidRepositoryConfiguration(
  overrides: Partial<RepositoryConfiguration> = {}
): RepositoryConfiguration {
  return {
    resources: [
      {
        name: "primary-db",
        provider: "test-resource-provider",
        isolationStrategy: "name-scoped",
        scopedValidate: false,
        scopedReset: false,
        scopedCleanup: false
      }
    ],
    endpoints: [
      {
        name: "app-base-url",
        role: "application-base-url",
        provider: "test-endpoint-provider"
      }
    ],
    ...overrides
  };
}

export function createWorktreeInstance(
  input: WorktreeInstanceInput
): WorktreeInstanceInput {
  return input;
}
