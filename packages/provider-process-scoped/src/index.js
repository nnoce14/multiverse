import { join } from "node:path";
function unsafeScope() {
    return {
        category: "unsafe_scope",
        reason: "Safe worktree scope cannot be determined: worktree ID is absent."
    };
}
export function createProcessScopedProvider(config) {
    return {
        deriveResource({ resource, worktree }) {
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
