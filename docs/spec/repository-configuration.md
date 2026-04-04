# Repository Configuration

## Purpose

This document defines the business rules for repository configuration in the tool.

Repository configuration exists to declare the repository objects the tool manages and to bind those objects to explicit providers and explicit isolation behavior.

## Configuration Scope in 1.0

In 1.0, the repository uses one unified configuration model.

The unified model is responsible for declaring:

- managed resources
- managed endpoints
- provider assignments
- repository-level configuration metadata required by the tool

## Explicit Declaration Requirement

In 1.0, every managed resource must be declared explicitly.

In 1.0, every managed endpoint must be declared explicitly.

The tool does not infer managed repository objects in 1.0.

## Explicit Provider Selection Requirement

In 1.0, every declared resource and every declared endpoint must explicitly select a provider.

The tool does not infer providers in 1.0.

## Core Declaration Requirements

### Resource Declarations

Each declared resource must include:

- a resource name
- a provider
- a primary isolation strategy
- whether scoped reset is intended for use
- whether scoped cleanup is intended for use

### Endpoint Declarations

Each declared endpoint must include:

- an endpoint name
- an intended role
- a provider

## Provider Capabilities Versus Repository Intent

Provider capability and repository intent are distinct concepts.

### Provider Capability

A provider declares which capabilities it supports.

For example, a provider may support:

- derive
- validate
- reset
- cleanup

### Repository Intent

A repository declaration indicates which supported capabilities the repository intends to use for a specific object.

A repository may not declare intent to use a capability that the selected provider does not support.

## Provider-Specific Configuration

Provider-specific configuration is allowed in 1.0.

Provider-specific configuration extends a declaration but does not replace required core business fields.

Provider-specific configuration must not be the only source of information for:

- object identity
- provider assignment
- intended role
- isolation strategy
- intended lifecycle usage

## Minimal Defaults in 1.0

In 1.0, defaults are intentionally minimal.

The configuration model favors explicit declarations over inferred or implicit behavior.

Future versions may introduce more streamlined defaults once the core business model is stable.

## Configuration Validity Rules

A repository configuration is invalid if any of the following are true:

1. A managed resource is omitted from declaration.
2. A managed endpoint is omitted from declaration.
3. A declared object omits required core fields.
4. A declared object does not explicitly select a provider.
5. A resource declaration omits its primary isolation strategy.
6. A repository declares intent to use a capability not supported by the selected provider.
7. Provider-specific configuration attempts to replace required core business fields.

## Unified Model Boundary

The unified repository configuration model is a business declaration surface.

It defines what the repository wants the tool to manage and how those objects relate to providers.

It does not itself define implementation mechanisms such as:

- configuration file syntax
- serialization format
- provider registration implementation
- runtime loading behavior

Those concerns are outside the scope of this document.

## Repository Boundary

The repository is responsible for declaring:

- which resources are managed
- which endpoints are managed
- which providers are assigned
- which optional supported capabilities it intends to use

The tool is responsible for:

- evaluating whether declarations are valid
- coordinating declared objects through the common model
- refusing invalid or contradictory configurations

## Open Areas

The following remain to be specified elsewhere:

- configuration syntax and file format
- configuration loading behavior
- provider registration model
- error reporting details for invalid configuration
