# Dev Slice 21 — Scenario Map

## Slice theme

First concrete process-scoped resource provider: handle derivation

## Scenario goal

Demonstrate that the process-scoped resource provider derives a stable, unique, and deterministic provider-managed state directory per worktree instance, and refuses when safe scope cannot be determined.

## Primary feature area

### Feature area A — Deterministic state directory derivation

#### Scenario A1.1

Given a valid worktree instance with a known ID  
And a process-scoped provider configured with a base directory and a command  
And a declared resource with a name  
When the provider derives the resource handle  
Then the handle is `{baseDir}/{resourceName}/{worktreeId}/`

#### Scenario A1.2

Given a valid worktree instance  
And a process-scoped provider  
When the provider derives a state directory twice with the same input  
Then both derived state directories are identical

#### Scenario A1.3

Given two worktree instances with distinct IDs  
And the same base directory and resource name  
When the provider derives state directories for both  
Then the two derived state directories differ

### Feature area B — Refusal behavior

#### Scenario B1.1

Given a worktree instance with no ID  
And a process-scoped provider configured with a base directory and a command  
When the provider attempts to derive a state directory  
Then the result is a refusal with category `unsafe_scope`

### Feature area C — Contract compliance

#### Scenario C1.1

Given the process-scoped provider  
When evaluated against the resource provider derive contract  
Then it satisfies all required contract behaviors

## Recommended test layering

### Acceptance tests

Use these to prove:

- end-to-end derive behavior using `@multiverse/provider-process-scoped` through the core resolve path
- correct state directory format (`{baseDir}/{resourceName}/{worktreeId}/`)
- determinism across two calls with the same input
- distinct state directories for distinct worktree IDs
- refusal when worktree ID is absent

### Contract tests

Use these to prove:

- the provider returns a `DerivedResourcePlan` for valid input
- the derived result satisfies the `DerivedResourcePlan` shape
- the handle matches the expected state directory derivation format

## Minimum viable scenario set

1. valid worktree derives a state directory in `{baseDir}/{resourceName}/{worktreeId}/` format
2. same input always derives the same state directory
3. two distinct worktree IDs derive two distinct state directories
4. missing worktree ID is refused as `unsafe_scope`
5. provider satisfies resource provider derive contract
