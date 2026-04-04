# Resource Isolation Scenarios

## Scenario: name-scoped resources derive different names per worktree

Given two worktree instances of the same repository
And a resource with a name-scoped isolation strategy
When the tool derives isolated resource values
Then the resource name for the first worktree differs from the resource name for the second worktree

## Scenario: path-scoped resources derive different paths per worktree

Given two worktree instances of the same repository
And a resource with a path-scoped isolation strategy
When the tool derives isolated resource values
Then the resource path for the first worktree differs from the resource path for the second worktree

## Scenario: process-scoped resources require distinct runtime instances

Given two worktree instances of the same repository
And a resource with a process-scoped isolation strategy
When the tool prepares isolated runtime behavior
Then the resource for one worktree is not treated as the same runtime instance as the resource for the other worktree

## Scenario: fake integration state is treated as a resource

Given a fake local integration that produces mutable local state
When the tool models local isolation requirements
Then that integration-owned state is treated as a resource

## Scenario: real local infrastructure is treated as a resource

Given a real local backing system used by the application during local development
When the tool models local isolation requirements
Then that backing system is treated as a resource

## Scenario: resource declaration includes isolation strategy

Given a resource declared for the repository
When the tool evaluates the resource definition
Then the resource declares one primary isolation strategy

## Scenario: resource declaration includes lifecycle support information

Given a resource declared for the repository
When the tool evaluates the resource definition
Then the resource indicates whether scoped reset is supported
And the resource indicates whether scoped cleanup is supported

## Scenario: scoped reset does not affect another worktree

Given two worktree instances with isolated state for the same resource
And the resource supports scoped reset
When the first worktree resets its isolated resource state
Then the second worktree's isolated resource state remains unchanged

## Scenario: scoped cleanup does not affect another worktree

Given two worktree instances with isolated state for the same resource
And the resource supports scoped cleanup
When the first worktree cleans up its isolated resource state
Then the second worktree's isolated resource state remains unchanged

## Scenario: destructive action is refused when safe scope cannot be determined

Given a resource operation that would destroy or reinitialize resource state
When the tool cannot safely determine the owning worktree scope
Then the tool does not proceed silently with the destructive action
