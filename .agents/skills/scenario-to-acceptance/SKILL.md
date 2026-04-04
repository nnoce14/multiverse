---
name: scenario-to-acceptance
description: Use this skill when the task is to turn existing Multiverse scenario docs into executable acceptance tests for the current development slice, map slice scope to relevant scenario sections, or add acceptance coverage without inventing behavior beyond the specs, ADRs, and active slice doc.
---

# Scenario to Acceptance

Use this skill to convert existing Multiverse scenario documents into executable acceptance tests for the active development slice.

## Read first

Before doing any work, read only the documents needed for the current task, in this order:

1. relevant ADRs under `docs/adr/`
2. relevant specs under `docs/spec/`
3. relevant scenarios under `docs/scenarios/`
4. active slice and development docs under `docs/development/`

For the current initial phase, start with:

- `docs/development/dev-slice-01.md`
- `docs/development/implementation-strategy.md`
- `AGENTS.md`
- `CLAUDE.md`

## Use this skill when

Use this skill when the task is to:

- identify which existing scenarios are in scope for the active slice
- map scenario documents to executable acceptance coverage
- create or update acceptance tests for current-slice behavior
- preserve behavior-first TDD without broadening implementation scope

## Do not use this skill when

Do not use this skill when the task is primarily:

- production implementation
- package restructuring
- CLI expansion
- provider design beyond what current acceptance coverage requires
- inventing new business behavior that is not already supported by ADRs, specs, scenarios, or the active slice doc

## Workflow

1. Read the active development slice document.
2. Identify the exact behavior currently in scope.
3. Read only the ADRs, specs, and scenarios needed for that slice.
4. Extract only the scenario behavior that should become executable acceptance coverage now.
5. Exclude behavior that belongs to later slices.
6. Create or update acceptance tests that verify externally visible outcomes only.
7. Preserve business language where practical.
8. Stop at the slice boundary.

## Output

Produce:

- a concise mapping from active-slice behavior to relevant scenario sections
- executable acceptance tests for the in-scope behavior
- no speculative production implementation beyond what is required to support the tests

## Acceptance test rules

Acceptance tests must:

- verify externally visible business behavior
- reflect the active slice only
- assert success, determinism, isolation, and refusal where relevant
- avoid provider internals
- avoid implementation-detail assertions

Acceptance tests must not:

- encode speculative future behavior
- silently introduce provider inference
- broaden CLI or orchestration scope
- replace business language with unnecessary framework jargon

## Scope discipline

If a scenario document contains both current-slice and future-slice behavior:

- implement only the portion justified by the current slice
- leave the rest untouched
- do not partially implement future behavior incidentally

## Refusal discipline

Refusal is a first-class behavior.

If the active slice requires refusal outcomes, acceptance coverage must include them.

Do not convert unsafe ambiguity into permissive assumptions.

## Multiverse constraints

These constraints remain mandatory:

- no provider inference
- no managed object inference
- repository configuration is declarative only
- refuse rather than guess when safe scope is ambiguous
- core and provider responsibilities must remain separate

## Stop conditions

Stop and surface the issue instead of guessing if:

- the slice boundary is unclear
- scenario behavior conflicts with higher-priority repo documents
- required behavior is underspecified
- the task would require inventing business behavior not present in source documents
