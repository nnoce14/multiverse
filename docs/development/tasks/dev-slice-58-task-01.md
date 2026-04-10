# Task: Dev Slice 58 — Provider Support Classification

## Slice

58 — provider support classification for 1.0

## Purpose

Produce a source-of-truth document that states explicitly which first-party providers are
first-class for the 1.0 common case and which are supported for specific use cases with
stated constraints. The goal is to let a user answer the question "which providers can I
depend on for 1.0?" without reading source code.

This is a docs-only slice. No production code changes. No new providers.

## Active file set

- `docs/spec/provider-support-classification.md` — new classification spec (primary deliverable)
- `docs/development/tasks/dev-slice-58-task-01.md` — this task doc (new)
- `docs/development/current-state.md` — add Slice 58 proving result
- `docs/spec/provider-model.md` — add pointer to classification doc

## Pre-work audit performed

All six provider packages were read directly. The following source-of-truth docs were
consulted: ADR-0004, ADR-0005, ADR-0009, ADR-0015, ADR-0016, ADR-0020, ADR-0018,
ADR-0019, product-spec.md, provider-model.md, resource-isolation.md, endpoint-model.md,
provider-authoring-guide.md, external-demo-guide.md, sample-compose/providers.ts.

## Classification summary

Two tiers are justified by the source-of-truth docs. No provider is deferred.

**First-class for the 1.0 common case:**
- `path-scoped` — primary resource in the external demo guide; full lifecycle
- `name-scoped` — ADR-0004 isolation strategy; scope-confirmation pattern correct by design
- `local-port` — primary endpoint in the external demo guide and composed sample

**Supported in 1.0 (for specific use cases, within stated constraints):**
- `process-scoped` — ADR-0015 explicit constraints; directory-path handle; no validate
- `process-port-scoped` — ADR-0016; liveness-only readiness; self-describing handle
- `fixed-host-port` — ADR-0020 extensibility proof; derive-only; requires explicit host config

Validate capability gaps (name-scoped, process-scoped, process-port-scoped) are intentional
and documented in the classification spec. Endpoint lifecycle gaps (local-port, fixed-host-port)
follow from `docs/spec/endpoint-model.md` and the provider authoring guide.

## Explicit out-of-scope

- No new providers or provider capabilities
- No changes to provider contracts or implementations
- No redesign of the provider authoring story
- No changes to existing ADRs
- No outside-workspace packaging or distribution
- No ecosystem formalization

## Acceptance criteria

- `provider-support-classification.md` exists at `docs/spec/`
- Two tiers are defined with honest rationale for each provider
- Lifecycle capability gaps are explained as intentional, not missing
- `provider-model.md` references the classification doc
- `current-state.md` records the Slice 58 proving result
- No production code is changed
