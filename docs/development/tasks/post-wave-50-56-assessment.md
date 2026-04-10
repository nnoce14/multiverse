# Post-Wave Assessment: 0.7.x Public Surface Stability Complete

## Purpose

This document records the post-wave assessment performed after completing the planned
`0.7.x` public-surface stability wave (Slices 50–56). Its purpose is to determine the
honest next project posture and identify the highest-signal proving question for the next wave.

## Wave summary

Slices 50–56 addressed every item listed in the roadmap's "Immediate direction" for 0.7.x:

| Slice | Focus | Outcome |
|---|---|---|
| 50 | `--help`/`-h` correctness and usage structure | Exit 0 for help flags; raw blob replaced with structured multi-line USAGE_LINES |
| 51 | Output-shape specification | `docs/spec/cli-output-shapes.md` + 20 executable acceptance tests across all 5 primary commands |
| 52 | Help Options completeness | `--help`/`-h` and `--format` added to Options subsections; acceptance tests |
| 53 | README and guide alignment | README Common commands fixed; `cli-output-shapes.md` in Key docs; guide Reference and Step 6 updated |
| 54 | Utility-command classification | `"Utility commands (declaration validation):"` label in USAGE_LINES; spec exclusion note expanded |
| 55 | Utility-command decision memo | Explicit options A–D framed; Option B recommended; product decision solicited |
| 56 | `validate-worktree` removal | Command removed; rationale anchored to ADR-0021; tests updated; `validate-repository` retained |

## 0.7.x exit criteria assessment

From `roadmap.md`:

| Exit criterion | Evidence | Met? |
|---|---|---|
| The CLI surface feels coherent and stable | 5 primary commands + 1 labeled utility command; consistent flag structure; auto-discovery for `--worktree-id`; `--help`/`-h` works correctly | ✓ |
| Documentation examples are consistent with actual usage | README and guide aligned (Slice 53); `cli-output-shapes.md` linked from README; help text matches dispatch | ✓ |
| Common command flows feel intentional rather than provisional | Output-shape spec provides stability guarantee; USAGE_LINES structured and complete; Options section documents all flags | ✓ |
| Users are not forced to relearn the surface between minor milestones | Stability contract explicit in `cli-output-shapes.md`; flag naming stable; invocation patterns consistent | ✓ |

All four exit criteria are met in substance.

## Remaining open items (not blockers)

The following items are explicitly deferred and do not constitute uncompleted 0.7.x work:

- **`validate-repository` guide documentation**: optional; no user workflow depends on it
  being in the guide; the command works and is labeled
- **Utility command subcommand restructuring**: explicitly deferred to post-0.7.x; no ADR
  or spec requires it for 1.0
- **Outside-workspace packaging and distribution**: always deferred; not part of 0.7.x

## Roadmap "immediate direction" items — all addressed

The roadmap listed four near-term directions for 0.7.x:

1. "audit the CLI surface — help text, output format conventions, flag naming, and invocation
   patterns — for stability and intentionality" → **Done** (Slices 50–52, 54)
2. "identify inconsistencies between repo-local and formal binary invocation paths in docs and
   guides" → **Done** (Slice 53)
3. "specify expected output shapes for each command in source-of-truth docs" → **Done** (Slice 51)
4. "assess whether the current `validate-worktree` and `validate-repository` utility commands
   belong on the same CLI surface as the primary commands" → **Done** (Slices 54–56)

## Recommendation: close out 0.7.x and move to 0.8.0-alpha.1

The planned wave is complete in substance. Remaining open items are correctly classified as
deferred. There is no genuine 0.7.x public-surface gap that is both unaddressed and a blocker.

## Next proving question: 0.8.x support boundary definition

From `roadmap.md`, the 0.8.x line is for defining what Multiverse officially supports for 1.0:
which providers are first-class, which workflows are part of the supported common case, which
behaviors remain experimental, what belongs in core versus extensions, and what is intentionally
deferred.

The highest-signal proving question for 0.8.x is:

**Can Multiverse's support boundaries be made explicit enough that a user can tell what the
tool officially supports for 1.0, without reading the source code?**

Known signals that this question is live:

- The six first-party providers (name-scoped, path-scoped, process-scoped, process-port-scoped,
  local-port endpoint, fixed-host-port endpoint) all work, but no source-of-truth doc makes
  an explicit statement about which are "officially supported" vs experimental vs deferred
- The common-case developer workflow is proven end-to-end (Slice 42), but no doc states what
  the official supported workflow is for 1.0
- The core/extension boundary is implicit in the code and ADRs but has not been stated as an
  explicit 1.0 support boundary
- The consumer integration model (appEnv, runtime-config boundary) is proven but not stated
  as "officially supported for 1.0" vs "experimental"

No changes to these areas are included in this assessment. They are identified as the next
proving target for 0.8.x work. Each will require its own slice and task doc.
