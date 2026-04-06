# Repository Map

## Purpose

This document describes the intended repository layout for Multiverse during the current implementation phase.

It exists to make code ownership, directory purpose, and dependency direction explicit for both human contributors and coding agents.

This map is meant to reflect the repository as it evolves through implementation. It is not a commitment to a large final package catalog.

## Current Repository State

The repository contains behavior-first design artifacts and a working implementation:

* specifications under `docs/spec/`
* scenarios under `docs/scenarios/`
* ADRs under `docs/adr/`
* development guidance under `docs/development/`
* core business logic in `packages/core/`
* provider contracts in `packages/provider-contracts/`
* six concrete provider packages: `provider-name-scoped`,
  `provider-path-scoped`, `provider-local-port`, `provider-fixed-host-port`,
  `provider-process-scoped`, and `provider-process-port-scoped`
* a test provider registry in `packages/providers-testkit/`
* a thin CLI in `apps/cli/`
* a sample Express application in `apps/sample-express/`
* a composed proving application in `apps/sample-compose/`
* acceptance, contract, unit, and integration tests under `tests/`

Implementation has progressed through 31 development slices. The core lifecycle
(derive, validate, reset, cleanup) is implemented across the current declared
resource and endpoint model, with multi-resource and multi-endpoint support in
place. The `0.3.x` work proved the main composed-application consumer workflow,
and Slice 31 added the first narrow `0.4.x` endpoint-provider extensibility
proof.

## Implementation Model

Multiverse is implemented as a **pnpm workspace monorepo**.

The workspace structure should remain small in the early slices and expand only when new package boundaries are justified by actual responsibility boundaries.

## Intended Top-Level Structure

```text
apps/
packages/
tests/
docs/
```

## Directory Roles

### `docs/`

Repository documentation and design source of truth.

Important areas:

* `docs/spec/` — business rules, concepts, and guarantees
* `docs/scenarios/` — behavior scenarios that drive acceptance testing
* `docs/adr/` — accepted architectural decisions
* `docs/development/` — implementation-phase guidance, slice planning, and repo structure docs
* `docs/guides/` — practical usage guides and reproducible demo flows

### `apps/`

Application-facing entrypoints and proving seams.

Current application areas:

* `apps/cli/` — thin CLI entrypoint for invoking Multiverse behavior
* `apps/sample-express/` — sample application used for end-to-end integration proof
* `apps/sample-compose/` — composed proving application for the current consumer-workflow phase

Applications may parse input, invoke core behavior, and present results, but must not become the home of business rules.

### `packages/`

Reusable implementation packages with explicit responsibility boundaries.

Current packages:

* `packages/core/` — business logic, orchestration, validation, refusal enforcement
* `packages/provider-contracts/` — shared TypeScript interfaces between core and providers
* `packages/providers-testkit/` — fake providers and test fixtures
* `packages/provider-name-scoped/` — name-scoped resource isolation (derive, reset, cleanup confirmation only)
* `packages/provider-path-scoped/` — path-scoped resource isolation (derive, effectful reset, effectful cleanup for provider-managed filesystem state)
* `packages/provider-local-port/` — local-port endpoint isolation (derive)
* `packages/provider-fixed-host-port/` — fixed-host plus derived-port endpoint isolation (derive)
* `packages/provider-process-scoped/` — process-backed resource lifecycle as a declared isolation seam
* `packages/provider-process-port-scoped/` — process-backed resource seam with deterministic local address handles

Additional packages may be introduced when justified by real implementation boundaries.

### `tests/`

Cross-cutting test organization.

Current structure:

* `tests/acceptance/`
* `tests/contracts/`
* `tests/unit/`
* `tests/integration/`

These directories reflect test roles, not implementation ownership.

### `.agents/`

Repository-local coding-agent assets.

Intended structure:

* `.agents/skills/`

This area may contain custom skills used by coding agents working in the repository.

## Initial Workspace Packages

### `apps/cli`

Purpose:

* provide a thin user-facing entrypoint
* parse invocation input
* call core behavior
* present success or refusal outcomes

Must not:

* own business rules
* implement provider-specific behavior
* become a substitute for core coordination logic

### `packages/core`

Purpose:

* evaluate repository configuration
* enforce business rules
* resolve worktree-instance context
* preserve worktree-instance boundaries
* coordinate provider interactions through explicit contracts
* enforce safety and refusal behavior

### `packages/provider-contracts`

Purpose:

* define the explicit contract between core and provider implementations
* define provider-facing shapes needed by the current slices
* remain small and stable

Must not:

* absorb core business rules
* introduce provider-specific policy into the shared contract

### `packages/providers-testkit`

Purpose:

* provide fake or test-oriented provider implementations
* support provider contract tests
* support acceptance tests when provider behavior must be simulated

Must not:

* become the default home for production provider logic

## Future Package Candidates

These should be added only when justified by real implementation needs:

* additional provider packages under `packages/provider-*` as new isolation strategies are required
* a configuration-model package if configuration concerns become large enough to justify isolation
* shared test utilities if test support grows beyond the provider testkit role

Future packages are possible, but not presumed.

## Dependency Direction

The intended dependency direction is:

* applications may depend on core
* core may depend on provider contracts
* concrete providers may depend on provider contracts
* tests may depend on test utilities and testkit support
* core must not depend directly on concrete providers
* providers must not own business rules

## Test Areas

### `tests/acceptance/`

Purpose:

* verify externally visible business behavior
* prove slice behavior derived from scenario documents
* validate success, isolation, determinism, and refusal outcomes

Acceptance tests should not depend on provider internals.

### `tests/contracts/`

Purpose:

* verify that provider implementations satisfy the contract expected by core
* verify capability reporting, scoped derivation behavior, and refusal behavior relevant to the provider contract

### `tests/integration/`

Purpose:

* verify end-to-end behavior across real package seams
* prove consumer workflows and runtime isolation behavior
* exercise realistic provider interactions and external application scenarios

Integration tests should validate broader system behavior than a single contract or unit seam while remaining narrower and faster than production-scale proving.

### `tests/unit/`

Purpose:

* verify local implementation logic
* support maintainability of pure derivation, validation, or mapping behavior

Unit tests must not replace acceptance coverage for business behavior.

## Documentation Areas vs Implementation Areas

### Documentation-first areas

These are source-of-truth areas and not implementation targets:

* `docs/spec/`
* `docs/scenarios/`
* `docs/adr/`

### Implementation-phase guidance

These documents guide implementation but do not define business truth above the specs and ADRs:

* `docs/development/`

### Implementation targets

Primary code targets in the current implementation phase include:

* `apps/cli/`
* `apps/sample-express/`
* `apps/sample-compose/`
* `packages/core/`
* `packages/provider-contracts/`
* `packages/providers-testkit/`
* `packages/provider-name-scoped/`
* `packages/provider-path-scoped/`
* `packages/provider-local-port/`
* `packages/provider-fixed-host-port/`
* `packages/provider-process-scoped/`
* `packages/provider-process-port-scoped/`
* `tests/`

## Development Slice Alignment

Current implementation work should follow the active development slice and task documents under `docs/development/`.

Slices 01–31 have been implemented. Subsequent work is tracked through current
development documents and the repository’s open issues.

Contributors and agents should use those sources to determine what behavior is currently in scope.

## Practical Rules

* keep the initial package count small
* only add a package when a real boundary requires it
* do not bury business rules in application entrypoints
* do not couple core directly to concrete providers
* do not let test convenience distort package boundaries
