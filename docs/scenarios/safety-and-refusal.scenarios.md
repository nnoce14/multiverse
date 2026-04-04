# Safety and Refusal Behavior Scenarios

## Scenario: invalid configuration is treated distinctly from unsafe scope

Given a repository configuration that violates required business rules
When the tool evaluates the configuration
Then the tool treats the condition as invalid configuration
And the tool does not treat the condition as unsafe scope

## Scenario: unsupported capability is treated distinctly from provider failure

Given a declared repository object
And a selected provider that does not support a requested capability
When the repository intends to use that capability
Then the tool treats the condition as unsupported capability
And the tool does not treat the condition as provider failure

## Scenario: unsafe scope causes refusal during derivation

Given a declared repository object
And a selected provider
When the tool requests derivation
And safe worktree-instance ownership cannot be determined
Then the operation is refused

## Scenario: unsafe scope causes refusal during validation

Given a declared repository object
And a selected provider with validate capability
When the tool requests validation
And safe worktree-instance ownership cannot be determined
Then the operation is refused

## Scenario: unsafe scope causes refusal during reset

Given a declared repository object
And a selected provider with reset capability
When the tool requests reset
And safe worktree-instance ownership cannot be determined
Then the operation is refused

## Scenario: unsafe scope causes refusal during cleanup

Given a declared repository object
And a selected provider with cleanup capability
When the tool requests cleanup
And safe worktree-instance ownership cannot be determined
Then the operation is refused

## Scenario: destructive operations do not use best-effort behavior

Given a declared repository object
And a destructive operation is requested
When worktree scope is ambiguous
Then the tool does not proceed with best-effort behavior
And the operation is refused

## Scenario: non-destructive operations may still be refused

Given a declared repository object
When the tool requests a non-destructive operation
And safe ownership cannot be determined
Then the operation is refused

## Scenario: core refuses operations when configuration cannot establish ownership boundary

Given repository configuration that does not establish safe ownership boundaries
When the tool evaluates an operation
Then the core tool refuses the operation

## Scenario: provider refuses operations when technology-specific safety cannot be established

Given a valid declared repository object
And a selected provider
When the provider cannot establish technology-specific safety for the requested action
Then the provider refuses the operation

## Scenario: provider failure is distinct from unsafe scope

Given a valid declared repository object
And a selected provider
When the provider attempts a safe operation
And the operation fails for provider-specific reasons unrelated to ownership ambiguity
Then the condition is treated as provider failure
And the condition is not treated as unsafe scope
