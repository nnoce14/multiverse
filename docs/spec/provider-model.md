# Provider Model

## Purpose

This document defines the business rules for provider modeling in the tool.

Providers exist to carry out isolation behavior for concrete technologies without hardcoding those technologies into the core business model.

## Provider Definition

A provider is a concrete strategy that fulfills an isolation contract for a declared repository object.

Providers are responsible for carrying out technology-specific isolation behavior while preserving worktree-instance boundaries.

## Provider Domains

The tool defines one high-level provider abstraction with two provider domains:

- resource providers
- endpoint providers

These domains share a common conceptual role but operate on different business objects.

### Resource Providers

A resource provider carries out isolation behavior for a resource.

A resource provider is responsible for technology-specific behavior related to mutable local dependencies or mutable integration-owned state.

### Endpoint Providers

An endpoint provider carries out isolation behavior for an endpoint.

An endpoint provider is responsible for technology-specific behavior related to local communication addresses and routing correctness.

## Provider Relationship to Core Concepts

A provider is not the same thing as a resource or an endpoint.

- a resource or endpoint describes what must be isolated
- a provider describes how a concrete technology fulfills that isolation requirement

## Provider Selection

In 1.0, provider selection is explicit.

The repository configuration must declare which provider is used for each
resource or endpoint, together with any explicit provider-owned configuration
required by that provider shape.

The core tool does not infer providers in 1.0.

## Provider Capabilities

### Required Capability

Every provider must support:

- derive

### Optional Capabilities

A provider may additionally declare support for:

- validate
- reset
- cleanup

A provider is only responsible for optional lifecycle behavior when it explicitly declares support for that capability.

## Capability Definitions

### Derive

Derive computes scoped values for a single worktree instance.

Derive must be deterministic for a given worktree instance and provider input.

### Validate

Validate verifies that the provider's derived scope or derived values are usable, coherent, or safe to act upon.

Validation behavior is provider-specific and optional.

### Reset

Reset prepares a worktree instance's isolated state for fresh use.

Reset reinitializes or destroys only the isolated state belonging to one worktree instance.
The intent of reset is that the worktree instance will continue in use: isolated state is
cleared so the next run starts fresh, not permanently removed.

Reset is destructive and optional.

A provider that owns no mutable state may implement reset as a scope-confirmation operation:
returning the standard reset result to confirm that the correct worktree scope was recognized,
without performing any side effects. This is the correct behavior for a provider whose derived
handle is a logical identifier rather than physical state the provider manages directly.

### Cleanup

Cleanup permanently removes tool-generated or provider-managed state belonging only to a
single worktree instance when that worktree is no longer needed.

The intent of cleanup is finality: the isolated state is removed with the expectation that
the worktree instance will not continue in use. This distinguishes cleanup from reset —
reset clears state so the next run can proceed; cleanup removes state because the next
run is not expected.

Cleanup may be destructive and is optional.

A provider that owns no mutable state may implement cleanup as a scope-confirmation operation
for the same reason as reset.

## Safety Rules

1. No destructive provider capability may execute implicitly.
2. If a provider cannot safely determine the owning worktree scope for a destructive action, it must not proceed silently.
3. Provider behavior must preserve worktree-instance boundaries even when branch metadata is shared.
4. A provider must not claim support for a capability it cannot safely perform.

## Repository Boundary

The repository is responsible for declaring:

- which resources exist
- which endpoints exist
- which provider is assigned to each declared object

The provider is responsible for implementing:

- scoped derivation behavior
- any declared optional lifecycle capabilities
- technology-specific safety rules needed to preserve isolation

The core tool is responsible for coordinating provider behavior through the common contract.

## Non-Goals

The provider model does not require providers to manage general application orchestration.

Concepts such as app startup, app shutdown, or full infrastructure provisioning are outside the core provider contract unless later formalized.

## Open Areas

The following remain to be specified in more detail elsewhere:

- endpoint business rules
- provider input and output contracts
- provider registration model
- repository configuration shape
- error and refusal behavior details
