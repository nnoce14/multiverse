# Worktree Identity Scenarios

## Scenario: main checkout identity when --worktree-id is supplied explicitly

Given the main checkout
And --worktree-id main is supplied
When the tool derives worktree identity
Then the Worktree ID is `main`
And the Worktree Label is `main`

## Scenario: auto-discovery resolves worktree identity from git worktree path basename

Given a git repository
And the tool is invoked from within a known git worktree directory
And --worktree-id is not supplied
When the tool discovers worktree identity
Then the discovered Worktree ID is the basename of the matching worktree's filesystem path

## Scenario: primary checkout identity under auto-discovery is the directory basename

Given the primary checkout
And --worktree-id is not supplied
When the tool discovers worktree identity
Then the discovered Worktree ID is the basename of the primary checkout's filesystem path
And that identity may or may not be "main" depending on how the repository was cloned

## Scenario: auto-discovery refuses when worktree identity cannot be determined

Given --worktree-id is not supplied
When the tool attempts to discover worktree identity
And git is unavailable or no worktree path matches the current working directory
Then the operation is refused
And the refusal message directs the caller to pass --worktree-id explicitly

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

NOTE: This scenario is aspirational. It requires a persistent worktree identity registry
and is explicitly deferred. ADR-0021 confirms this is not addressed by the current
auto-discovery algorithm and will require a future registry-based approach.

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
