# Development Slice 01

## Title

Resolve one worktree instance into one isolated resource plan and one endpoint mapping, or refuse.

## Purpose

This slice begins executable implementation of Multiverse through a narrow, behavior-proving path.

The goal is to prove that the system can take explicit repository declarations plus a concrete worktree instance and produce deterministic, worktree-specific runtime isolation outputs without introducing inference, orchestration, or hidden behavior.

This slice must also prove that refusal is present from the beginning, not deferred as a later hardening step.

## Why This Slice First

This slice exercises the core business model with minimal scope expansion.

It touches:

- worktree identity
- declarative repository configuration
- explicit provider assignment
- deterministic isolated derivation
- endpoint isolation
- refusal behavior

It does **not** require broad runtime orchestration or multiple-provider complexity.

## Slice Objective

Given:

- a valid repository configuration
- a concrete worktree instance
- one declared managed resource
- one declared managed endpoint
- explicit provider assignment

the system can:

- evaluate the declarations
- establish the worktree instance context
- derive an isolated resource plan for that worktree instance
- derive an isolated endpoint mapping for that worktree instance
- refuse when safe scope or valid declaration cannot be established

## Business Outcome

A repository can declare one resource and one endpoint such that different worktree instances of the same repository resolve to different isolated outputs, while invalid or unsafe requests are refused rather than guessed.

## In Scope

This slice includes only the behavior needed to prove the first executable path.

### Repository scope

- one repository
- one machine
- git worktrees as the only supported worktree model in v1

### Configuration scope

- one valid repository configuration shape
- one declared managed resource
- one declared managed endpoint
- explicit provider assignment for declared objects
- no implicit defaults that weaken explicitness

### Runtime derivation scope

- identify or accept a concrete worktree instance input
- derive deterministic worktree-scoped values
- produce one isolated resource plan
- produce one isolated endpoint mapping

### Safety scope

- refusal for invalid declaration
- refusal for missing required provider assignment
- refusal for ambiguous or unsafe scope
- refusal for missing required fields needed by this slice

## Out of Scope

The following are explicitly out of scope for Development Slice 01:

- provider inference
- managed object inference
- dynamic provider discovery
- broad CLI UX design
- process orchestration
- application bootstrapping
- multi-provider coordination
- cleanup and reset workflows beyond what is strictly required for this slice
- multiple resources unless required to support a specific in-scope acceptance case
- multiple endpoints unless required to support a specific in-scope acceptance case
- concurrency stress behavior
- cross-machine behavior
- non-git worktree models
- convenience features not justified by accepted specs and scenarios

## Slice Boundaries

This slice must preserve the repository’s explicit responsibility model.

### Core

Core is responsible for:

- evaluating repository declarations relevant to this slice
- enforcing business rules
- preserving worktree-instance boundaries
- coordinating provider usage through explicit contracts
- enforcing refusal behavior

Core must not:

- infer undeclared providers
- infer undeclared managed objects
- absorb provider-specific implementation details
- introduce orchestration behavior not required by this slice

### Provider

Provider is responsible for:

- technology-specific scoped derivation required by this slice
- returning isolated values in the contract shape expected by core
- refusing provider-level operations when safe scope cannot be established

Provider must not:

- redefine business rules
- weaken explicit repository declarations
- bypass refusal requirements

### Repository Configuration

Repository configuration is responsible for:

- explicitly declaring the resource
- explicitly declaring the endpoint
- explicitly assigning the provider
- supplying the data required for deterministic derivation in this slice

Repository configuration must remain declarative and explicit.

## Acceptance Focus

The first implementation must be acceptance-test driven.

Acceptance coverage for this slice should prove:

1. a valid declared configuration can be evaluated successfully
2. a worktree instance can be resolved into deterministic isolated outputs
3. different worktree instances produce different isolated outputs
4. repeated evaluation for the same worktree instance produces the same outputs
5. invalid or unsafe requests are refused

## Candidate Acceptance Behaviors

The exact executable tests may be split differently, but this slice should cover the following business behaviors.

### Happy path: single worktree instance resolves successfully

Given a valid repository configuration with one declared resource, one declared endpoint, and explicit provider assignment, when the system evaluates a concrete worktree instance, then it produces:

- a valid isolated resource plan for that worktree instance
- a valid isolated endpoint mapping for that worktree instance

### Determinism: same worktree instance resolves the same way repeatedly

Given the same valid repository configuration and the same concrete worktree instance, when the system evaluates the request multiple times, then the isolated resource plan and endpoint mapping remain the same.

### Isolation: different worktree instances resolve differently

Given the same valid repository configuration and two different worktree instances of the same repository, when the system evaluates each worktree instance, then the isolated outputs differ in the way required to preserve isolation.

### Refusal: missing provider assignment

Given a repository declaration required by this slice but missing its explicit provider assignment, when the system evaluates the request, then it refuses the operation.

### Refusal: invalid required declaration

Given a repository configuration missing required data for the declared resource or endpoint used in this slice, when the system evaluates the request, then it refuses the operation.

### Refusal: ambiguous or unsafe scope

Given a request where safe worktree-instance scope cannot be determined or preserved, when the system evaluates the request, then it refuses the operation.

## Initial Scenario Mapping

Executable acceptance tests for this slice should be drawn from the existing scenario documents and kept aligned with them.

Likely source areas include:

- worktree identity
- repository configuration
- resource isolation
- endpoint model
- safety and refusal

Only the scenarios needed for this slice should be promoted into executable acceptance tests now.
Do not pull in future-slice behavior prematurely.

## Provider Strategy for This Slice

This slice should use the smallest provider surface that can prove the architecture.

Recommended approach:

- define one minimal provider contract sufficient for isolated derivation
- implement one minimal test provider or first real provider path
- keep provider behavior narrow and directly tied to this slice
- do not generalize the provider contract beyond what current acceptance behavior requires

## Testing Strategy for This Slice

### Acceptance tests

Acceptance tests are the primary driver for this slice.

They should assert externally visible outcomes such as:

- successful resolution
- deterministic scoped outputs
- distinct isolated outputs across worktree instances
- refusal outcomes

They should not assert provider internals.

### Provider contract tests

Add only the contract tests needed to verify that the provider implementation used in this slice satisfies the core-facing contract.

### Unit tests

Add unit tests only where they improve maintainability for pure derivation or validation logic.

Unit tests must not replace acceptance coverage.

## Expected Deliverables

Development Slice 01 should produce:

- executable acceptance tests for the in-scope behaviors
- minimal provider contract tests required by the slice
- minimal production code required to satisfy those tests
- no speculative abstractions beyond the slice boundary

## Completion Criteria

Development Slice 01 is complete when:

- in-scope acceptance tests exist and pass
- required refusal cases for this slice exist and pass
- the implementation preserves explicit core/provider/configuration boundaries
- no provider inference or hidden defaults were introduced
- no out-of-scope orchestration or convenience behavior was added

## Practical Rule

If a design or abstraction is not required to satisfy the acceptance behavior of this slice, defer it.

This slice is meant to prove the model, not to pre-build the entire system.

## Workspace and Package Targeting

Development Slice 01 should be implemented within the repository’s pnpm workspace monorepo structure.

The intended primary touchpoints for this slice are:

- `apps/cli/` for any thin entrypoint behavior required by the slice
- `packages/core/` for slice business behavior and coordination
- `packages/provider-contracts/` for any minimal provider-facing contract shapes required by the slice
- `packages/providers-testkit/` for fake or test-oriented provider support if needed
- `tests/acceptance/` for executable slice acceptance tests
- `tests/contracts/` for any minimal provider contract tests required by the slice
- `tests/unit/` for focused local tests where useful

### Slice 01 Packaging Rule

This slice must use the minimum number of packages required to preserve clarity.

Do not introduce additional packages unless the slice cannot be implemented cleanly within the intended initial workspace structure.
