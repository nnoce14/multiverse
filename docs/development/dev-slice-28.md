# Dev Slice 28 — Sample-Compose Runtime Config Boundary Proof

## Status

In progress

## Intent

Strengthen the `0.3.0-alpha.2` composed-application proof by making the
application-owned runtime-config boundary in `apps/sample-compose` explicit and
independently testable.

This slice does not add new Multiverse product behavior. It proves and tightens
the consumer-side pattern preferred by the roadmap: application code reads
app-owned config at one boundary instead of scattering direct environment access
through the application.

## Why this slice now

Dev Slice 27 proved explicit app-native env mapping through `multiverse run`.

The roadmap's next `0.3.x` direction also calls out:

- application-owned runtime config boundaries
- cleaner common-case Node application consumption
- continued confidence-building around the composed app workflow

`apps/sample-compose/src/index.ts` already acts as a boundary in practice, but
the boundary is still implicit. This slice makes it explicit without expanding
the CLI or declaration model.

## In scope

- extract a dedicated runtime-config module for `apps/sample-compose`
- keep environment reads isolated to that module
- keep the accepted app-native names:
  - `DATABASE_PATH`
  - `CACHE_ADDR`
  - `APP_HTTP_URL`
- add focused unit tests for the boundary behavior
- prove that raw `MULTIVERSE_*` names are not consumed as fallback inputs by the
  sample application boundary

## Out of scope

- new CLI behavior
- new repository configuration fields
- fallback inference from `MULTIVERSE_*` names
- typed endpoint extraction beyond existing alias-only URL-to-port parsing in
  the sample app boundary
- sample-express changes
- broader docs/guides churn

## Acceptance criteria

- `apps/sample-compose/src/runtime-config.ts` is the only place the sample app
  reads process environment variables for startup configuration
- `apps/sample-compose/src/index.ts` delegates startup config loading to that
  boundary module
- unit tests prove:
  - valid app-native env input maps to `AppConfig`
  - missing required app-native vars fail explicitly
  - malformed `APP_HTTP_URL` fails explicitly
  - raw `MULTIVERSE_*` env vars do not act as fallback inputs

## Definition of done

- relevant unit tests pass
- integration tests remain green
- no new product behavior is introduced beyond the sample-app consumer proof
