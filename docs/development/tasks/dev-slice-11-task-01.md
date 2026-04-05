# Dev Slice 11 — Task 01

## Title

Add one thin CLI command for explicit scoped reset through the provider-module boundary seam

## Objective

Implement the minimum CLI production path that exposes the already-proven core reset behavior through `apps/cli` while preserving thin-app boundaries and refusal-first safety behavior.

This task should reuse the explicit `--providers <module-path>` seam established for CLI derive rather than introducing discovery or hidden defaults.

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
- `docs/development/tasks/dev-slice-08-task-01.md`
- `docs/development/tasks/dev-slice-10-task-01.md`

## Required outcome

Implement the minimum production change such that:

- the CLI can request one explicit scoped reset for one declared resource
- the CLI requires explicit `--config`, `--worktree-id`, and `--providers` input
- the CLI delegates reset business behavior to core rather than re-implementing it
- successful reset output remains structured and machine-testable
- refusal outcomes remain structured and unchanged from the core result

## In scope

- one `reset` command in `apps/cli`
- argument presence parsing for `--config`, `--worktree-id`, and `--providers`
- loading an explicit provider registry module in the app layer only
- invoking the current core reset entrypoint through public package entrypoints
- acceptance coverage for happy-path reset and key refusal paths
- bounded cleanup of touched CLI command dispatch only if needed for maintainability

## Out of scope

- provider discovery or provider registry inference
- cleanup CLI orchestration
- multiple-resource execution
- rich CLI UX or interactive prompts
- changes to core reset business rules except narrow bug fixes required by the slice
- speculative CLI framework expansion beyond the touched command path

## Acceptance criteria

- the CLI performs one explicit scoped reset when repository intent and provider support allow it
- missing `--providers` is refused at the CLI boundary rather than guessed
- unsupported reset capability is returned as `unsupported_capability`
- unsafe reset scope is returned as `unsafe_scope`
- reset remains explicit and is not added to derive or validation paths implicitly
- the CLI continues to depend on core only through workspace package public entrypoints

## Safety and boundary expectations

- the CLI remains a thin app layer
- provider loading stays explicit at the application boundary
- destructive operations remain explicit and refusal-first
- core retains business-rule and refusal-category ownership
- provider-specific behavior remains in provider implementations
