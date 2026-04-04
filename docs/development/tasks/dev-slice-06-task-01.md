# Development Slice 06 Task 01

## Objective

Implement a narrow refusal-propagation slice that proves provider-originated refusal categories survive core coordination unchanged for the current single-resource, single-endpoint path.

## Business Context

Multiverse is a behavior-first isolation tool for parallel development across git worktrees of the same repository on one machine.

This task must preserve explicit worktree-instance boundaries, declarative repository configuration, explicit provider coordination, and refusal-first safety behavior.

## In Scope

- add executable coverage proving provider-originated `unsafe_scope` during derive is returned through the core orchestration path
- add executable coverage proving provider-originated `provider_failure` during derive is returned through the core orchestration path
- add executable coverage proving provider-originated `unsafe_scope` during validate is returned through the Slice 02 path
- add executable coverage proving provider-originated `provider_failure` during validate is returned through the Slice 02 path
- add the minimum test-provider support required to exercise those refusal paths
- preserve the current intended workspace areas only:
  - `packages/core/`
  - `packages/providers-testkit/`
  - `tests/`

## Out of Scope

- provider inference
- managed object inference
- broad CLI UX expansion
- arbitrary process orchestration
- unsupported-capability taxonomy changes
- reset execution
- cleanup execution
- multi-provider coordination
- multiple-resource expansion
- multiple-endpoint expansion
- speculative abstractions not required by this slice

## Source Documents

Use these as the source of truth:

- `docs/adr/0008-unsafe-operations-are-refused-in-1-0.md`
- `docs/spec/safety-and-refusal.md`
- `docs/spec/system-boundary.md`
- `docs/spec/provider-model.md`
- `docs/scenarios/safety-and-refusal.scenarios.md`
- `docs/scenarios/system-boundary.scenarios.md`
- `docs/scenarios/provider-model.scenarios.md`
- `AGENTS.md`
- `docs/development/testing-strategy.md`
- `docs/development/implementation-strategy.md`

## Required Constraints

- refusal must remain a first-class behavior
- do not guess when safe scope is ambiguous
- core must not absorb provider-specific implementation details
- providers must not redefine business concepts
- repository configuration remains explicit
- preserve the distinction between `unsafe_scope` and `provider_failure`

## Expected Deliverables

- executable acceptance tests for the in-scope refusal propagation behavior
- focused contract tests where provider refusal behavior is central
- minimal production and testkit changes required to satisfy those tests
- no unrelated refactors

## Acceptance Criteria

- provider-originated `unsafe_scope` during derive is returned unchanged by the core path
- provider-originated `provider_failure` during derive is returned unchanged by the core path
- provider-originated `unsafe_scope` during validate is returned unchanged by the Slice 02 path
- provider-originated `provider_failure` during validate is returned unchanged by the Slice 02 path
- the implementation preserves the current core/provider/configuration boundary

## Notes for the Coding Agent

Before making changes:

1. identify the smallest set of files required
2. confirm the change preserves current boundaries
3. implement tests before broadening production code
4. stop at the slice boundary

When uncertain, prefer refusal and explicitness over convenience behavior.
