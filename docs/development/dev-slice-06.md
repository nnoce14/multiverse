# Dev Slice 06 — Preserve Provider Refusals Through Core Coordination

## Status

Implemented on `main`

## Intent

Preserve provider-originated refusal categories unchanged as they flow through core coordination for derive and validate paths.

This slice proves that the core coordinates provider behavior without rewriting provider refusals into different categories, which keeps the safety model explicit and preserves the distinction between core and provider responsibility.

## Why this slice after Slices 01 to 05

Slices 01 through 05 established the trusted admission seams for worktree identity, repository configuration, and endpoint declarations.

The next trust-preserving boundary is refusal propagation.

Once providers are invoked, the core must still keep provider refusal categories intact so that:

- unsafe scope remains unsafe scope
- provider failure remains provider failure
- the core does not collapse provider-originated refusals into generic invalid configuration

Without this seam, later destructive and CLI-driven paths would lose the ability to distinguish the source of failure.

## Slice objective

Implement refusal propagation such that:

1. provider-originated refusals from derive are returned unchanged through the core path
2. provider-originated refusals from validate are returned unchanged through the core path
3. the core does not reclassify provider refusals into different categories
4. refusal categories remain stable and machine-testable

## Scope

This slice includes:

- acceptance coverage for provider-originated derive refusals
- acceptance coverage for provider-originated validate refusals
- minimal core coordination changes needed to preserve refusal categories
- focused provider testkit support for refusal-path setup

## Out of scope

This slice does not include:

- provider capability discovery
- reset or cleanup execution
- CLI behavior
- broad orchestration redesign
- new refusal categories
- changing the refusal surface that later slices depend on

## Architectural stance

This slice preserves the responsibility split already established elsewhere:

> providers decide when technology-specific safety cannot be established

The core coordinates those refusals, but does not rewrite the categories or make the refusal less specific.

## Refusal behavior in scope

The in-scope refusal categories are:

- `unsafe_scope`
- `provider_failure`

The in-scope paths are:

- derive
- validate

The core must return the provider's refusal unchanged.

## Acceptance criteria

- provider-originated `unsafe_scope` during derive is returned unchanged
- provider-originated `provider_failure` during derive is returned unchanged
- provider-originated `unsafe_scope` during validate is returned unchanged
- provider-originated `provider_failure` during validate is returned unchanged
- the core does not collapse provider refusals into generic invalid configuration

## Expected artifacts

- acceptance tests proving refusal propagation through derive and validate
- any minimal core coordination adjustments required for stable refusal passthrough
- provider testkit helpers for refusal scenarios

## Definition of done

This slice is done when provider refusals survive core coordination unchanged for derive and validate, and the tests prove that refusal categories remain stable across the boundary.
