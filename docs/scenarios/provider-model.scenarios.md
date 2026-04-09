# Provider Model Scenarios

## Scenario: resource provider derives scoped values

Given a declared resource
And an explicitly selected resource provider
When the tool requests derived values for a worktree instance
Then the provider derives scoped values for that worktree instance

## Scenario: endpoint provider derives scoped values

Given a declared endpoint
And an explicitly selected endpoint provider
When the tool requests derived values for a worktree instance
Then the provider derives scoped values for that worktree instance

## Scenario: provider selection is explicit

Given a declared repository object
When the tool evaluates provider assignment in 1.0
Then the provider is selected explicitly by repository configuration
And the tool does not infer the provider automatically

## Scenario: derive is required for every provider

Given a declared provider
When the tool evaluates provider capabilities
Then the provider supports derive

## Scenario: optional capabilities are declared explicitly

Given a declared provider
When the tool evaluates provider capabilities
Then any support for validate, reset, or cleanup is declared explicitly

## Scenario: provider may support validate

Given a declared provider with validate capability
When the tool requests validation for a worktree instance
Then the provider may validate derived scope or values for that worktree instance

## Scenario: provider may support reset

Given a declared provider with reset capability
And isolated state for a worktree instance
When the tool requests reset explicitly
Then the provider resets only the isolated state belonging to that worktree instance

## Scenario: provider may support cleanup

Given a declared provider with cleanup capability
And provider-managed isolated state for a worktree instance
When the tool requests cleanup explicitly
Then the provider cleans up only the isolated state belonging to that worktree instance

## Scenario: destructive provider action is never implicit

Given a provider with reset or cleanup capability
When the tool derives scoped values only
Then the provider does not perform destructive actions implicitly

## Scenario: destructive action is refused when safe scope cannot be determined

Given a provider that supports a destructive capability
When the provider cannot safely determine the owning worktree scope
Then the provider does not proceed silently with the destructive action

## Scenario: provider capability claims must be honest

Given a declared provider
When the tool evaluates the provider's declared capabilities
Then the provider does not claim support for a capability it cannot safely perform

## Scenario: reset intent is to prepare isolated state for fresh use

Given a declared provider with reset capability
When the tool requests reset for a worktree instance
Then the isolated state for that instance is prepared for fresh use
And the worktree instance is expected to continue in use after reset

## Scenario: cleanup intent is permanent removal of isolated state

Given a declared provider with cleanup capability
When the tool requests cleanup for a worktree instance
Then the isolated state for that instance is permanently removed
And the worktree instance is not expected to continue in use after cleanup

## Scenario: provider with no owned state may implement reset as scope-confirmation

Given a declared provider with reset capability
And the provider owns no mutable state of its own
When the tool requests reset for a worktree instance
Then the provider may return scope-confirmation metadata without performing side effects
And the worktree scope boundary is confirmed as correctly recognized

## Scenario: provider with no owned state may implement cleanup as scope-confirmation

Given a declared provider with cleanup capability
And the provider owns no mutable state of its own
When the tool requests cleanup for a worktree instance
Then the provider may return scope-confirmation metadata without performing side effects
And the worktree scope boundary is confirmed as correctly recognized
