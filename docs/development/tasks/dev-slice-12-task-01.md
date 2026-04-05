# Dev Slice 12 — Task 01

## Title

Add one thin CLI command for explicit scoped cleanup through the provider-module boundary seam

## Objective

Implement the minimum CLI production path that exposes the already-proven core cleanup behavior through `apps/cli` while preserving thin-app boundaries and refusal-first safety behavior.

This task should reuse the explicit `--providers <module-path>` seam already established for CLI derive and reset-oriented CLI work.

## Sources of truth

Ground this task in:

- `docs/adr/0005-providers-implement-isolation-contracts.md`
- `docs/adr/0008-unsafe-operations-are-refused-in-1-0.md`
- `docs/adr/0009-core-provider-repository-and-application-boundaries-are-explicit.md`
- `docs/spec/provider-model.md`
- `docs/spec/resource-isolation.md`
- `docs/spec/repository-configuration.md`
- `docs/spec/safety-and-refusal.md`
- `docs/spec/system-boundary.md`
- `docs/development/tasks/dev-slice-09-task-01.md`
- `docs/development/tasks/dev-slice-10-task-01.md`

## Required outcome

Implement the minimum production change such that:

- the CLI can request one explicit scoped cleanup for one declared resource
- the CLI requires explicit `--config`, `--worktree-id`, and `--providers` input
- the CLI delegates cleanup business behavior to core rather than re-implementing it
- successful cleanup output remains structured and machine-testable
- refusal outcomes remain structured and unchanged from the core result

## In scope

- one `cleanup` command in `apps/cli`
- argument presence parsing for `--config`, `--worktree-id`, and `--providers`
- loading an explicit provider registry module in the app layer only
- invoking the current core cleanup entrypoint through public package entrypoints
- acceptance coverage for happy-path cleanup and key refusal paths
- bounded cleanup of touched CLI command dispatch only if needed for maintainability

## Out of scope

- provider discovery or provider registry inference
- reset CLI behavior beyond preserving existing behavior
- multiple-resource execution
- rich CLI UX or interactive prompts
- changes to core cleanup business rules except narrow bug fixes required by the slice
- speculative CLI framework expansion beyond the touched command path

## Acceptance criteria

- the CLI performs one explicit scoped cleanup when repository intent and provider support allow it
- missing `--providers` is refused at the CLI boundary rather than guessed
- unsupported cleanup capability is returned as `unsupported_capability`
- cleanup without declared repository intent is returned as `invalid_configuration`
- unsafe cleanup scope is returned as `unsafe_scope`
- cleanup remains explicit and is not added to derive or validation paths implicitly
- the CLI continues to depend on core only through workspace package public entrypoints

## Safety and boundary expectations

- the CLI remains a thin app layer
- provider loading stays explicit at the application boundary
- destructive operations remain explicit and refusal-first
- core retains business-rule and refusal-category ownership
- provider-specific behavior remains in provider implementations
