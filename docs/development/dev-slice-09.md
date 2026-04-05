# Dev Slice 09 — Explicit Scoped Cleanup

## Status

Implemented on `main`

## Intent

Add one explicit scoped cleanup path for one declared resource so lifecycle cleanup remains explicit and refusal-first.

This slice mirrors the reset seam, but for cleanup.

## Why this slice after Slice 08

Cleanup is the other destructive lifecycle path in 1.0.

Like reset, it must not guess or silently proceed when safe scope is ambiguous.

The core needs to preserve the distinction between repository intent, provider capability, and provider-originated scope safety.

## Slice objective

Implement the cleanup seam such that:

1. the core can request one explicit scoped cleanup for one declared resource
2. cleanup is accepted only when repository intent and provider support both allow it
3. cleanup refuses when safe worktree scope cannot be established
4. cleanup does not guess, fall back, or silently proceed when scope is unsafe

## Scope

This slice includes:

- one explicit cleanup entry path in the core
- one resource provider cleanup contract surface
- acceptance coverage for explicit cleanup happy path and refusal paths
- provider contract tests needed for cleanup behavior
- bounded refactor of the touched orchestration path if needed

## Out of scope

This slice does not include:

- reset execution changes beyond preserving existing behavior
- endpoint validation or lifecycle behavior
- multiple-resource orchestration
- CLI UX
- broad runtime orchestration
- speculative lifecycle abstractions beyond cleanup

## Architectural stance

Cleanup is destructive and must preserve worktree boundaries.

The core coordinates the cleanup request and preserves refusal categories.

The provider carries out the technology-specific cleanup behavior only when it can safely target one worktree instance.

## Acceptance criteria

- an explicitly supported scoped cleanup request succeeds for one worktree instance
- unsupported cleanup intent is refused as `unsupported_capability`
- cleanup without explicit repository intent is refused as `invalid_configuration`
- unsafe scope for cleanup is refused as `unsafe_scope`
- cleanup remains explicit and is not performed during derive-only paths
- the implementation preserves the current core/provider/configuration boundaries

## Expected artifacts

- core cleanup entrypoint
- resource-provider cleanup contract surface
- acceptance coverage for happy path and refusal paths
- provider contract tests for cleanup behavior

## Definition of done

This slice is done when cleanup is available as one explicit, refusal-first lifecycle action for one declared resource and the tests prove that the boundary stays intact.
