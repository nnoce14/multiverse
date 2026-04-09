import { accessSync } from "node:fs";
import { join } from "node:path";
import { rm } from "node:fs/promises";
import type {
  ResourceProvider,
  DerivedResourcePlan,
  ResourceValidation,
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
      validate: true,
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

    validateResource({ resource, derived, worktree }): ResourceValidation | Refusal {
      if (!worktree.id) {
        return unsafeScope();
      }

      try {
        accessSync(derived.handle);
      } catch {
        return {
          category: "provider_failure",
          reason: `Path-scoped resource '${resource.name}' is not accessible at: ${derived.handle}`
        };
      }

      return {
        resourceName: resource.name,
        provider: resource.provider,
        worktreeId: derived.worktreeId,
        capability: "validate"
      };
    },

    async resetResource({ resource, derived, worktree }): Promise<ResourceReset | Refusal> {
      if (!worktree.id) {
        return unsafeScope();
      }

      await rm(derived.handle, { recursive: true, force: true });

      return {
        resourceName: resource.name,
        provider: resource.provider,
        worktreeId: derived.worktreeId,
        capability: "reset"
      };
    },

    async cleanupResource({ resource, derived, worktree }): Promise<ResourceCleanup | Refusal> {
      if (!worktree.id) {
        return unsafeScope();
      }

      await rm(derived.handle, { recursive: true, force: true });

      return {
        resourceName: resource.name,
        provider: resource.provider,
        worktreeId: derived.worktreeId,
        capability: "cleanup"
      };
    }
  };
}
