---
name: validation-boundary-check
description: Use this skill when a Multiverse change introduces or modifies validation logic and you need to verify that declaration validation, scope-safety validation, and provider capability or runtime safety validation are placed in the correct layer with the correct refusal behavior.
---

# Validation Boundary Check

Use this skill to review where validation logic belongs in Multiverse.

## Read first

1. `AGENTS.md`
2. the active task document under `docs/development/tasks/` if one exists
3. the active slice document under `docs/development/` if one exists
4. relevant specs, scenarios, and ADRs for the behavior being validated
5. `CLAUDE.md` only if additional repo guidance is needed

> In the Claude version, swap steps 1 and 5 so `CLAUDE.md` is first and `AGENTS.md` is secondary.

## Use this skill when

Use this skill when:

- new validation logic is being added
- refusal categories are being introduced or changed
- a change mixes core and provider checks
- TypeScript narrowing and validated models are becoming unclear

## Do not use this skill when

Do not use this skill when:

- the change does not materially affect validation or refusal behavior
- the task is purely documentation or Git workflow
- the active behavior is still too underspecified to classify safely

## Validation layers

Use these distinctions:

### Declaration validation

Core-facing validation of raw repository declarations.

Typical questions:
- are required fields present?
- is provider assignment explicit?
- is declared intent structurally valid for the current slice?

### Scope-safety validation

Core-facing validation of worktree ownership and operation safety.

Typical questions:
- is worktree scope established safely?
- is ownership ambiguous?
- is the requested operation safe for this scope?

### Provider capability or runtime validation

Provider-facing validation of optional capability support and technology-specific safety.

Typical questions:
- does the provider support the requested capability?
- can the provider safely perform the requested operation for this scope?
- is there provider-level refusal or failure?

## Review priorities

1. is the validation logic in the correct layer?
2. does the refusal category match the layer and business meaning?
3. is core doing business-rule validation rather than provider-specific runtime work?
4. is the provider handling technology-specific safety rather than redefining business rules?
5. does the change improve or weaken validated narrowing and explicitness?

## Output

Provide:

- the validation logic you identified
- the correct layer for each piece
- any misplaced validation or refusal logic
- the recommended correction if needed
- whether the current change is acceptable for the active slice

## Stop conditions

Stop if:

- the business meaning of the validation is unclear from repo documents
- the change would require inventing a new refusal category not supported by repo truth
- the active slice does not define enough context to classify the validation safely
