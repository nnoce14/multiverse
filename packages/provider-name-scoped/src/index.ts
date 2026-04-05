import type { ResourceProvider, DerivedResourcePlan, Refusal } from "@multiverse/provider-contracts";

export function createNameScopedProvider(): ResourceProvider {
  return {
    deriveResource({ resource, worktree }): DerivedResourcePlan | Refusal {
      if (!worktree.id) {
        return {
          category: "unsafe_scope",
          reason: "Safe worktree scope cannot be determined: worktree ID is absent."
        };
      }

      return {
        resourceName: resource.name,
        provider: resource.provider,
        isolationStrategy: "name-scoped",
        worktreeId: worktree.id,
        handle: `${resource.name}_${worktree.id}`
      };
    }
  };
}
