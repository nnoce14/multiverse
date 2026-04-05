# Dev Slice 04 Docs Sync — Task 01

## Title

Sync the development docs with the already-implemented Slice 04 repository-configuration validation seam

## Objective

Add the missing development documentation for the Slice 04 repository-configuration boundary work that already exists on `main`, and refresh the visibly stale parts of `docs/development/implementation-strategy.md` so the development docs no longer imply the repo is still only at the first-slice planning stage.

## In Scope

- add `docs/development/dev-slice-04.md`
- add `docs/development/dev-slice-04-scenario-map.md`
- update `docs/development/implementation-strategy.md` only where the current wording is plainly stale
- align the new docs to the behavior already proven by:
  - `tests/acceptance/dev-slice-04.acceptance.test.ts`
  - `tests/unit/repository-configuration-boundary.test.ts`

## Out of Scope

- broad README refresh
- retroactive rewriting of slices `01` to `03`
- new product behavior
- new acceptance or unit tests
- documentation for later slices beyond what is required to stop Slice 04 drift

## Source Documents

- `docs/adr/0007-repository-configuration-is-explicit-in-1-0.md`
- `docs/spec/repository-configuration.md`
- `docs/spec/system-boundary.md`
- `docs/scenarios/system-boundary.scenarios.md`
- `tests/acceptance/dev-slice-04.acceptance.test.ts`
- `tests/unit/repository-configuration-boundary.test.ts`
- issue `#16`

## Acceptance Criteria

- the repo contains a development-slice doc for Slice 04
- the repo contains a paired Slice 04 scenario map
- the docs reflect repository-configuration validation as already implemented on `main`
- `docs/development/implementation-strategy.md` no longer reads as though only the initial first slice is relevant
- the update remains narrow and does not attempt a repo-wide documentation rewrite
