import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    conditions: ["source"]
  },
  test: {
    include: ["tests/acceptance/**/*.test.ts", "tests/contracts/**/*.test.ts", "tests/unit/**/*.test.ts"]
  }
});
