# Post-Wave Assessment: 0.6.x Semantic Stability Complete

## Purpose

This document records the post-wave assessment performed after completing the planned
`0.6.x` semantic-stability wave (Slices 44–49). Its purpose is to determine the honest
next project posture and identify the highest-signal proving question for the next wave.

## Wave summary

Slices 44–49 addressed all six semantic seams identified in the planning pass:

| Slice | Seam(s) | Outcome |
|---|---|---|
| 44 | All six | Planning baseline; six-seam audit; proposed slice sequence |
| 45 | Seam 1, Seam 4 | Reset/cleanup intent and scope-confirmation vs effectful distinction added to spec, scenarios, guide |
| 46 | Seam 2 | path-scoped `validateResource` implemented; `scopedValidate` added to spec; scenarios added |
| 47 | Seam 3, Seam 4 | Refusal audit across all five commands — no conflation found; spec/contract naming split documented; `run` added to Operations Subject to Refusal; scenario added |
| 48 | Seam 6 | Worktree identity scenarios aligned with ADR-0021; auto-discovery scenarios added; "recreated worktree" annotated as deferred |
| 49 | Seam 5 | appEnv exclusion from `derive --format=env` explicitly classified as deferred in ADR-0018; external-demo-guide Step 6 corrected |

## 0.6.x exit criteria assessment

From `roadmap.md`:

| Exit criterion | Evidence | Met? |
|---|---|---|
| Lifecycle semantics feel consistent and trustworthy | Slice 45 aligned spec + scenarios for reset/cleanup intent and scope-confirmation semantics | ✓ |
| Refusal behavior understandable and predictable | Slice 47 audited all five commands; no conflation; spec/contract naming split documented | ✓ |
| Major core terms stable across docs, code, and CLI output | "scope-confirmation," "effectful," refusal category names all now documented consistently | ✓ |
| Users can infer what Multiverse will do without guesswork | Worktree identity scenarios corrected and complete; appEnv boundary classified | ✓ |
| Consumer configuration model feels dependable | appEnv exclusion from derive classified as intentional and deferred; external-demo-guide corrected | ✓ |

All five criteria are met in substance.

## Remaining open items (not blockers)

The following items are explicitly deferred and do not constitute uncompleted 0.6.x work:

- **Refusal reporting format** (stdout vs stderr for `run`): in the spec's Open Areas; not
  addressed without a spec decision
- **User-facing messaging conventions**: in the spec's Open Areas
- **appEnv in `derive --format=env`**: explicitly deferred in ADR-0018; no accepted follow-on ADR
- **Validate for name-scoped, process-scoped, process-port-scoped**: not declared; validate
  is provider-specific; no spec requirement for additional providers in the current scope
- **Outside-workspace packaging/distribution**: always deferred; not part of 0.6.x

## Recommendation: Outcome B

Close out `0.6.x` and move to `0.7.0-alpha.1`.

The planned 0.6.x wave is complete in substance. Remaining open items are correctly
classified as deferred. There is no genuine 0.6.x semantic-stability gap that is both
unaddressed and a blocker.

## Next proving question: 0.7.x public surface stability

From `roadmap.md`, the 0.7.x line is for stabilizing the public-facing product surface:
command names, flags, invocation patterns, CLI help text, output conventions,
installation/build/link expectations, and example consistency.

The highest-signal proving question for 0.7.x is:

**Does the CLI surface — flag naming, invocation patterns, help output, and output
format conventions — feel intentional and stable enough that a user would not be
forced to relearn it between minor versions?**

Known signals that this question is live:
- The CLI `--help` output is a single long usage string, not a structured help system
- `validate-worktree` and `validate-repository` are internal utility commands exposed on
  the same surface as `derive`, `run`, `reset`, `cleanup`, `validate` — it is not
  obvious how they relate to each other
- Output format is raw JSON with no per-command output specification documented in specs
- `derive --format=env` and `derive` (JSON) are documented in the guide but not in any
  spec or scenario that defines expected output shape
- The repo-local (`pnpm cli`) and formal binary (`multiverse`) invocation paths both work
  but their relationship is documented only in the guide, not in any spec

No changes to these areas are included in this assessment document. They are identified
as the next proving target for 0.7.x work. Each will require its own slice and task doc.
