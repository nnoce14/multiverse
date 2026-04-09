# Dev Slice 46 — Task 01

## Title

Validate capability resolution — implement path-scoped validateResource

## Sources of truth

- `docs/development/dev-slice-44.md` — Slice 46 definition and decision criteria
- `docs/development/dev-slice-44-scenario-map.md` — Seam 2 gap inventory
- `docs/spec/provider-model.md` — validate capability definition
- `docs/spec/resource-isolation.md` — resource declaration requirements (scopedValidate missing)
- `docs/spec/safety-and-refusal.md` — refusal categories
- `docs/guides/provider-authoring-guide.md` — capabilities section to update

## Decision rationale

The validate seam is NOT deferred. Evidence:

- `ProviderCapabilities.validate?: true` and `validateResource?` are defined in
  `@multiverse/provider-contracts`
- `resolveAndDeriveAllWithValidation()` in core fully checks `scopedValidate`, verifies
  capability, calls `validateResource()`, and returns `ResourceValidation[]`
- The CLI `validate` command is fully implemented
- Acceptance tests for the validate seam already cover the general path via testkit

The gap is narrow: no first-party production provider implements `validateResource()`, and
`scopedValidate` is absent from `docs/spec/resource-isolation.md`.

For path-scoped, "verify derived scope is usable" (the spec's definition of validate) maps
directly to "check that the derived filesystem path exists and is accessible." This is
provider-specific, bounded to one `accessSync` call, and closes the seam honestly.

Option A (narrow implementation) is chosen. Option B (explicit deferral) would misrepresent
a fully-wired seam as deferred.

## In scope

- `packages/provider-path-scoped/src/index.ts`
  - Add `validate: true` to capabilities
  - Add `validateResource` method: checks `worktree.id`, calls `accessSync(derived.handle)`,
    returns `ResourceValidation` on success, `provider_failure` Refusal if path not accessible

- `docs/spec/resource-isolation.md`
  - Add `scopedValidate` to resource declaration requirements list (was omitted; field is
    optional and defaults to false)

- `docs/scenarios/resource-isolation.scenarios.md`
  - Add two scenarios: path-scoped validate confirms accessible path; path-scoped validate
    refuses when path not accessible

- `docs/guides/provider-authoring-guide.md`
  - Add `validate: true` to capabilities example; add minimal `validateResource` example

- `tests/contracts/resource-provider.path-scoped.contract.test.ts`
  - Add validate contract tests: declares capability, succeeds when path exists, refuses
    on unsafe scope, refuses when path not accessible

- `docs/development/current-state.md`
  - Add Slice 46 proving result entry

## Out of scope

- Validate implementation for name-scoped, process-scoped, or process-port-scoped
- Validate for endpoint providers
- New refusal categories
- Changes to the CLI validate command surface or output format
- Slice 47/48/49 work
- Any implementation beyond path-scoped

## Acceptance criteria

- `pnpm test:contracts` passes including new path-scoped validate contract tests
- `pnpm test:acceptance` passes (existing validate acceptance tests remain green)
- `pnpm typecheck` passes
- `scopedValidate: true` on a path-scoped resource with an existing path produces a
  `ResourceValidation` result through the CLI validate command
- `scopedValidate: true` on a path-scoped resource with a non-existent path produces a
  `provider_failure` Refusal through the CLI validate command
- `docs/spec/resource-isolation.md` lists `scopedValidate` as an optional declaration field
- No implementation changes outside `provider-path-scoped`
