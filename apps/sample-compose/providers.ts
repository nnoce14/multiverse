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
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createPathScopedProvider } from "@multiverse/provider-path-scoped";
import { createLocalPortProvider } from "@multiverse/provider-local-port";
import { createProcessPortScopedProvider } from "@multiverse/provider-process-port-scoped";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = fileURLToPath(new URL("../..", import.meta.url));
const sidecarPath = join(__dirname, "src/sidecar.ts");
const tsxCliPath = join(root, "node_modules", "tsx", "dist", "cli.mjs");
const runtimeRoot = join(root, ".codex", "runtime", "sample-compose");

export const providers = {
  resources: {
    "path-scoped": createPathScopedProvider({
      baseDir: join(runtimeRoot, "db")
    }),
    "process-port-scoped": createProcessPortScopedProvider({
      baseDir: join(runtimeRoot, "sidecar"),
      basePort: 6100,
      command: [process.execPath, tsxCliPath, sidecarPath, "--port", "{PORT}"]
    })
  },
  endpoints: {
    "local-port": createLocalPortProvider({ basePort: 5400 })
  }
};
