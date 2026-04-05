# Dev Slice 08 — Explicit Scoped Reset

## Status

Implemented on `main`

## Intent

Add one explicit scoped reset path for one declared resource so destructive lifecycle behavior can be requested only when repository intent and provider support both allow it.

This slice proves that reset remains explicit and refusal-first.

## Why this slice after the provider and package boundaries

By this point, the repository already has explicit package boundaries, validated declarations, and provider refusal behavior.

Reset is the first destructive resource operation that needs those boundaries to stay intact.

The core must coordinate reset without guessing or silently proceeding when scope is unsafe.

## Slice objective

Implement the reset seam such that:

1. the core can request one explicit scoped reset for one declared resource
2. reset is accepted only when repository intent and provider support both allow it
3. reset refuses when safe worktree scope cannot be established
4. reset does not guess, fall back, or silently proceed when scope is unsafe

## Scope

This slice includes:

- one explicit reset entry path in the core
- one resource provider reset contract surface
- acceptance coverage for explicit reset happy path and refusal paths
- provider contract tests needed for reset behavior
- bounded refactor of the touched orchestration path if needed

## Out of scope

This slice does not include:

- cleanup execution
- endpoint validation or lifecycle behavior
- multiple-resource orchestration
- CLI UX
- broad runtime orchestration
- speculative lifecycle abstractions beyond reset

## Architectural stance

Reset is destructive, so the core and provider must agree on safe scope before execution.

The core coordinates the request and preserves refusal categories.

The provider carries out the technology-specific reset behavior only when it can safely target one worktree instance.

## Acceptance criteria

- an explicitly supported scoped reset request succeeds for one worktree instance
- unsupported reset intent is refused as `unsupported_capability`
- unsafe scope for reset is refused as `unsafe_scope`
- reset remains explicit and is not performed during derive-only paths
- the implementation preserves the current core/provider/configuration boundaries

## Expected artifacts

- core reset entrypoint
- resource-provider reset contract surface
- acceptance coverage for happy path and refusal paths
- provider contract tests for reset behavior

## Definition of done

This slice is done when reset is available as one explicit, refusal-first lifecycle action for one declared resource and the tests prove that the boundary stays intact.
