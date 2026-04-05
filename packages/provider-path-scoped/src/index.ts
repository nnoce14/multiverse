import { join } from "node:path";
import type { ResourceProvider, DerivedResourcePlan, Refusal } from "@multiverse/provider-contracts";

export interface PathScopedProviderConfig {
  baseDir: string;
}

export function createPathScopedProvider(config: PathScopedProviderConfig): ResourceProvider {
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
        isolationStrategy: "path-scoped",
        worktreeId: worktree.id,
        handle: join(config.baseDir, resource.name, worktree.id)
      };
    }
  };
}
