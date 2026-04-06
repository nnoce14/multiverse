import { join } from "node:path";
import { tmpdir } from "node:os";
import { createProcessScopedProvider } from "@multiverse/provider-process-scoped";

export const providers = {
  resources: {
    "process-scoped": createProcessScopedProvider({
      baseDir: join(tmpdir(), "multiverse-cli-process-scoped-test"),
      command: ["node", "-e", "setTimeout(() => {}, 60000)"]
    })
  },
  endpoints: {}
};
