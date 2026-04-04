# Repository Configuration Scenarios

## Scenario: managed resources are declared explicitly

Given a repository using the tool in 1.0
When the tool evaluates repository configuration
Then every managed resource is declared explicitly

## Scenario: managed endpoints are declared explicitly

Given a repository using the tool in 1.0
When the tool evaluates repository configuration
Then every managed endpoint is declared explicitly

## Scenario: provider selection is explicit for every declared object

Given a repository using the tool in 1.0
When the tool evaluates repository configuration
Then every declared resource explicitly selects a provider
And every declared endpoint explicitly selects a provider

## Scenario: resource declaration includes required core fields

Given a declared resource
When the tool evaluates repository configuration
Then the resource declaration includes a resource name
And the resource declaration includes a provider
And the resource declaration includes a primary isolation strategy
And the resource declaration indicates whether scoped reset is intended for use
And the resource declaration indicates whether scoped cleanup is intended for use

## Scenario: endpoint declaration includes required core fields

Given a declared endpoint
When the tool evaluates repository configuration
Then the endpoint declaration includes an endpoint name
And the endpoint declaration includes an intended role
And the endpoint declaration includes a provider

## Scenario: provider capability and repository intent are evaluated separately

Given a declared repository object
And a selected provider
When the tool evaluates repository configuration
Then provider capability is not treated as the same thing as repository intent

## Scenario: repository cannot intend to use unsupported capability

Given a declared repository object
And a selected provider that does not support a capability
When the repository declares intent to use that capability
Then the refusal category is `unsupported_capability`

## Scenario: provider-specific configuration may extend but not replace core declaration

Given a declared repository object
When the tool evaluates provider-specific configuration
Then provider-specific configuration may extend the declaration
But provider-specific configuration does not replace required core business fields

## Scenario: missing required declaration makes configuration invalid

Given a repository using the tool in 1.0
When a managed resource or managed endpoint is not declared
Then the repository configuration is invalid

## Scenario: missing provider assignment makes configuration invalid

Given a declared repository object
When the object does not explicitly select a provider
Then the repository configuration is invalid

## Scenario: missing resource isolation strategy makes configuration invalid

Given a declared resource
When the resource does not declare a primary isolation strategy
Then the repository configuration is invalid
