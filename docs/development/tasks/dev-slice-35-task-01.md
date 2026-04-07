# Dev Slice 35 — Task 01

## Title

CLI-level non-first-party provider integration proof

## Sources of truth

- `docs/adr/0005-providers-implement-isolation-contracts.md`
- `docs/adr/0009-core-provider-repository-and-application-boundaries-are-explicit.md`
- `docs/guides/provider-authoring-guide.md`
- `docs/development/tasks/dev-slice-32-task-01.md`

## Motivation

Slice 32 proved that a provider authored against `@multiverse/provider-contracts`
integrates correctly through `deriveOne` (the core/registry seam). That acceptance
test explicitly scoped out CLI invocation:

> "This is a core/registry seam proof. It does not exercise the CLI or prove
> runtime invocation behavior for externally distributed providers."

The provider authoring guide's registration section tells an author to put their
provider in `providers.ts` and invoke `pnpm cli derive --providers ./providers.ts`.
That is the documented path. Every existing `--providers` fixture in
`tests/acceptance/fixtures/` imports from first-party packages. No acceptance test
has ever exercised the full path: a non-first-party provider (only
`@multiverse/provider-contracts` imports) loaded by the CLI and deriving correctly.

This slice closes that named gap with a single fixture file and a focused
acceptance test, and updates the provider authoring guide to remove the "not
covered here" caveat for CLI invocation.

## In scope

- `tests/acceptance/fixtures/non-first-party-test-providers.ts` (new)
  - A `providers.ts`-style fixture authored against only `@multiverse/provider-contracts`
  - Exports a `ProviderRegistry` as a named `providers` export (per guide convention)
  - Contains one resource provider and one endpoint provider, matching the guide's
    minimal examples
  - No imports from any concrete provider package or core internals

- `tests/acceptance/dev-slice-35.acceptance.test.ts` (new)
  - Calls `runCli` with `--providers` pointing to the non-first-party fixture
  - Calls `--config` pointing to a minimal `multiverse.json` compatible with those providers
  - Asserts successful derivation (exit code 0, JSON output matches expected shape)
  - Asserts worktree isolation (different worktree ids produce different handles)
  - Asserts `unsafe_scope` refusal when `--worktree-id` is absent (already tested
    separately; omit if duplicating existing coverage exactly)

- `docs/guides/provider-authoring-guide.md` (update)
  - Remove or update the "not covered here: CLI invocation" caveat in the scope note
  - Replace with a statement that CLI invocation is now proven for the
    `providers.ts` + `multiverse.json` + `pnpm cli derive` path

## Out of scope

- Provider distribution as a standalone npm package
- Loading a provider from a path outside the repository
- Lifecycle capabilities (reset, cleanup) for a non-first-party provider
- Provider auto-discovery or inference
- New provider packages
- Changes to core, CLI command surface, or provider-contracts
- Version bump

## Acceptance criteria

- A `providers.ts`-style fixture exists that imports only from
  `@multiverse/provider-contracts` (no first-party provider package imports)
- `runCli` with `--providers` pointing to that fixture and a compatible
  `--config` exits 0 and returns a derive result containing the expected
  `resourceName`, `provider`, and `worktreeId` fields
- `pnpm vitest run` passes (all existing tests continue to pass)
- The provider authoring guide scope note no longer marks CLI invocation as
  not covered

## Safety and refusal expectations

- No new refusal paths introduced; existing unsafe_scope and
  invalid_configuration behavior is unchanged
- The fixture must return `unsafe_scope` when `worktree.id` is absent (per
  guide's required pattern) — this is already coverage from the compliance suite

## Files expected to change

- `tests/acceptance/fixtures/non-first-party-test-providers.ts` (new)
- `tests/acceptance/dev-slice-35.acceptance.test.ts` (new)
- `docs/guides/provider-authoring-guide.md` (update scope note)
- `docs/development/tasks/dev-slice-35-task-01.md` (this file)

## Truth-alignment on completion

On slice completion:
- `docs/development/current-state.md` — add Slice 35 proving result; if this
  closes the last named 0.4.x gap, state that explicitly and note the transition
  question toward 0.5.x
- `docs/development/repo-map.md` — advance slice count (34 → 35)
- `docs/guides/provider-authoring-guide.md` — remove CLI-invocation caveat
- No ADR required — this closes the named scope gap from Slice 32, no new
  architectural decision

## What this slice proves and what it still does not prove

**Proves:**
- The full `providers.ts` → `pnpm cli derive --providers` path works for a
  provider authored following the guide
- The documented registration workflow is executable, not just theoretically sound
- The 0.4.x extension story is complete at both the core/registry seam (Slice 32)
  and the CLI invocation level (this slice)

**Does not prove:**
- Distribution of a provider as a standalone npm package
- CLI invocation from a path outside the repository
- Provider lifecycle capabilities (reset, cleanup) for non-first-party providers
- Provider auto-discovery or plugin loading

## Version and status

- No version bump — this is a proof slice, not a feature or behavior change
- After this slice, the 0.4.x exit criteria should be assessed for completeness
  and a transition toward 0.5.x planning should be considered
