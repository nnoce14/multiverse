# Dev Slice 17 — Path-Scoped Provider Lifecycle: Reset and Cleanup

## Status

Implemented on `main`

## Intent

Add `reset` and `cleanup` capabilities to `@multiverse/provider-path-scoped`, following the same scope-confirmation model established in Slice 16.

For path-scoped resources (SQLite files, artifact directories), cleanup is the primary lifecycle operation — it tells the consumer which path to remove when a worktree is retired. Reset tells the consumer which path to clear and reinitialize.

## Scope

- `packages/provider-path-scoped/src/index.ts` — add capabilities + methods
- `tests/contracts/resource-provider.path-scoped.contract.test.ts` — extend
- `tests/acceptance/dev-slice-17.acceptance.test.ts`
- slice and task docs

## Out of scope

- validate capability
- actual filesystem operations
- name-scoped provider (done in Slice 16)

## Acceptance criteria

- `resetOneResource` succeeds for a path-scoped resource with `scopedReset: true`
- `cleanupOneResource` succeeds for a path-scoped resource with `scopedCleanup: true`
- both include the derived path handle in the result
- both refuse with `unsafe_scope` when worktree ID is absent
- all existing 110 tests remain green

## Status

In progress
