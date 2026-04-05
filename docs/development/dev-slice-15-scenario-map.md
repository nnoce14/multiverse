# Dev Slice 15 — Scenario Map

## Slice theme

Second concrete resource provider: path-scoped

## Scenario goal

Demonstrate that the path-scoped resource provider derives stable, unique, and deterministic filesystem paths per worktree instance, and refuses when safe scope cannot be determined.

## Primary feature area

### Feature area A — Deterministic path derivation

#### Scenario A1.1

Given a valid worktree instance with a known ID  
And a path-scoped provider configured with a base directory  
And a declared resource with a name  
When the provider derives the resource handle  
Then the handle is `{baseDir}/{resourceName}/{worktreeId}`

#### Scenario A1.2

Given a valid worktree instance  
And a path-scoped provider  
When the provider derives a path twice with the same input  
Then both derived paths are identical

#### Scenario A1.3

Given two worktree instances with distinct IDs  
And the same base directory and resource name  
When the provider derives paths for both  
Then the two derived paths differ

### Feature area B — Refusal behavior

#### Scenario B1.1

Given a worktree instance with no ID  
And a path-scoped provider configured with a base directory  
When the provider attempts to derive a path  
Then the result is a refusal with category `unsafe_scope`

### Feature area C — Contract compliance

#### Scenario C1.1

Given the path-scoped provider  
When evaluated against the resource provider derive contract  
Then it satisfies all required contract behaviors

## Recommended test layering

### Acceptance tests

Use these to prove:

- end-to-end derive behavior using `@multiverse/provider-path-scoped` through the core resolve path
- correct path format (`{baseDir}/{resourceName}/{worktreeId}`)
- determinism across two calls with the same input
- distinct paths for distinct worktree IDs
- refusal when worktree ID is absent

### Contract tests

Use these to prove:

- the provider returns a `DerivedResourcePlan` for valid input
- the derived result satisfies the `DerivedResourcePlan` shape
- the handle matches the expected path derivation format

## Minimum viable scenario set

1. valid worktree derives a path in `{baseDir}/{resourceName}/{worktreeId}` format
2. same input always derives the same path
3. two distinct worktree IDs derive two distinct paths
4. missing worktree ID is refused as `unsafe_scope`
5. provider satisfies resource provider derive contract
