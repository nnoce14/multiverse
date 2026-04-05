# Dev Slice 14 — Scenario Map

## Slice theme

First concrete resource provider: name-scoped

## Scenario goal

Demonstrate that the name-scoped resource provider derives stable, unique, and deterministic handles per worktree instance, and refuses when safe scope cannot be determined.

## Primary feature area

### Feature area A — Deterministic handle derivation

#### Scenario A1.1

Given a valid worktree instance with a known ID  
And a declared resource with a name  
When the name-scoped provider derives the resource handle  
Then the handle is `{resourceName}_{worktreeId}`

#### Scenario A1.2

Given a valid worktree instance  
And a name-scoped provider  
When the provider derives a handle twice with the same input  
Then both derived handles are identical

#### Scenario A1.3

Given two worktree instances with distinct IDs  
And the same resource name  
When the provider derives handles for both  
Then the two derived handles differ

### Feature area B — Refusal behavior

#### Scenario B1.1

Given a worktree instance with no ID  
When the name-scoped provider attempts to derive a handle  
Then the result is a refusal with category `unsafe_scope`

### Feature area C — Contract compliance

#### Scenario C1.1

Given the name-scoped provider  
When evaluated against the resource provider derive contract  
Then it satisfies all required contract behaviors

## Recommended test layering

### Acceptance tests

Use these to prove:

- end-to-end derive behavior using `@multiverse/provider-name-scoped` through the core resolve path
- correct handle format (`{resourceName}_{worktreeId}`)
- determinism across two calls with the same input
- distinct handles for distinct worktree IDs
- refusal when worktree ID is absent

### Contract tests

Use these to prove:

- the provider returns a `DerivedResourcePlan` for valid input
- the derived result satisfies the `DerivedResourcePlan` shape
- the handle matches the expected derivation format

## Minimum viable scenario set

1. valid worktree derives a handle in `{resourceName}_{worktreeId}` format
2. same input always derives the same handle
3. two distinct worktree IDs derive two distinct handles
4. missing worktree ID is refused as `unsafe_scope`
5. provider satisfies resource provider derive contract
