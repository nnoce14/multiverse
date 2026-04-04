---
name: tdd-red-green-refactor
description: "Use this skill when implementing or stabilizing a Multiverse slice through the full behavior-first TDD loop: acceptance and contract tests first, minimum production code to green, then a bounded refactor pass under test protection."
---

# TDD Red-Green-Refactor

Use this skill when the task requires the full Multiverse TDD loop rather than stopping at the first passing implementation.

## Read first

Before doing any work, read only the documents needed for the current task, in this order:

1. relevant ADRs under `docs/adr/`
2. relevant specs under `docs/spec/`
3. relevant scenarios under `docs/scenarios/`
4. active slice and development docs under `docs/development/`
5. `AGENTS.md`
6. `CLAUDE.md`

Then read the acceptance tests and any provider contract tests that define the in-scope behavior.

## Use this skill when

Use this skill when the task is to:

- implement a current slice under behavior-first TDD
- stabilize a recently implemented slice whose touched path is becoming monolithic or unclear
- extract pure helpers after the first green implementation
- improve maintainability while preserving already-proven behavior

## Do not use this skill when

Do not use this skill when the task is primarily:

- scenario analysis or acceptance authoring only
- broad architecture redesign
- repo-wide cleanup
- package reorganization beyond the active slice path
- inventing behavior not justified by repo documents

## Workflow

1. Read the active slice and task documents.
2. Identify the exact acceptance and contract behavior in scope.
3. Make the relevant tests fail if they do not already.
4. Add the minimum production code needed to make the tests pass.
5. Run the relevant checks and confirm green.
6. Inspect the touched path for maintainability problems created by the minimal implementation.
7. Perform a bounded refactor pass while preserving behavior.
8. Add focused unit tests for extracted pure helpers when they improve maintainability.
9. Re-run the relevant acceptance, contract, unit, and type checks.
10. Stop at the slice boundary.

## Refactor discipline

The refactor phase is behavior-preserving.

Allowed refactor goals:

- separate mixed responsibilities in touched files
- extract stable pure helpers for validation, mapping, derivation, or refusal logic
- keep public entrypoints thin
- correct touched cross-package imports to use package public entry paths
- improve naming and local structure in the active slice path

Do not use the refactor phase to:

- add new product behavior
- broaden slice scope
- perform unrelated cleanup
- introduce speculative abstractions
- redesign package boundaries without a real dependency or responsibility reason

## Testing rules

- acceptance tests remain the source of truth for externally visible behavior
- provider contract tests remain the source of truth for provider compliance
- unit tests support extracted pure logic and local maintainability
- unit tests must not replace acceptance or contract coverage
- green acceptance tests are necessary, but they do not automatically end the task if the touched path still needs a bounded refactor to remain maintainable

## Output

Produce:

- passing acceptance and contract tests for the active slice
- minimum production behavior required for the slice
- a bounded refactor of the touched path where needed
- focused unit tests for extracted pure helpers where useful
- no new behavior beyond the slice
- no unrelated refactors
