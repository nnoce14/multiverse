---
name: git-task-workflow
description: Use this skill when a Multiverse task is ready for Git workflow handling on a task branch, including confirming or creating the correct branch, validating and grouping changes, making focused commits, pushing the branch, and creating a concise pull request for human review without merging.
---

# Git Task Workflow

Use this skill when a Multiverse task is ready for branch, commit, push, and pull request workflow.

## Read first

1. `CLAUDE.md`
2. the active task document under `docs/development/tasks/` if one exists
3. the active slice document under `docs/development/` if the task is slice-based
4. `AGENTS.md` only if additional repo guidance is needed

## Use this skill when

Use this skill when the task requires:

- creating or confirming a task branch
- reviewing the working tree before commit
- making focused commits
- pushing the branch
- creating a pull request with `gh`

## Do not use this skill when

Do not use this skill when:

- the work is not ready for commit
- required checks have not passed
- the working tree still contains unrelated changes
- the task would require merging a pull request

## Workflow

1. Inspect the current branch and working tree.
2. Confirm or create the correct task branch.
3. Identify the intended file set and exclude incidental changes.
4. Run the checks required for the current task.
5. Summarize the proposed commit scope and commit message(s).
6. Stage only the intended files.
7. Commit in focused logical groups.
8. Push the branch to origin.
9. Create a concise PR with `gh pr create` if requested and available.
10. Stop for human review. Do not merge.

## Validation

Run only the checks appropriate to the task.

Typical examples:

- `scripts/codex-env.sh pnpm typecheck`
- `scripts/codex-env.sh pnpm test:acceptance`

## PR summary

Keep PR descriptions concise and factual. Include:

- summary
- scope
- validation
- deferred items if relevant

## Output

Provide:

- branch status
- intended file set
- checks run and results
- proposed commit message(s)
- push result
- PR title and summary if a PR is created

## Stop conditions

Stop if:

- unrelated changes cannot be safely separated
- required checks are failing
- the correct branch is unclear
- `gh` is unavailable or unauthenticated when PR creation is requested
- the workflow would require merge or force-push without explicit instruction