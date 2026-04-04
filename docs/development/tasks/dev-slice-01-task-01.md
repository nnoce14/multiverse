# Development Slice 01 | Task 01

## Objective

Implement Development Slice 01 through behavior-first TDD by first deriving executable acceptance tests from the existing repository documents and then implementing the minimum production code required to satisfy those tests.

## Business Context

Multiverse is a behavior-first isolation tool for parallel development across git worktrees of the same repository on one machine.

This task must preserve explicit worktree-instance boundaries, declarative repository configuration, and refusal-first safety behavior.

## In Scope

- derive executable acceptance tests for Development Slice 01 from the existing repo documents
- use the active slice and slice scenario map as the immediate planning anchors
- add initial acceptance tests under `tests/acceptance/`
- implement only the minimum production code required to satisfy the new tests
- use the current intended workspace areas only:
  - `apps/` only if a thin entrypoint is strictly required by the slice
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
- future-slice behavior
- cleanup and reset workflows beyond strict Slice 01 need
- multi-provider coordination
- convenience behavior that weakens explicit repository declarations

## Source Documents

Use these as the source of truth:

- `AGENTS.md`
- `CLAUDE.md`
- `docs/development/testing-strategy.md`
- `docs/development/implementation-strategy.md`
- `docs/development/dev-slice-01.md`
- `docs/development/dev-slice-01-scenario-map.md`
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

## Execution Plan

### Phase 1 — Scenario to Acceptance

Use `$scenario-to-acceptance` first.

Read the active slice documents and only the ADR/spec/scenario docs needed for Development Slice 01.

Derive and add the initial executable acceptance tests for Development Slice 01 under `tests/acceptance/`.

Acceptance coverage in scope:

- valid declared configuration plus valid worktree instance resolves successfully
- same worktree instance resolves deterministically
- different worktree instances resolve differently
- missing provider assignment refuses
- missing required declaration data refuses
- ambiguous or unsafe scope refuses

Requirements for Phase 1:

- derive tests from repo docs; do not invent new business behavior
- keep assertions focused on externally visible behavior
- do not assert provider internals
- preserve business language where practical
- stop at the slice boundary

After Phase 1, provide a concise summary of:

- which scenario areas were used
- which acceptance tests were added
- any ambiguities that were identified instead of guessed through

### Phase 2 — Slice Implementation

After the acceptance tests are in place, use `$slice-implementation`.

Implement only the minimum production code required to satisfy the Slice 01 tests.

Target the current intended structure only:

- `apps/` only if a thin entrypoint is strictly required
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

- executable acceptance tests for the in-scope Slice 01 behavior
- minimal production implementation required to satisfy those tests
- contract tests only where needed by the slice
- no unrelated refactors

## Acceptance Criteria

- executable acceptance tests exist for the Slice 01 behaviors identified in `docs/development/dev-slice-01-scenario-map.md`
- the implementation satisfies those tests with the minimum production code required
- refusal outcomes are implemented explicitly where required by the slice
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
- acceptance tests added
- whether the new acceptance tests pass
- any remaining gaps, ambiguities, or deferred items
