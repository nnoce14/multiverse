# Dev Slice 04 — Scenario Map

## Slice theme

Validated repository configuration at the core boundary

## Scenario goal

Demonstrate that raw repository declarations are not trusted by orchestration until they pass explicit validation.

The scenario set for this slice is intentionally narrow.
It proves admission of trusted repository declarations, not every future configuration rule.

## Primary feature area

### Feature area A — Boundary validation for repository configuration

This feature area proves that the current single-resource, single-endpoint path can validate raw repository configuration before orchestration begins.

## Scenario groups

### Group A1 — Accept valid raw repository configuration

#### Scenario A1.1

Given raw repository configuration containing one valid declared resource and one valid declared endpoint  
When the configuration is validated through the current orchestration path  
Then orchestration receives a trusted repository representation

### Group A2 — Reject malformed repository declarations

#### Scenario A2.1

Given raw repository configuration with a resource missing its provider  
When the configuration is validated  
Then validation fails as invalid configuration

#### Scenario A2.2

Given raw repository configuration with a resource missing its primary isolation strategy  
When the configuration is validated  
Then validation fails as invalid configuration

#### Scenario A2.3

Given raw repository configuration with an endpoint missing its intended role  
When the configuration is validated  
Then validation fails as invalid configuration

### Group A3 — Preserve boundary/orchestration separation

#### Scenario A3.1

Given invalid raw repository configuration  
When boundary validation fails  
Then provider orchestration is not invoked

#### Scenario A3.2

Given valid raw repository configuration  
When boundary validation succeeds  
Then downstream orchestration receives only trusted repository declarations

## Recommended test layering

### Acceptance / behavior tests

Use these to prove:

- valid raw repository configuration is accepted through the current orchestration path
- invalid raw repository configuration is refused before orchestration
- provider-facing orchestration does not run on invalid raw configuration

### Unit tests

Use these to prove:

- structured validation output for missing required resource and endpoint fields
- trusted repository representation returned by the validation seam

## Minimum viable scenario set

The leanest proof set for this slice is:

1. valid raw repository configuration is accepted
2. a resource missing its provider is rejected
3. a resource missing its isolation strategy is rejected
4. an endpoint missing its role is rejected
5. invalid raw repository configuration does not invoke orchestration
