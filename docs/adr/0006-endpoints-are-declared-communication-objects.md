# ADR 0006: Endpoints are declared communication objects

## Status

Accepted

## Decision

In 1.0, endpoints are modeled as declared communication objects rather than raw derived addresses.

Each endpoint declaration must include:

- an endpoint name
- an endpoint provider
- an intended role

In 1.0, one endpoint declaration maps to exactly one derived address per worktree instance.

Endpoint providers must support `derive` and may optionally support `validate`.

Endpoints are limited to local communication addresses relevant to the local runtime in 1.0.

## Rationale

Endpoints protect against communication misdirection rather than state collision.

Modeling endpoints as declared objects preserves routing intent and ownership boundaries more clearly than treating them as anonymous derived values.

Limiting endpoints to local communication addresses in 1.0 keeps the model focused and avoids premature expansion into arbitrary remote URL management.

## Consequences

The repository must declare endpoints explicitly.

Endpoint providers remain separate from resource providers, even though both domains share a common provider abstraction.

The core tool preserves a business distinction between resource isolation and endpoint routing correctness.
