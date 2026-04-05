# Dev Slice 20 — Task 01

## Title

Remove the 1-resource/1-endpoint limit from core derive and validate orchestration

## Sources of truth

- `docs/spec/repository-configuration.md`
- `docs/spec/safety-and-refusal.md`
- `docs/development/dev-slice-20.md`

## In scope

- `packages/core/src/orchestration.ts`
- `packages/core/src/index.ts`
- `tests/acceptance/dev-slice-20.acceptance.test.ts`
- slice and task docs

## Out of scope

- CLI changes
- Provider changes
- Existing test modifications (all 137 must stay green)

## Acceptance criteria

- 2 resources with `scopedValidate: true` → both validated, `resourceValidations` has 2 entries
- 2 resources, only 1 with `scopedValidate: true` → `resourceValidations` has 1 entry
- 2 resources, none with `scopedValidate: true` → succeeds with empty `resourceValidations`
- 2nd resource validation refusal → fail-fast, operation returns that refusal
- 2 resources + 2 endpoints → `resourcePlans` has 2, `endpointMappings` has 2
- 0 endpoints in repository → still succeeds
- All existing 137 tests remain green

## Key implementation note

Add `resolveAndDeriveAllWithValidation` to `orchestration.ts`. This function:
1. Validates worktree identity
2. Validates repository configuration
3. For each resource in declaration order: checks capability pre-flight, derives, and (if `scopedValidate: true`) validates — fail-fast on any refusal
4. For each endpoint in declaration order: derives — fail-fast on any refusal
5. Returns all plans, mappings, and validations

Update `deriveAndValidateOne` in `index.ts` to call the new function.

Remove dead code: `resolveSlicePreflight`, `resolveSliceExecution`, `resolveSliceDeclarations`, `resolveSliceProviders`, their associated interfaces, and the `validateResourcePlan` helper in `index.ts`.
