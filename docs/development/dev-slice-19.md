# Dev Slice 19 — Multi-Resource Reset and Cleanup

## Status

Implemented on `main`

## Intent

Remove the artificial 1-resource/1-endpoint limit from core reset and cleanup orchestration.

`resetOneResource` and `cleanupOneResource` route through `resolveSlicePreflight`, which enforces exactly-1-resource and exactly-1-endpoint via `resolveSliceDeclarations`. Both constraints are wrong for lifecycle operations:

- Endpoint declarations have no relevance to reset or cleanup.
- Real applications declare multiple resources; all resources that declare the capability must be targeted in one call.

## Business truth grounding

From `docs/spec/repository-configuration.md`:
- No count constraint is stated for managed resources.
- Every declared resource must be managed — reset/cleanup applies to all that declare the capability.

From `docs/spec/safety-and-refusal.md`:
- "In 1.0, the tool does not use best-effort behavior when safety is ambiguous."
- If any declared resource cannot be reset or cleaned up safely, the whole operation fails.

## Slice objective

Update the reset and cleanup paths such that:

1. All resources that declare `scopedReset: true` are reset in one call (fail-fast on first refusal).
2. All resources that declare `scopedCleanup: true` are cleaned up in one call (fail-fast on first refusal).
3. Resources that do not declare the capability are skipped (not a refusal).
4. If no resources declare the capability, `invalid_configuration` is returned — calling reset/cleanup when nothing is configured for it is a configuration error.
5. Endpoint declarations are completely ignored in reset and cleanup paths.

## Evaluation order

Resources are evaluated in declaration order. Fail-fast applies: the first refusal from any resource stops the operation.

## Scope

- `packages/core/src/orchestration.ts` — add `resolveAndResetAll` and `resolveAndCleanupAll`
- `packages/core/src/index.ts` — update `resetOneResource` and `cleanupOneResource` to use new paths
- `tests/acceptance/dev-slice-19.acceptance.test.ts`
- slice and task docs

## Out of scope

- Multi-endpoint lifecycle (endpoints have no lifecycle operations in 1.0)
- CLI changes
- Provider changes
- Existing test modifications (all 126 must stay green)

## Acceptance criteria

- A repository with 2 resources both declaring `scopedReset: true` → both are reset successfully
- A repository with 2 resources where only 1 declares `scopedReset: true` → only that resource is reset
- A repository with 2 resources and none declare `scopedReset: true` → `invalid_configuration`
- If the second resource's reset provider returns a refusal → fail-fast, operation returns that refusal
- A repository with 2 resources both declaring `scopedCleanup: true` → both are cleaned up successfully
- Endpoints in the repository are ignored (reset/cleanup succeeds even with 0 endpoints declared)
- All existing 126 tests remain green

## Definition of done

This slice is done when `resetOneResource` and `cleanupOneResource` handle any number of declared resources, endpoints are ignored, fail-fast refusal semantics are proven by tests, and all existing tests remain green.
