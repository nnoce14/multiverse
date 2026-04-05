# Dev Slice 14 — First Concrete Resource Provider: Name-Scoped

## Status

Implemented on `main`

## Intent

Introduce `@multiverse/provider-name-scoped` as the first concrete production resource provider.

This slice is required before sample project verification. The `derive` command needs both a resource provider and an endpoint provider — the port endpoint provider from Slice 13 covers the endpoint side, but no production resource provider exists yet.

## Why this slice next

Every real Node.js app that uses a local database, queue, or any name-identified backing service needs a name-scoped resource provider. It is the most common isolation strategy in the 1.0 resource model.

A name-scoped provider is also the simplest possible resource provider — it derives a unique handle by combining the resource base name and the worktree ID. No filesystem, no infrastructure, no external dependencies.

## Slice objective

Implement the name-scoped resource provider such that:

1. `@multiverse/provider-name-scoped` exists as an explicit workspace package
2. the provider exports `createNameScopedProvider()` returning a `ResourceProvider`
3. the provider derives a stable handle in the form `{resourceName}_{worktreeId}` for each worktree instance
4. derivation is deterministic and requires no external state
5. the provider refuses with `unsafe_scope` when worktree ID is absent
6. resource provider contract tests cover the name-scoped provider
7. acceptance tests prove end-to-end derive behavior with real name-scoped handles

## Scope

This slice includes:

- a new `packages/provider-name-scoped` workspace package
- a `createNameScopedProvider()` factory export
- deterministic handle derivation: `{resourceName}_{worktreeId}`
- refusal with `unsafe_scope` when worktree ID is absent
- resource provider contract test for the name-scoped provider
- acceptance tests (dev-slice-14)
- slice and task docs

## Out of scope

- `validate`, `reset`, or `cleanup` capabilities (derive only for this slice)
- configurable separator or handle format
- endpoint providers
- CLI changes
- core changes

## Architectural stance

The name-scoped provider is a concrete provider package.

It depends on `@multiverse/provider-contracts` only.

Core and CLI are not changed.

Handle derivation must not depend on runtime state or external configuration.

## Handle derivation rule

A handle is derived by combining the resource name and the worktree ID with an underscore separator:

```
handle = {resourceName}_{worktreeId}
```

This handle is the isolated identifier that downstream consumers (e.g. database names, schema names, queue names) use for the worktree's scoped resource.

## Acceptance criteria

- a valid worktree instance derives a handle in the form `{resourceName}_{worktreeId}`
- two distinct worktree IDs derive two distinct handles for the same resource name
- the same worktree ID and resource name always derive the same handle
- missing worktree ID is refused as `unsafe_scope`
- the provider satisfies the resource provider contract
- existing 85 tests remain green

## Expected artifacts

- `packages/provider-name-scoped/package.json`
- `packages/provider-name-scoped/index.ts`
- `packages/provider-name-scoped/src/index.ts`
- `tests/contracts/resource-provider.name-scoped.contract.test.ts`
- `tests/acceptance/dev-slice-14.acceptance.test.ts`

## Definition of done

This slice is done when `@multiverse/provider-name-scoped` exists as an explicit workspace package, satisfies the resource provider contract for the derive capability, and acceptance tests prove deterministic name-scoped handle derivation and correct refusal behavior.
