# Dev Slice 05 — Scenario Map

## Slice theme

Validated endpoint declaration at the core boundary

## Scenario goal

Demonstrate that raw endpoint declarations are not trusted by orchestration until they pass explicit validation.

The scenario set below is intentionally narrow.
It proves admission of trusted endpoint declarations, not the full endpoint model.

## Primary feature area

### Feature area A — Boundary validation for endpoint declarations

This feature area proves that the current single-endpoint path can validate raw endpoint declarations before orchestration begins.

## Scenario groups

### Group A1 — Accept valid raw endpoint declarations

#### Scenario A1.1

Given raw endpoint declarations containing one valid endpoint with a name, provider, and intended role  
When the declarations are validated through the current orchestration path  
Then orchestration receives a trusted endpoint representation

### Group A2 — Reject malformed endpoint declarations

#### Scenario A2.1

Given raw endpoint declarations with an endpoint missing its name  
When the declarations are validated  
Then validation fails as invalid configuration

#### Scenario A2.2

Given raw endpoint declarations with an endpoint missing its provider  
When the declarations are validated  
Then validation fails as invalid configuration

#### Scenario A2.3

Given raw endpoint declarations with an endpoint missing its intended role  
When the declarations are validated  
Then validation fails as invalid configuration

### Group A3 — Preserve boundary/orchestration separation

#### Scenario A3.1

Given invalid raw endpoint declarations  
When boundary validation fails  
Then provider orchestration is not invoked

#### Scenario A3.2

Given valid raw endpoint declarations  
When boundary validation succeeds  
Then downstream orchestration receives only trusted endpoint declarations

## Recommended test layering

### Acceptance / behavior tests

Use these to prove:

- valid raw endpoint declarations are accepted through the current orchestration path
- invalid raw endpoint declarations are refused before orchestration
- provider-facing orchestration does not run on invalid raw endpoint declarations

### Unit tests

Use these to prove:

- structured validation output for missing required endpoint fields
- trusted endpoint representation returned by the validation seam

## Minimum viable scenario set

The leanest proof set for this slice is:

1. valid raw endpoint declarations are accepted
2. an endpoint missing its name is rejected
3. an endpoint missing its provider is rejected
4. an endpoint missing its intended role is rejected
5. invalid raw endpoint declarations do not invoke orchestration
