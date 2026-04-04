# Development Slice 02 Task 01

## Objective

Implement Development Slice 02 through behavior-first TDD by first deriving executable coverage from the existing repository documents and then implementing the minimum production code required to satisfy that coverage.

## Business Context

Multiverse is a behavior-first isolation tool for parallel development across git worktrees of the same repository on one machine.

This task must preserve explicit worktree-instance boundaries, declarative repository configuration, explicit provider capability evaluation, and refusal-first safety behavior.

## In Scope

- derive executable coverage for Development Slice 02 from the existing repo documents
- use the active slice and slice scenario map as the immediate planning anchors
- add the initial Slice 02 executable coverage in the appropriate test layers
- implement only the minimum production code required to satisfy that coverage
- extend the existing single-resource and single-endpoint path only as needed to evaluate one optional provider capability intent
- preserve the current intended workspace areas only:
  - `packages/core/`
  - `packages/provider-contracts/`
  - `packages/providers-testkit/`
  - `tests/`

## Out of Scope

- provider inference
- managed object inference
- broad CLI UX expansion
- arbitrary process orchestration
- behavior not justified by current specs, scenarios, ADRs, and slice docs
- speculative abstractions not required for this slice
- new packages unless absolutely required to preserve the approved current structure
- reset execution
- cleanup execution
- multi-provider coordination
- multiple-resource expansion beyond slice need
- multiple-endpoint expansion beyond slice need
- dynamic provider discovery
- convenience behavior that weakens explicit repository declarations

## Source Documents

Use these as the source of truth:

- `AGENTS.md`
- `CLAUDE.md`
- `docs/development/testing-strategy.md`
- `docs/development/implementation-strategy.md`
- `docs/development/dev-slice-02.md`
- `docs/development/dev-slice-02-scenario-map.md`
- relevant ADRs under `docs/adr/`
- relevant specs under `docs/spec/`
- relevant scenarios under `docs/scenarios/`

Use this precedence order:

1. accepted ADRs under `docs/adr/`
2. specifications under `docs/spec/`
3. scenarios under `docs/scenarios/`
4. development guidance under `docs/development/`

## Required Constraints

- refusal must remain a first-class behavior
- do not guess when safe scope is ambiguous
- core must not absorb provider-specific implementation details
- providers must not redefine business concepts
- repository configuration remains explicit
- core and provider responsibilities must remain separate
- do not introduce hidden defaults or convenience inference
- preserve the current slice boundary

## Skill Invocation

Use the repository skills in this order:

1. `$scenario-to-acceptance`
2. `$slice-implementation`
3. `$git-task-workflow` only if the task reaches commit/push/PR readiness

## Execution Plan

### Phase 1 — Scenario to Coverage

Use `$scenario-to-acceptance` first.

Read the active slice documents and only the ADR/spec/scenario docs needed for Development Slice 02.

Derive and add the initial executable coverage for Development Slice 02 in the appropriate test layers.

Coverage in scope:

- accepts an explicitly supported optional capability request
- refuses unsupported capability intent as invalid configuration
- refuses when safe scope for the requested operation cannot be established

Requirements for Phase 1:

- derive tests from repo docs; do not invent new business behavior
- keep acceptance assertions focused on externally visible behavior
- do not assert provider internals in acceptance tests
- use contract tests only where provider capability declaration or provider compliance is central
- preserve business language where practical
- stop at the slice boundary

After Phase 1, provide a concise summary of:

- which scenario areas were used
- which tests were added
- any ambiguities that were identified instead of guessed through

### Phase 2 — Slice Implementation

After the executable coverage is in place, use `$slice-implementation`.

Implement only the minimum production code required to satisfy the Slice 02 tests.

Target the current intended structure only:

- `packages/core/`
- `packages/provider-contracts/`
- `packages/providers-testkit/`
- `tests/`

Requirements for Phase 2:

- preserve explicit boundaries between core, provider contracts, providers, and entrypoints
- do not add new packages unless absolutely required by the slice
- do not broaden CLI or UX surface
- do not introduce orchestration behavior
- do not introduce provider inference
- do not introduce managed object inference
- refuse rather than guess when safe scope is ambiguous
- make the smallest implementation necessary for the active slice

## Expected Deliverables

- executable coverage for the in-scope Slice 02 behavior
- minimal production implementation required to satisfy that coverage
- contract tests only where needed by the slice
- no unrelated refactors

## Acceptance Criteria

- executable coverage exists for the Slice 02 behaviors identified in `docs/development/dev-slice-02-scenario-map.md`
- supported capability intent is accepted only when explicitly supported
- unsupported capability intent is refused explicitly as invalid configuration
- unsafe-scope refusal remains explicit for the requested operation
- the implementation preserves the current core/provider/configuration boundaries
- no provider inference, managed object inference, orchestration expansion, or unrelated package growth was introduced

## Notes for the Coding Agent

Before making changes:

1. identify the smallest set of files required
2. confirm the change preserves current boundaries
3. implement tests before broadening production code
4. stop at the slice boundary

When uncertain, prefer refusal and explicitness over convenience behavior.

## Final Summary Required

At the end of the task, provide a brief summary of:

- files added or changed
- tests added
- whether the new tests pass
- whether typecheck passes
- any remaining gaps, ambiguities, or deferred items
