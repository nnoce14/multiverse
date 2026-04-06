import { join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { createLocalPortProvider } from "@multiverse/provider-local-port";
import { createPathScopedProvider } from "@multiverse/provider-path-scoped";
import { createProcessPortScopedProvider } from "@multiverse/provider-process-port-scoped";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const sidecarPath = join(root, "apps/sample-compose/src/sidecar.ts");
const tsxCliPath = join(root, "node_modules", "tsx", "dist", "cli.mjs");
const baseDir = join(root, ".codex", "test-state", "integration", "sample-compose");

export const providers = {
  resources: {
    "path-scoped": createPathScopedProvider({
      baseDir: join(baseDir, "db")
    }),
    "process-port-scoped": createProcessPortScopedProvider({
      baseDir: join(baseDir, "sidecar"),
      basePort: 6400,
      command: [process.execPath, tsxCliPath, sidecarPath, "--port", "{PORT}"]
    })
  },
  endpoints: {
    "local-port": createLocalPortProvider({ basePort: 5400 })
  }
};
