# Dev Slice 21 — First Process-Scoped Provider: Handle Derivation

## Status

Implemented on `main`

## Intent

Introduce `@multiverse/provider-process-scoped` as the first concrete process-scoped resource provider, covering the process-scoped isolation strategy defined in ADR-0015.

A process-scoped resource isolates state through a provider-managed process state directory per worktree instance. The directory is the stable public handle for the resource. All provider-owned implementation artifacts (PID file, readiness metadata, logs) live inside it.

This slice is an extensibility proof. It proves that the existing `ResourceProvider` contract covers process-scoped handle derivation without any new top-level concepts.

## Why this slice

ADR-0015 defines process-scoped providers as the next provider category. The `IsolationStrategy` type already includes `"process-scoped"` as a placeholder. This slice fulfills that placeholder with a real provider.

Following the same pattern as path-scoped (slice 15 = derive only, slices 16–17 = lifecycle), this slice establishes the derivation baseline before adding process management.

## Slice objective

Implement `@multiverse/provider-process-scoped` such that:

1. `@multiverse/provider-process-scoped` exists as an explicit workspace package
2. the provider exports `createProcessScopedProvider(config: { baseDir: string; command: string[] })` returning a `ResourceProvider`
3. the provider derives a stable state directory in the form `{baseDir}/{resourceName}/{worktreeId}/` for each worktree instance
4. derivation is deterministic and requires no external state
5. the provider refuses with `unsafe_scope` when worktree ID is absent
6. resource provider contract tests cover the process-scoped provider
7. acceptance tests prove end-to-end derive behavior with process-scoped handles

## Scope

This slice includes:

- a new `packages/provider-process-scoped` workspace package
- a `createProcessScopedProvider(config: { baseDir: string; command: string[] })` factory export
- deterministic state directory derivation: `{baseDir}/{resourceName}/{worktreeId}/`
- refusal with `unsafe_scope` when worktree ID is absent
- resource provider contract test for the process-scoped provider
- acceptance tests (dev-slice-21)
- slice and scenario-map docs

## Out of scope

- `validate`, `reset`, or `cleanup` capabilities (derive only for this slice)
- actual process launch or termination
- PID file creation or readiness checks
- any filesystem effects
- endpoint providers
- CLI changes
- core changes

## Architectural stance

The process-scoped provider is a concrete provider package.

It depends on `@multiverse/provider-contracts` and `node:path` only.

Core and CLI are not changed.

State directory derivation must not interact with the filesystem — it is pure path computation.

The `command` field is stored in the provider configuration at registration time. It is not used in the derive operation for this slice, but must be accepted and stored for use in future lifecycle slices.

## Handle derivation rule

A state directory path is derived by joining the configured base directory, the resource name, and the worktree ID:

```
stateDir = {baseDir}/{resourceName}/{worktreeId}/
```

This directory is the isolated provider-managed workspace for the worktree's scoped process instance. It becomes the `DerivedResourcePlan.handle`.

Consumers use this handle to locate provider-managed state. They must not assume the internal layout of the directory.

## Acceptance criteria

- a valid worktree instance and a configured base directory derive a state directory path in the form `{baseDir}/{resourceName}/{worktreeId}/`
- two distinct worktree IDs derive two distinct state directories for the same base directory and resource name
- the same worktree ID, base directory, and resource name always derive the same state directory
- missing worktree ID is refused as `unsafe_scope`
- the provider satisfies the resource provider contract
- existing 172 tests remain green

## Expected artifacts

- `packages/provider-process-scoped/package.json`
- `packages/provider-process-scoped/src/index.ts`
- `tests/contracts/resource-provider.process-scoped.contract.test.ts`
- `tests/acceptance/dev-slice-21.acceptance.test.ts`

## Definition of done

This slice is done when `@multiverse/provider-process-scoped` exists as an explicit workspace package, satisfies the resource provider contract for the derive capability, and acceptance tests prove deterministic process-scoped handle derivation and correct refusal behavior.
