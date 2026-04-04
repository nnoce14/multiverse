# ADR 0011: TypeScript and Node.js for initial implementation

## Status

Accepted

## Context

Multiverse is moving from design-first documentation into behavior-first implementation.

The repository has already accepted the following implementation-shaping decisions:

- explicit boundaries between core behavior, provider contracts, repository configuration, and application-facing concerns
- a pnpm workspace monorepo structure for implementation
- narrow development slices driven by executable acceptance tests

The project is intended to serve the npm ecosystem. As implementation begins, the repository should make the initial runtime and language target explicit so that contributors and coding agents do not introduce avoidable ambiguity.

## Decision

The initial implementation of Multiverse will use:

- TypeScript
- Node.js
- pnpm workspaces

The implementation should follow Node.js and TypeScript package conventions across applications, workspace packages, tests, and supporting tooling.

## Scope of This Decision

This decision applies to the initial implementation phase of Multiverse, including:

- application entrypoints
- core packages
- provider contract packages
- test support packages
- test harness and supporting scripts

## Rationale

TypeScript on Node.js is the right fit for the initial implementation because:

- Multiverse is intended to serve the npm ecosystem
- the repository is already structured as a pnpm workspace monorepo
- the design emphasizes explicit contracts and boundaries, which benefit from strong typing
- Node.js is a natural fit for CLI-oriented tooling and local developer workflows in the npm ecosystem
- this choice reduces ambiguity for human contributors and coding agents during the first implementation slices

## Consequences

### Positive

- the implementation target is explicit
- package and tooling decisions can align with one runtime model
- contract-heavy boundaries can benefit from TypeScript’s type system
- contributors and coding agents have clearer expectations for project structure and conventions

### Negative

- the initial implementation is not runtime-agnostic
- future portability to other ecosystems would require an explicit later decision rather than falling out “for free”

## Rules Derived from This Decision

- assume Node.js and TypeScript conventions unless a later ADR states otherwise
- keep the early implementation focused on the npm ecosystem
- do not introduce cross-runtime abstraction unless a real requirement justifies it
- do not treat runtime neutrality as an implicit goal of the initial implementation

## Alternatives Considered

### Leave the implementation language and runtime unspecified

Rejected because it creates unnecessary ambiguity during the first implementation phase and makes it easier for contributors or coding agents to drift into inconsistent conventions.

### JavaScript without TypeScript

Rejected for the initial implementation because explicit contracts and boundary-heavy design benefit from stronger type safety and clearer shared types.

### Runtime-agnostic first implementation

Rejected because the current product direction is focused on the npm ecosystem and the initial implementation should optimize for that target rather than speculative portability.

## Outcome

Multiverse will begin implementation as a TypeScript-on-Node.js tool within a pnpm workspace monorepo for the npm ecosystem.
