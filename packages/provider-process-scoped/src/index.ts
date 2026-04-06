import { join } from "node:path";
import type {
  ResourceProvider,
  DerivedResourcePlan,
  Refusal
} from "@multiverse/provider-contracts";

export interface ProcessScopedProviderConfig {
  baseDir: string;
  command: string[];
}

function unsafeScope(): Refusal {
  return {
    category: "unsafe_scope",
    reason: "Safe worktree scope cannot be determined: worktree ID is absent."
  };
}

export function createProcessScopedProvider(config: ProcessScopedProviderConfig): ResourceProvider {
  return {
    deriveResource({ resource, worktree }): DerivedResourcePlan | Refusal {
      if (!worktree.id) {
        return unsafeScope();
      }

      return {
        resourceName: resource.name,
        provider: resource.provider,
        isolationStrategy: "process-scoped",
        worktreeId: worktree.id,
        handle: join(config.baseDir, resource.name, worktree.id) + "/"
      };
    }
  };
}
