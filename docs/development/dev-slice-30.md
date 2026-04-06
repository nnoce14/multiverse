# Dev Slice 30 — Typed Endpoint App-Env Mapping

## Status

Completed

## ADR

ADR-0019: Explicit typed endpoint mapping for app-native environment variables

## Intent

Extend endpoint `appEnv` mapping so `multiverse run` can inject explicit typed
app-native values for endpoints, with support for `url` and `port`.

This slice advances the `0.3.x` common-case workflow by supporting direct
application needs like `PORT` while preserving explicit declaration, refusal-first
behavior, and unchanged provider responsibilities.

## In scope

- endpoint `appEnv` may be:
  - a single string alias, preserving ADR-0018 behavior
  - a mapping object from app-native env names to endpoint value kinds
- supported endpoint value kinds:
  - `url`
  - `port`
- declaration validation for typed endpoint mappings
- collision refusal for all mapped app-native endpoint env names
- refusal when `port` cannot be extracted from the derived endpoint value
- update `sample-compose` to consume `PORT` through its runtime-config boundary

## Out of scope

- resource typed mapping
- changes to `derive --format=env`
- provider contract or implementation changes
- additional endpoint value kinds
- config-file overlays
- framework-specific behavior

## Acceptance criteria

- typed endpoint mapping injects both `url` and `port` values during `run`
- alias-only endpoint mapping continues to work unchanged
- declaration validation rejects:
  - empty mapping objects
  - invalid env names in typed mappings
  - reserved `MULTIVERSE_*` names
  - unsupported endpoint value kinds
  - duplicate app-env names across declarations
- `run` refuses when a mapped endpoint app-env name already exists in the parent env
- `run` refuses when a requested `port` value cannot be extracted
- `sample-compose` can consume `PORT` through its runtime-config boundary

## Definition of done

- targeted acceptance, unit, integration, and type checks pass
- no new provider behavior is introduced
- canonical `MULTIVERSE_*` endpoint injection remains unchanged
