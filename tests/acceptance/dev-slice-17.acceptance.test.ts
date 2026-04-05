import { describe, it, expect } from "vitest";
import { resetOneResource, cleanupOneResource } from "@multiverse/core";
import { createPathScopedProvider } from "@multiverse/provider-path-scoped";
import { createLocalPortProvider } from "@multiverse/provider-local-port";

describe("dev-slice-17: path-scoped provider lifecycle", () => {
  const baseDir = "/var/multiverse/test";
  const pathScopedProvider = createPathScopedProvider({ baseDir });
  const localPortProvider = createLocalPortProvider({ basePort: 8000 });

  function makeProviders() {
    return {
      resources: { "path-scoped": pathScopedProvider },
      endpoints: { "local-port": localPortProvider }
    };
  }

  function makeRepository(overrides: { scopedReset?: boolean; scopedCleanup?: boolean } = {}) {
    return {
      resources: [
        {
          name: "sqlite-db",
          provider: "path-scoped",
          isolationStrategy: "path-scoped" as const,
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
    it("succeeds for a path-scoped resource with scopedReset declared", () => {
      const result = resetOneResource({
        repository: makeRepository({ scopedReset: true }),
        worktree: { id: "feature-login" },
        providers: makeProviders()
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.resourceResets[0].capability).toBe("reset");
      expect(result.resourceResets[0].resourceName).toBe("sqlite-db");
      expect(result.resourceResets[0].worktreeId).toBe("feature-login");
    });

    it("returns invalid_configuration when scopedReset is not declared", () => {
      const result = resetOneResource({
        repository: makeRepository({ scopedReset: false }),
        worktree: { id: "feature-login" },
        providers: makeProviders()
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.refusal.category).toBe("invalid_configuration");
    });

    it("returns unsafe_scope when worktree ID is absent", () => {
      const result = resetOneResource({
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
    it("succeeds for a path-scoped resource with scopedCleanup declared", () => {
      const result = cleanupOneResource({
        repository: makeRepository({ scopedCleanup: true }),
        worktree: { id: "feature-login" },
        providers: makeProviders()
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.resourceCleanups[0].capability).toBe("cleanup");
      expect(result.resourceCleanups[0].resourceName).toBe("sqlite-db");
      expect(result.resourceCleanups[0].worktreeId).toBe("feature-login");
    });

    it("returns invalid_configuration when scopedCleanup is not declared", () => {
      const result = cleanupOneResource({
        repository: makeRepository({ scopedCleanup: false }),
        worktree: { id: "feature-login" },
        providers: makeProviders()
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.refusal.category).toBe("invalid_configuration");
    });

    it("returns unsafe_scope when worktree ID is absent", () => {
      const result = cleanupOneResource({
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
