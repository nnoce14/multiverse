# ADR 0009: Core, provider, repository, and application boundaries are explicit

## Status

Accepted

## Decision

The system defines four responsibility layers:

- core tool
- provider
- repository configuration
- application/runtime

Each layer has clearly defined responsibilities and non-responsibilities.

The core tool operates at the business-model level.

Providers operate at the technology-integration level.

Repository configuration operates as a business declaration surface.

The application/runtime operates at the execution level.

## Rationale

Explicit responsibility boundaries prevent responsibility drift and reduce ambiguity during implementation.

They also provide a clear structure for behavior-first development and ensure that coding agents and human developers operate within well-defined constraints.

## Consequences

Implementation work must respect the defined boundaries.

No layer may assume responsibilities assigned to another.

Provider loading, configuration parsing, and runtime orchestration remain outside the scope of the business boundary and will be addressed at the implementation level.
