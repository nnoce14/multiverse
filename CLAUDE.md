# CLAUDE.md

## Purpose

Multiverse is a behavior-first tool for deterministic local runtime isolation across multiple git worktrees of the same repository on one machine.

## Current Phase

This repository is transitioning from design into implementation through small vertical slices driven by executable acceptance tests.

## Source of Truth

When implementing behavior, use this precedence order:

1. accepted ADRs under `docs/adr/`
2. specifications under `docs/spec/`
3. scenarios under `docs/scenarios/`
4. development guidance under `docs/development/`

Do not invent behavior not supported by these sources.

## Hard Constraints for 1.0

- no provider inference
- no managed object inference
- repository configuration is declarative only
- refusal is a first-class behavior
- refuse rather than guess when safe scope is ambiguous
- core and provider responsibilities must remain separate

## Boundary Rules

- core enforces business rules, coordination, and safety/refusal
- providers implement technology-specific isolation behavior through explicit contracts
- repository configuration must remain explicit
- do not move business rules into provider code
- do not introduce hidden defaults or convenience inference

## Implementation Rules

- implement only the current slice
- prefer extending tests before extending production code
- follow a bounded red-green-refactor loop for slice implementation:
  1. make the relevant acceptance and contract tests fail for the in-scope behavior
  2. add the minimum production code needed to make them pass
  3. perform a bounded refactor pass while keeping tests green
  4. add focused unit tests for extracted pure helpers when they improve maintainability
- do not broaden CLI or UX surface unless explicitly required
- do not introduce orchestration behavior unless explicitly required
- do not silently resolve ambiguity by guessing
- do not add speculative abstractions beyond the needs of the current slice
- keep 1.0 narrow; capture broader ergonomics, ecosystem, or 2.0 ideas as
  deferred follow-up work unless the active slice explicitly requires them

## Testing Rules

Multiverse follows behavior-first TDD.

- acceptance tests verify externally visible business behavior and derive from scenario documents
- provider contract tests verify provider compliance with core expectations
- unit tests verify local implementation details and do not replace acceptance coverage
- passing acceptance tests are necessary but not always sufficient for completion; a slice may require a bounded refactor pass before it is considered done
- refactor passes must preserve behavior proven by acceptance and contract tests

## Task Discipline

Each implementation task must define:

- the vertical slice in scope
- scenario coverage in scope
- expected files to change
- explicit out-of-scope behavior
- acceptance criteria
- safety/refusal expectations

Each implementation slice should normally also have a short task document under
`docs/development/tasks/`, even when a slice document already exists.

That task document may be brief, but it should make the active file set,
acceptance target, and explicit out-of-scope boundary easy to review before
coding starts.

If a task is ambiguous, preserve existing boundaries rather than introducing new behavior.

## Slice Completion Discipline

Before considering a slice done or opening a PR, review whether truth-alignment
updates are needed in:

- the active ADR for the slice, if one exists
- the active slice doc and any task doc used for implementation
- nearby state/roadmap/repo-map docs that describe the implemented seam

When doing that review:

- distinguish clearly between the current project version posture and behavior
  merely implemented on `main`
- do not imply a release bump unless the version itself changed
- describe narrow shared declaration or contract changes explicitly when they
  occurred; do not describe them as "no contract change" if a small explicit
  extension was introduced
- record deferred items explicitly instead of smuggling them into the completed
  slice

## Git Workflow Policy

For coding-agent work in this repository:

- never work directly on `main`
- never push directly to `main`
- use a task-scoped branch for implementation work
- pull requests are required for review
- the coding agent should autonomously create branches, commit focused changes, push task branches, and open pull requests when work is ready
- the coding agent may merge its own pull requests after required validation passes and no blocking review feedback remains
- do not force-push unless explicitly instructed

Use the `git-task-workflow` skill when a task reaches branch, commit, push, or pull request stages.

Routine branch, commit, push, and pull request steps do not require additional user approval.
Stop for user input only when:

- business truth is ambiguous
- unrelated changes cannot be safely separated
- required validation is failing and the next step is unclear
- a force-push would be required

### Merge Rules

The coding agent may merge its own PRs when all of the following are true:

- the branch is up to date enough to merge cleanly
- required validation for the task has passed
- there is no unresolved blocking review feedback or requested-change state
- the PR scope matches the active task and does not include unrelated work
- the merge can be performed without force-pushing

If any of those conditions are not met, stop and ask for user input.

### Pull Request Rules

When creating a PR, include:

- a concise summary of the task
- the scope of changes
- validation performed
- notable deferred items or follow-up work
- whether docs or status artifacts were updated as part of slice completion when
  that is relevant

Keep PR descriptions concise and factual.

## Skill Usage Guidance

When a task clearly matches a repository skill, prefer using the skill instead of recreating the workflow ad hoc.

Prefer the lightest workflow that fits the task.

### Default execution

For small or well-bounded tasks, use direct execution without subagents.

### Use `scenario-to-acceptance`

Use when the task is to derive executable acceptance coverage from existing ADRs, specs, scenarios, and active slice docs.

### Use `slice-implementation`

Use when acceptance or contract coverage already defines the in-scope behavior and the task is to implement the current slice with a narrow production change.

### Use `tdd-red-green-refactor`

Use when the task requires the full TDD loop for the current slice, including:

- driving behavior from acceptance and contract tests
- getting to green with minimal code
- performing a bounded refactor pass under test protection
- adding focused unit tests for extracted pure helpers where useful

### Use `git-task-workflow`

Use when the task is ready for branch, commit, push, or pull request workflow.
Do not use it before required checks pass.

### Use `lite-subagent-development`

Use when a task may benefit from limited subagent decomposition for planning, implementation, and review.
Default to solo or paired mode.
Do not use subagents to mutate the same shared seam in parallel.

### Use `slice-review`

Use when reviewing a diff, branch, or implementation result against the active slice, task, and scenario-map documents.

### Use `validation-boundary-check`

Use when a change introduces or modifies validation logic and it is necessary to confirm that declaration validation, scope-safety validation, and provider capability or runtime validation are placed in the correct layer.

## Skill Selection Rule

Prefer the smallest number of skills and the lightest execution mode that can complete the task safely.

Do not introduce subagents or extra review passes unless they provide clear value for the active slice.

## Core Principle

The agent may discover implementation, but it may not discover business truth.

Business truth must come from ADRs, specs, scenarios, and development slice/task documents.

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (90-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk vitest run          # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%)
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->
