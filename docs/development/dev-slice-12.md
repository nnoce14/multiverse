# Dev Slice 12 — Explicit CLI Cleanup Command

## Status

Implemented on `main`

## Intent

Add one thin CLI command for explicit scoped cleanup through the explicit provider-module boundary seam established by the earlier CLI slices.

This slice reuses the same application-boundary seam as derive and reset so cleanup remains explicit and refusal-first.

## Why this slice after the CLI validation and reset slices

Cleanup is the other destructive lifecycle command in 1.0.

The CLI must not discover providers implicitly or invent orchestration behavior to reach it.

## Slice objective

Implement the cleanup CLI seam such that:

1. the CLI can request one explicit scoped cleanup for one declared resource
2. the CLI requires explicit `--config`, `--worktree-id`, and `--providers` input
3. the CLI delegates cleanup business behavior to core rather than re-implementing it
4. successful cleanup output remains structured and machine-testable
5. refusal outcomes remain structured and unchanged from the core result

## Scope

This slice includes:

- one `cleanup` command in `apps/cli`
- argument presence parsing for `--config`, `--worktree-id`, and `--providers`
- loading an explicit provider registry module in the app layer only
- invoking the current core cleanup entrypoint through public package entrypoints
- acceptance coverage for happy-path cleanup and key refusal paths
- bounded cleanup of touched CLI command dispatch only if needed for maintainability

## Out of scope

This slice does not include:

- provider discovery or provider registry inference
- reset CLI behavior beyond preserving existing behavior
- multiple-resource execution
- rich CLI UX or interactive prompts
- changes to core cleanup business rules except narrow bug fixes required by the slice
- speculative CLI framework expansion beyond the touched command path

## Architectural stance

The CLI remains a thin app layer.

Provider loading stays explicit at the application boundary.

Destructive operations remain explicit and refusal-first.

Core retains business-rule and refusal-category ownership.

## Acceptance criteria

- the CLI performs one explicit scoped cleanup when repository intent and provider support allow it
- missing `--providers` is refused at the CLI boundary rather than guessed
- unsupported cleanup capability is returned as `unsupported_capability`
- cleanup without declared repository intent is returned as `invalid_configuration`
- unsafe cleanup scope is returned as `unsafe_scope`
- cleanup remains explicit and is not added to derive or validation paths implicitly
- the CLI continues to depend on core only through workspace package public entrypoints

## Expected artifacts

- cleanup CLI command
- explicit provider-module loading in the app layer
- acceptance coverage for happy-path cleanup and refusal paths

## Definition of done

This slice is done when the CLI can request cleanup through the explicit provider-module seam, and the tests prove that refusal and success outputs stay stable.
