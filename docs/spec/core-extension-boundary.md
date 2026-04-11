# Core/Extension Boundary for 1.0

## Purpose

This document states the official 1.0 core/extension boundary for Multiverse.

It synthesizes the boundary definitions that are currently distributed across ADR-0005,
ADR-0009, `provider-model.md`, and the provider authoring guide into one readable
reference. A user or potential contributor should be able to read this document and
answer:

- What does Multiverse core own?
- What is the stable extension seam for writing a custom provider?
- What do first-party providers guarantee, and where does that guarantee end?
- What is explicitly deferred for post-1.0 extensibility?

---

## The four responsibility layers

ADR-0009 defines four explicit responsibility layers. Every implementation decision in
Multiverse is evaluated against these boundaries:

| Layer | Responsibility |
|---|---|
| **Core** | Business rules, orchestration, validation, safety/refusal |
| **Provider** | Technology-specific isolation behavior through explicit contracts |
| **Repository configuration** | Explicit declaration of what must be isolated and how |
| **Application/runtime** | Consuming derived values; reading injected environment variables |

These layers are not implementation convenience — they are the enforcement structure for
keeping the tool predictable, testable, and safe.

---

## Core responsibilities for 1.0

Core (`packages/core/`) owns the following for 1.0:

**Configuration validation**
Core reads and validates `multiverse.json`. It checks that required fields are present,
that declared provider names resolve in the registry, and that provider-specific
configuration is structurally sound. Declaration correctness is a core responsibility,
not a provider responsibility.

**Worktree identity resolution**
Core resolves the active worktree identity — either from an explicit `--worktree-id`
flag or by discovering it from git state (ADR-0021). Identity resolution is a core
responsibility because the resulting identity governs scope boundaries for all operations.

**Safety and refusal enforcement**
Core enforces the refusal-first contract (ADR-0008). If scope is ambiguous, if a
declared provider is not registered, or if a requested capability is not supported,
core refuses with a structured refusal object rather than guessing or proceeding
silently. Core-level refusal is not configurable.

**Provider coordination**
Core dispatches derive, validate, reset, and cleanup operations to the appropriate
registered provider through the contract defined in `@multiverse/provider-contracts`.
Core does not implement technology-specific behavior; it coordinates providers through
the shared contract.

### What core does NOT do

- Core does not implement technology-specific isolation behavior.
- Core does not infer provider selection from project structure or conventions.
- Core does not access application code or runtime-injected configuration.
- Core does not manage application startup, shutdown, or process lifecycle beyond the
  `run` child-process wrapper.

---

## The extension seam — `@multiverse/provider-contracts`

`@multiverse/provider-contracts` is the stable extension seam for 1.0.

This package defines the complete contract between core and provider implementations:

- `ResourceProvider` — the interface a resource provider must implement
- `EndpointProvider` — the interface an endpoint provider must implement
- `ProviderRegistry` — the registry shape core reads at runtime
- `DerivedResourcePlan` — the shape a successful resource derivation must return
- `DerivedEndpointMapping` — the shape a successful endpoint derivation must return
- `Refusal` — the shape a provider must return when it cannot safely proceed
- Capability types for `validate`, `reset`, and `cleanup`

**A provider authored against this package alone integrates correctly through core.**
This has been verified end-to-end: a custom provider that imports only from
`@multiverse/provider-contracts`, is registered in a `ProviderRegistry`, and is
referenced from `providers.ts` will derive correctly through `pnpm cli derive --providers`.
Core does not distinguish between first-party and custom providers at runtime — it
coordinates both through the same contract.

This seam is **stable for 1.0**. No changes to the contract package are planned for 1.0.
Future changes to the contract would be driven by new explicit ADRs.

### What `@multiverse/provider-contracts` does not provide

- It does not provide provider implementations. Providers that use it must implement
  their own technology-specific isolation behavior.
- It does not provide a mechanism for provider auto-discovery or auto-registration.
  Every provider must be explicitly registered in `providers.ts`.
- It does not address packaging or distribution. The package is a workspace package
  in the Multiverse repository and is not published to npm.

---

## First-party providers

The six providers shipped with Multiverse are the 1.0 first-party provider support
guarantee:

| Package | Domain | Support tier |
|---|---|---|
| `@multiverse/provider-name-scoped` | Resource | First-class for the 1.0 common case |
| `@multiverse/provider-path-scoped` | Resource | First-class for the 1.0 common case |
| `@multiverse/provider-local-port` | Endpoint | First-class for the 1.0 common case |
| `@multiverse/provider-process-scoped` | Resource | Supported for specific use cases |
| `@multiverse/provider-process-port-scoped` | Resource | Supported for specific use cases |
| `@multiverse/provider-fixed-host-port` | Endpoint | Supported for specific use cases |

Each provider is classified and described in `docs/spec/provider-support-classification.md`,
including its capabilities, governing ADR, and constraints.

### First-party provider guarantees

- Derive is implemented and tested for all six.
- Lifecycle capabilities (validate, reset, cleanup) are declared explicitly and match
  the stated capability matrix in `provider-support-classification.md`.
- Each provider satisfies the universal derive contract asserted by
  `tests/contracts/resource-provider.derive.contract.test.ts` (resources) and
  `tests/contracts/endpoint-provider.derive.contract.test.ts` (endpoints).
- No first-party provider implements business rules. Business rules remain in core.

### First-party provider limitations

First-party provider packages are workspace packages. They are not published to npm.
Any `providers.ts` that imports first-party providers must resolve those imports from
the Multiverse workspace `node_modules`. Outside-workspace provider packaging and
distribution are explicitly deferred.

---

## Custom/extension providers

A custom provider is any provider that is not shipped with Multiverse and is authored
by a repository owner or contributor against `@multiverse/provider-contracts`.

### What a custom provider can do

- Implement any isolation strategy the contract supports: resource derivation (logical
  name, filesystem path, process instance, or any other technology-specific approach),
  endpoint derivation, and optional lifecycle capabilities (validate, reset, cleanup).
- Be registered in `providers.ts` under any name, matching the `provider` field in
  `multiverse.json`.
- Work through the full CLI path (`pnpm cli derive --providers`, `pnpm cli run`, and all
  other primary commands) in the same way as first-party providers. Core does not
  distinguish between them.
- Be verified for derive contract compliance by adding it to `providerCases` in
  `tests/contracts/resource-provider.derive.contract.test.ts`.

### What a custom provider must not do

These boundaries keep business rules in core and technology behavior in providers:

- **Do not validate declaration correctness.** By the time a provider receives input,
  declarations have already been validated by core. Checking whether required fields are
  present is core's responsibility.
- **Do not read repository configuration directly.** A provider receives only the narrow
  input it needs from core. It must not open `multiverse.json` independently.
- **Do not implement business rules.** Refusal behavior, scope safety, and worktree
  boundary enforcement belong to core. Providers enforce only technology-specific safety
  (e.g., refusing when a required path is inaccessible).
- **Do not perform destructive actions during `deriveResource` or `deriveEndpoint`.** Derive
  is read-only. Side effects belong in `resetResource` and `cleanupResource`.
- **Do not operate outside the declared worktree scope.** Every derived value must be
  scoped to the provided `worktree.id`.

The `provider-authoring-guide.md` has the complete list and examples.

### Support guarantee for custom providers

Multiverse guarantees the contract seam (`@multiverse/provider-contracts`) is stable for
1.0. A custom provider that correctly implements the contract will integrate with core
correctly.

Multiverse does **not** guarantee the behavior of any specific custom provider — that is
the extension author's responsibility. A custom provider is outside the first-party
support tier regardless of how well it is implemented.

---

## What is deferred for 1.0

The following are explicitly outside the 1.0 extension support statement:

**Provider packaging and distribution**
First-party and custom provider packages are workspace-local. Publishing provider
packages as standalone npm packages consumable outside the Multiverse workspace is
deferred. No accepted ADR governs provider distribution.

**Community extension workflow**
Multiverse does not provide tooling for discovering, sharing, or installing community
provider packages. There is no extension registry, marketplace, or distribution
mechanism.

**Additional first-party providers beyond the current six**
No new first-party providers are planned for 1.0. New provider shapes require a new ADR
before implementation.

**Provider auto-discovery or inference**
Provider selection is always explicit in repository configuration (ADR-0007). Core never
infers which provider to use from the technology in use, the directory structure, or
any convention.

**Plugin or ecosystem framing**
Multiverse's extensibility is through the explicit `@multiverse/provider-contracts`
seam. There is no plugin system, no provider marketplace, and no generalized ecosystem
abstraction planned for 1.0.

---

## Relationship to existing docs

| Document | Relationship |
|---|---|
| `docs/adr/0005-providers-implement-isolation-contracts.md` | Establishes that providers implement isolation contracts; core does not hardcode technologies |
| `docs/adr/0007-repository-configuration-is-explicit-in-1-0.md` | Governs explicit provider selection and the absence of provider inference |
| `docs/adr/0008-unsafe-operations-are-refused-in-1-0.md` | Governs core-level and provider-level refusal behavior |
| `docs/adr/0009-core-provider-repository-and-application-boundaries-are-explicit.md` | Defines the four responsibility layers this document synthesizes |
| `docs/spec/provider-model.md` | Defines provider capabilities, domains, and safety rules |
| `docs/spec/provider-support-classification.md` | Classifies the six first-party providers by support tier |
| `docs/guides/provider-authoring-guide.md` | Practical guide for implementing a custom provider against the contract seam |
