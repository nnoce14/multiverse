# Dev Slice 19 — Task 01

## Title

Remove the 1-resource/1-endpoint limit from core reset and cleanup orchestration

## Sources of truth

- `docs/spec/repository-configuration.md`
- `docs/spec/safety-and-refusal.md`
- `docs/development/dev-slice-19.md`

## In scope

- `packages/core/src/orchestration.ts`
- `packages/core/src/index.ts`
- `tests/acceptance/dev-slice-19.acceptance.test.ts`
- slice and task docs

## Out of scope

- Multi-endpoint lifecycle
- CLI changes
- Provider changes
- Existing test modifications (all 126 must stay green)

## Acceptance criteria

- 2 resources with `scopedReset: true` → both reset successfully
- 2 resources, only 1 with `scopedReset: true` → only that resource reset
- 2 resources, none with `scopedReset: true` → `invalid_configuration`
- 2nd resource reset refusal → fail-fast, operation returns that refusal
- 2 resources with `scopedCleanup: true` → both cleaned up successfully
- 0 endpoints in repository → reset/cleanup still succeeds (endpoints ignored)
- All existing 126 tests remain green

## Key implementation note

Add `resolveAndResetAll` and `resolveAndCleanupAll` to `orchestration.ts`. These functions:
1. Validate worktree (same as `resolveAndDeriveAll`)
2. Validate repository configuration
3. Iterate resources — skip those without the capability declared, fail-fast on first refusal
4. Return `invalid_configuration` if no resources declare the capability

Update `resetOneResource` and `cleanupOneResource` in `index.ts` to call the new functions instead of `resolveSlicePreflight`.
