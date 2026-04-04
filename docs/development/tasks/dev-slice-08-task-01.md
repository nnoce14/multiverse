# Dev Slice 08 — Task 01

## Title

Execute one explicit scoped resource reset for one worktree instance, or refuse

## Objective

Implement the minimum production path that proves a destructive resource operation can be requested explicitly for one worktree instance while preserving refusal-first safety behavior.

This task introduces one explicit reset operation for the current single-resource path.

## Sources of truth

Ground this task in:

- `docs/adr/0005-providers-implement-isolation-contracts.md`
- `docs/adr/0008-unsafe-operations-are-refused-in-1-0.md`
- `docs/spec/provider-model.md`
- `docs/spec/resource-isolation.md`
- `docs/spec/repository-configuration.md`
- `docs/spec/safety-and-refusal.md`
- `docs/scenarios/provider-model.scenarios.md`
- `docs/scenarios/resource-isolation.scenarios.md`
- `docs/scenarios/safety-and-refusal.scenarios.md`
- `docs/scenarios/system-boundary.scenarios.md`

## Required outcome

Implement the minimum production change such that:

- the core can request one explicit scoped reset for one declared resource
- reset is accepted only when repository intent and provider support both allow it
- reset refuses when safe worktree scope cannot be established
- reset does not guess, fall back, or silently proceed when scope is unsafe

## In scope

- one explicit reset entry path in the core
- one resource provider reset contract surface
- acceptance coverage for explicit reset happy path and refusal paths
- provider contract tests needed for reset behavior
- bounded refactor of the touched orchestration path if needed

## Out of scope

- cleanup execution
- endpoint validation or lifecycle behavior
- multiple-resource orchestration
- CLI UX
- broad runtime orchestration
- speculative lifecycle abstractions beyond the needs of reset

## Acceptance criteria

- an explicitly supported scoped reset request succeeds for one worktree instance
- unsupported reset intent is refused as `unsupported_capability`
- unsafe scope for reset is refused as `unsafe_scope`
- reset remains explicit and is not performed during derive-only paths
- the implementation preserves the current core/provider/configuration boundaries

## Safety and boundary expectations

- destructive operations require safe scope determination before execution
- no reset action may execute implicitly
- provider-specific reset behavior remains in provider code
- the core coordinates the reset request and preserves refusal categories
