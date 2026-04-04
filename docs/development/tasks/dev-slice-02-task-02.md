# Dev Slice 02 — Task 02

## Title

Refuse unsupported scoped reset and cleanup intent before resource derivation

## Objective

Extend the existing explicit capability-intent behavior so repository declarations for `scopedReset` and `scopedCleanup` are evaluated against the selected provider's declared capabilities before the core proceeds with derivation.

This task stays within the Slice 02 theme:

- provider capability and repository intent remain distinct
- unsupported capability intent is refused explicitly
- refusal happens before provider execution proceeds

## Sources of truth

Ground this task in:

- `docs/adr/0008-unsafe-operations-are-refused-in-1-0.md`
- `docs/spec/repository-configuration.md`
- `docs/spec/provider-model.md`
- `docs/spec/safety-and-refusal.md`
- `docs/scenarios/repository-configuration.scenarios.md`
- `docs/scenarios/safety-and-refusal.scenarios.md`
- `docs/development/dev-slice-02.md`
- `docs/development/dev-slice-02-scenario-map.md`

## Required outcome

Implement the minimum production change such that:

- repository intent for `scopedReset` is refused when the selected provider does not support `reset`
- repository intent for `scopedCleanup` is refused when the selected provider does not support `cleanup`
- refusal occurs before resource derivation for the current single-resource path

## In scope

- resource capability-intent evaluation for `reset` and `cleanup`
- acceptance coverage for unsupported capability refusal
- minimal provider-test support if needed to express supported or unsupported capability declarations
- bounded refactor of the touched capability-intent path if it improves maintainability

## Out of scope

- reset execution
- cleanup execution
- endpoint capability expansion
- multiple-resource orchestration
- broad repository validation redesign
- lint or toolchain changes unrelated to this slice

## Acceptance criteria

- a resource declaration with `scopedReset: true` is refused when the selected provider does not support `reset`
- a resource declaration with `scopedCleanup: true` is refused when the selected provider does not support `cleanup`
- refusal uses the explicit unsupported-capability category
- provider derivation does not run when capability intent exceeds provider support

## Safety and boundary expectations

- preserve the distinction between unsupported capability and invalid configuration
- do not silently ignore declared capability intent
- keep capability evaluation in the core rather than smearing it into provider implementation
