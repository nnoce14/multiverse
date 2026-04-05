# Dev Slice 20 — Multi-Resource Derive and Validate

## Status

Implemented on `main`

## Intent

Remove the artificial 1-resource/1-endpoint limit from `deriveAndValidateOne`.

`deriveAndValidateOne` still routes through `resolveSliceExecution`, which enforces exactly-1-resource and exactly-1-endpoint via `resolveSliceDeclarations`. Both constraints are wrong for a function whose job is to derive all declared resources and endpoints and then validate the ones that declare the capability.

## Business truth grounding

From `docs/spec/repository-configuration.md`:
- No count constraint is stated for managed resources or endpoints.

From `docs/spec/safety-and-refusal.md`:
- "In 1.0, the tool does not use best-effort behavior when safety is ambiguous."
- If any declared resource declares a capability intent that the provider cannot fulfill, the whole operation fails before any derivation.

## Slice objective

Update the derive+validate path such that:

1. All declared resources are derived in declaration order (fail-fast on first derive refusal).
2. All declared endpoints are derived in declaration order (fail-fast on first derive refusal).
3. For each resource that declares `scopedValidate: true`, the provider's `validateResource` is called immediately after its `deriveResource` (fail-fast on first validation refusal).
4. Resources that do not declare `scopedValidate: true` are derived but not validated — this is not a refusal.
5. If no resources declare `scopedValidate: true`, `deriveAndValidateOne` still succeeds with an empty `resourceValidations` array (unlike reset/cleanup, validate is supplemental and not required).
6. Capability pre-flight check: if any resource declares a capability intent (`scopedValidate`, `scopedReset`, or `scopedCleanup`) that its provider cannot fulfill, the operation refuses before any derivation.

## Scope

- `packages/core/src/orchestration.ts` — add `resolveAndDeriveAllWithValidation`; remove dead `resolveSlicePreflight`, `resolveSliceExecution`, and their helpers
- `packages/core/src/index.ts` — update `deriveAndValidateOne` to use new path; remove dead `validateResourcePlan` helper
- `tests/acceptance/dev-slice-20.acceptance.test.ts`
- slice and task docs

## Out of scope

- CLI changes
- Provider changes
- Existing test modifications (all 137 must stay green)

## Acceptance criteria

- A repository with 2 resources both declaring `scopedValidate: true` → both derived and validated, `resourceValidations` has 2 entries
- A repository with 2 resources where only 1 declares `scopedValidate: true` → only that resource validated, `resourceValidations` has 1 entry
- A repository with 2 resources and none declare `scopedValidate: true` → succeeds, `resourceValidations` is empty
- If the second resource's validation refuses → fail-fast, operation returns that refusal
- A repository with 2 resources and 2 endpoints → `resourcePlans` has 2, `endpointMappings` has 2
- A repository with 2 resources and 0 endpoints → still succeeds (endpoint count not enforced)
- All existing 137 tests remain green

## Definition of done

This slice is done when `deriveAndValidateOne` handles any number of declared resources and endpoints, the old single-resource orchestration functions are removed, and all existing and new tests pass.
