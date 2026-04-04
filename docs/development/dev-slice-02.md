# Development Slice 02

## Title

Evaluate one declared provider capability intent for one worktree instance, or refuse.

## Purpose

This slice extends the first executable path without broadening the runtime surface.

The goal is to prove that the system can continue to work from explicit repository declarations and explicit provider contracts when optional provider capabilities enter the model.

Slice 02 should establish that provider capability and repository intent are evaluated separately, that optional capability usage remains explicit, and that unsupported or unsafe requests are refused rather than guessed through.

This slice must preserve the same boundary discipline established by Development Slice 01.

## Why This Slice Next

Development Slice 01 proved the minimum derive path for one resource and one endpoint.

The next business gap in the source documents is explicit capability coordination:

- every provider must support `derive`
- optional capabilities such as `validate` are explicit
- repository intent does not replace provider capability
- unsupported capability intent is refused as `unsupported_capability`
- refusal distinctions must remain explicit

This slice strengthens the provider contract boundary without introducing orchestration, multiple-object expansion, or destructive lifecycle execution.

## Slice Objective

Given:

- a valid repository configuration
- a concrete worktree instance
- one declared managed resource
- one declared managed endpoint
- explicit provider assignment
- explicit intended use of one optional provider capability relevant to the slice

the system can:

- evaluate provider capability separately from repository intent
- accept the request when the selected provider explicitly supports the intended capability
- refuse when the repository intends to use a capability the selected provider does not support
- preserve refusal when safe scope for the requested operation cannot be established

## Business Outcome

A repository can declare optional capability intent for a selected provider in a way that remains explicit, deterministic, and refusal-aware, without collapsing business rules into provider implementation details.

## In Scope

This slice includes only the behavior needed to prove explicit provider-capability coordination for the existing single-object path.

### Repository scope

- one repository
- one machine
- git worktrees as the only supported worktree model in v1

### Configuration scope

- one valid repository configuration shape extended only as needed to express one optional capability intent
- one declared managed resource
- one declared managed endpoint
- explicit provider assignment for declared objects
- explicit intended use of one optional supported capability
- no hidden defaults that weaken explicitness

### Runtime behavior scope

- preserve the existing derive path from Slice 01
- evaluate one optional capability request relevant to this slice
- distinguish supported optional capability from unsupported optional capability
- preserve explicit refusal categories for unsupported capability and unsafe scope

### Safety scope

- refusal when repository intent declares unsupported capability usage
- refusal when safe worktree scope cannot be established for the requested operation
- refusal without best-effort fallback

## Out of Scope

The following are explicitly out of scope for Development Slice 02:

- provider inference
- managed object inference
- dynamic provider discovery
- broad CLI UX design
- process orchestration
- application bootstrapping
- multi-provider coordination
- multiple resources unless required by a specific in-scope acceptance case
- multiple endpoints unless required by a specific in-scope acceptance case
- reset execution
- cleanup execution
- broad validation subsystems beyond the one capability path needed by this slice
- cross-machine behavior
- non-git worktree models
- convenience behavior not justified by accepted specs and scenarios

## Slice Boundaries

This slice must preserve the repository’s explicit responsibility model.

### Core

Core is responsible for:

- evaluating repository declarations relevant to capability intent
- enforcing the distinction between provider capability and repository intent
- coordinating provider invocation through explicit contracts
- preserving refusal behavior and category distinction

Core must not:

- infer undeclared providers
- infer undeclared managed objects
- invent capability support
- absorb provider-specific implementation details
- introduce orchestration behavior not required by this slice

### Provider

Provider is responsible for:

- declaring the capabilities it explicitly supports
- carrying out the requested operation only when that capability is supported
- refusing provider-level operations when technology-specific safety cannot be established

Provider must not:

- redefine business rules
- replace repository intent with implicit behavior
- bypass refusal requirements

### Repository Configuration

Repository configuration is responsible for:

- explicitly declaring the resource
- explicitly declaring the endpoint
- explicitly assigning the provider
- explicitly expressing any intended use of optional supported capability required by this slice

Repository configuration must remain declarative and explicit.

## Acceptance Focus

The next executable coverage for this slice should prove:

1. optional capability intent is evaluated explicitly rather than inferred
2. a supported optional capability request can be evaluated for the existing single-worktree path
3. an unsupported optional capability request is refused as unsupported capability
4. unsafe scope still refuses for the requested operation
5. derive behavior from Slice 01 is preserved and not broadened incidentally

## Candidate Acceptance Direction

The exact executable tests may be split differently, but this slice should aim to cover the following business behaviors.

### Happy path: explicit supported capability is accepted

Given a declared repository object with explicit provider assignment
And a selected provider that explicitly supports the optional capability used by this slice
When the system evaluates the request for one worktree instance
Then the request is accepted through the explicit capability path

### Refusal: unsupported capability intent

Given a declared repository object
And a selected provider that does not support the optional capability intended by repository configuration
When the system evaluates the request
Then the refusal category is `unsupported_capability`
And the operation is refused

### Refusal: unsafe scope for the requested operation

Given a declared repository object
And a selected provider that supports the requested capability
When safe worktree-instance ownership cannot be established for that operation
Then the operation is refused

## Initial Scenario Mapping

Executable coverage for this slice should be drawn from the existing scenario documents and kept aligned with them.

Likely source areas include:

- provider model
- repository configuration
- safety and refusal
- system boundary
- worktree identity where scope safety matters

Only the scenarios needed for this slice should be promoted into executable coverage.
Do not pull reset, cleanup, or orchestration behavior into this slice unless a higher-priority document requires it.

## Provider Strategy for This Slice

This slice should preserve the smallest provider surface that can prove capability coordination.

Recommended approach:

- extend the provider contract only as needed to model one optional capability relevant to this slice
- keep capability declaration explicit
- avoid generalizing provider registration or loading behavior
- avoid destructive lifecycle behavior unless a higher-priority source requires it

## Testing Strategy for This Slice

### Acceptance tests

Acceptance tests should remain focused on externally visible business behavior:

- explicit supported capability path
- refusal on unsupported capability intent
- refusal on unsafe scope for the requested operation

They should not assert provider internals.

### Provider contract tests

Provider contract tests are likely needed in this slice because capability declaration and provider-level refusal are central business concerns for the provider boundary.

### Unit tests

Add unit tests only if they materially improve maintainability for capability evaluation or refusal classification helpers.

## Expected Deliverables

Development Slice 02 should produce:

- executable acceptance tests for the in-scope capability behavior
- provider contract tests needed by that slice
- minimal production code required to satisfy those tests
- no speculative abstractions beyond the slice boundary

## Completion Criteria

Development Slice 02 is complete when:

- in-scope executable coverage exists and passes
- unsupported capability intent is refused explicitly
- unsafe-scope refusal remains explicit for the requested operation
- the implementation preserves core/provider/configuration boundaries
- no provider inference, hidden defaults, or orchestration behavior was introduced
