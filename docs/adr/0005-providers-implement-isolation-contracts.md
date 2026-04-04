# ADR 0005: Providers implement isolation contracts

## Status

Accepted

## Decision

The tool defines one high-level provider abstraction with two provider domains:

- resource providers
- endpoint providers

In v1, every provider must support `derive`.

Providers may additionally declare explicit support for:

- `validate`
- `reset`
- `cleanup`

Provider selection is explicit in repository configuration and is not inferred by the core tool in 1.0.

## Rationale

This keeps the core model technology-agnostic while still allowing concrete technologies to fulfill isolation behavior through a normalized contract.

Explicit provider selection and explicit capability declaration keep behavior deterministic, understandable, and suitable for behavior-first development and TDD.

## Consequences

The repository must declare which provider is assigned to each resource or endpoint.

The core tool coordinates providers through the shared contract rather than hardcoding specific technologies.

Destructive lifecycle behavior remains explicit and capability-based rather than implicit.
