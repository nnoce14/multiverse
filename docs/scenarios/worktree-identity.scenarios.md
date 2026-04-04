# Worktree Identity Scenarios

## Scenario: main checkout identity
Given the main checkout
When the tool derives worktree identity
Then the Worktree ID is `main`
And the Worktree Label is `main`

## Scenario: linked worktree receives unique identity
Given a linked worktree
When the tool derives worktree identity
Then the worktree receives a unique Worktree ID
And the worktree receives a human-readable Worktree Label

## Scenario: same branch, different worktrees
Given two linked worktrees on the same branch
When the tool derives worktree identity for each
Then each worktree receives a different Worktree ID

## Scenario: recreated worktree gets new lifecycle identity
Given a linked worktree that previously existed and was removed
And a new linked worktree is later created from the same branch
When the tool derives worktree identity
Then the new worktree receives a new Worktree ID
And the old identity is not reused

## Scenario: branch name is metadata only
Given a linked worktree with branch metadata
When the tool derives worktree identity
Then branch name may influence the human-readable label
But branch name does not define the canonical Worktree ID