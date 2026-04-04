# System Boundary and Responsibility Model

## Purpose

This document defines the responsibility boundaries between the core tool, providers, repository configuration, and the application/runtime.

The purpose of these boundaries is to preserve separation of concerns, prevent responsibility drift, and ensure that isolation guarantees remain enforceable and testable.

## Boundary Overview

The system is composed of four responsibility layers:

- core tool
- provider
- repository configuration
- application/runtime

Each layer has distinct responsibilities and must not assume the responsibilities of another.

## Core Tool Responsibilities

The core tool is responsible for:

- evaluating repository configuration
- coordinating declared objects through the common model
- enforcing business rules
- preserving worktree-instance boundaries
- coordinating provider invocation
- enforcing safety and refusal behavior

The core tool operates at the business-model level.

## Core Tool Non-Responsibilities

The core tool is not responsible for:

- application bootstrapping
- arbitrary process orchestration
- framework-specific runtime composition
- implementing fake integrations
- inferring providers in 1.0

## Provider Responsibilities

A provider is responsible for:

- implementing technology-specific isolation behavior
- deriving scoped values
- optionally performing validate, reset, and cleanup when explicitly supported
- refusing operations when technology-specific safety cannot be established

Providers operate at the technology-integration level.

## Provider Non-Responsibilities

A provider is not responsible for:

- redefining business concepts
- determining which repository objects exist
- replacing required repository declarations
- bypassing safety and refusal rules

## Repository Configuration Responsibilities

Repository configuration is responsible for:

- declaring managed resources
- declaring managed endpoints
- assigning providers
- expressing intended use of optional supported capabilities

Repository configuration operates as a business declaration surface.

## Repository Configuration Non-Responsibilities

Repository configuration is not responsible for:

- replacing provider capability declarations
- bypassing safety and refusal rules
- encoding implementation mechanics as business truth
- inferring provider behavior implicitly

## Application / Runtime Responsibilities

The application/runtime is responsible for:

- consuming derived configuration and scoped values
- implementing application behavior on top of isolated runtime inputs
- implementing fake or real integrations where required by the application

The application/runtime operates at the execution level.

## Application / Runtime Non-Responsibilities

The application/runtime is not responsible for:

- redefining worktree identity
- overriding repository declarations silently
- weakening isolation guarantees provided by the tool
- managing isolation across worktree instances

## Interaction Model

- The repository configuration declares what exists and how it is intended to be used.
- The core tool evaluates declarations and coordinates behavior.
- Providers implement technology-specific isolation and lifecycle behavior.
- The application/runtime consumes the resulting isolated configuration.

## Out of Scope for This Model

This document does not define:

- provider registration or loading mechanisms
- configuration file formats or parsing
- application startup or orchestration behavior
- runtime execution frameworks

These concerns are considered implementation details outside the business boundary.

## Safety Alignment

All layers must respect the safety principle:

The tool may act only when it can preserve the guaranteed ownership boundary of a worktree instance.

No layer may bypass refusal behavior once unsafe scope is determined.

## Open Areas

The following remain to be specified elsewhere:

- implementation-level integration between layers
- provider discovery and registration mechanisms
- runtime wiring patterns between tool output and application input
