# Dev Slice 17 — Path-Scoped Provider Lifecycle: Reset and Cleanup

## Status

Implemented on `main`

## Intent

Add `reset` and `cleanup` capabilities to `@multiverse/provider-path-scoped` for provider-managed filesystem state.

For path-scoped resources such as SQLite files and artifact directories, cleanup is the primary lifecycle operation because the provider owns the filesystem path directly. Reset and cleanup are effectful in 1.0 for this provider: they delete only the derived path for the target worktree instance.

This differs from Slice 16. Name-scoped reset and cleanup remain scope-confirmation only in 1.0. Path-scoped reset and cleanup are effectful only because the state is provider-managed filesystem state with an explicit derived path handle.

## Scope

- `packages/provider-path-scoped/src/index.ts` — add capabilities + methods
- `tests/contracts/resource-provider.path-scoped.contract.test.ts` — extend
- `tests/acceptance/dev-slice-17.acceptance.test.ts`
- slice and task docs

## Out of scope

- validate capability
- name-scoped provider (done in Slice 16)
- generic orchestration or application hooks around destructive actions
- technology-specific destructive behavior for non-filesystem resources

## Acceptance criteria

- `resetOneResource` succeeds for a path-scoped resource with `scopedReset: true`
- `cleanupOneResource` succeeds for a path-scoped resource with `scopedCleanup: true`
- reset deletes only the derived path for the targeted worktree instance
- cleanup deletes only the derived path for the targeted worktree instance
- one worktree's reset or cleanup does not affect another worktree's isolated path
- both include the derived path handle in the result
- both refuse with `unsafe_scope` when worktree ID is absent
- all existing 110 tests remain green

## Definition of done

This slice is done when `@multiverse/provider-path-scoped` performs destructive reset and cleanup for provider-managed filesystem state at the derived worktree path, preserves worktree-instance boundaries, and the tests prove that behavior end-to-end.
