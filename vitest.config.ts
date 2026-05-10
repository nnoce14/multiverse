import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@multiverse/provider-contracts": new URL(
        "./packages/provider-contracts/index.ts",
        import.meta.url
      ).pathname,
      "@multiverse/core": new URL("./packages/core/index.ts", import.meta.url).pathname,
      "@multiverse/providers-testkit": new URL(
        "./packages/providers-testkit/index.ts",
        import.meta.url
      ).pathname
    }
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts", "**/*.acceptance.test.ts"]
  }
});
