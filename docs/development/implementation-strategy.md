# Implementation Strategy

## Purpose

This document defines the implementation approach for the first phase of Multiverse.

The goal is to begin with a small, behavior-proving slice that exercises the core model without expanding scope beyond the current 1.0 boundaries.

## Current Phase

Multiverse has moved from design-first specification into behavior-first implementation through a sequence of narrow slices.

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

## Initial Slice Objective

The initial executable slice was intended to prove that the tool can:

- evaluate a valid repository configuration
- recognize a worktree instance
- derive isolated runtime values for one declared resource
- derive one declared endpoint mapping
- refuse when safe ownership or valid declaration cannot be established

## Initial Recommended Slice

### Slice name

Resolve one worktree instance into one isolated resource plan and one endpoint mapping, or refuse.

### Why this slice

This slice exercised the most important business boundaries early:

- worktree identity
- declarative repository configuration
- provider invocation
- deterministic isolated derivation
- endpoint isolation
- refusal behavior

It was small enough to implement quickly and meaningful enough to prove the architecture is real.

## In Scope for the Initial Slice

- one repository
- one machine
- one valid repository configuration shape
- one resource declaration
- one endpoint declaration
- one explicit provider assignment for each declared object
- deterministic derivation for one worktree instance
- different derived values for different worktree instances
- refusal for invalid configuration or unsafe scope

## Out of Scope for the Initial Slice

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

## Expected Deliverables for the Initial Slice

- executable acceptance tests for the selected in-scope behavior
- minimal provider contract tests required by the slice
- minimal production code needed to satisfy those tests
- no speculative abstractions beyond the current slice

## Current Progress Note

The repository has progressed beyond the initial slice-planning stage.

Current `main` includes implemented slices covering:

- one-worktree deterministic derive orchestration
- validated worktree identity admission
- validated repository-configuration admission
- validated endpoint-declaration admission
- explicit ESM workspace packages and package-boundary enforcement
- explicit capability-intent refusal behavior
- refusal propagation from providers
- explicit reset and cleanup core paths
- thin CLI with derive, validate, reset, cleanup, and validate-repository commands
- multi-resource and multi-endpoint support across all core paths
- path-scoped provider with effectful reset and cleanup (filesystem state)
- name-scoped provider with scope-confirmation reset and cleanup
- local-port endpoint provider
- fixed-host-port endpoint provider as the first narrow `0.4.x`
  extensibility proof
- sample Express application for end-to-end integration proof
- CI pipeline with acceptance, contract, unit, and integration test jobs
- `derive --format=env` for shell-sourceable KEY=VALUE output
- `multiverse run` process wrapper with derived env injection
- conventional defaults for `--config` and `--providers`
- process-scoped provider: state-directory handle, full lifecycle (launch, liveness, cleanup)
- CLI and integration test coverage for process-scoped lifecycle

Phase 1 complete (0.2.x / alpha.1):

- ADR-0012: explicit process wrapper (`multiverse run`) — implemented
- ADR-0013: runtime env variable naming convention — implemented
- ADR-0014: strict conventional defaults for `--config` and `--providers` — implemented

Phase 2 complete (0.2.x / alpha.2):

- ADR-0015: process-scoped providers manage explicitly requested child processes only
- Slice 21: `@multiverse/provider-process-scoped` — handle derivation (process state directory) — implemented
- Slice 22: process-scoped lifecycle — launch, liveness readiness, cleanup — implemented
- Slice 23: CLI-level acceptance coverage for process-scoped lifecycle — implemented
- Integration tests for process-scoped lifecycle — implemented

Phase 3 in design (targeting 0.2.x):

- ADR-0016 (proposed): port-aware process-backed provider with self-describing connection handle
- Open question: a new `provider-process-port-scoped` that combines deterministic port assignment
  with process lifecycle management, exposing `host:port` as the public resource handle

The purpose of this document is still to preserve implementation posture and first-phase boundaries, not to serve as the complete change log for every later slice.

## Refusal Requirements

Refusal must be present from the first implementation slice onward.

At minimum, the slice should refuse when:

- required repository declarations are missing
- a declared object omits its provider
- a required field is missing
- safe scope cannot be determined for the requested operation

## Practical Rule

Do not build for slice three while claiming to work on slice one.

If an abstraction is not required to satisfy current acceptance behavior, defer it.
