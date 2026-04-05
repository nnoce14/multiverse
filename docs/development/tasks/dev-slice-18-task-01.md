# Dev Slice 18 — Task 01

## Title

Remove the 1-resource/1-endpoint limit from core derive orchestration

## Sources of truth

- `docs/spec/repository-configuration.md`
- `docs/spec/safety-and-refusal.md`
- `docs/development/dev-slice-18.md`

## In scope

- `packages/core/src/orchestration.ts`
- `packages/core/src/index.ts`
- `tests/acceptance/dev-slice-18.acceptance.test.ts`
- slice and task docs

## Out of scope

- multi-resource reset or cleanup
- CLI changes
- provider changes
- existing test modifications (all 120 must stay green)

## Acceptance criteria

- 2 resources + 1 endpoint → all derived successfully
- 1 resource + 2 endpoints → all derived successfully
- 2nd resource refusal → fail-fast, operation returns that refusal
- 0 resources + 0 endpoints → succeeds with empty arrays
- all existing 120 tests remain green

## Key implementation note

The `resolveSliceDeclarations` function in orchestration.ts currently enforces `repository.resources.length !== 1` and `repository.endpoints.length !== 1`. Remove this enforcement and instead iterate all declared resources and endpoints.

The `resourceCountReason` and `endpointCountReason` parameters throughout the call chain can be removed once the count check is gone.
