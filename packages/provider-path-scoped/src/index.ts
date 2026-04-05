import { join } from "node:path";
import type {
  ResourceProvider,
  DerivedResourcePlan,
  ResourceReset,
  ResourceCleanup,
  Refusal
} from "@multiverse/provider-contracts";

export interface PathScopedProviderConfig {
  baseDir: string;
}

function unsafeScope(): Refusal {
  return {
    category: "unsafe_scope",
    reason: "Safe worktree scope cannot be determined: worktree ID is absent."
  };
}

export function createPathScopedProvider(config: PathScopedProviderConfig): ResourceProvider {
  return {
    capabilities: {
      reset: true,
      cleanup: true
    },

    deriveResource({ resource, worktree }): DerivedResourcePlan | Refusal {
      if (!worktree.id) {
        return unsafeScope();
      }

      return {
        resourceName: resource.name,
        provider: resource.provider,
        isolationStrategy: "path-scoped",
        worktreeId: worktree.id,
        handle: join(config.baseDir, resource.name, worktree.id)
      };
    },

    resetResource({ resource, derived, worktree }): ResourceReset | Refusal {
      if (!worktree.id) {
        return unsafeScope();
      }

      return {
        resourceName: resource.name,
        provider: resource.provider,
        worktreeId: derived.worktreeId,
        capability: "reset"
      };
    },

    cleanupResource({ resource, derived, worktree }): ResourceCleanup | Refusal {
      if (!worktree.id) {
        return unsafeScope();
      }

      return {
        resourceName: resource.name,
        provider: resource.provider,
        worktreeId: derived.worktreeId,
        capability: "cleanup"
      };
    }
  };
}
