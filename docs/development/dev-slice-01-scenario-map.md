# Development Slice 01 Scenario Map

## Purpose

This document maps the active development slice to the existing scenario sources in the repository.

It exists to ensure that executable acceptance tests for Development Slice 01 are derived from the accepted business documents rather than invented during implementation.

This document does not create new business truth. It identifies the scenario areas that should be promoted into executable acceptance coverage now and distinguishes them from behavior that remains deferred.

## Active Slice

- `docs/development/dev-slice-01.md`

Slice title:

- Resolve one worktree instance into one isolated resource plan and one endpoint mapping, or refuse.

## Source of Truth

Use this precedence order when deriving executable acceptance tests:

1. accepted ADRs under `docs/adr/`
2. specifications under `docs/spec/`
3. scenarios under `docs/scenarios/`
4. development guidance under `docs/development/`

If a scenario appears to conflict with a higher-priority source, the higher-priority source wins.

## Slice Objective

Development Slice 01 exists to prove that the system can take:

- a valid repository configuration
- a concrete worktree instance
- one declared managed resource
- one declared managed endpoint
- explicit provider assignment

and then:

- evaluate the declarations
- establish the worktree instance context
- derive an isolated resource plan for that worktree instance
- derive an isolated endpoint mapping for that worktree instance
- refuse when safe scope or valid declaration cannot be established

## In-Scope Scenario Sources

The following scenario documents are expected to supply the business behavior for this slice:

- `docs/scenarios/worktree-identity.scenarios.md`
- `docs/scenarios/repository-configuration.scenarios.md`
- `docs/scenarios/resource-isolation.scenarios.md`
- `docs/scenarios/endpoint-model.scenarios.md`
- `docs/scenarios/safety-and-refusal.scenarios.md`

## In-Scope Behavior by Scenario Area

### Worktree identity

Use this area to derive acceptance coverage for:

- recognition or resolution of a concrete worktree instance
- treating worktree instance as authoritative for isolation
- preserving the distinction between worktree identity and branch metadata
- deterministic behavior for the same worktree instance across repeated evaluation

Expected contribution to acceptance coverage:

- same worktree instance resolves consistently
- different worktree instances are treated as distinct isolation scopes
- branch similarity or branch metadata does not collapse worktree identity

### Repository configuration

Use this area to derive acceptance coverage for:

- explicit declarations required by the slice
- required fields for one resource and one endpoint
- explicit provider assignment for declared objects
- refusal when required declaration data is missing

Expected contribution to acceptance coverage:

- valid declared configuration is accepted
- missing required provider assignment is refused
- missing required declaration data is refused

### Resource isolation

Use this area to derive acceptance coverage for:

- deriving one isolated resource plan from declared configuration and worktree instance
- distinct isolated outputs for distinct worktree instances
- deterministic isolated output for the same worktree instance

Expected contribution to acceptance coverage:

- successful isolated resource derivation for a valid worktree instance
- different worktree instances produce different resource outputs
- repeated evaluation for the same worktree instance produces the same resource output

### Endpoint model

Use this area to derive acceptance coverage for:

- deriving one endpoint mapping from declared configuration and worktree instance
- preserving endpoint isolation between worktree instances
- ensuring endpoint behavior remains tied to the owning worktree instance

Expected contribution to acceptance coverage:

- successful endpoint mapping derivation for a valid worktree instance
- different worktree instances produce different endpoint outputs where needed for isolation
- repeated evaluation for the same worktree instance produces the same endpoint output

### Safety and refusal

Use this area to derive acceptance coverage for:

- refusal as a first-class business outcome
- refusal when safe scope cannot be determined
- refusal when declarations needed by this slice are invalid or incomplete
- refusal instead of guessing

Expected contribution to acceptance coverage:

- refusal on missing provider assignment
- refusal on invalid required declaration
- refusal on ambiguous or unsafe scope

## Initial Acceptance Test Set

The following executable acceptance tests should exist for Development Slice 01.

### Acceptance 01: resolves successfully for a valid declared worktree instance

Given a valid repository configuration with one declared managed resource, one declared managed endpoint, and explicit provider assignment, when the system evaluates a concrete worktree instance, then it returns:

- an isolated resource plan for that worktree instance
- an endpoint mapping for that worktree instance

Primary scenario sources:

- worktree identity
- repository configuration
- resource isolation
- endpoint model

### Acceptance 02: resolves deterministically for the same worktree instance

Given the same valid repository configuration and the same concrete worktree instance, when the system evaluates the request multiple times, then the derived isolated outputs remain the same.

Primary scenario sources:

- worktree identity
- resource isolation
- endpoint model

### Acceptance 03: resolves different isolated outputs for different worktree instances

Given the same valid repository configuration and two different worktree instances of the same repository, when the system evaluates each worktree instance, then the derived isolated outputs differ in the way required to preserve isolation.

Primary scenario sources:

- worktree identity
- resource isolation
- endpoint model

### Acceptance 04: refuses when provider assignment is missing

Given a repository declaration used by this slice that omits its required explicit provider assignment, when the system evaluates the request, then it refuses the operation.

Primary scenario sources:

- repository configuration
- safety and refusal

### Acceptance 05: refuses when required declaration data is invalid or missing

Given a repository configuration missing required declaration data for the resource or endpoint used in this slice, when the system evaluates the request, then it refuses the operation.

Primary scenario sources:

- repository configuration
- safety and refusal

### Acceptance 06: refuses when safe scope is ambiguous or unsafe

Given a request where safe worktree-instance scope cannot be determined or preserved, when the system evaluates the request, then it refuses the operation.

Primary scenario sources:

- worktree identity
- safety and refusal

## Deferred Scenario Areas

The following behavior should remain deferred unless required to satisfy the in-scope acceptance tests above:

- provider inference
- managed object inference
- multi-provider coordination
- broad CLI behavior
- process orchestration
- cleanup and reset workflows beyond strict slice need
- multiple resources beyond the minimum needed for Slice 01
- multiple endpoints beyond the minimum needed for Slice 01
- future convenience features not justified by the active slice

## Acceptance Authoring Rules

When converting these mapped behaviors into executable tests:

- keep tests focused on externally visible behavior
- preserve business language where practical
- avoid provider internals in acceptance assertions
- do not encode future-slice behavior incidentally
- include refusal outcomes explicitly where required
- stop at the Development Slice 01 boundary

## Implementation Handoff

After this mapping is accepted, the next step is to create executable acceptance tests under:

- `tests/acceptance/`

Those tests should then drive the minimal production implementation for Development Slice 01.
