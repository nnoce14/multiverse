import { describe, it, expect } from "vitest";
import { resetOneResource, cleanupOneResource } from "@multiverse/core";
import { createNameScopedProvider } from "@multiverse/provider-name-scoped";
import { createLocalPortProvider } from "@multiverse/provider-local-port";

describe("dev-slice-16: name-scoped provider lifecycle", () => {
  const nameScopedProvider = createNameScopedProvider();
  const localPortProvider = createLocalPortProvider({ basePort: 7000 });

  function makeProviders() {
    return {
      resources: { "name-scoped": nameScopedProvider },
      endpoints: { "local-port": localPortProvider }
    };
  }

  function makeRepository(overrides: { scopedReset?: boolean; scopedCleanup?: boolean } = {}) {
    return {
      resources: [
        {
          name: "primary-db",
          provider: "name-scoped",
          isolationStrategy: "name-scoped" as const,
          scopedValidate: false,
          scopedReset: overrides.scopedReset ?? false,
          scopedCleanup: overrides.scopedCleanup ?? false
        }
      ],
      endpoints: [
        {
          name: "app-base-url",
          role: "application-base-url",
          provider: "local-port"
        }
      ]
    };
  }

  describe("reset", () => {
    it("succeeds for a name-scoped resource with scopedReset declared", async () => {
      const result = await resetOneResource({
        repository: makeRepository({ scopedReset: true }),
        worktree: { id: "feature-login" },
        providers: makeProviders()
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.resourceResets[0].capability).toBe("reset");
      expect(result.resourceResets[0].resourceName).toBe("primary-db");
      expect(result.resourceResets[0].worktreeId).toBe("feature-login");
    });

    it("returns invalid_configuration when scopedReset is not declared", async () => {
      const result = await resetOneResource({
        repository: makeRepository({ scopedReset: false }),
        worktree: { id: "feature-login" },
        providers: makeProviders()
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.refusal.category).toBe("invalid_configuration");
    });

    it("returns unsafe_scope when worktree ID is absent", async () => {
      const result = await resetOneResource({
        repository: makeRepository({ scopedReset: true }),
        worktree: {},
        providers: makeProviders()
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.refusal.category).toBe("unsafe_scope");
    });
  });

  describe("cleanup", () => {
    it("succeeds for a name-scoped resource with scopedCleanup declared", async () => {
      const result = await cleanupOneResource({
        repository: makeRepository({ scopedCleanup: true }),
        worktree: { id: "feature-login" },
        providers: makeProviders()
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.resourceCleanups[0].capability).toBe("cleanup");
      expect(result.resourceCleanups[0].resourceName).toBe("primary-db");
      expect(result.resourceCleanups[0].worktreeId).toBe("feature-login");
    });

    it("returns invalid_configuration when scopedCleanup is not declared", async () => {
      const result = await cleanupOneResource({
        repository: makeRepository({ scopedCleanup: false }),
        worktree: { id: "feature-login" },
        providers: makeProviders()
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.refusal.category).toBe("invalid_configuration");
    });

    it("returns unsafe_scope when worktree ID is absent", async () => {
      const result = await cleanupOneResource({
        repository: makeRepository({ scopedCleanup: true }),
        worktree: {},
        providers: makeProviders()
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.refusal.category).toBe("unsafe_scope");
    });
  });
});
