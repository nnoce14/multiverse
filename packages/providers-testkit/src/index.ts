import type {
  DerivedResourcePlan,
  ProviderRegistry,
  Refusal,
  ResourceValidation,
  RepositoryConfiguration,
  WorktreeInstanceInput
} from "../../provider-contracts/index";

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

export function createExplicitTestProviders(): ProviderRegistry {
  return {
    resources: {
      "test-resource-provider": {
        capabilities: {
          validate: true
        },
        deriveResource({ resource, worktree }) {
          if (!worktree.id) {
            return unsafeScope("Safe worktree scope cannot be determined.");
          }

          return {
            resourceName: resource.name,
            provider: resource.provider,
            isolationStrategy: resource.isolationStrategy,
            worktreeId: worktree.id,
            handle: `${resource.name}--${worktree.id}`
          };
        },
        validateResource({ resource, derived, worktree }) {
          return validateScopedResource({
            resource,
            derived,
            worktree
          });
        }
      },
      "test-resource-provider-no-validate": {
        deriveResource({ resource, worktree }) {
          if (!worktree.id) {
            return unsafeScope("Safe worktree scope cannot be determined.");
          }

          return {
            resourceName: resource.name,
            provider: resource.provider,
            isolationStrategy: resource.isolationStrategy,
            worktreeId: worktree.id,
            handle: `${resource.name}--${worktree.id}`
          };
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
