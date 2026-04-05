# Dev Slice 14 — Task 01

## Title

Implement the name-scoped resource provider package

## Objective

Introduce `@multiverse/provider-name-scoped` as the first concrete production resource provider, prove it satisfies the resource provider contract for derive, and add acceptance coverage for deterministic name-scoped handle derivation.

## Sources of truth

Ground this task in:

- `docs/adr/0004-resource-isolation-strategies.md`
- `docs/adr/0005-providers-implement-isolation-contracts.md`
- `docs/adr/0009-core-provider-repository-and-application-boundaries-are-explicit.md`
- `docs/spec/provider-model.md`
- `docs/spec/resource-isolation.md`
- `docs/spec/safety-and-refusal.md`
- `docs/development/dev-slice-14.md`
- `docs/development/dev-slice-14-scenario-map.md`

## Required outcome

Implement the minimum production change such that:

- `@multiverse/provider-name-scoped` exists as an explicit workspace package
- the provider exports `createNameScopedProvider()`
- the provider derives a stable `{resourceName}_{worktreeId}` handle for a given resource and worktree ID
- derivation is deterministic and requires no external state
- the provider refuses with `unsafe_scope` when worktree ID is absent
- resource provider contract tests cover the name-scoped derive behavior
- acceptance tests prove the above behaviors end-to-end

## In scope

- `packages/provider-name-scoped/` workspace package
- `createNameScopedProvider()` factory function
- `{resourceName}_{worktreeId}` handle derivation
- `tests/contracts/resource-provider.name-scoped.contract.test.ts`
- `tests/acceptance/dev-slice-14.acceptance.test.ts`
- workspace registration (root `package.json` devDependencies)

## Out of scope

- `validate`, `reset`, or `cleanup` capabilities
- configurable separator
- endpoint providers
- CLI changes
- core changes
- changes to existing tests

## Acceptance criteria

- the provider derives `{resourceName}_{worktreeId}` for a valid worktree ID
- two distinct worktree IDs produce two distinct handles for the same resource name
- the same resource name and worktree ID always produce the same handle
- missing worktree ID produces a refusal with category `unsafe_scope`
- contract tests pass for the name-scoped provider
- all existing 85 tests remain green

## Safety and boundary expectations

- the new package depends only on `@multiverse/provider-contracts`
- no Node.js built-ins beyond what TypeScript requires
- core and CLI are not changed
- handle derivation must not depend on runtime state or environment
