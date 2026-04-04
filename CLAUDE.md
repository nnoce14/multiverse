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

## Git Workflow Rules

For coding-agent work in this repository:

- never work directly on `main`
- create or use a task-scoped branch named with one of:
  - `feat/<task-or-slice-name>`
  - `fix/<task-or-slice-name>`
  - `chore/<task-or-slice-name>`
  - `docs/<task-or-slice-name>`
- before making commits, summarize the planned file set and the checks that passed
- make focused, logical commits grouped by purpose
- do not use `git add .`
- stage only files relevant to the current task
- do not include unrelated generated files or incidental changes
- after required checks pass, the agent may:
  - commit to the current task branch
  - push the branch to origin
  - create a pull request for review
- the agent must not:
  - push directly to `main`
  - merge pull requests
  - force-push unless explicitly instructed
  - include unrelated cleanup in a feature PR

### Pull Request Rules

When creating a PR, include:

- a concise summary of the task
- the scope of changes
- validation performed
- notable deferred items or follow-up work

Keep PR descriptions concise and factual.