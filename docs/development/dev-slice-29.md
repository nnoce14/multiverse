# Dev Slice 29 — Common-Case Docs Sync

## Status

Completed

## Intent

Align top-level project docs with the now-merged `0.3.0-alpha.2` proving state.

This slice does not add product behavior. It updates repository-facing guidance so
the documented common-case story matches the implementation now present on `main`.

## Why this slice now

The roadmap explicitly prioritizes:

- docs and guides that support the richer proving story
- a clearer common-case Node workflow
- a cleaner explanation of how applications consume Multiverse-managed values

After the `appEnv` and runtime-config-boundary slices, key docs still describe an
older repo shape and understate the composed-app workflow.

## In scope

- update `README.md` to reflect:
  - current provider and sample-app surface
  - the composed-app / app-native env proving story
- update `docs/development/repo-map.md` to reflect:
  - `apps/sample-compose`
  - process-backed provider packages
  - current slice progression through 29
- update `docs/guides/external-demo-guide.md` to mention the explicit common-case
  consumer direction:
  - canonical `MULTIVERSE_*` vars remain available
  - app-native env aliases via `appEnv` are supported for `run`
  - an application-owned runtime-config boundary is a preferred consumer pattern

## Out of scope

- new CLI behavior
- new declaration fields
- new sample applications
- broad documentation rewrite
- changes to ADRs/specs/scenarios

## Acceptance criteria

- top-level repo docs no longer describe the old pre-`sample-compose` surface
- docs explicitly acknowledge the current common-case consumer direction for
  `0.3.x`
- docs remain explicit about the repo-local `pnpm cli ...` path versus the
  formal `multiverse ...` binary path

## Definition of done

- the in-scope docs are internally consistent with the current implementation
- no new product behavior is introduced
