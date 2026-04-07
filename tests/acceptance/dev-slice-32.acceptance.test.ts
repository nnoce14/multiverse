/**
 * Dev Slice 32 acceptance: non-first-party provider authoring proof.
 *
 * Proves that a provider authored against only @multiverse/provider-contracts —
 * with no knowledge of core internals or any concrete provider package — can be
 * registered in a ProviderRegistry and consumed correctly through deriveOne.
 *
 * This is a core/registry seam proof. It does not exercise the CLI or prove
 * runtime invocation behavior for externally distributed providers.
 */
import { describe, it, expect } from "vitest";

import { deriveOne } from "@multiverse/core";
import type {
  ResourceProvider,
  EndpointProvider,
  ProviderRegistry
} from "@multiverse/provider-contracts";

// ---------------------------------------------------------------------------
// User-authored providers
//
// These are written as an outside author would write them: importing only from
// @multiverse/provider-contracts, knowing nothing about core internals.
// ---------------------------------------------------------------------------

const userResourceProvider: ResourceProvider = {
  deriveResource({ resource, worktree }) {
    if (!worktree.id) {
      return {
        category: "unsafe_scope",
        reason: "Worktree identity is required to derive a scoped handle."
      };
    }
    return {
      resourceName: resource.name,
      provider: resource.provider,
      isolationStrategy: resource.isolationStrategy,
      worktreeId: worktree.id,
      handle: `${resource.name}_${worktree.id}`
    };
  }
};

const userEndpointProvider: EndpointProvider = {
  deriveEndpoint({ endpoint, worktree }) {
    if (!worktree.id) {
      return {
        category: "unsafe_scope",
        reason: "Worktree identity is required to derive an endpoint address."
      };
    }
    return {
      endpointName: endpoint.name,
      provider: endpoint.provider,
      role: endpoint.role,
      worktreeId: worktree.id,
      address: `http://localhost:9000`
    };
  }
};

// ---------------------------------------------------------------------------
// Registry and repository configuration used throughout the suite.
// ---------------------------------------------------------------------------

const providers: ProviderRegistry = {
  resources: { "my-resource-provider": userResourceProvider },
  endpoints: { "my-endpoint-provider": userEndpointProvider }
};

const repository = {
  resources: [
    {
      name: "cache",
      provider: "my-resource-provider",
      isolationStrategy: "name-scoped" as const,
      scopedReset: false,
      scopedCleanup: false
    }
  ],
  endpoints: [
    {
      name: "app",
      role: "application-http",
      provider: "my-endpoint-provider"
    }
  ]
};

// ---------------------------------------------------------------------------
// Acceptance tests
// ---------------------------------------------------------------------------

describe("dev-slice-32: non-first-party provider authoring proof", () => {
  it("derives successfully when a valid worktree id is supplied", () => {
    const result = deriveOne({
      repository,
      worktree: { id: "wt-authored-a" },
      providers
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.resourcePlans).toHaveLength(1);
    expect(result.endpointMappings).toHaveLength(1);
    expect(result.resourcePlans[0]).toMatchObject({
      resourceName: "cache",
      provider: "my-resource-provider",
      worktreeId: "wt-authored-a"
    });
    expect(typeof result.resourcePlans[0].handle).toBe("string");
    expect(result.resourcePlans[0].handle.length).toBeGreaterThan(0);
  });

  it("produces the same handle for the same worktree id (deterministic)", () => {
    const first = deriveOne({ repository, worktree: { id: "wt-authored-b" }, providers });
    const second = deriveOne({ repository, worktree: { id: "wt-authored-b" }, providers });

    expect(first).toEqual(second);
  });

  it("produces different handles for different worktree ids", () => {
    const resultA = deriveOne({ repository, worktree: { id: "wt-authored-c" }, providers });
    const resultB = deriveOne({ repository, worktree: { id: "wt-authored-d" }, providers });

    expect(resultA.ok).toBe(true);
    expect(resultB.ok).toBe(true);
    if (!resultA.ok || !resultB.ok) return;

    expect(resultA.resourcePlans[0].handle).not.toBe(resultB.resourcePlans[0].handle);
  });

  it("refuses with unsafe_scope when worktree id is absent", () => {
    const result = deriveOne({
      repository,
      worktree: {},
      providers
    });

    expect(result).toMatchObject({
      ok: false,
      refusal: { category: "unsafe_scope" }
    });
  });

  it("refuses with invalid_configuration when the provider name is not registered", () => {
    const result = deriveOne({
      repository: {
        ...repository,
        resources: [
          {
            name: "cache",
            provider: "unregistered-provider",
            isolationStrategy: "name-scoped" as const,
            scopedReset: false,
            scopedCleanup: false
          }
        ]
      },
      worktree: { id: "wt-authored-e" },
      providers
    });

    expect(result).toMatchObject({
      ok: false,
      refusal: { category: "invalid_configuration" }
    });
  });
});
