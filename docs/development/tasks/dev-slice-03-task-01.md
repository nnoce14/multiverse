# Dev Slice 03 — Task 01

## Title

Implement the first validated boundary seam using worktree identity as the proving path

## Objective

Create the minimum production-grade implementation that proves raw application input must be validated before it becomes trusted core input.

Use `WorktreeIdentity` as the first validated domain value unless repo inspection reveals a better already-existing load-bearing candidate.

## Why this task first

This is the narrowest vertical path that establishes the seam without dragging in provider execution or broad domain modeling.

If this task is done well, later slices can reuse the same pattern for repository configuration, endpoint declarations, and provider requests.

---

## Required outcome

Implement a small end-to-end path with these properties:

- an application-facing entry point accepts raw input
- raw input is validated through an explicit seam
- successful validation returns or creates a trusted worktree identity value
- failed validation returns structured validation errors
- invalid raw input does not reach downstream core behavior

---

## Constraints

- Preserve behavior-first TDD workflow.
- Start from failing behavior tests.
- Keep the slice narrow; no speculative general framework build-out.
- Do not add provider execution, filesystem mutation, or orchestration logic.
- Do not redesign repo structure unless necessary to preserve explicit boundaries.
- Do not invent domain rules that are not grounded in existing repo docs or code.
- Do not rely on exception-message assertions where a stable structured result can be asserted instead.
- Do not introduce or preserve cross-package imports that reach into another package's internal source tree.
- Use package public entry points for all cross-package imports in the touched implementation path.
- If the selected path currently uses bad cross-package imports, correct them as part of this task.
- Do not expand into unrelated repo-wide import cleanup outside the Slice 03 path.

---

## Implementation guidance

### 1. Inspect first

Read the current docs and code relevant to:

- system boundary
- worktree identity
- safety/refusal
- any existing core/application module split

Determine whether `WorktreeIdentity` is already partially modeled.
If yes, extend it through the seam rather than replacing it casually.

### 2. Add tests first

Write failing behavior tests that prove:

- valid raw identity is accepted
- missing identity is rejected
- whitespace-only identity is rejected
- invalid input does not invoke downstream core behavior

Then add focused unit tests for validator and/or value rules.

### 3. Implement the seam

Introduce the smallest explicit validation contract needed, for example:

- success/failure result type
- structured validation error record
- mapper/factory/validator at the application boundary

Naming may differ based on the repo’s current style, but the seam must remain obvious.

### 4. Implement the trusted value path

Ensure downstream core code receives a trusted value object or equivalent trusted representation, not raw strings.

### 5. Keep the task vertically complete

Prefer one thin end-to-end path over broad disconnected abstractions.

---

## Suggested acceptance checks

- There is a testable application-boundary function, command, or use-case entry point for this path.
- Invalid raw input produces structured validation failure output.
- Valid raw input produces a trusted worktree identity value.
- No core behavior path accepts malformed raw identity input in normal application flow.
- Tests clearly distinguish boundary validation from downstream domain behavior.
- All cross-package imports in files touched by this task use public package entry paths.
- No new source-to-source package boundary violations are introduced.

---

## Deliverables

- failing tests first, then passing implementation
- minimal validation primitives
- first validated worktree identity path
- brief doc update if naming or seam placement needs clarification

---

## Non-goals

Do not in this task:

- validate all input types
- create a giant shared validation framework
- introduce provider adapters
- implement endpoint allocation
- add CLI UX beyond what is needed to prove the seam

---

## Completion note

The task is complete when the repo has one narrow, behavior-tested, implementation-grade example of the validated boundary seam in real use.
