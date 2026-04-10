# Task: Dev Slice 60 — Consumer Integration Model Classification

## Slice

60 — consumer integration model classification for 1.0

## Purpose

Produce a source-of-truth document that explicitly classifies the consumer integration
model for 1.0. The goal is to answer: which consumer integration patterns are officially
supported for 1.0, what is preferred vs merely supported, and what is deferred?

This is a docs-only slice. No production code changes. No new integration patterns.

## Active file set

- `docs/spec/consumer-integration-model.md` — new classification spec (primary deliverable)
- `docs/development/tasks/dev-slice-60-task-01.md` — this task doc (new)
- `docs/development/current-state.md` — add Slice 60 proving result
- `docs/development/roadmap.md` — mark consumer integration item complete in Immediate direction
- `README.md` — add pointer to the new spec from Key docs

## Pre-work audit performed

The following source-of-truth docs and code were consulted: ADR-0012, ADR-0018, ADR-0019,
cli-output-shapes.md, supported-workflow.md, external-demo-guide.md, product-spec.md,
apps/sample-compose/src/runtime-config.ts, apps/sample-compose/multiverse.json,
apps/sample-compose/providers.ts, roadmap.md, current-state.md.

## Classification summary

Three supported patterns. No pattern is experimental. The distinction is between the
preferred pattern for composed applications and the simpler supported form.

**Canonical `MULTIVERSE_*` transport vars:**
- Always injected by `run`; the baseline transport layer
- Supported for 1.0; direct reading is valid and sufficient for single-seam applications
- Not preferred for composed applications with multiple seams (scatters Multiverse-specific
  names through application code)

**`appEnv` alias mapping (ADR-0018, ADR-0019):**
- Declared in `multiverse.json` per resource or endpoint
- `run` injects both canonical `MULTIVERSE_*` vars and declared app-native aliases
- Resources: single string alias; the alias receives the same derived string value
- Endpoints: string alias (full address) or typed object (`url`/`port` extraction)
- Applies to `run` only — not included in `derive --format=env`
- Conflict detection: refuses if the mapped name already exists in parent env

**Application-owned runtime-config boundary (recommended for composed apps):**
- Enabled by `appEnv` mapping; the application reads only app-owned names at one explicit
  function or module
- Demonstrated by `apps/sample-compose/src/runtime-config.ts` (reads DATABASE_PATH,
  CACHE_ADDR, PORT — no MULTIVERSE_* names in application business logic)
- Preferred for applications consuming multiple Multiverse-managed seams

**`run` stderr behavior:**
- Refusal during `run` is written to stderr (not stdout), intentionally
- This is a 1.0 stable behavior, not an open area

**Deferred:** appEnv in `derive --format=env`; resource typed extraction; multiple aliases
per declaration; additional endpoint value kinds; config overlays; framework-specific
behavior.

## Explicit out-of-scope

- No changes to runtime behavior
- No new env injection features
- No changes to ADR-0018 or ADR-0019
- No outside-workspace integration patterns
- No redesign of `run`

## Acceptance criteria

- `consumer-integration-model.md` exists at `docs/spec/`
- Three patterns are classified with explicit preferred vs supported distinctions
- `run` stderr behavior is stated as a stable 1.0 behavior
- Deferred items are listed explicitly
- `current-state.md` records the Slice 60 proving result
- `roadmap.md` marks the consumer integration item complete
- No production code is changed
