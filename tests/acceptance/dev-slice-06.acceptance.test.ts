import { describe, expect, it } from "vitest";

import { resolveSlice01, resolveSlice02 } from "../../packages/core/index";
import {
  createProvidersWithEndpointDeriveRefusal,
  createProvidersWithResourceDeriveRefusal,
  createProvidersWithResourceValidateRefusal,
  createValidRepositoryConfiguration,
  createWorktreeInstance
} from "../../packages/providers-testkit/index";

describe("Development Slice 06 acceptance", () => {
  it("returns provider-originated unsafe scope during derive unchanged", () => {
    const outcome = resolveSlice01({
      repository: createValidRepositoryConfiguration(),
      worktree: createWorktreeInstance({
        id: "wt-provider-unsafe-derive"
      }),
      providers: createProvidersWithResourceDeriveRefusal({
        category: "unsafe_scope",
        reason: "Provider could not verify owning scope for derived resource."
      })
    });

    expect(outcome).toEqual({
      ok: false,
      refusal: {
        category: "unsafe_scope",
        reason: "Provider could not verify owning scope for derived resource."
      }
    });
  });

  it("returns provider-originated provider failure during derive unchanged", () => {
    const outcome = resolveSlice01({
      repository: createValidRepositoryConfiguration(),
      worktree: createWorktreeInstance({
        id: "wt-provider-failure-derive"
      }),
      providers: createProvidersWithEndpointDeriveRefusal({
        category: "provider_failure",
        reason: "Endpoint provider failed after safe scope was established."
      })
    });

    expect(outcome).toEqual({
      ok: false,
      refusal: {
        category: "provider_failure",
        reason: "Endpoint provider failed after safe scope was established."
      }
    });
  });

  it("returns provider-originated unsafe scope during validate unchanged", () => {
    const outcome = resolveSlice02({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider",
            isolationStrategy: "name-scoped",
            scopedValidate: true,
            scopedReset: false,
            scopedCleanup: false
          }
        ]
      }),
      worktree: createWorktreeInstance({
        id: "wt-provider-unsafe-validate"
      }),
      providers: createProvidersWithResourceValidateRefusal({
        category: "unsafe_scope",
        reason: "Provider could not verify owning scope for validation."
      })
    });

    expect(outcome).toEqual({
      ok: false,
      refusal: {
        category: "unsafe_scope",
        reason: "Provider could not verify owning scope for validation."
      }
    });
  });

  it("returns provider-originated provider failure during validate unchanged", () => {
    const outcome = resolveSlice02({
      repository: createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider",
            isolationStrategy: "name-scoped",
            scopedValidate: true,
            scopedReset: false,
            scopedCleanup: false
          }
        ]
      }),
      worktree: createWorktreeInstance({
        id: "wt-provider-failure-validate"
      }),
      providers: createProvidersWithResourceValidateRefusal({
        category: "provider_failure",
        reason: "Provider validation failed after safe scope was established."
      })
    });

    expect(outcome).toEqual({
      ok: false,
      refusal: {
        category: "provider_failure",
        reason: "Provider validation failed after safe scope was established."
      }
    });
  });
});
