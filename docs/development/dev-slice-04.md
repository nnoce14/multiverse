# Dev Slice 04 — Validated Repository Configuration at the Core Boundary

## Status

Implemented on `main`

## Intent

Establish the first trusted admission seam for repository configuration so raw repository declarations are validated before orchestration uses them as trusted core inputs.

This slice extends the validated-boundary work introduced in Slice 03 by moving from one validated worktree value to one validated repository declaration model.

The goal is to prove that repository declarations remain explicit business inputs while malformed raw configuration is refused before provider orchestration begins.

## Why this slice after Slice 03

Slice 03 established that raw application input must not enter the core model unvalidated.

The next immediate trust boundary is the repository configuration itself.

Before capability coordination, lifecycle operations, and CLI-driven orchestration can be extended safely, the system needs a trusted representation of:

- declared resources
- declared endpoints
- required core fields such as provider assignment, intended role, and primary isolation strategy

Without this seam, later orchestration slices would need to reason about malformed declaration shapes while coordinating business behavior.

## Slice objective

Implement the repository-configuration validation seam such that:

1. raw repository configuration may enter through the current orchestration path
2. validation occurs before trusted repository declarations are used downstream
3. valid raw configuration becomes a trusted repository representation
4. invalid raw configuration returns structured validation errors
5. downstream orchestration is not invoked when repository validation fails

## Scope

This slice includes:

- a validated repository-configuration representation
- structured boundary validation errors for missing required declaration fields
- acceptance coverage proving valid raw configuration is accepted through the current orchestration path
- acceptance coverage proving invalid raw configuration is refused before orchestration
- focused unit coverage for the repository-configuration validation seam

## Out of scope

This slice does not include:

- provider execution redesign
- capability intent coordination
- reset or cleanup execution
- CLI UX work
- configuration discovery or serialization format decisions
- broad error-taxonomy expansion beyond the current structured validation output

## Architectural stance

This slice reinforces the same boundary rule as Slice 03:

> raw boundary declarations are not trusted core declarations

Repository configuration is still the business declaration surface, but raw configuration objects are not treated as trusted until they pass explicit validation.

The core may coordinate only validated declarations.

## Targeted declaration rules

The first repository-configuration seam should prove validation of required business fields for the current single-resource, single-endpoint path.

The in-scope required rules are:

- a resource must declare a provider
- a resource must declare a primary isolation strategy
- an endpoint must declare a role
- invalid raw repository configuration must not reach provider orchestration

Do not broaden this slice into full configuration-file or loading behavior.

## Acceptance criteria

- valid raw repository configuration is accepted through the current orchestration path
- a resource missing its provider is refused as invalid configuration
- a resource missing its primary isolation strategy is refused as invalid configuration
- an endpoint missing its role is refused as invalid configuration
- orchestration is not invoked for invalid raw repository configuration
- successful validation yields a trusted repository representation for downstream use

## Expected artifacts

- repository-configuration validation seam in core
- structured repository validation error output
- acceptance tests for valid and invalid raw repository configuration
- focused unit tests for the repository-configuration boundary

## Definition of done

This slice is done when the repo contains a narrow, test-proven path that admits raw repository declarations into the trusted core model only through structured validation, and refuses malformed declaration shapes before orchestration begins.
