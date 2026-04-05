# Dev Slice 16 — Task 01

## Title

Add reset and cleanup capabilities to the name-scoped resource provider

## Sources of truth

- `docs/adr/0008-unsafe-operations-are-refused-in-1-0.md`
- `docs/spec/provider-model.md`
- `docs/spec/resource-isolation.md`
- `docs/spec/safety-and-refusal.md`
- `docs/development/dev-slice-16.md`

## In scope

- `packages/provider-name-scoped/src/index.ts`
- `tests/contracts/resource-provider.name-scoped.contract.test.ts`
- `tests/acceptance/dev-slice-16.acceptance.test.ts`
- slice and task docs

## Out of scope

- validate capability
- actual database operations
- path-scoped provider
- CLI or core changes

## Acceptance criteria

- `resetOneResource` succeeds with `{ ok: true, resourceResets: [...] }` for a name-scoped resource
- `cleanupOneResource` succeeds with `{ ok: true, resourceCleanups: [...] }` for a name-scoped resource
- both refuse with `unsafe_scope` when worktree ID is absent
- all existing 100 tests remain green
