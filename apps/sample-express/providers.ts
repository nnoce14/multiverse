import { join } from "node:path";
import { tmpdir } from "node:os";
import { createPathScopedProvider } from "@multiverse/provider-path-scoped";
import { createLocalPortProvider } from "@multiverse/provider-local-port";

/**
 * Provider registry for the sample-express app.
 *
 * Resources:
 *   path-scoped  — isolates the JSON data file under a per-worktree subdirectory
 *
 * Endpoints:
 *   local-port   — assigns a deterministic port per worktree starting from base 5100
 */
export const providers = {
  resources: {
    "path-scoped": createPathScopedProvider({
      baseDir: join(tmpdir(), "multiverse-sample-express")
    })
  },
  endpoints: {
    "local-port": createLocalPortProvider({ basePort: 5100 })
  }
};
