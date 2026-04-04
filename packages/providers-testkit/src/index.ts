import type {
  ProviderRegistry,
  Refusal,
  RepositoryConfiguration,
  WorktreeInstanceInput
} from "../../provider-contracts/src";

function unsafeScope(reason: string): Refusal {
  return {
    category: "unsafe_scope",
    reason
  };
}

export function createExplicitTestProviders(): ProviderRegistry {
  return {
    resources: {
      "test-resource-provider": {
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
