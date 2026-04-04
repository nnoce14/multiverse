# Endpoint Model Scenarios

## Scenario: endpoint derives one address for one worktree instance

Given a declared endpoint
And an explicitly selected endpoint provider
When the tool requests endpoint derivation for a worktree instance
Then the endpoint derives exactly one address for that worktree instance

## Scenario: endpoint derivation is deterministic

Given a declared endpoint
And an explicitly selected endpoint provider
When the tool derives the endpoint address multiple times for the same worktree instance with the same input
Then the derived endpoint address remains the same

## Scenario: same endpoint on different worktrees does not create ambiguous ownership

Given two worktree instances of the same repository
And a declared endpoint with the same intended role in each worktree instance
When the tool derives endpoint addresses
Then the derived endpoint address for the first worktree does not create ambiguous local ownership with the derived endpoint address for the second worktree

## Scenario: endpoint is a declared communication object

Given a repository endpoint declaration
When the tool evaluates the declaration
Then the endpoint has a declared name
And the endpoint has a declared intended role
And the endpoint has an explicitly selected provider

## Scenario: endpoint is not modeled as a resource

Given a declared endpoint
When the tool evaluates the business model
Then the endpoint is not treated as a resource

## Scenario: endpoint provider must support derive

Given a declared endpoint provider
When the tool evaluates provider capabilities
Then the endpoint provider supports derive

## Scenario: endpoint provider may support validate

Given a declared endpoint provider with validate capability
When the tool requests validation for a worktree instance
Then the endpoint provider may validate the derived address or scope for that worktree instance

## Scenario: endpoint provider selection is explicit

Given a declared endpoint
When the tool evaluates provider assignment in 1.0
Then the endpoint provider is selected explicitly by repository configuration
And the tool does not infer the endpoint provider automatically

## Scenario: endpoint derivation preserves worktree boundaries even when branch metadata matches

Given two linked worktree instances on the same branch
And a declared endpoint with the same intended role
When the tool derives endpoint addresses
Then endpoint derivation preserves the ownership boundary between the two worktree instances

## Scenario: endpoint derivation is refused when safe ownership cannot be determined

Given a declared endpoint
When the endpoint provider cannot safely determine the owning worktree scope
Then the tool does not proceed silently with endpoint derivation
