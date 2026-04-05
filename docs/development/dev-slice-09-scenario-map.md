# Dev Slice 09 — Scenario Map

## Slice theme

Explicit scoped cleanup

## Scenario goal

Demonstrate that one destructive cleanup operation can be requested explicitly while preserving refusal-first safety behavior.

The scenario set is intentionally narrow.
It proves cleanup behavior, not full lifecycle management.

## Primary feature area

### Feature area A — Support explicit cleanup when allowed

#### Scenario A1.1

Given one declared resource with explicit scoped cleanup intent and a provider that supports cleanup  
When the core coordinates cleanup  
Then the request succeeds for one worktree instance

### Feature area B — Refuse unsupported or unsafe cleanup

#### Scenario B1.1

Given one declared resource with explicit scoped cleanup intent and a provider that does not support cleanup  
When the core coordinates cleanup  
Then the operation is refused as unsupported capability

#### Scenario B1.2

Given one declared resource that does not declare scoped cleanup intent  
When the core coordinates cleanup  
Then the operation is refused as invalid configuration

#### Scenario B1.3

Given one declared resource with explicit scoped cleanup intent but no safe worktree scope  
When the core coordinates cleanup  
Then the operation is refused as unsafe scope

### Feature area C — Preserve boundary separation

#### Scenario C1.1

Given derive-only orchestration  
When cleanup intent exists in repository configuration  
Then cleanup does not execute implicitly

## Recommended test layering

### Acceptance / behavior tests

Use these to prove:

- the happy-path cleanup succeeds
- unsupported and unsafe cleanup paths are refused
- cleanup is not triggered by derive-only behavior

### Contract tests

Use these to prove:

- the cleanup capability exists only when explicitly declared
- provider-side scope refusal stays in provider code

## Minimum viable scenario set

The leanest proof set for this slice is:

1. supported cleanup succeeds
2. unsupported cleanup is refused
3. missing cleanup intent is refused
4. unsafe scope is refused
5. cleanup does not run implicitly during derive-only resolution
