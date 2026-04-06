/**
 * Provider registry for the sample-compose app.
 *
 * Resources:
 *   path-scoped          — isolates the SQLite data directory per worktree
 *   process-port-scoped  — starts and isolates the in-memory cache sidecar per worktree
 *
 * Endpoints:
 *   local-port           — assigns a deterministic HTTP port per worktree
 */

import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { createPathScopedProvider } from "@multiverse/provider-path-scoped";
import { createLocalPortProvider } from "@multiverse/provider-local-port";
import { createProcessPortScopedProvider } from "@multiverse/provider-process-port-scoped";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const sidecarPath = join(__dirname, "src/sidecar.ts");

export const providers = {
  resources: {
    "path-scoped": createPathScopedProvider({
      baseDir: join(tmpdir(), "multiverse-sample-compose")
    }),
    "process-port-scoped": createProcessPortScopedProvider({
      baseDir: join(tmpdir(), "multiverse-sample-compose-sidecar"),
      basePort: 6100,
      command: ["tsx", sidecarPath, "--port", "{PORT}"]
    })
  },
  endpoints: {
    "local-port": createLocalPortProvider({ basePort: 5400 })
  }
};
