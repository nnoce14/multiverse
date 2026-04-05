# Dev Slice 06 — Scenario Map

## Slice theme

Preserve provider refusals through core coordination

## Scenario goal

Demonstrate that provider-originated refusal categories survive the core path unchanged for derive and validate.

The scenario set is intentionally narrow.
It proves refusal propagation, not the full provider model.

## Primary feature area

### Feature area A — Propagate derive refusals unchanged

#### Scenario A1.1

Given a provider that refuses derive with `unsafe_scope`  
When the core coordinates derive  
Then the refusal is returned unchanged

#### Scenario A1.2

Given a provider that refuses derive with `provider_failure`  
When the core coordinates derive  
Then the refusal is returned unchanged

### Feature area B — Propagate validate refusals unchanged

#### Scenario B1.1

Given a provider that refuses validate with `unsafe_scope`  
When the core coordinates validate  
Then the refusal is returned unchanged

#### Scenario B1.2

Given a provider that refuses validate with `provider_failure`  
When the core coordinates validate  
Then the refusal is returned unchanged

### Feature area C — Preserve category boundaries

#### Scenario C1.1

Given a provider-originated refusal  
When the core returns the result  
Then the refusal category remains stable and machine-testable

#### Scenario C1.2

Given a provider-originated refusal  
When the core returns the result  
Then the refusal is not recategorized as invalid configuration

## Recommended test layering

### Acceptance / behavior tests

Use these to prove:

- derive refusals pass through unchanged
- validate refusals pass through unchanged
- the refusal categories remain stable

### Unit tests

Use these to prove:

- any helper logic used to preserve refusal passthrough remains category-stable

## Minimum viable scenario set

The leanest proof set for this slice is:

1. provider-originated unsafe scope during derive is preserved
2. provider-originated provider failure during derive is preserved
3. provider-originated unsafe scope during validate is preserved
4. provider-originated provider failure during validate is preserved
