# Task: Dev Slice 57 — 0.8.x Planning Baseline

## Slice

57 — 0.8.x support boundary planning baseline

## Purpose

Produce the planning artifacts for the `0.8.x` support boundary definition wave.
No implementation. No new specs. No behavior changes.

The deliverable is a planning baseline document that gives follow-on slices (58–61)
a shared starting point: what is already explicit in source-of-truth docs, what the
gaps are, and in what order to address them.

## Active file set

- `docs/development/tasks/dev-slice-57-0.8x-planning-baseline.md` — primary planning doc (new)
- `docs/development/tasks/dev-slice-57-task-01.md` — this task doc (new)

## Audit performed

Four seams were audited against ADRs, specs, scenarios, guides, and provider packages:

1. **Provider support classification** — no source-of-truth doc classifies the six providers
   as first-class / experimental / deferred; capability matrix recorded
2. **Official workflow** — `external-demo-guide` covers the full workflow but does not state
   it as the "officially supported 1.0 common case"
3. **Consumer integration model** — `appEnv` / runtime-config boundary proven in ADR-0018,
   ADR-0019, and code; not explicitly classified as "officially supported for 1.0"
4. **Core/extension boundary** — boundary distributed across five docs; no single 1.0 statement

## Proposed follow-on slices

| Slice | Focus |
|---|---|
| 58 | Provider support classification doc |
| 59 | Official workflow statement |
| 60 | Consumer integration model classification |
| 61 | Core/extension boundary consolidation |

## Explicit out-of-scope

- No new providers, commands, or flags
- No implementation changes
- No outside-workspace packaging work
- No provider ecosystem formalization

## Acceptance criteria

- `dev-slice-57-0.8x-planning-baseline.md` exists and covers all four seams
- Each seam section states what is already explicit and what the gap is
- A proposed slice sequence is recorded (58–61) with deliverable per slice
- No production code is changed
- No test files are changed
