# Dev Slice 05 — Validated Endpoint Declaration at the Core Boundary

## Status

Implemented on `main`

## Intent

Establish the first trusted admission seam for endpoint declarations so raw endpoint data is validated before orchestration uses it as a trusted core input.

This slice extends the repository-configuration boundary work from Slice 04 by proving that endpoint declarations are also explicit business inputs rather than raw objects the core can use without validation.

The goal is to preserve endpoint routing correctness by refusing malformed endpoint declarations before provider derivation begins.

## Why this slice after Slice 04

Slice 04 established trusted admission for repository configuration.

The next visible trust boundary is the endpoint declaration itself.

Before the system can safely coordinate endpoint derivation, it needs a trusted representation of:

- endpoint name
- endpoint provider
- intended role

Without this seam, later provider and CLI slices would need to reason about malformed endpoint declaration shapes while coordinating behavior.

## Slice objective

Implement the endpoint-declaration validation seam such that:

1. raw endpoint declarations may enter through the current orchestration path
2. validation occurs before trusted endpoint declarations are used downstream
3. valid raw endpoint declarations become a trusted representation
4. invalid raw endpoint declarations return structured validation errors
5. downstream orchestration is not invoked when endpoint validation fails

## Scope

This slice includes:

- a validated endpoint-declaration representation
- structured boundary validation errors for missing required endpoint fields
- acceptance coverage proving valid raw endpoint declarations are accepted through the current orchestration path
- acceptance coverage proving invalid raw endpoint declarations are refused before orchestration
- focused unit coverage for the endpoint-declaration validation seam

## Out of scope

This slice does not include:

- provider execution redesign
- capability intent coordination
- reset or cleanup execution
- CLI UX work
- endpoint file-format or discovery decisions
- broad error-taxonomy expansion beyond the current structured validation output

## Architectural stance

This slice reinforces the same rule established by Slice 03 and Slice 04:

> raw boundary declarations are not trusted core declarations

Endpoint declarations are part of the business declaration surface, but raw endpoint objects are not treated as trusted until they pass explicit validation.

The core may coordinate only validated endpoint declarations.

## Targeted declaration rules

The first endpoint seam should prove validation of required business fields for the current single-endpoint path.

The in-scope required rules are:

- an endpoint must declare a name
- an endpoint must declare a provider
- an endpoint must declare an intended role
- invalid raw endpoint declarations must not reach provider orchestration

Do not broaden this slice into endpoint address generation or lifecycle behavior.

## Acceptance criteria

- valid raw endpoint declarations are accepted through the current orchestration path
- an endpoint missing its name is refused as invalid configuration
- an endpoint missing its role is refused as invalid configuration
- an endpoint missing its provider is refused as invalid configuration
- orchestration is not invoked for invalid raw endpoint declarations
- successful validation yields a trusted endpoint representation for downstream use

## Expected artifacts

- endpoint-declaration validation seam in core
- structured endpoint validation error output
- acceptance tests for valid and invalid raw endpoint declarations
- focused unit tests for the endpoint-declaration boundary

## Definition of done

This slice is done when the repo contains a narrow, test-proven path that admits raw endpoint declarations into the trusted core model only through structured validation, and refuses malformed endpoint declaration shapes before orchestration begins.
