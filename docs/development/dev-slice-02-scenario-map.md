# Development Slice 02 Scenario Map

## Purpose

This document maps the next development slice to the existing scenario sources in the repository.

It exists to ensure that executable coverage for Development Slice 02 is derived from the accepted business documents rather than invented during implementation.

This document does not create new business truth. It identifies the scenario areas that should inform Slice 02 and distinguishes them from behavior that remains deferred.

## Active Slice

- `docs/development/dev-slice-02.md`

Slice title:

- Evaluate one declared provider capability intent for one worktree instance, or refuse.

## Source of Truth

Use this precedence order when deriving executable coverage:

1. accepted ADRs under `docs/adr/`
2. specifications under `docs/spec/`
3. scenarios under `docs/scenarios/`
4. development guidance under `docs/development/`

If a scenario appears to conflict with a higher-priority source, the higher-priority source wins.

## Slice Objective

Development Slice 02 exists to prove that the system can take:

- a valid repository configuration
- a concrete worktree instance
- one declared managed resource
- one declared managed endpoint
- explicit provider assignment
- explicit intended use of one optional capability relevant to the slice

and then:

- evaluate provider capability separately from repository intent
- accept the request when the selected provider explicitly supports that capability
- refuse when repository intent exceeds provider support
- preserve refusal when safe scope for the requested operation cannot be established

## In-Scope Scenario Sources

The following scenario documents are expected to supply the business behavior for this slice:

- `docs/scenarios/provider-model.scenarios.md`
- `docs/scenarios/repository-configuration.scenarios.md`
- `docs/scenarios/safety-and-refusal.scenarios.md`
- `docs/scenarios/system-boundary.scenarios.md`
- `docs/scenarios/worktree-identity.scenarios.md`

## In-Scope Behavior by Scenario Area

### Provider model

Use this area to derive executable coverage for:

- explicit provider selection
- required derive support
- explicit declaration of optional capabilities
- honest provider capability claims

Expected contribution to executable coverage:

- supported capability path is accepted only when capability is declared explicitly
- unsupported capability intent is not treated as implicitly supported
- provider capability remains explicit rather than inferred

### Repository configuration

Use this area to derive executable coverage for:

- explicit provider assignment
- explicit distinction between provider capability and repository intent
- unsupported capability when repository intent exceeds selected provider support

Expected contribution to executable coverage:

- repository intent is evaluated separately from provider capability
- unsupported capability intent is refused as unsupported capability

### Safety and refusal

Use this area to derive executable coverage for:

- refusal as a first-class business outcome
- unsafe-scope refusal for the requested operation
- distinction between invalid configuration and unsafe scope

Expected contribution to executable coverage:

- unsupported capability remains unsupported capability, not unsafe scope
- unsafe ownership for the requested operation remains a refusal condition

### System boundary

Use this area to derive executable coverage for:

- core coordination of provider invocation
- provider responsibility for technology-specific operation behavior
- repository configuration not replacing provider capability declaration

Expected contribution to executable coverage:

- core enforces capability evaluation as a business rule
- provider remains responsible for technology-specific operation behavior
- repository declarations do not replace provider capability claims

### Worktree identity

Use this area only where needed to preserve worktree-scope safety for the requested operation.

Expected contribution to executable coverage:

- requested operation still respects worktree-instance ownership boundaries
- branch metadata does not collapse scope identity if scope safety is part of the slice behavior

## Initial Intended Coverage Set

The following executable coverage should be the intended next step for Development Slice 02.

### Coverage 01: accepts an explicitly supported optional capability request

Given a declared repository object with explicit provider assignment
And a selected provider that explicitly supports the optional capability used by this slice
When the system evaluates the request for one worktree instance
Then the request is accepted through the explicit capability path

Primary scenario sources:

- provider model
- repository configuration
- system boundary

### Coverage 02: refuses unsupported capability intent as unsupported capability

Given a declared repository object
And a selected provider that does not support the optional capability intended by repository configuration
When the system evaluates the request
Then the refusal category is `unsupported_capability`
And the operation is refused

Primary scenario sources:

- provider model
- repository configuration
- safety and refusal

### Coverage 03: refuses when safe scope for the requested operation cannot be established

Given a declared repository object
And a selected provider that supports the requested capability
When safe worktree-instance ownership cannot be determined or preserved for that operation
Then the operation is refused

Primary scenario sources:

- safety and refusal
- provider model
- worktree identity

## Deferred Scenario Areas

The following behavior should remain deferred unless required by a higher-priority source:

- provider inference
- managed object inference
- dynamic provider discovery
- broad CLI behavior
- process orchestration
- reset execution
- cleanup execution
- multi-provider coordination
- multiple resources beyond the minimum needed for Slice 02
- multiple endpoints beyond the minimum needed for Slice 02
- future convenience behavior not justified by the active slice

## Coverage Authoring Rules

When converting this mapped behavior into executable tests later:

- keep tests focused on externally visible business behavior
- preserve business language where practical
- avoid provider internals in acceptance assertions
- do not encode reset or cleanup execution unless later required
- include refusal outcomes explicitly where required
- stop at the Development Slice 02 boundary

## Implementation Handoff

After this mapping is accepted, the next step will be to create executable coverage for Development Slice 02 under the appropriate test layers:

- `tests/acceptance/` for externally visible business behavior
- `tests/contracts/` where provider contract compliance is central to the slice

Those tests should then drive the minimal implementation for the slice.
