# Dev Slice 13 — Scenario Map

## Slice theme

First concrete endpoint provider: local port derivation

## Scenario goal

Demonstrate that the local port endpoint provider derives stable, unique, and deterministic local HTTP addresses per worktree instance, and refuses when safe scope cannot be determined.

## Primary feature area

### Feature area A — Deterministic port derivation

#### Scenario A1.1

Given a valid worktree instance with a known ID  
And a local port provider configured with a base port  
When the provider derives an endpoint address  
Then the address is `http://localhost:{port}` where port is in `[basePort, basePort + 999]`

#### Scenario A1.2

Given a valid worktree instance  
And a local port provider configured with a base port  
When the provider derives an endpoint address twice with the same input  
Then both derived addresses are identical

#### Scenario A1.3

Given two worktree instances with distinct IDs  
And a local port provider configured with the same base port  
When the provider derives endpoint addresses for both  
Then the two derived addresses differ

### Feature area B — Refusal behavior

#### Scenario B1.1

Given a worktree instance with no ID  
And a local port provider configured with a base port  
When the provider attempts to derive an endpoint address  
Then the result is a refusal with category `unsafe_scope`

### Feature area C — Contract compliance

#### Scenario C1.1

Given the local port provider  
When evaluated against the endpoint provider contract  
Then it satisfies all required contract behaviors

## Recommended test layering

### Acceptance tests

Use these to prove:

- end-to-end derive behavior using `@multiverse/provider-local-port` through the core resolve path
- correct address format (`http://localhost:{port}`)
- determinism across two calls with the same input
- distinct addresses for distinct worktree IDs
- refusal when worktree ID is absent

### Contract tests

Use these to prove:

- the provider returns a `DerivedEndpointMapping` for valid input
- the provider returns a `Refusal` with `unsafe_scope` for missing worktree ID
- derived results satisfy the `DerivedEndpointMapping` shape

## Minimum viable scenario set

1. valid worktree derives a local HTTP address with port in the expected range
2. same input always derives the same address
3. two distinct worktree IDs derive two distinct addresses
4. missing worktree ID is refused as `unsafe_scope`
5. provider satisfies endpoint provider contract
