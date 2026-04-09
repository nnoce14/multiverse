# Dev Slice 54 — Task 01

## Title

Utility-command surface classification — planning baseline and USAGE_LINES section label

## Purpose

This document records the audit findings for the `validate-worktree` and `validate-repository`
surface question identified in `roadmap.md` and `current-state.md` as the remaining 0.7.x
design-decision work. It answers the primary question, identifies what requires a further product
decision, and scopes the minimum truthful change that can be made now.

## Sources of truth

- `docs/development/roadmap.md` — "assess whether the current `validate-worktree` and
  `validate-repository` utility commands belong on the same CLI surface as the primary commands"
- `docs/spec/cli-output-shapes.md` — explicitly excludes both commands from the primary output
  contract spec; this is the strongest existing source-of-truth signal
- `docs/development/tasks/post-wave-44-49-assessment.md` — identified both commands as a known
  signal about the 0.7.x public-surface question
- `docs/development/current-state.md` — "Practical instruction" lists utility-command
  classification as the only remaining 0.7.x design-decision work
- `apps/cli/src/index.ts` — current CLI dispatch; `USAGE_LINES`; handler implementations

## Audit findings

### What these commands actually do

**`validate-worktree`:**
- Accepts: `--worktree-id VALUE` (required; no auto-discovery; no conventional default)
- Calls: `validateWorktreeIdentity()` from `@multiverse/core` — checks the string is non-empty and non-blank
- Returns: `{ ok: true, value: { kind: "worktree_identity", value: "..." } }` or `{ ok: false, errors: [...] }`
- Does not need: providers, repository config, git state

**`validate-repository`:**
- Accepts: `--config PATH` (required; no conventional default)
- Calls: `validateRepositoryConfiguration()` on the parsed config file — checks field presence, required fields, duplicate-appEnv cross-declaration
- Returns: `{ ok: true, value: { resources: [...], endpoints: [...] } }` or `{ ok: false, errors: [...] }`
- Does not need: providers, worktree identity, git state

Both commands perform declaration validation only. They do not perform isolation operations.

### How they differ from primary commands

| Property | Primary commands | `validate-worktree` / `validate-repository` |
|---|---|---|
| Need providers module | Yes | No |
| Need worktree identity | Yes (auto-discovered) | `validate-worktree` only, required explicitly |
| Need config file | Yes (default: `./multiverse.json`) | `validate-repository` only, required explicitly |
| Perform isolation operations | Yes | No |
| Covered by `cli-output-shapes.md` | Yes | Explicitly excluded |
| Mentioned in guide Reference section | Yes | No |
| Visual separation in USAGE_LINES | No (listed in Commands) | Yes (blank-line separated) |

### What existing source-of-truth already says

1. **`cli-output-shapes.md`** explicitly states: "It does not cover `validate-worktree` or
   `validate-repository`." This is the strongest signal — the primary output spec already
   distinguishes them from primary commands.

2. **The external-demo-guide** Reference section covers only the 5 primary commands. Neither
   utility command appears in any documented user workflow.

3. **`USAGE_LINES`** already separates them from primary commands with a blank line (introduced
   implicitly in Slice 50). The visual separation exists but has no label to make it explicit.

4. **No ADR governs these commands.** They were introduced as part of early CLI slices (Slice 10)
   as developer-time diagnostic tools for pre-flight declaration checking, but their surface
   classification was never documented.

### What requires a further product decision

The following questions are **not answered by current source-of-truth** and require a product
decision before any truthful implementation:

1. **Should `validate-worktree` be removed or retained?** Since Slice 37 introduced auto-discovery,
   worktree identity validation is now embedded in every primary command's path. A user running
   `derive` with an invalid worktree id gets an actionable refusal. The standalone
   `validate-worktree` command provides little additional value except as a direct diagnostic
   tool. Whether this value justifies its presence on the CLI surface is a product question.

2. **Should these commands be restructured?** For example, moved to a subcommand structure
   (`multiverse debug validate-worktree`) or documented as a separate diagnostic layer. This would
   require a new ADR or spec update.

3. **Should the guide mention these commands?** As diagnostic tools they may have value for
   operators troubleshooting configuration or CI pipeline validation. Documenting them is a
   product question.

## Recommendation: Option B — narrow reclassification in help text and spec note

The existing source-of-truth is sufficient to support a narrow classification without a new
design decision:

- The spec already excludes them from the primary output contract
- The guide already excludes them from all documented workflows
- USAGE_LINES already visually separates them

The minimum truthful change is to make the implicit classification explicit in two places:

1. **USAGE_LINES** — add a section label `"Utility commands (declaration validation):"` before
   the two commands, mirroring how `"Options:"` and `"Options (derive only):"` label their
   sections. This makes the visual separation semantically explicit without changing any behavior.

2. **`docs/spec/cli-output-shapes.md`** — expand the exclusion note to explain why, so a reader
   understands the exclusion is intentional.

These two changes are directly supported by existing source-of-truth and require no new design
decision.

## In scope

- `apps/cli/src/index.ts`
  - Add `"  Utility commands (declaration validation):"` section label line before
    `validate-worktree` and `validate-repository` in `USAGE_LINES`
  - No other code changes

- `docs/spec/cli-output-shapes.md`
  - Expand the exclusion note to explain why these commands are excluded

- `tests/acceptance/cli-help-flag.acceptance.test.ts`
  - Add one test that `--help` output contains the utility-commands section label

- `docs/development/current-state.md`
  - Add Slice 54 planning/proving result
  - Update "What kinds of work" to reflect the remaining open product decision

- `docs/development/tasks/dev-slice-54-task-01.md` (this file)

## Out of scope

- Removing `validate-worktree` or `validate-repository` — requires product decision
- Restructuring commands into a subcommand hierarchy — requires product decision / new ADR
- Adding these commands to the guide — requires a product decision about their documented role
- Per-command help text
- Any change to command behavior, flags, or output shapes

## Acceptance criteria

- `runCli(["--help"]).stdout.join("\n")` contains the utility section label
- All existing `--help`, usage-string, and validate-worktree/validate-repository tests pass
- `docs/spec/cli-output-shapes.md` exclusion note explains the reason for exclusion
- `pnpm test` passes

## Deferred items (requiring product decision)

- Whether `validate-worktree` should be removed given that inline validation now covers the
  primary use case through auto-discovery
- Whether to restructure utility commands into a distinct subcommand namespace
- Whether to document these commands in the guide as diagnostic tools

## Safety / refusal expectations

No refusal behavior is touched. The USAGE_LINES change is additive only (new label line).
No command dispatch, flag handling, or output shapes are changed.
