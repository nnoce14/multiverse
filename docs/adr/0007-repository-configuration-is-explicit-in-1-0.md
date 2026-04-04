# ADR 0007: Repository configuration is explicit in 1.0

## Status

Accepted

## Decision

In 1.0, the tool uses one unified repository configuration model.

Every managed resource and every managed endpoint must be declared explicitly.

Every declared object must explicitly select a provider.

Provider-specific configuration is allowed, but it extends rather than replaces required core business fields.

Defaults are intentionally minimal in 1.0.

## Rationale

An explicit unified model keeps repository behavior understandable, deterministic, and suitable for behavior-first design and TDD.

It also avoids premature inference and hidden conventions while the core business abstractions are still maturing.

## Consequences

Repositories must declare their managed objects directly rather than relying on discovery or inference.

The tool validates configuration as a business declaration surface before any implementation-specific behavior is considered.

Future versions may streamline configuration once the explicit model has been proven stable.
