# Testing Strategy

## Purpose

This document defines the testing approach for Multiverse as the repository moves from design into behavior-first implementation.

The goal is to ensure that accepted business behavior drives implementation and that technology-specific provider behavior does not distort the core model.

## Testing Layers

Multiverse uses three testing layers:

1. acceptance tests
2. provider contract tests
3. unit tests

These layers have different purposes and must not be conflated.

## Acceptance Tests

Acceptance tests verify externally visible business behavior of the tool.

They should answer questions such as:

- can the tool derive isolated runtime context for a valid worktree instance?
- does the tool preserve worktree-instance boundaries?
- does the tool refuse when safe scope is ambiguous?
- does the tool enforce explicit repository declarations?

Acceptance tests must be derived from the scenario documents under `docs/scenarios/`.

Acceptance tests should not:

- depend on provider internals
- assert private implementation details
- become broad end-to-end runtime orchestration tests
- encode behavior that is not justified by the specs or scenarios

## Provider Contract Tests

Provider contract tests verify that a provider implementation satisfies the common provider-facing contract expected by the core tool.

They should answer questions such as:

- can the provider derive scoped values correctly?
- does the provider report unsupported capabilities correctly?
- does the provider refuse destructive or scope-sensitive operations when ownership cannot be safely established?

Provider contract tests should focus on contract compliance, not on re-testing the entire business model.

## Unit Tests

Unit tests verify local implementation behavior within a module or class.

Unit tests are useful for:

- pure derivation logic
- config validation helpers
- object mapping
- refusal classification helpers
- provider adapter internals

Unit tests must not replace acceptance coverage for business rules.

## Test Progression

Implementation should generally proceed in this order:

1. identify in-scope acceptance scenarios for the current slice
2. create executable acceptance tests for those scenarios
3. add provider contract tests needed by the slice
4. implement the minimal production code required to satisfy the tests
5. add focused unit tests where they improve maintainability

## Mapping from Scenario Docs to Tests

Scenario markdown remains the business-readable source of truth.

Executable acceptance tests should mirror scenario intent as closely as possible.

A scenario may be:

- implemented directly as one executable test
- split into a small number of executable tests when necessary for clarity
- deferred if it is explicitly out of scope for the current slice

Deferred scenarios should not be partially implemented through incidental behavior.

## Test Data and Fixtures

Test fixtures should be explicit and readable.

Fixtures may include:

- fake repository configurations
- fake worktree-instance inputs
- provider test doubles
- deterministic scoped derivation examples

Fixtures should be designed to preserve business language rather than hide it.

## First Implementation Phase

The first implementation phase should emphasize:

- worktree identity
- repository configuration validation
- derivation of isolated resource context
- derivation of endpoint mapping
- refusal on invalid or unsafe scope

Reset and cleanup behavior may be deferred unless required for the selected first slice.

## Naming Guidance

Suggested test organization:

- `acceptance/`
- `contracts/`
- `unit/`

Suggested acceptance naming style:

- `*.acceptance.test.*`

Suggested provider contract naming style:

- `*.contract.test.*`

Suggested unit naming style:

- `*.test.*`

Exact file extensions and framework structure may be chosen later, but the distinction in test role must remain clear.

## Non-Goals

This testing strategy does not define:

- the final test framework choice
- snapshot policy
- CI pipeline design
- coverage thresholds

Those may be added later once the first implementation slice is proven.
