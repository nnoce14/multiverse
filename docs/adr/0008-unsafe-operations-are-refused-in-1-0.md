# ADR 0008: Unsafe operations are refused in 1.0

## Status

Accepted

## Decision

In 1.0, the tool treats refusal as a first-class business behavior.

The tool must refuse operations when safe worktree-instance ownership cannot be determined or preserved.

This refusal behavior applies to:

- derive
- validate
- reset
- cleanup

In 1.0, the tool does not use best-effort behavior when safety is ambiguous.

The tool preserves a distinction between:

- invalid configuration
- unsupported capability
- unsafe scope
- provider failure

## Rationale

The core purpose of the tool is to preserve worktree isolation boundaries.

Guessing when scope is ambiguous would violate that purpose and weaken the guarantees promised by the business model.

Treating refusal as a first-class behavior keeps the design explicit, testable, and appropriate for behavior-first development and TDD.

## Consequences

Both the core tool and providers participate in refusal behavior.

The core refuses operations when safe ownership cannot be established from the business model or declared configuration.

Providers refuse operations when technology-specific safety cannot be established.

Future implementation work must preserve these distinctions rather than collapsing them into generic failure handling.
