# Provider Authoring Guide

## What this guide covers

This guide explains how to write a provider for Multiverse.

A provider is a concrete implementation of the isolation contract for one
resource or endpoint type. Providers live at the technology-integration level:
they carry out technology-specific derivation behavior while the core tool
handles business rules, validation, and coordination.

This guide covers the **core/registry seam**: what the contract requires, how to
implement it, and how to register a provider so that `deriveOne` (and the rest of
the core API) can consume it. It does not cover packaging a provider for
distribution outside a repository, which is not addressed in the current scope.

---

## Providers and the core boundary

Two boundary rules govern everything a provider does:

1. **Core owns business rules.** A provider must not validate declaration
   correctness, enforce worktree safety rules, or make routing decisions. Those
   responsibilities belong to the core tool.

2. **Providers own technology behavior.** A provider is responsible for
   technology-specific derivation logic, scoped handle or address construction,
   and any optional lifecycle behavior it explicitly declares.

The contract between core and providers is defined entirely in
`@multiverse/provider-contracts`. A provider implementation needs only that
package.

---

## Provider domains

There are two provider domains:

- **Resource providers** carry out isolation behavior for declared resources —
  mutable local dependencies or integration-owned state.
- **Endpoint providers** carry out isolation behavior for declared endpoints —
  local communication addresses.

Both share the same shape: a required `deriveX` method plus optional lifecycle
methods declared through a `capabilities` object.

---

## Resource provider

### Minimal implementation

```typescript
import type {
  ResourceProvider,
  DerivedResourcePlan,
  Refusal
} from "@multiverse/provider-contracts";

export function createMyResourceProvider(): ResourceProvider {
  return {
    deriveResource({ resource, worktree }) {
      if (!worktree.id) {
        return {
          category: "unsafe_scope",
          reason: "Worktree identity is required."
        } satisfies Refusal;
      }

      return {
        resourceName: resource.name,
        provider: resource.provider,
        isolationStrategy: resource.isolationStrategy,
        worktreeId: worktree.id,
        handle: `${resource.name}_${worktree.id}`
      } satisfies DerivedResourcePlan;
    }
  };
}
```

### Required fields in the derived plan

| Field               | Type                | Description                                 |
|---------------------|---------------------|---------------------------------------------|
| `resourceName`      | `string`            | Echo the declared resource name             |
| `provider`          | `string`            | Echo the declared provider name             |
| `isolationStrategy` | `IsolationStrategy` | Echo the declared isolation strategy        |
| `worktreeId`        | `string`            | The resolved worktree identity              |
| `handle`            | `string`            | The provider-derived scoped value           |

The `handle` is the technology-specific output. For a name-scoped resource it
might be a namespaced database name. For a path-scoped resource it would be a
filesystem path. The core tool treats it as an opaque string.

### Derive must be deterministic

For the same `resource`, `worktree.id`, and any provider-owned configuration,
`deriveResource` must return the same `handle` every time it is called. The core
tool relies on this for repeatability.

---

## Endpoint provider

### Minimal implementation

```typescript
import type {
  EndpointProvider,
  DerivedEndpointMapping,
  Refusal
} from "@multiverse/provider-contracts";

export function createMyEndpointProvider(): EndpointProvider {
  return {
    deriveEndpoint({ endpoint, worktree }) {
      if (!worktree.id) {
        return {
          category: "unsafe_scope",
          reason: "Worktree identity is required."
        } satisfies Refusal;
      }

      return {
        endpointName: endpoint.name,
        provider: endpoint.provider,
        role: endpoint.role,
        worktreeId: worktree.id,
        address: `http://localhost:9000`
      } satisfies DerivedEndpointMapping;
    }
  };
}
```

### Required fields in the derived mapping

| Field          | Type     | Description                                    |
|----------------|----------|------------------------------------------------|
| `endpointName` | `string` | Echo the declared endpoint name                |
| `provider`     | `string` | Echo the declared provider name                |
| `role`         | `string` | Echo the declared endpoint role                |
| `worktreeId`   | `string` | The resolved worktree identity                 |
| `address`      | `string` | The provider-derived URL-shaped address string |

The `address` should be a URL string. The core tool uses it as-is for
`MULTIVERSE_ENDPOINT_*` injection and for `appEnv` typed extraction (`url`,
`port`). An address that is not a valid URL will produce meaningless `port`
extraction output.

---

## Required and optional capabilities

### Required: `deriveResource` / `deriveEndpoint`

Every provider must implement its `deriveX` method. There is no optional flag for
this — a provider that cannot derive is not a provider.

### Optional: `validate`, `reset`, `cleanup`

A resource provider may optionally support lifecycle capabilities. These must be
declared explicitly through a `capabilities` object, and the corresponding method
must be implemented.

```typescript
import type { ResourceProvider } from "@multiverse/provider-contracts";

export function createMyStatefulProvider(): ResourceProvider {
  return {
    capabilities: {
      reset: true,
      cleanup: true
    },

    deriveResource({ resource, worktree }) {
      // ... derive logic
    },

    async resetResource({ resource, derived, worktree }) {
      if (!worktree.id) {
        return { category: "unsafe_scope", reason: "Worktree identity is required." };
      }
      // ... reset logic
      return {
        resourceName: resource.name,
        provider: resource.provider,
        worktreeId: derived.worktreeId,
        capability: "reset"
      };
    },

    async cleanupResource({ resource, derived, worktree }) {
      if (!worktree.id) {
        return { category: "unsafe_scope", reason: "Worktree identity is required." };
      }
      // ... cleanup logic
      return {
        resourceName: resource.name,
        provider: resource.provider,
        worktreeId: derived.worktreeId,
        capability: "cleanup"
      };
    }
  };
}
```

**Do not declare a capability you cannot safely perform.** Core will refuse if a
declared resource configuration requests a capability the registered provider does
not support.

Endpoint providers are derive-only in the current scope. Optional lifecycle
capabilities for endpoint providers are not supported.

---

## Refusal behavior

A provider must return a `Refusal` object — not throw an exception — when it
cannot safely proceed.

```typescript
// Correct
return {
  category: "unsafe_scope",
  reason: "Worktree identity is required."
};

// Wrong — do not throw
throw new Error("Missing worktree id");
```

### Refusal categories

| Category               | When to use                                                  |
|------------------------|--------------------------------------------------------------|
| `unsafe_scope`         | Worktree identity is absent or cannot be safely determined   |
| `invalid_configuration`| Provider-owned configuration is missing or invalid          |
| `provider_failure`     | A technology-specific failure prevents safe derivation       |
| `unsupported_capability` | A requested capability cannot be performed               |

The most common case is `unsafe_scope`: return it whenever `worktree.id` is
absent or empty. Core relies on providers to enforce this boundary before
performing any scoped operation.

---

## What a provider must not do

These boundaries exist to keep business rules in core and technology behavior in
providers. Crossing them creates ambiguity and makes behavior harder to test and
reason about.

- **Do not validate declaration correctness.** Checking whether `resource.name`
  is non-empty, whether `provider` matches an expected string, or whether a
  declared field is present is core's responsibility. By the time your provider
  receives input, declarations have already been validated.

- **Do not read repository configuration directly.** A provider receives only the
  narrow input it needs from core. It must not open `multiverse.json` or any
  repository-level config file on its own.

- **Do not perform destructive actions during `deriveResource`.** Derive is
  read-only. Filesystem writes, process launches, and network calls must not
  happen during derivation. Save side effects for `reset` and `cleanup`, and only
  when those capabilities are declared and requested.

- **Do not operate outside the declared worktree scope.** If a provider derives a
  path, that path must be scoped to the provided `worktree.id`. Never use a fixed
  or global path that would collide across worktrees.

- **Do not infer or guess missing provider-owned configuration.** If your provider
  requires a `host` or `basePort`, refuse when they are absent rather than
  substituting a default. Explicit configuration is a 1.0 hard constraint.

- **Do not swallow errors silently.** If the provider encounters an unexpected
  failure, return a `Refusal` with category `provider_failure`. Do not return a
  success result with placeholder data.

---

## Registering your provider

Providers are supplied to the core tool through a `ProviderRegistry` object. In
the current repository workflow, this is typically the `providers.ts` file at the
repository root, which is loaded by the CLI at invocation time.

```typescript
// providers.ts
import type { ProviderRegistry } from "@multiverse/provider-contracts";
import { createMyResourceProvider } from "./my-resource-provider.js";
import { createLocalPortProvider } from "@multiverse/provider-local-port";

const registry: ProviderRegistry = {
  resources: {
    "my-resource-provider": createMyResourceProvider()
  },
  endpoints: {
    "local-port": createLocalPortProvider({ basePort: 4000 })
  }
};

export default registry;
```

The registry keys (`"my-resource-provider"`, `"local-port"`) must match the
`provider` field in each resource or endpoint declaration in `multiverse.json`.
Core will refuse with `invalid_configuration` if a declared provider name is not
present in the registry.

---

## Verifying compliance

To verify that your `deriveResource` implementation satisfies the universal
contract requirements, add your provider to the `providerCases` array in
`tests/contracts/resource-provider.derive.contract.test.ts` and run:

```bash
pnpm test:contracts
```

That file is the single parameterized source of truth for derive compliance —
the same suite all first-party resource providers must pass. It covers shape,
determinism, worktree isolation, and `unsafe_scope` refusal. Lifecycle
capability compliance (reset, cleanup, validate), if your provider declares
those capabilities, is not covered there; write focused tests for those
separately, following the existing per-provider contract files as reference.

---

## Scope note

The seam proven by this guide is: **implement the contract, register in the
registry, and the provider works through `deriveOne` and the rest of the core
API**.

This has been verified by an acceptance test (`tests/acceptance/dev-slice-32.acceptance.test.ts`)
that authors a resource and endpoint provider using only `@multiverse/provider-contracts`
types and confirms they derive correctly through `@multiverse/core`.

What is **not** covered here:
- Packaging a provider as a standalone npm package for distribution outside the
  repository. That packaging workflow is not addressed in the current scope.
- CLI invocation with an external provider. The `providers.ts` convention is the
  current registration seam; broader loading models are deferred.
- Provider discovery or auto-registration. Provider selection is always explicit
  in repository configuration.
