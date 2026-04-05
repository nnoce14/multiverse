# Dev Slice 18 — Multi-Resource and Multi-Endpoint Derive

## Status

Implemented on `main`

## Intent

Remove the artificial 1-resource-and-1-endpoint limit from core derive orchestration.

The repository spec declares no count constraint — every declared resource and endpoint must be managed, but the tool does not limit how many may be declared. The 1-of-each enforcement was an early implementation boundary introduced to keep the initial slices narrow.

Real applications declare multiple resources (primary database, cache, search index) and potentially multiple endpoints. Without this change, the tool cannot serve a representative real-world application.

## Business truth grounding

From `docs/spec/repository-configuration.md`:
- "In 1.0, every managed resource must be declared explicitly" — no count limit stated
- "A managed resource is omitted from declaration" is a validity failure — but zero or many are not disallowed

From `docs/spec/safety-and-refusal.md`:
- "In 1.0, the tool does not use best-effort behavior when safety is ambiguous"
- If any declared resource or endpoint cannot be derived safely, the whole operation fails

## Slice objective

Update the core derive path such that:

1. `deriveOne` accepts a repository configuration with any number of resources and endpoints
2. all declared resources are derived and all declared endpoints are derived in one call
3. if any resource or endpoint fails to derive (refusal), the whole operation returns that refusal
4. successful result contains all derived resource plans and all endpoint mappings (already array-typed)
5. a repository with zero resources and zero endpoints derives successfully with empty arrays

## Refusal semantics for multi-resource derive

Fail-fast: the first refusal encountered during derivation stops the operation and is returned.

This is consistent with the spec: the tool refuses rather than guessing, and does not return partial results when any declared object cannot be safely scoped.

## Evaluation order — intentional 1.0 behavior

Resources are evaluated before endpoints, both in declaration order.

This ordering is intentional and defined:

1. All resources are derived in declaration order (fail-fast on first refusal).
2. All endpoints are derived in declaration order (fail-fast on first refusal).

Callers may rely on this order. A refusal from resource index N will always precede any endpoint evaluation. This makes refusal output predictable and testable.

## Scope

- `packages/core/src/orchestration.ts` — remove 1-of-each count enforcement, iterate all resources and endpoints
- `packages/provider-contracts/src/index.ts` — remove `resourceCountReason`/`endpointCountReason` from `ResolvedSliceDeclarations` if present, result type shape unchanged
- `packages/core/src/index.ts` — update `deriveOne` to pass through without count reasons
- `tests/acceptance/dev-slice-18.acceptance.test.ts`
- slice and task docs

## Out of scope

- multi-resource reset or cleanup (those remain single-resource in 1.0)
- count validation rules (the spec does not prescribe a minimum count)
- CLI changes
- provider changes

## Acceptance criteria

- a repository with 2 resources and 1 endpoint derives all 3 objects successfully
- a repository with 1 resource and 2 endpoints derives all 3 objects successfully
- if the second resource fails to derive, the operation returns that refusal (fail-fast)
- if the second endpoint fails to derive, the operation returns that refusal (fail-fast)
- resources are evaluated before endpoints (evaluation order is intentional)
- a repository with 0 resources and 0 endpoints derives successfully with empty arrays
- all existing 120 tests remain green

## Definition of done

This slice is done when `deriveOne` handles any number of declared resources and endpoints, fail-fast refusal semantics are proven by tests, and all existing tests remain green.
