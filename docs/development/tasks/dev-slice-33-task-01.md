# Dev Slice 33 — Task 01

## Title

Resource provider derive compliance suite

## Sources of truth

- `docs/adr/0005-providers-implement-isolation-contracts.md`
- `docs/adr/0009-core-provider-repository-and-application-boundaries-are-explicit.md`
- `docs/spec/provider-model.md`
- `docs/scenarios/provider-model.scenarios.md`
- `packages/provider-contracts/src/index.ts`
- `docs/guides/provider-authoring-guide.md`

## Motivation

Slice 32 proved that a non-first-party provider can be authored against
`@multiverse/provider-contracts` and consumed through the core/registry seam.
The authoring guide explains how to write a provider. The remaining
repeatability gap is compliance verification: a provider author has no
documented, executable path for knowing whether their `deriveResource`
implementation is contract-compliant.

The endpoint side already solved this. `tests/contracts/endpoint-provider.derive.contract.test.ts`
is a single parameterized file using `describe.each` that covers the universal
derive contract requirements for endpoint providers. Adding a new endpoint
provider to the compliance suite takes one entry in `providerCases`.

The resource side has no equivalent. There are eight separate per-provider
contract test files, each written in bespoke style. A new resource provider
author reading these files cannot easily tell which tests are universal
requirements vs. provider-specific assertions, and has no documented path to
verify their own provider.

This slice closes that gap by adding a parameterized derive compliance suite
for resource providers, mirroring what the endpoint side already has.

## Truth-alignment note

This slice does not prove CLI invocation compliance or end-to-end integration
for a non-first-party provider. It proves that the universal `deriveResource`
contract requirements are explicit, executable, and usable by any provider
author — including one who only has access to `@multiverse/provider-contracts`.

The existing per-provider contract test files (lifecycle, reset, cleanup) are
not replaced or consolidated by this slice. They remain the authoritative source
for provider-specific and lifecycle-capability behavior.

## In scope

- `tests/contracts/resource-provider.derive.contract.test.ts` (new)
  - Parameterized with `describe.each` over a `providerCases` array
  - Covers all four existing first-party resource providers:
    - `name-scoped` via `createNameScopedProvider()`
    - `path-scoped` via `createPathScopedProvider({ baseDir: "/tmp/multiverse-compliance" })`
    - `process-scoped` via `createProcessScopedProvider({ ... })`
    - `process-port-scoped` via `createProcessPortScopedProvider({ ... })`
  - Also includes a non-first-party inline resource provider using only
    `@multiverse/provider-contracts` types (mirroring the Slice 32 proof)
  - Universal compliance assertions per case:
    - `deriveResource` returns a `DerivedResourcePlan` for valid input
    - Result echoes `resourceName`, `provider`, `isolationStrategy`, `worktreeId`
    - `handle` is a non-empty string
    - Derive is deterministic: same input → same output
    - Different `worktree.id` values produce different handles
    - Returns a `Refusal` with `category: "unsafe_scope"` when `worktree.id` is absent

- `docs/guides/provider-authoring-guide.md` (update)
  - Add a short "Verifying compliance" section explaining that a provider
    author can verify their `deriveResource` implementation by adding it to
    `tests/contracts/resource-provider.derive.contract.test.ts` and running
    `pnpm test:contracts`
  - Keep it brief — one short paragraph pointing to the file

## Out of scope

- Consolidating or replacing existing per-provider contract test files
- Lifecycle compliance (reset, cleanup, validate) — remain in existing files
- Endpoint provider compliance — already covered by existing parameterized test
- CLI or runtime integration proof for non-first-party providers
- Testkit helper functions or new testkit API surface
- New provider packages
- Core changes
- CLI changes
- Version bump

## Acceptance criteria

- `tests/contracts/resource-provider.derive.contract.test.ts` exists and is
  parameterized over at least five cases (four first-party + one non-first-party)
- All five cases pass the same universal derive assertions
- The non-first-party case imports only from `@multiverse/provider-contracts`
  (no imports from any concrete provider package or core internals)
- `pnpm test:contracts` passes (all existing contract tests continue to pass)
- The provider authoring guide includes a brief "Verifying compliance" section
  referencing this file

## Safety and refusal expectations

- The `unsafe_scope` refusal test must be present for every case in the suite
- This test verifies that each provider refuses — rather than silently
  proceeding — when `worktree.id` is absent

## Files expected to change

- `tests/contracts/resource-provider.derive.contract.test.ts` (new)
- `docs/guides/provider-authoring-guide.md` (update — add compliance section)
- `docs/development/tasks/dev-slice-33-task-01.md` (this file)

## Truth-alignment on completion

On slice completion, review:
- `docs/development/current-state.md` — update the proving result and priority
- `docs/development/repo-map.md` — update slice count (32 → 33)
- No ADR required — no new architectural decision; this works within ADR 0005
  and ADR 0009

## Version and status check

- This task does not change the current project version posture (`0.4.0-alpha.1`)
- Behavior implemented on `main` does not change; only contract test coverage
  and authoring guide are extended
