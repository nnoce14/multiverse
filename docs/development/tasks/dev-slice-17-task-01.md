# Dev Slice 17 — Task 01

## Title

Add reset and cleanup capabilities to the path-scoped resource provider

## Sources of truth

- `docs/spec/provider-model.md`
- `docs/spec/resource-isolation.md`
- `docs/spec/safety-and-refusal.md`
- `docs/development/dev-slice-17.md`

## In scope

- `packages/provider-path-scoped/src/index.ts`
- `tests/contracts/resource-provider.path-scoped.contract.test.ts`
- `tests/acceptance/dev-slice-17.acceptance.test.ts`
- slice and task docs

## Out of scope

- validate capability
- name-scoped or other providers
- generic orchestration or consumer hooks for destructive actions
- non-filesystem destructive behavior

## Acceptance criteria

- `resetOneResource` succeeds with structured result for path-scoped resource
- `cleanupOneResource` succeeds with structured result for path-scoped resource
- reset deletes the derived path for the targeted worktree instance
- cleanup deletes the derived path for the targeted worktree instance
- another worktree's derived path remains unaffected
- unsafe_scope returned when worktree ID absent
- all existing 110 tests remain green
