# Coding Task Template

## Objective

Implement the following vertical slice for Multiverse:

[describe the slice in one sentence]

## Business Context

Multiverse is a behavior-first isolation tool for parallel development across git worktrees of the same repository on one machine.

This task must preserve explicit worktree-instance boundaries, declarative repository configuration, and refusal-first safety behavior.

## In Scope

- [list exact behaviors in scope]
- [list exact scenario files or scenario sections in scope]
- [list expected production areas allowed to change]
- [list expected test areas allowed to change]

## Out of Scope

- provider inference
- managed object inference
- broad CLI UX expansion
- arbitrary process orchestration
- behavior not justified by current specs/scenarios
- speculative abstractions not required for this slice

Add any slice-specific exclusions here:

- [slice-specific exclusions]

## Source Documents

Use these as the source of truth:

- [spec documents]
- [scenario documents]
- [relevant ADRs]
- `AGENTS.md`
- `docs/development/testing-strategy.md`
- `docs/development/implementation-strategy.md`

## Required Constraints

- refusal must remain a first-class behavior
- do not guess when safe scope is ambiguous
- core must not absorb provider-specific implementation details
- providers must not redefine business concepts
- repository configuration remains explicit

## Expected Deliverables

- executable acceptance tests for the in-scope behavior
- minimal production implementation required to satisfy those tests
- contract tests only where needed by the slice
- no unrelated refactors

## Version and Status Check

Before implementation starts, note whether this task is expected to:

- change only behavior implemented on `main`
- change the current project version posture
- require ADR, slice-doc, roadmap, current-state, or repo-map updates when done

If the task does not change the published version posture, say so explicitly and
avoid wording that implies a release bump.

## Acceptance Criteria

- [criterion 1]
- [criterion 2]
- [criterion 3]
- [criterion 4]

## Notes for the Coding Agent

Before making changes:

1. identify the smallest set of files required
2. confirm the change preserves current boundaries
3. implement tests before broadening production code
4. stop at the slice boundary

Before considering the task complete:

1. confirm a short task doc exists and still matches the implemented slice
2. perform the bounded refactor pass required by the repo's TDD loop
3. review whether the active ADR, slice doc, and nearby state docs need
   truth-alignment updates
4. distinguish clearly between "implemented on `main`" and any actual version
   or release-posture change
5. list deferred items explicitly in the PR summary instead of broadening scope

When uncertain, prefer refusal and explicitness over convenience behavior.
