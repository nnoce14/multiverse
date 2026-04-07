# Dev Slice 32 — Task 01

## Title

Provider authoring guide and out-of-first-party acceptance proof

## Sources of truth

- `docs/adr/0005-providers-implement-isolation-contracts.md`
- `docs/adr/0009-core-provider-repository-and-application-boundaries-are-explicit.md`
- `docs/spec/provider-model.md`
- `docs/scenarios/provider-model.scenarios.md`
- `packages/provider-contracts/src/index.ts`

## Motivation

The 0.4.x exit criteria require that "provider authoring expectations are
understandable" and that "the extension story feels credible rather than
hypothetical." The fixed-host-port slice proved that a second endpoint provider
shape can be added. But the proof was entirely first-party: the author already
knew the codebase and the contract. No guide exists for someone arriving from
outside. No acceptance test shows that a provider authored against only
`@multiverse/provider-contracts` integrates cleanly through the standard seam.

This slice closes that gap with minimal scope: one authoring guide and one narrow
acceptance proof.

## Truth-alignment note

This slice proves that a **non-first-party provider** — one implemented knowing
only `@multiverse/provider-contracts`, with no access to core internals — can be
registered in a `ProviderRegistry` and consumed correctly through the standard
`deriveOne` seam in `@multiverse/core`.

This is a **core/registry seam proof**, not a CLI invocation proof or a runtime
distribution proof. The acceptance test exercises `deriveOne` directly, not the
CLI. Packaging, distributing, or publishing a provider outside the repository is
not addressed in this slice. Do not describe this slice as proving that external
providers work with `multiverse run` unless the implementation actually goes that
far.

## In scope

- `docs/guides/provider-authoring-guide.md` (new)
  - what a resource provider is and what it is responsible for
  - what an endpoint provider is and what it is responsible for
  - minimal TypeScript examples for each provider kind
  - required capability (`derive`) vs. optional capabilities (`validate`,
    `reset`, `cleanup`)
  - how refusal works and when a provider must return one
  - how to register a provider in `providers.ts` via `ProviderRegistry`
  - what belongs in the provider vs. what belongs in core
  - no plugin discovery, no auto-registration, no ecosystem framing

- `tests/acceptance/dev-slice-32.acceptance.test.ts` (new)
  - defines a minimal user-authored resource provider inline in the test file,
    importing only from `@multiverse/provider-contracts`
  - registers it in a `ProviderRegistry` alongside a standard endpoint provider
  - calls `deriveOne` through core with a matching repository configuration
  - asserts deterministic derived output
  - asserts that a different worktree id produces a different handle
  - asserts that absent worktree id is refused with `unsafe_scope`
  - no CLI invocation required; tests core seam directly

## Out of scope

- new provider packages
- changes to `packages/provider-contracts/`
- changes to `packages/core/`
- changes to `apps/cli/`
- provider registry or plugin discovery behavior
- changes to existing providers
- contract compliance test harness in testkit (may follow as a separate slice)
- ecosystem or community-extension framing
- version bump

## Acceptance criteria

- `docs/guides/provider-authoring-guide.md` exists and covers all in-scope topics
- the guide's minimal provider examples are consistent with the current contract shape
- the acceptance test defines a user-authored resource provider using only
  `@multiverse/provider-contracts` types, with no imports from core or any
  concrete provider package
- the acceptance test passes for valid input (deterministic handle, different
  worktrees produce different handles)
- the acceptance test passes for missing worktree id (refused with `unsafe_scope`)
- `pnpm test:acceptance` passes after the slice is complete

## Safety and refusal expectations

- the user-authored provider in the acceptance test must return a `Refusal` with
  `category: "unsafe_scope"` when worktree identity is absent
- the guide must make this requirement explicit and show the pattern

## Files expected to change

- `docs/guides/provider-authoring-guide.md` (new)
- `tests/acceptance/dev-slice-32.acceptance.test.ts` (new)
- `docs/development/tasks/dev-slice-32-task-01.md` (this file, already created)

## Version and status check

- this task does not change the current project version posture (`0.4.0-alpha.1`)
- no ADR is required; the decision about provider contracts is already captured
  in ADR 0005 and ADR 0009
- roadmap and state docs should be reviewed on slice completion to update
  the 0.4.x progress description
