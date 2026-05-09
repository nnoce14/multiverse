import { describe, expect, it, vi } from "vitest";

import { deriveOne } from "@multiverse/core";
import {
  createExplicitTestProviders,
  createProvidersWithEndpointDeriveRefusal,
  createProvidersWithResourceDeriveRefusal,
  createValidRepositoryConfiguration,
  createWorktreeInstance
} from "@multiverse/providers-testkit";

describe("derive: core isolation guarantees", () => {
  it("resolves successfully for a valid declared worktree instance", () => {
    const outcome = deriveOne({
      repository: createValidRepositoryConfiguration(),
      worktree: createWorktreeInstance({ id: "wt-feature-a", label: "feature-a", branch: "feature/shared" }),
      providers: createExplicitTestProviders()
    });

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;

    expect(outcome.resourcePlans).toHaveLength(1);
    expect(outcome.endpointMappings).toHaveLength(1);
    expect(outcome.resourcePlans[0]).toMatchObject({
      resourceName: "primary-db",
      provider: "test-resource-provider",
      isolationStrategy: "name-scoped",
      worktreeId: "wt-feature-a"
    });
    expect(typeof outcome.resourcePlans[0]!.handle).toBe("string");
    expect(outcome.endpointMappings[0]).toMatchObject({
      endpointName: "app-base-url",
      provider: "test-endpoint-provider",
      role: "application-base-url",
      worktreeId: "wt-feature-a"
    });
    expect(typeof outcome.endpointMappings[0]!.address).toBe("string");
  });

  it("derives deterministically for the same worktree instance", () => {
    const repository = createValidRepositoryConfiguration();
    const worktree = createWorktreeInstance({ id: "wt-repeatable", label: "repeatable", branch: "feature/repeatable" });
    const providers = createExplicitTestProviders();

    const first = deriveOne({ repository, worktree, providers });
    const second = deriveOne({ repository, worktree, providers });

    expect(first).toEqual(second);
  });

  it("resolves successfully for the reserved main worktree identity", () => {
    const outcome = deriveOne({
      repository: createValidRepositoryConfiguration(),
      worktree: createWorktreeInstance({ id: "main", label: "main" }),
      providers: createExplicitTestProviders()
    });

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;

    expect(outcome.resourcePlans[0]).toMatchObject({ worktreeId: "main" });
    expect(outcome.endpointMappings[0]).toMatchObject({ worktreeId: "main" });
  });

  it("derives different isolated outputs for different worktree instances sharing a branch", () => {
    const repository = createValidRepositoryConfiguration();
    const providers = createExplicitTestProviders();

    const first = deriveOne({
      repository,
      worktree: createWorktreeInstance({ id: "wt-first", label: "first", branch: "feature/shared" }),
      providers
    });
    const second = deriveOne({
      repository,
      worktree: createWorktreeInstance({ id: "wt-second", label: "second", branch: "feature/shared" }),
      providers
    });

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (!first.ok || !second.ok) return;

    expect(first.resourcePlans[0]!.handle).not.toBe(second.resourcePlans[0]!.handle);
    expect(first.endpointMappings[0]!.address).not.toBe(second.endpointMappings[0]!.address);
  });
});

describe("derive: refusal behavior", () => {
  it("refuses when worktree ID is absent", () => {
    const outcome = deriveOne({
      repository: createValidRepositoryConfiguration(),
      worktree: { label: "ambiguous-scope", branch: "feature/shared" },
      providers: createExplicitTestProviders()
    });

    expect(outcome).toMatchObject({
      ok: false,
      refusal: { category: "unsafe_scope" }
    });
  });

  it("refuses whitespace-only worktree ID before invoking any provider", () => {
    const providers = createExplicitTestProviders();
    const deriveResource = vi.spyOn(
      providers.resources["test-resource-provider"]!,
      "deriveResource"
    );
    const deriveEndpoint = vi.spyOn(
      providers.endpoints["test-endpoint-provider"]!,
      "deriveEndpoint"
    );

    const outcome = deriveOne({
      repository: createValidRepositoryConfiguration(),
      worktree: createWorktreeInstance({ id: "   ", label: "invalid" }),
      providers
    });

    expect(outcome).toMatchObject({ ok: false, refusal: { category: "unsafe_scope" } });
    expect(deriveResource).not.toHaveBeenCalled();
    expect(deriveEndpoint).not.toHaveBeenCalled();
  });

  it("refuses when provider assignment is missing from a resource declaration", () => {
    const outcome = deriveOne({
      repository: createValidRepositoryConfiguration({
        resources: [{ name: "primary-db", isolationStrategy: "name-scoped", scopedReset: false, scopedCleanup: false }]
      }),
      worktree: createWorktreeInstance({ id: "wt-missing-provider" }),
      providers: createExplicitTestProviders()
    });

    expect(outcome).toMatchObject({ ok: false, refusal: { category: "invalid_configuration" } });
  });

  it("refuses when a required endpoint field is missing", () => {
    const outcome = deriveOne({
      repository: createValidRepositoryConfiguration({
        endpoints: [{ name: "app-base-url", provider: "test-endpoint-provider" }]
      }),
      worktree: createWorktreeInstance({ id: "wt-invalid-endpoint" }),
      providers: createExplicitTestProviders()
    });

    expect(outcome).toMatchObject({ ok: false, refusal: { category: "invalid_configuration" } });
  });

  it("surfaces a provider resource derive refusal", () => {
    const outcome = deriveOne({
      repository: createValidRepositoryConfiguration(),
      worktree: createWorktreeInstance({ id: "wt-provider-refusal" }),
      providers: createProvidersWithResourceDeriveRefusal({
        category: "provider_failure",
        reason: "backing system unavailable"
      })
    });

    expect(outcome).toMatchObject({ ok: false, refusal: { category: "provider_failure" } });
  });

  it("surfaces a provider endpoint derive refusal", () => {
    const outcome = deriveOne({
      repository: createValidRepositoryConfiguration(),
      worktree: createWorktreeInstance({ id: "wt-endpoint-refusal" }),
      providers: createProvidersWithEndpointDeriveRefusal({
        category: "provider_failure",
        reason: "endpoint derivation failed"
      })
    });

    expect(outcome).toMatchObject({ ok: false, refusal: { category: "provider_failure" } });
  });
});
