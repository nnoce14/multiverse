# System Boundary Scenarios

## Scenario: core tool evaluates repository configuration

Given a repository using the tool
When the tool processes repository configuration
Then the core tool evaluates the configuration as a business declaration surface

## Scenario: core tool enforces business rules

Given a declared repository configuration
When the tool evaluates the configuration
Then the core tool enforces business rules defined by the model

## Scenario: provider implements technology-specific behavior

Given a declared repository object
And a selected provider
When the tool requests an operation
Then the provider implements technology-specific behavior for that operation

## Scenario: provider does not redefine business concepts

Given a declared repository object
And a selected provider
When the provider executes an operation
Then the provider does not redefine business concepts defined by the core model

## Scenario: repository configuration declares managed objects

Given a repository using the tool
When the configuration is defined
Then the repository configuration declares managed resources and endpoints explicitly

## Scenario: repository configuration does not replace provider capability

Given a declared repository object
And a selected provider
When the configuration expresses intended capability usage
Then the repository configuration does not replace provider capability declarations

## Scenario: application consumes derived configuration

Given a declared repository configuration
And derived scoped values from the tool
When the application/runtime executes
Then the application consumes derived configuration and scoped values

## Scenario: application does not manage isolation

Given multiple worktree instances
When the application/runtime executes
Then the application does not manage isolation across worktree instances

## Scenario: core tool coordinates provider invocation

Given a declared repository object
And a selected provider
When an operation is requested
Then the core tool coordinates invocation of the provider

## Scenario: safety rules are respected across all layers

Given an operation requiring safe worktree ownership
When the operation is evaluated
Then all layers respect the safety principle
And no layer bypasses refusal behavior
