# Safety and Refusal Behavior

## Purpose

This document defines the business rules for safety and refusal behavior in the tool.

Safety and refusal behavior exists to preserve worktree-instance boundaries when the tool or a provider cannot safely act without risking state collision, communication misdirection, or ownership ambiguity.

## Refusal as a First-Class Business Behavior

In 1.0, refusal is a first-class business behavior.

Refusal is not merely an implementation detail or an incidental error case.

The tool must refuse operations when it cannot preserve the business guarantees required for safe worktree isolation.

## Safety Principle

The tool may act only when it can preserve the guaranteed ownership boundary of a worktree instance.

If the tool or a provider cannot safely determine, preserve, or validate that ownership boundary, the operation must not proceed silently.

## Failure Categories

In 1.0, the tool distinguishes between the following business failure categories:

- invalid configuration
- unsupported capability
- unsafe scope
- provider failure

These categories are distinct and must not be treated as interchangeable.

### Category names: spec form and contract form

This document uses human-readable names (spaces, lowercase): "invalid configuration",
"unsupported capability", "unsafe scope", "provider failure".

The `Refusal` type in `@multiverse/provider-contracts` uses machine-readable identifiers
(underscores): `"invalid_configuration"`, `"unsupported_capability"`, `"unsafe_scope"`,
`"provider_failure"`.

Both forms refer to the same four categories. The spec uses human-readable names because
it is a business rules document. The contract type uses underscore identifiers because it
is a code-level API. A reader seeing both forms in different documents is not seeing an
inconsistency — they are seeing the same categories expressed at different layers.

### Invalid Configuration

Invalid configuration occurs when repository declarations violate required business rules.

Examples may include:

- missing required declarations
- missing provider assignment
- missing required core fields
- contradictory configuration intent

### Unsupported Capability

Unsupported capability occurs when a repository declares intent to use a capability that the selected provider does not support.

### Unsafe Scope

Unsafe scope occurs when the tool or a provider cannot safely determine or preserve the owning worktree-instance boundary for the requested operation.

Unsafe scope is a refusal condition.

### Provider Failure

Provider failure occurs when a provider that is otherwise valid and supported cannot successfully complete an operation.

Provider failure does not erase the distinction between capability support and scope safety.

## Operations Subject to Refusal

In 1.0, refusal may apply to any operation that depends on safe worktree ownership.

This includes, but is not limited to:

- derive
- validate
- run
- reset
- cleanup

Refusal is not limited to destructive operations.

An operation may be non-destructive and still be unsafe if worktree ownership cannot be determined or preserved.

## Destructive Operations

In 1.0, the following operations are considered destructive:

- reset
- cleanup

Destructive operations require safe scope determination before they may proceed.

## Best-Effort Behavior

In 1.0, the tool does not use best-effort behavior when safety is ambiguous.

If safe scope cannot be determined, the tool must refuse rather than guess.

## Core Versus Provider Responsibility

Safety and refusal behavior is shared across the core tool and providers.

### Core Responsibility

The core tool is responsible for refusing operations when the business model or declared configuration cannot establish safe ownership boundaries.

Examples may include:

- invalid repository configuration
- missing provider assignment
- contradictory lifecycle intent
- missing declared object identity

### Provider Responsibility

A provider is responsible for refusing operations when technology-specific scope or safety cannot be established for the requested action.

Examples may include:

- inability to map a request to one owning worktree instance
- inability to verify that a destructive action targets only one worktree instance's isolated state
- inability to validate the provider's derived scope safely

## Silent Execution Prohibition

No unsafe operation may proceed silently.

No destructive action may execute implicitly.

No provider may claim support for an operation it cannot safely perform.

## Safety Guarantees for 1.0

1. The tool refuses operations when safe worktree-instance ownership cannot be determined.
2. The tool does not silently guess when scope is ambiguous.
3. Destructive operations require safe scope determination before execution.
4. Refusal behavior applies to derivation and validation as well as destructive lifecycle actions.
5. The distinction between invalid configuration, unsupported capability, unsafe scope, and provider failure is preserved.

## Repository Boundary

The repository is responsible for declaring a valid configuration that allows the tool to reason about ownership boundaries.

The repository is not responsible for overriding refusal behavior once the tool or provider determines that safe action cannot be guaranteed.

## Open Areas

The following remain to be specified elsewhere:

- refusal reporting format
- error surface design
- user-facing messaging conventions
- implementation-specific exception or return modelsF
