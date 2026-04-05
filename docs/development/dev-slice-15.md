# Dev Slice 15 — Second Concrete Resource Provider: Path-Scoped

## Status

Implemented on `main`

## Intent

Introduce `@multiverse/provider-path-scoped` as the second concrete production resource provider, covering the path-scoped isolation strategy.

Path-scoped resources isolate state through a unique filesystem path per worktree instance — the right strategy for SQLite databases, artifact directories, local emulator workspaces, and any file-based mutable state.

## Why this slice after Slice 14

Slice 14 established the concrete provider package pattern with name-scoped. Path-scoped is the second most common isolation strategy for Node.js local development. Together with name-scoped and the port endpoint provider, these three providers cover the majority of 1.0 use cases.

## Slice objective

Implement the path-scoped resource provider such that:

1. `@multiverse/provider-path-scoped` exists as an explicit workspace package
2. the provider exports `createPathScopedProvider(config: { baseDir: string })` returning a `ResourceProvider`
3. the provider derives a stable path in the form `{baseDir}/{resourceName}/{worktreeId}` for each worktree instance
4. derivation is deterministic and requires no external state
5. the provider refuses with `unsafe_scope` when worktree ID is absent
6. resource provider contract tests cover the path-scoped provider
7. acceptance tests prove end-to-end derive behavior with real path-scoped handles

## Scope

This slice includes:

- a new `packages/provider-path-scoped` workspace package
- a `createPathScopedProvider(config: { baseDir: string })` factory export
- deterministic path derivation: `{baseDir}/{resourceName}/{worktreeId}`
- refusal with `unsafe_scope` when worktree ID is absent
- resource provider contract test for the path-scoped provider
- acceptance tests (dev-slice-15)
- slice and task docs

## Out of scope

- `validate`, `reset`, or `cleanup` capabilities (derive only for this slice)
- path normalization or platform-specific separators beyond `node:path`
- endpoint providers
- CLI changes
- core changes

## Architectural stance

The path-scoped provider is a concrete provider package.

It depends on `@multiverse/provider-contracts` and `node:path` only.

Core and CLI are not changed.

Path derivation must not interact with the filesystem — it is pure path computation.

## Path derivation rule

A path is derived by joining the configured base directory, the resource name, and the worktree ID:

```
path = {baseDir}/{resourceName}/{worktreeId}
```

This path is the isolated filesystem location that downstream consumers use for the worktree's scoped resource (e.g. a SQLite file at `{path}/db.sqlite`, or an artifact directory at `{path}/`).

The derived handle is the full path string.

## Acceptance criteria

- a valid worktree instance and a configured base directory derive a path in the form `{baseDir}/{resourceName}/{worktreeId}`
- two distinct worktree IDs derive two distinct paths for the same base directory and resource name
- the same worktree ID, base directory, and resource name always derive the same path
- missing worktree ID is refused as `unsafe_scope`
- the provider satisfies the resource provider contract
- existing 93 tests remain green

## Expected artifacts

- `packages/provider-path-scoped/package.json`
- `packages/provider-path-scoped/index.ts`
- `packages/provider-path-scoped/src/index.ts`
- `tests/contracts/resource-provider.path-scoped.contract.test.ts`
- `tests/acceptance/dev-slice-15.acceptance.test.ts`

## Definition of done

This slice is done when `@multiverse/provider-path-scoped` exists as an explicit workspace package, satisfies the resource provider contract for the derive capability, and acceptance tests prove deterministic path-scoped derivation and correct refusal behavior.
