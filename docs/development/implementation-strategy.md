# Implementation Strategy

## Purpose

This document defines the implementation approach for the first phase of Multiverse.

The goal is to begin with a small, behavior-proving slice that exercises the core model without expanding scope beyond the current 1.0 boundaries.

## Current Phase

Multiverse is transitioning from design-first specification into behavior-first implementation.

The implementation approach is:

- acceptance-first
- slice oriented
- boundary-preserving
- explicit rather than inferred
- refusal-aware from the first slice

## Implementation Platform

Multiverse is being implemented for the npm ecosystem.

The initial implementation uses:

- TypeScript
- Node.js
- pnpm workspaces

Early slices should follow Node.js and TypeScript conventions for package structure, test setup, scripts, and entrypoints.

Cross-runtime portability is not an implicit goal of the initial implementation. Do not introduce runtime-neutral abstractions unless a later decision explicitly requires them.

## First Slice Objective

The first executable slice should prove that the tool can:

- evaluate a valid repository configuration
- recognize a worktree instance
- derive isolated runtime values for one declared resource
- derive one declared endpoint mapping
- refuse when safe ownership or valid declaration cannot be established

## Recommended First Slice

### Slice name

Resolve one worktree instance into one isolated resource plan and one endpoint mapping, or refuse.

### Why this slice

This slice exercises the most important business boundaries early:

- worktree identity
- declarative repository configuration
- provider invocation
- deterministic isolated derivation
- endpoint isolation
- refusal behavior

It is small enough to implement quickly and meaningful enough to prove the architecture is real.

## In Scope for the First Slice

- one repository
- one machine
- one valid repository configuration shape
- one resource declaration
- one endpoint declaration
- one explicit provider assignment for each declared object
- deterministic derivation for one worktree instance
- different derived values for different worktree instances
- refusal for invalid configuration or unsafe scope

## Out of Scope for the First Slice

- provider inference
- managed object inference
- arbitrary orchestration behavior
- rich CLI UX
- dynamic provider discovery
- multiple providers in one slice unless strictly necessary
- broad reset/cleanup workflows
- application bootstrapping concerns
- full runtime process management

## Architectural Direction

The first slice should preserve the explicit responsibility model:

- repository configuration declares what exists
- core validates declarations and coordinates behavior
- provider derives technology-specific scoped values
- application/runtime remains a consumer of derived outputs

## Package Discipline

Multiverse is implemented as a pnpm workspace monorepo, but early slices should use the minimum number of packages required to preserve clarity.

Do not create new packages for speculative reuse or abstract neatness.

A new package should be introduced only when a real responsibility boundary or dependency-direction need requires it.

## Expected Deliverables for the First Slice

- executable acceptance tests for the selected in-scope behavior
- minimal provider contract tests required by the slice
- minimal production code needed to satisfy those tests
- no speculative abstractions beyond the current slice

## Refusal Requirements

Refusal must be present in the first implementation slice.

At minimum, the slice should refuse when:

- required repository declarations are missing
- a declared object omits its provider
- a required field is missing
- safe scope cannot be determined for the requested operation

## Practical Rule

Do not build for slice three while claiming to work on slice one.

If an abstraction is not required to satisfy current acceptance behavior, defer it.
