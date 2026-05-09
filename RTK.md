# Multiverse Agent Workflow

## Purpose

Multiverse is a behavior-first tool for deterministic local runtime isolation across multiple git worktrees of the same repository on one machine.

This fresh implementation starts with the agentic development foundation before implementation slices. Product behavior must be governed by accepted decisions, source records, task briefs, and executable validation.

## Source of Truth

Use this precedence order when implementing behavior:

1. accepted decision records under `decisions/`
2. specifications under `docs/spec/`
3. scenarios under `docs/scenarios/`
4. development guidance under `docs/development/`
5. historical material from `../multiverse-old`, only when represented by a source record or task brief

Do not invent business truth from code shape alone.

## Agentic Workflow

The repository follows the OpenClinXR pattern of machine-checked planning artifacts:

- source records document what external or historical material may support
- decision records capture accepted architecture and reversal triggers
- agent charters and memory indexes preserve role-specific project memory
- iteration folders hold briefs, plans, scorecards, reviews, and synthesis
- validation scripts gate artifact shape before implementation proceeds

The workflow foundation is product work. Do not skip it to start slices early.

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
- repository configuration remains explicit
- providers must not own business rules
- implementation must not introduce hidden defaults or convenience inference

## Implementation Rules

- implement only the active governed slice
- write or update the task brief before production changes
- prefer acceptance coverage before production code
- do not broaden CLI, provider, or orchestration behavior unless the active slice requires it
- record deferred behavior explicitly instead of smuggling it into a slice

## Testing Rules

Multiverse follows behavior-first TDD.

- acceptance tests verify externally visible business behavior
- provider contract tests verify provider compliance with core expectations
- unit tests verify local implementation details and do not replace acceptance coverage
- artifact validation is required before implementation slices

## Codex Environment Rules

When running package-manager or toolchain commands that may write to HOME, XDG paths, Corepack state, or the pnpm store, use the repository wrapper:

- `scripts/codex-env.sh pnpm ...`
- `scripts/codex-env.sh corepack ...`
- `scripts/codex-env.sh npm ...` only if npm is explicitly required

Keep repo-local tool state under `.codex/`.

## Git Workflow Policy

Once the repository is initialized, do not work directly on `main` for implementation slices. Use task-scoped branches, focused commits, validation before PR, and concise factual PR descriptions.

Routine branch, commit, push, and pull request work may proceed without extra approval when validation is passing and scope is clear. Stop for user input when business truth is ambiguous, unrelated changes cannot be separated, or validation fails with no clear next step.

## Core Principle

Agents may discover implementation details, but they may not discover business truth. Business truth must come from governed artifacts.
