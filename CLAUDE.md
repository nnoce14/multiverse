# CLAUDE.md

## Purpose

Multiverse is a behavior-first tool for deterministic local runtime isolation across multiple git worktrees of the same repository on one machine.

## Current Phase

This repository is transitioning from design into implementation through small vertical slices driven by executable acceptance tests.

## Source of Truth

When implementing behavior, use this precedence order:

1. accepted ADRs under `docs/adr/`
2. specifications under `docs/spec/`
3. scenarios under `docs/scenarios/`
4. development guidance under `docs/development/`

Do not invent behavior not supported by these sources.

## Hard Constraints for 1.0

- no provider inference
- no managed object inference
- repository configuration is declarative only
- refusal is a first-class behavior
- refuse rather than guess when safe scope is ambiguous
- core and provider responsibilities must remain separate

## Boundary Rules

- core enforces business rules, coordination, and safety/refusal
- providers implement technology-specific isolation behavior through explicit contracts
- repository configuration must remain explicit
- do not move business rules into provider code
- do not introduce hidden defaults or convenience inference

## Implementation Rules

- implement only the current slice
- prefer extending tests before extending production code
- do not broaden CLI or UX surface unless explicitly required
- do not introduce orchestration behavior unless explicitly required
- do not silently resolve ambiguity by guessing
- do not add speculative abstractions beyond the needs of the current slice

## Testing Rules

Multiverse follows behavior-first TDD.

- acceptance tests verify externally visible business behavior and derive from scenario documents
- provider contract tests verify provider compliance with core expectations
- unit tests verify local implementation details and do not replace acceptance coverage

## Task Discipline

Each implementation task must define:

- the vertical slice in scope
- scenario coverage in scope
- expected files to change
- explicit out-of-scope behavior
- acceptance criteria
- safety/refusal expectations

If a task is ambiguous, preserve existing boundaries rather than introducing new behavior.
