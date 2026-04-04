---
name: slice-implementation
description: Use this skill when implementing one narrow Multiverse development slice under behavior-first TDD, especially when acceptance tests already define the in-scope behavior and the goal is to make the minimum production change without expanding scope, inference, or architecture.
---

# Slice Implementation

Use this skill to implement one narrow Multiverse development slice under behavior-first TDD.

## Read first

Before doing any work, read only the documents needed for the current task, in this order:

1. relevant ADRs under `docs/adr/`
2. relevant specs under `docs/spec/`
3. relevant scenarios under `docs/scenarios/`
4. active slice and development docs under `docs/development/`

For the current initial phase, start with:

- `docs/development/dev-slice-01.md`
- `docs/development/implementation-strategy.md`
- `AGENTS.md`
- `CLAUDE.md`

Then read the acceptance tests that define the in-scope behavior.

## Use this skill when

Use this skill when the task is to:

- implement the active development slice
- satisfy existing or newly added acceptance tests
- make the minimum production change required for the slice
- preserve explicit boundaries between core, provider contracts, providers, and entrypoints

## Do not use this skill when

Do not use this skill when the task is primarily:

- scenario analysis or acceptance-test authoring
- architecture expansion beyond the active slice
- broad package reorganization
- inventing behavior not justified by repo documents
- adding convenience features outside the slice boundary

## Workflow

1. Read the active development slice document.
2. Read the acceptance tests that define the in-scope behavior.
3. Identify the smallest set of production files required.
4. Implement only what is needed to satisfy the current slice.
5. Preserve explicit boundaries between core, provider contracts, providers, and entrypoints.
6. Keep changes small and test-led.
7. Stop at the slice boundary.

## Implementation rules

- implement only the current slice
- prefer satisfying acceptance tests before adding abstractions
- do not broaden CLI or UX surface unless explicitly required
- do not introduce orchestration behavior unless explicitly required
- do not silently resolve ambiguity by guessing
- do not add speculative abstractions beyond the needs of the current slice

## Boundary rules

- core enforces business rules, coordination, and safety/refusal
- providers implement technology-specific behavior through explicit contracts
- repository configuration must remain explicit
- do not move business rules into provider code
- do not introduce hidden defaults or convenience inference
- do not couple core directly to concrete providers unless the approved repo structure explicitly requires it

## Workspace rules

Multiverse uses a pnpm workspace monorepo.

Target the intended implementation areas appropriately:

- `apps/` for thin entrypoints
- `packages/core/` for slice business behavior and coordination
- `packages/provider-contracts/` for minimal shared provider-facing contracts
- `packages/providers-testkit/` for fakes and test-oriented provider support
- `tests/` for acceptance, contract, and unit tests

Do not create new packages unless the slice cannot be implemented cleanly within the current structure.

## Testing rules

- acceptance tests verify externally visible business behavior
- provider contract tests verify provider compliance with core expectations
- unit tests verify local implementation details
- unit tests do not replace acceptance coverage

When adding tests, keep them aligned with the slice and avoid testing provider internals through acceptance coverage.

## Refusal discipline

Refusal is a first-class behavior.

If the slice requires refusal outcomes, implement them explicitly.

Do not convert unsafe ambiguity into permissive behavior.

## Multiverse constraints

These constraints remain mandatory:

- no provider inference
- no managed object inference
- repository configuration is declarative only
- refuse rather than guess when safe scope is ambiguous
- core and provider responsibilities must remain separate

## Output

Produce:

- the minimal production implementation required for the current slice
- only the tests needed to support and verify that slice
- no unrelated refactors
- no future-slice convenience features

## Stop conditions

Stop and surface the issue instead of guessing if:

- the slice boundary is unclear
- the acceptance behavior conflicts with higher-priority repo documents
- required behavior is underspecified
- the implementation would require broadening scope beyond the current slice
- the task would require speculative package or architecture expansion
