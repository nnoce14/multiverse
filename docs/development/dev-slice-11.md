# Dev Slice 11 — Explicit CLI Reset Command

## Status

Implemented on `main`

## Intent

Add one thin CLI command for explicit scoped reset through the explicit provider-module boundary seam established by the earlier CLI slice.

This slice keeps provider loading explicit at the application boundary, reuses the explicit `--providers <module-path>` seam established by CLI derive, and delegates reset business behavior to core.

## Why this slice after the thin CLI validation and provider wiring slices

The CLI already has a thin validation entrypoint and an explicit provider-wired derive path.

Reset is the first destructive CLI command to reuse that seam.

The app layer must not invent provider discovery or hidden defaults in order to reach reset behavior.

## Slice objective

Implement the reset CLI seam such that:

1. the CLI can request one explicit scoped reset for one declared resource
2. the CLI requires explicit `--config`, `--worktree-id`, and `--providers` input
3. the CLI delegates reset business behavior to core rather than re-implementing it
4. successful reset output remains structured and machine-testable
5. refusal outcomes remain structured and unchanged from the core result

## Scope

This slice includes:

- one `reset` command in `apps/cli`
- argument presence parsing for `--config`, `--worktree-id`, and `--providers`
- loading an explicit provider registry module in the app layer only
- invoking the current core reset entrypoint through public package entrypoints
- acceptance coverage for happy-path reset and key refusal paths
- bounded cleanup of touched CLI command dispatch only if needed for maintainability

## Out of scope

This slice does not include:

- provider discovery or provider registry inference
- cleanup CLI orchestration
- multiple-resource execution
- rich CLI UX or interactive prompts
- changes to core reset business rules except narrow bug fixes required by the slice
- speculative CLI framework expansion beyond the touched command path

## Architectural stance

The CLI remains a thin app layer.

Provider loading stays explicit at the application boundary.

Destructive operations remain explicit and refusal-first.

Core retains business-rule and refusal-category ownership.

## Acceptance criteria

- the CLI performs one explicit scoped reset when repository intent and provider support allow it
- missing `--providers` is refused at the CLI boundary rather than guessed
- unsupported reset capability is returned as `unsupported_capability`
- unsafe reset scope is returned as `unsafe_scope`
- reset remains explicit and is not added to derive or validation paths implicitly
- the CLI continues to depend on core only through workspace package public entrypoints

## Expected artifacts

- reset CLI command
- explicit provider-module loading in the app layer
- acceptance coverage for happy-path reset and refusal paths

## Definition of done

This slice is done when the CLI can request reset through the explicit provider-module seam, and the tests prove that refusal and success outputs stay stable.
