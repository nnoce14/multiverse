# Repository Map

## Purpose

This document describes the intended repository layout for Multiverse as implementation begins.

It exists to make code ownership, directory purpose, and dependency direction explicit for both human contributors and coding agents.

This map is meant to support the current implementation phase. It is not a commitment to a large final package catalog.

## Current Repository State

The repository currently contains behavior-first design artifacts, including:

- specifications under `docs/spec/`
- scenarios under `docs/scenarios/`
- ADRs under `docs/adr/`
- development guidance under `docs/development/`

Implementation is beginning through narrow vertical slices.

## Implementation Model

Multiverse is implemented as a **pnpm workspace monorepo**.

The workspace structure should remain small in the early slices and expand only when new package boundaries are justified by actual responsibility boundaries.

## Intended Top-Level Structure

```text
apps/
packages/
tests/
docs/
.agents/
```

## Directory Roles

### `docs/`

Repository documentation and design source of truth.

Important areas:

- `docs/spec/` — business rules, concepts, and guarantees
- `docs/scenarios/` — behavior scenarios that drive acceptance testing
- `docs/adr/` — accepted architectural decisions
- `docs/development/` — implementation-phase guidance, slice planning, and repo structure docs

### `apps/`

Application-facing entrypoints.

Initial intended application area:

- `apps/cli/` — thin CLI entrypoint for invoking Multiverse behavior

Applications may parse input, invoke core behavior, and present results, but must not become the home of business rules.

### `packages/`

Reusable implementation packages with explicit responsibility boundaries.

Initial intended packages:

- `packages/core/`
- `packages/provider-contracts/`
- `packages/providers-testkit/`

Additional packages may be introduced later when justified by real implementation boundaries.

### `tests/`

Cross-cutting test organization.

Intended structure:

- `tests/acceptance/`
- `tests/contracts/`
- `tests/unit/`

These directories reflect test roles, not implementation ownership.

### `.agents/`

Repository-local coding-agent assets.

Intended structure:

- `.agents/skills/`

This area may contain custom skills used by coding agents working in the repository.

## Initial Workspace Packages

### `apps/cli`

Purpose:

- provide a thin user-facing entrypoint
- parse invocation input
- call core behavior
- present success or refusal outcomes

Must not:

- own business rules
- implement provider-specific behavior
- become a substitute for core coordination logic

### `packages/core`

Purpose:

- evaluate repository configuration
- enforce business rules
- resolve worktree-instance context
- preserve worktree-instance boundaries
- coordinate provider interactions through explicit contracts
- enforce safety and refusal behavior

This is expected to be the primary package for the first development slice.

### `packages/provider-contracts`

Purpose:

- define the explicit contract between core and provider implementations
- define provider-facing shapes needed by the current slices
- remain small and stable

Must not:

- absorb core business rules
- introduce provider-specific policy into the shared contract

### `packages/providers-testkit`

Purpose:

- provide fake or test-oriented provider implementations
- support provider contract tests
- support acceptance tests when provider behavior must be simulated

Must not:

- become the default home for production provider logic

## Future Package Candidates

These should be added only when justified by real slices:

- concrete provider packages under `packages/provider-*`
- a configuration-model package if configuration concerns become large enough to justify isolation
- shared test utilities if test support grows beyond the provider testkit role

Future packages are possible, but not presumed.

## Dependency Direction

The intended dependency direction is:

- applications may depend on core
- core may depend on provider contracts
- concrete providers may depend on provider contracts
- tests may depend on test utilities and testkit support
- core must not depend directly on concrete providers
- providers must not own business rules

## Test Areas

### `tests/acceptance/`

Purpose:

- verify externally visible business behavior
- prove slice behavior derived from scenario documents
- validate success, isolation, determinism, and refusal outcomes

Acceptance tests should not depend on provider internals.

### `tests/contracts/`

Purpose:

- verify that provider implementations satisfy the contract expected by core
- verify capability reporting, scoped derivation behavior, and refusal behavior relevant to the provider contract

### `tests/unit/`

Purpose:

- verify local implementation logic
- support maintainability of pure derivation, validation, or mapping behavior

Unit tests must not replace acceptance coverage for business behavior.

## Documentation Areas vs Implementation Areas

### Documentation-first areas

These are source-of-truth areas and not implementation targets:

- `docs/spec/`
- `docs/scenarios/`
- `docs/adr/`

### Implementation-phase guidance

These documents guide implementation but do not define business truth above the specs and ADRs:

- `docs/development/`

### Implementation targets

Primary code targets as implementation begins:

- `apps/cli/`
- `packages/core/`
- `packages/provider-contracts/`
- `packages/providers-testkit/`
- `tests/`

## Development Slice Alignment

Current implementation work should follow the active development slice document under `docs/development/`.

At the time of writing, the first active slice is:

- `docs/development/dev-slice-01.md`

Contributors and coding agents should use that slice document to determine what behavior is currently in scope.

## Practical Rules

- keep the initial package count small
- only add a package when a real boundary requires it
- do not bury business rules in application entrypoints
- do not couple core directly to concrete providers
- do not let test convenience distort package boundaries
