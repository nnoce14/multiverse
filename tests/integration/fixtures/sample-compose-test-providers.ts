import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { createLocalPortProvider } from "@multiverse/provider-local-port";
import { createPathScopedProvider } from "@multiverse/provider-path-scoped";
import { createProcessPortScopedProvider } from "@multiverse/provider-process-port-scoped";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const sidecarPath = join(root, "apps/sample-compose/src/sidecar.ts");
const tsxPath = join(root, "node_modules/.bin/tsx");
const baseDir = join(root, ".codex", "test-state", "integration", "sample-compose");

export const providers = {
  resources: {
    "path-scoped": createPathScopedProvider({
      baseDir: join(baseDir, "db")
    }),
    "process-port-scoped": createProcessPortScopedProvider({
      baseDir: join(baseDir, "sidecar"),
      basePort: 6400,
      command: [tsxPath, sidecarPath, "--port", "{PORT}"]
    })
  },
  endpoints: {
    "local-port": createLocalPortProvider({ basePort: 5400 })
  }
};
