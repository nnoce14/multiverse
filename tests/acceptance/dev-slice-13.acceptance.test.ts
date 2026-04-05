import { describe, it, expect } from "vitest";
import { deriveOne } from "@multiverse/core";
import { createLocalPortProvider } from "@multiverse/provider-local-port";
import { createExplicitTestProviders } from "@multiverse/providers-testkit";

describe("dev-slice-13: local port endpoint provider", () => {
  const localPortProvider = createLocalPortProvider({ basePort: 5000 });

  function makeProviders() {
    const base = createExplicitTestProviders();
    return {
      resources: base.resources,
      endpoints: {
        "local-port": localPortProvider
      }
    };
  }

  const repository = {
    resources: [
      {
        name: "primary-db",
        provider: "test-resource-provider",
        isolationStrategy: "name-scoped" as const,
        scopedValidate: false,
        scopedReset: false,
        scopedCleanup: false
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

  it("derives a local HTTP address for a valid worktree instance", () => {
    const result = deriveOne({
      repository,
      worktree: { id: "feature-login" },
      providers: makeProviders()
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const [mapping] = result.endpointMappings;
    expect(mapping.address).toMatch(/^http:\/\/localhost:\d+$/);
  });

  it("derives an address with port in the configured base port range", () => {
    const result = deriveOne({
      repository,
      worktree: { id: "feature-login" },
      providers: makeProviders()
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const [mapping] = result.endpointMappings;
    const port = parseInt(mapping.address.replace("http://localhost:", ""), 10);

    expect(port).toBeGreaterThanOrEqual(5000);
    expect(port).toBeLessThanOrEqual(5999);
  });

  it("derives the same address for the same worktree ID on repeated calls", () => {
    const first = deriveOne({
      repository,
      worktree: { id: "feature-payments" },
      providers: makeProviders()
    });

    const second = deriveOne({
      repository,
      worktree: { id: "feature-payments" },
      providers: makeProviders()
    });

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (!first.ok || !second.ok) return;

    expect(first.endpointMappings[0].address).toBe(second.endpointMappings[0].address);
  });

  it("derives distinct addresses for distinct worktree IDs", () => {
    const resultA = deriveOne({
      repository,
      worktree: { id: "worktree-a" },
      providers: makeProviders()
    });

    const resultB = deriveOne({
      repository,
      worktree: { id: "worktree-b" },
      providers: makeProviders()
    });

    expect(resultA.ok).toBe(true);
    expect(resultB.ok).toBe(true);
    if (!resultA.ok || !resultB.ok) return;

    expect(resultA.endpointMappings[0].address).not.toBe(resultB.endpointMappings[0].address);
  });

  it("returns a refusal when worktree ID is absent", () => {
    const result = deriveOne({
      repository,
      worktree: {},
      providers: makeProviders()
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.refusal.category).toBe("unsafe_scope");
  });
});
