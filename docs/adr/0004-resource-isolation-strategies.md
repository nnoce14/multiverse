# ADR 0004: Resource isolation strategies for v1

## Status
Accepted

## Decision

In v1, resources are isolated using one primary strategy chosen from:

- name-scoped
- path-scoped
- process-scoped

Each declared resource must specify exactly one primary isolation strategy.

## Rationale

These three categories cover common local isolation patterns while keeping the model small and understandable.

They allow the tool to reason about resource isolation without hardcoding specific technologies into the core model.

## Consequences

The core tool models resources generically.

Concrete technologies are handled by providers rather than by the core business model.

Endpoints remain a separate concept and are not modeled as resources.