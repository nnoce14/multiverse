# ADR 0010: pnpm workspace monorepo for implementation

## Status

Accepted

## Context

Multiverse is moving from design-first documentation into behavior-first implementation.

The repository already defines explicit conceptual boundaries between:

- core business behavior
- provider contracts and provider-specific behavior
- repository-declared configuration
- application and runtime-facing concerns

As implementation begins, the codebase needs a structure that can:

- preserve these boundaries clearly
- support incremental vertical-slice development
- scale to additional providers without collapsing into a single mixed-responsibility package
- remain small and simple in the early implementation phase

The project does not need heavy package fragmentation at the start, but it does need a structure that can scale cleanly as the implementation grows.

## Decision

Multiverse will be implemented as a **pnpm workspace monorepo**.

The implementation will begin with a **small number of workspace packages and applications**. New packages must be justified by an actual responsibility boundary, not speculative reuse.

The initial workspace structure should favor:

- a thin application entrypoint
- a core package for business behavior
- a provider contract package for explicit core-to-provider interaction
- a provider testkit package for test doubles and provider contract support

Concrete provider implementations may be introduced as separate packages when they are required by actual slices.

## Initial Direction

The intended initial structure is:

- `apps/cli`
- `packages/core`
- `packages/provider-contracts`
- `packages/providers-testkit`

A separate configuration-model package may be introduced later if configuration concerns become large enough to justify their own package boundary.

## Dependency Direction

The intended dependency direction is:

- applications may depend on core
- core may depend on provider contracts
- concrete providers may depend on provider contracts
- tests may depend on testkit utilities
- core must not depend directly on concrete provider implementations
- providers must not own or redefine business rules

## Rationale

A pnpm workspace monorepo is a good fit because it:

- aligns physical code layout with the explicit business and architectural boundaries already defined in the repository
- supports narrow vertical slices without forcing all code into one package
- allows providers to scale cleanly as separate implementation areas
- helps both humans and coding agents reason about dependency direction and ownership
- avoids the overhead of coordinating multiple repositories

This decision also allows the project to remain small initially while preserving a clean growth path.

## Consequences

### Positive

- package boundaries can reinforce existing design boundaries
- future provider implementations can be added without restructuring the entire repository
- dependency direction can be made explicit early
- coding agents can operate with clearer structural guardrails

### Negative

- workspace setup introduces some up-front repository structure before significant production code exists
- the team must actively resist premature fragmentation into too many packages

## Rules Derived from This Decision

- start with the minimum number of packages required for clarity
- do not create a package unless it reflects a real boundary
- do not place business rules in application entrypoints
- do not couple core directly to concrete providers
- do not use the monorepo decision as justification for speculative package design

## Alternatives Considered

### Single package implementation

A single package would be simpler initially, but it would make it easier for core behavior, provider concerns, and application concerns to mix too early.

### Many packages from the start

A highly fragmented workspace would overfit the architecture before the first slices prove which boundaries actually need physical separation.

## Outcome

Use a pnpm workspace monorepo, but keep the initial package count deliberately small.
