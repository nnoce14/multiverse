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
- follow a bounded red-green-refactor loop for slice implementation:
  1. make the relevant acceptance and contract tests fail for the in-scope behavior
  2. add the minimum production code needed to make them pass
  3. perform a bounded refactor pass while keeping tests green
  4. add focused unit tests for extracted pure helpers when they improve maintainability
- do not broaden CLI or UX surface unless explicitly required
- do not introduce orchestration behavior unless explicitly required
- do not silently resolve ambiguity by guessing
- do not add speculative abstractions beyond the needs of the current slice

## Testing Rules

Multiverse follows behavior-first TDD.

- acceptance tests verify externally visible business behavior and derive from scenario documents
- provider contract tests verify provider compliance with core expectations
- unit tests verify local implementation details and do not replace acceptance coverage
- passing acceptance tests are necessary but not always sufficient for completion; a slice may require a bounded refactor pass before it is considered done
- refactor passes must preserve behavior proven by acceptance and contract tests

## Task Discipline

Each implementation task must define:

- the vertical slice in scope
- scenario coverage in scope
- expected files to change
- explicit out-of-scope behavior
- acceptance criteria
- safety/refusal expectations

If a task is ambiguous, preserve existing boundaries rather than introducing new behavior.

## Git Workflow Policy

For coding-agent work in this repository:

- never work directly on `main`
- never push directly to `main`
- use a task-scoped branch for implementation work
- pull requests are required for review
- the coding agent should autonomously create branches, commit focused changes, push task branches, and open pull requests when work is ready
- merges are human-only
- do not force-push unless explicitly instructed

Use the `git-task-workflow` skill when a task reaches branch, commit, push, or pull request stages.

Routine branch, commit, push, and pull request steps do not require additional user approval.
Stop for user input only when:

- business truth is ambiguous
- unrelated changes cannot be safely separated
- required validation is failing and the next step is unclear
- a force-push or merge would be required

### Pull Request Rules

When creating a PR, include:

- a concise summary of the task
- the scope of changes
- validation performed
- notable deferred items or follow-up work

Keep PR descriptions concise and factual.

## Skill Usage Guidance

When a task clearly matches a repository skill, prefer using the skill instead of recreating the workflow ad hoc.

Prefer the lightest workflow that fits the task.

### Default execution

For small or well-bounded tasks, use direct execution without subagents.

### Use `scenario-to-acceptance`

Use when the task is to derive executable acceptance coverage from existing ADRs, specs, scenarios, and active slice docs.

### Use `slice-implementation`

Use when acceptance or contract coverage already defines the in-scope behavior and the task is to implement the current slice with a narrow production change.

### Use `tdd-red-green-refactor`

Use when the task requires the full TDD loop for the current slice, including:

- driving behavior from acceptance and contract tests
- getting to green with minimal code
- performing a bounded refactor pass under test protection
- adding focused unit tests for extracted pure helpers where useful

### Use `git-task-workflow`

Use when the task is ready for branch, commit, push, or pull request workflow.
Do not use it before required checks pass.

### Use `lite-subagent-development`

Use when a task may benefit from limited subagent decomposition for planning, implementation, and review.
Default to solo or paired mode.
Do not use subagents to mutate the same shared seam in parallel.

### Use `slice-review`

Use when reviewing a diff, branch, or implementation result against the active slice, task, and scenario-map documents.

### Use `validation-boundary-check`

Use when a change introduces or modifies validation logic and it is necessary to confirm that declaration validation, scope-safety validation, and provider capability or runtime validation are placed in the correct layer.

## Skill Selection Rule

Prefer the smallest number of skills and the lightest execution mode that can complete the task safely.

Do not introduce subagents or extra review passes unless they provide clear value for the active slice.

## Core Principle

The agent may discover implementation, but it may not discover business truth.

Business truth must come from ADRs, specs, scenarios, and development slice/task documents.
