# Endpoint Model

## Purpose

This document defines the business rules for endpoint modeling in the tool.

Endpoints exist to preserve local communication correctness across parallel worktree instances.

## Endpoint Definition

An endpoint is a local communication address whose routing must remain correct for the owning worktree instance so that one worktree does not unintentionally send traffic to or receive traffic for another.

An endpoint models communication misdirection risk.

## Scope for 1.0

In 1.0, endpoints are limited to local communication addresses relevant to the local runtime.

Endpoints do not model arbitrary remote URLs in 1.0.

Examples may include:

- local application base URLs
- local API URLs
- local callback URLs
- local webhook receiver URLs
- local internal service URLs used during local development

## Endpoint Exclusions

Endpoints are not resources.

A resource models mutable state and collision risk.

An endpoint models communication routing and ownership correctness.

## Declared Endpoint Requirement

An endpoint is a declared communication object, not just a raw derived address.

Each endpoint declaration must include:

- an endpoint name
- an endpoint provider
- an intended role
- one derived address per worktree instance

## One-to-One Address Mapping in 1.0

In 1.0, one endpoint declaration maps to exactly one derived address for a given worktree instance.

## Endpoint Provider Relationship

An endpoint provider is a concrete strategy that fulfills endpoint isolation behavior for a declared endpoint.

The provider is responsible for carrying out technology-specific endpoint derivation while preserving worktree-instance routing boundaries.

## Endpoint Provider Capabilities

### Required Capability

Every endpoint provider must support:

- derive

### Optional Capability

An endpoint provider may additionally declare support for:

- validate

## Capability Definitions

### Derive

Derive computes the endpoint address for a single worktree instance.

Derive must be deterministic for a given worktree instance and provider input.

### Validate

Validate verifies that the derived endpoint address or endpoint scope is usable, coherent, or safe to rely upon for the owning worktree instance.

Validation behavior is provider-specific and optional.

## Endpoint Guarantees for 1.0

1. Each declared endpoint is derived deterministically for a given worktree instance.
2. Two worktree instances must not be assigned endpoint values that create ambiguous local ownership.
3. Endpoint derivation must preserve worktree-instance boundaries even when branch metadata is shared.
4. Endpoint providers must not silently redirect one worktree's communication to another worktree's endpoint.
5. If safe endpoint derivation or endpoint ownership cannot be determined, the tool must not proceed silently.

## Safety Rules

1. Endpoint behavior must preserve local routing correctness for the owning worktree instance.
2. The tool must preserve the distinction between endpoint identity and derived endpoint address.
3. The tool must not silently treat one worktree instance as the owner of another worktree instance's endpoint.
4. Endpoint validation, when supported, is explicit and not assumed.

## Repository Boundary

The repository is responsible for declaring:

- which endpoints exist
- the intended role of each endpoint
- which provider is assigned to each endpoint
- any explicit provider-owned configuration required by the selected endpoint
  provider shape

The endpoint provider is responsible for implementing:

- deterministic endpoint derivation
- optional endpoint validation
- technology-specific rules needed to preserve routing correctness

The core tool is responsible for coordinating endpoint behavior through the common contract.

## Open Areas

The following remain to be specified elsewhere:

- endpoint provider input and output contracts
- repository configuration shape for endpoint declarations
- endpoint refusal and error reporting details
