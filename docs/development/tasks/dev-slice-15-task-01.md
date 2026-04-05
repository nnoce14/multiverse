# Dev Slice 15 — Task 01

## Title

Implement the path-scoped resource provider package

## Objective

Introduce `@multiverse/provider-path-scoped` as the second concrete production resource provider, prove it satisfies the resource provider contract for derive, and add acceptance coverage for deterministic path-scoped derivation.

## Sources of truth

Ground this task in:

- `docs/adr/0004-resource-isolation-strategies.md`
- `docs/adr/0005-providers-implement-isolation-contracts.md`
- `docs/spec/provider-model.md`
- `docs/spec/resource-isolation.md`
- `docs/spec/safety-and-refusal.md`
- `docs/development/dev-slice-15.md`
- `docs/development/dev-slice-15-scenario-map.md`

## Required outcome

- `@multiverse/provider-path-scoped` exists as an explicit workspace package
- the provider exports `createPathScopedProvider(config: { baseDir: string })`
- the provider derives a stable `{baseDir}/{resourceName}/{worktreeId}` path for a given resource and worktree ID
- derivation is deterministic, pure path computation — no filesystem interaction
- the provider refuses with `unsafe_scope` when worktree ID is absent
- resource provider contract tests cover the path-scoped derive behavior
- acceptance tests prove the above behaviors end-to-end

## In scope

- `packages/provider-path-scoped/` workspace package
- `createPathScopedProvider(config: { baseDir: string })` factory function
- `{baseDir}/{resourceName}/{worktreeId}` path derivation using `node:path`
- `tests/contracts/resource-provider.path-scoped.contract.test.ts`
- `tests/acceptance/dev-slice-15.acceptance.test.ts`
- workspace registration (root `package.json` devDependencies)
- `.gitignore` update to exclude `.claude/data/`

## Out of scope

- `validate`, `reset`, or `cleanup` capabilities
- filesystem interaction (no `mkdir`, `stat`, `exists`)
- endpoint providers
- CLI changes
- core changes

## Acceptance criteria

- the provider derives `{baseDir}/{resourceName}/{worktreeId}` for a valid worktree ID
- two distinct worktree IDs produce two distinct paths
- the same inputs always produce the same path
- missing worktree ID produces a refusal with category `unsafe_scope`
- contract tests pass for the path-scoped provider
- all existing 93 tests remain green

## Safety and boundary expectations

- the new package depends only on `@multiverse/provider-contracts` and `node:path`
- no filesystem reads or writes — path derivation is pure computation
- core and CLI are not changed
