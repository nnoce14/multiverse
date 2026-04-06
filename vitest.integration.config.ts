import { resolve } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@multiverse/core": resolve(root, "packages/core/index.ts"),
      "@multiverse/provider-contracts": resolve(root, "packages/provider-contracts/index.ts"),
    }
  },
  test: {
    include: ["tests/integration/**/*.test.ts"]
  }
});
