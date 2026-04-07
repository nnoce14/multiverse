/**
 * Resource provider derive compliance suite.
 *
 * This is the single parameterized source of truth for universal deriveResource
 * contract requirements. Every resource provider — first-party or not — must
 * pass these assertions to be considered derive-compliant.
 *
 * To verify your provider: add an entry to providerCases and run
 *   pnpm test:contracts
 *
 * Scope: derive compliance only.
 * Lifecycle capability compliance (reset, cleanup, validate) is covered by the
 * existing per-provider contract test files and is intentionally not
 * consolidated here.
 */
import { describe, it, expect } from "vitest";
import type {
  ResourceProvider,
  DerivedResourcePlan,
  IsolationStrategy,
  Refusal
} from "@multiverse/provider-contracts";
import { createNameScopedProvider } from "@multiverse/provider-name-scoped";
import { createPathScopedProvider } from "@multiverse/provider-path-scoped";
import { createProcessScopedProvider } from "@multiverse/provider-process-scoped";
import { createProcessPortScopedProvider } from "@multiverse/provider-process-port-scoped";

function isDerivedResourcePlan(value: DerivedResourcePlan | Refusal): value is DerivedResourcePlan {
  return "resourceName" in value && "handle" in value;
}

function isRefusal(value: DerivedResourcePlan | Refusal): value is Refusal {
  return "category" in value && "reason" in value;
}

// ---------------------------------------------------------------------------
// Non-first-party provider — load-bearing case.
//
// Defined inline using only @multiverse/provider-contracts types. No imports
// from any concrete provider package or core internals. This proves the
// compliance suite is usable by any provider author, not only first-party
// implementations.
// ---------------------------------------------------------------------------
const nonFirstPartyProvider: ResourceProvider = {
  deriveResource({ resource, worktree }) {
    if (!worktree.id) {
      return {
        category: "unsafe_scope",
        reason: "Worktree identity is required."
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

// ---------------------------------------------------------------------------
// Provider cases.
//
// Each entry specifies a provider and a valid input that deriveResource should
// accept. The worktree id "wt-compliance-a" is used as the baseline for shape
// and determinism assertions; "wt-compliance-b" is used for isolation
// assertions within the suite body.
// ---------------------------------------------------------------------------
interface ProviderCase {
  name: string;
  provider: ResourceProvider;
  validInput: {
    resource: {
      name: string;
      provider: string;
      isolationStrategy: IsolationStrategy;
      scopedValidate: boolean;
      scopedReset: boolean;
      scopedCleanup: boolean;
    };
    worktree: {
      id: string;
      label: string;
      branch: string;
    };
  };
}

const providerCases: ProviderCase[] = [
  {
    name: "name-scoped",
    provider: createNameScopedProvider(),
    validInput: {
      resource: {
        name: "primary-db",
        provider: "name-scoped",
        isolationStrategy: "name-scoped",
        scopedValidate: false,
        scopedReset: false,
        scopedCleanup: false
      },
      worktree: { id: "wt-compliance-a", label: "compliance-a", branch: "feature/compliance" }
    }
  },
  {
    name: "path-scoped",
    provider: createPathScopedProvider({ baseDir: "/tmp/multiverse-compliance" }),
    validInput: {
      resource: {
        name: "sqlite-db",
        provider: "path-scoped",
        isolationStrategy: "path-scoped",
        scopedValidate: false,
        scopedReset: false,
        scopedCleanup: false
      },
      worktree: { id: "wt-compliance-a", label: "compliance-a", branch: "feature/compliance" }
    }
  },
  {
    name: "process-scoped",
    provider: createProcessScopedProvider({
      baseDir: "/tmp/multiverse-compliance",
      command: ["node", "-e", "0"]
    }),
    validInput: {
      resource: {
        name: "cache",
        provider: "process-scoped",
        isolationStrategy: "process-scoped",
        scopedValidate: false,
        scopedReset: false,
        scopedCleanup: false
      },
      worktree: { id: "wt-compliance-a", label: "compliance-a", branch: "feature/compliance" }
    }
  },
  {
    name: "process-port-scoped",
    provider: createProcessPortScopedProvider({
      baseDir: "/tmp/multiverse-compliance",
      basePort: 7000,
      command: ["node", "-e", "0"]
    }),
    validInput: {
      resource: {
        name: "cache",
        provider: "process-port-scoped",
        isolationStrategy: "process-port-scoped",
        scopedValidate: false,
        scopedReset: false,
        scopedCleanup: false
      },
      worktree: { id: "wt-compliance-a", label: "compliance-a", branch: "feature/compliance" }
    }
  },
  {
    name: "non-first-party (contracts-only)",
    provider: nonFirstPartyProvider,
    validInput: {
      resource: {
        name: "my-resource",
        provider: "my-resource-provider",
        isolationStrategy: "name-scoped",
        scopedValidate: false,
        scopedReset: false,
        scopedCleanup: false
      },
      worktree: { id: "wt-compliance-a", label: "compliance-a", branch: "feature/compliance" }
    }
  }
];

// ---------------------------------------------------------------------------
// Universal derive compliance assertions.
// ---------------------------------------------------------------------------
describe.each(providerCases)("resource provider contract: derive ($name)", ({ provider, validInput }) => {
  it("returns a DerivedResourcePlan for valid input", () => {
    const result = provider.deriveResource(validInput);

    expect(isDerivedResourcePlan(result)).toBe(true);
  });

  it("result echoes resourceName, provider, isolationStrategy, and worktreeId", () => {
    const result = provider.deriveResource(validInput);

    expect(isDerivedResourcePlan(result)).toBe(true);
    if (!isDerivedResourcePlan(result)) return;

    expect(result.resourceName).toBe(validInput.resource.name);
    expect(result.provider).toBe(validInput.resource.provider);
    expect(result.isolationStrategy).toBe(validInput.resource.isolationStrategy);
    expect(result.worktreeId).toBe(validInput.worktree.id);
  });

  it("handle is a non-empty string", () => {
    const result = provider.deriveResource(validInput);

    expect(isDerivedResourcePlan(result)).toBe(true);
    if (!isDerivedResourcePlan(result)) return;

    expect(typeof result.handle).toBe("string");
    expect(result.handle.length).toBeGreaterThan(0);
  });

  it("derive is deterministic for the same input", () => {
    const first = provider.deriveResource(validInput);
    const second = provider.deriveResource(validInput);

    expect(isDerivedResourcePlan(first)).toBe(true);
    expect(isDerivedResourcePlan(second)).toBe(true);
    if (!isDerivedResourcePlan(first) || !isDerivedResourcePlan(second)) return;

    expect(first.handle).toBe(second.handle);
  });

  it("produces different handles for different worktree ids", () => {
    const resultA = provider.deriveResource(validInput);
    const resultB = provider.deriveResource({
      ...validInput,
      worktree: { ...validInput.worktree, id: "wt-compliance-b" }
    });

    expect(isDerivedResourcePlan(resultA)).toBe(true);
    expect(isDerivedResourcePlan(resultB)).toBe(true);
    if (!isDerivedResourcePlan(resultA) || !isDerivedResourcePlan(resultB)) return;

    expect(resultA.handle).not.toBe(resultB.handle);
  });

  it("returns unsafe_scope when worktree id is absent", () => {
    const result = provider.deriveResource({
      ...validInput,
      worktree: {} as typeof validInput.worktree
    });

    expect(isRefusal(result)).toBe(true);
    if (!isRefusal(result)) return;

    expect(result.category).toBe("unsafe_scope");
  });
});
