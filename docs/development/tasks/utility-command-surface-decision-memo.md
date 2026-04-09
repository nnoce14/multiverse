# Decision Memo: Utility-Command CLI Surface

## Status

**Open — awaiting product decision.**

This memo records the current truth, explicit options, and a recommendation
for the `validate-worktree` / `validate-repository` surface question that
Slice 54 classified but did not resolve.

The question is: what should happen to these two commands before 0.7.x closes?

---

## Current truth

### What each command does

**`validate-worktree`**

Accepts: `--worktree-id VALUE` (required; no auto-discovery; no conventional default).

Behavior: calls `validateWorktreeIdentity()` — checks that the string is
non-empty and non-blank.

Returns: `{ ok: true, value: { kind: "worktree_identity", value: "..." } }` on success;
`{ ok: false, errors: [{ path: "worktreeId", code: "required" | "invalid_value" }] }` on failure.

Exit 0 on success, exit 1 on failure. Output to stdout, empty stderr.

Needs: nothing except the worktree id string. No git state, no config file, no providers.

**`validate-repository`**

Accepts: `--config PATH` (required; no conventional default).

Behavior: reads the config file, calls `validateRepositoryConfiguration()` —
checks field presence, required fields (provider, role), no duplicate `appEnv`
names across declarations.

Returns: `{ ok: true, value: { resources: [...], endpoints: [...] } }` on success;
`{ ok: false, errors: [...] }` on failure.

Exit 0 on success, exit 1 on failure. Output to stdout, empty stderr.

Needs: a readable config file path. No worktree identity, no providers, no git state.

### How they differ from the five primary commands

| Property | Primary commands | `validate-worktree` | `validate-repository` |
|---|---|---|---|
| Providers required | Yes | No | No |
| Config required | Yes (default: `./multiverse.json`) | No | Yes (required, no default) |
| Worktree id required | Optional (auto-discovered) | Yes (always required) | No |
| Performs isolation | Yes | No | No |
| Output spec in `cli-output-shapes.md` | Yes | No (excluded) | No (excluded) |
| Appears in guide Reference | Yes | No | No |
| Refusal categories apply | Yes | No (validation errors, not refusals) | No (validation errors, not refusals) |
| USAGE_LINES section | `Commands:` | `Utility commands (declaration validation):` | `Utility commands (declaration validation):` |

### What is already documented / proven

- Both commands work correctly and are tested (`tests/acceptance/dev-slice-10.acceptance.test.ts`).
- Both are classified as "Utility commands (declaration validation):" in `USAGE_LINES` after Slice 54.
- `cli-output-shapes.md` explicitly excludes both from the primary output contract; the exclusion note explains why.
- The guide Reference section covers only the five primary commands; neither utility command appears in any documented workflow step.
- No ADR governs these commands. They were introduced in early CLI work (Slice 10) as developer-time diagnostic tools.
- ADR-0021 (Slice 37) introduced auto-discovery for `--worktree-id` across all primary commands. `validate-worktree` predates that decision and was not revisited.

### What is still ambiguous

- Whether `validate-worktree` has ongoing standalone user value after ADR-0021 made worktree identity auto-discoverable in every primary command.
- Whether either command belongs in the guide as a documented diagnostic tool.
- Whether removing one or both would constitute a meaningful breaking change given their current undocumented state.
- Whether 0.7.x is the right wave to close this question or whether Option D (defer) is more appropriate.

---

## Options

### Option A — Keep both top-level; add guide documentation

No behavior change. Add a "Utility commands" subsection to the guide Reference
section describing what each command does and when to use it.

**User-facing clarity:** Moderate improvement. Discoverability improves, but the
fundamental surface asymmetry (these commands behave differently from primary
commands in flags, defaults, and purpose) remains.

**Source-of-truth consistency:** Fully consistent with current state after Slice 54.
No new design truth needed. Guide update is purely additive.

**Implementation cost:** Low. Guide edit only. No code changes, no test changes.

**Migration implications:** None. No behavior change.

**ADR required:** No. Classification already documented in Slice 54.

**When to choose this:** If these commands have real diagnostic value for operators
and that value is worth guide real estate. Also appropriate if you want to close
0.7.x without any surface removal risk.

---

### Option B — Keep `validate-repository`; remove `validate-worktree`

**The asymmetry between the two commands is real and material.**

`validate-repository` has standalone value that primary commands do not fully
replicate:

- A CI pipeline can run `multiverse validate-repository --config multiverse.json`
  as a pre-flight config linting step before any isolation operation. This surfaces
  declaration errors (missing `provider`, missing `role`, duplicate `appEnv`) early,
  independent of any providers module or worktree context. No primary command does
  exactly this — `derive` validates config as a side effect of deriving, but its
  output is the derivation result, not a dedicated validation report.
- The command is useful without a git checkout (pure file validation), which is
  genuinely different from all primary commands.

`validate-worktree` has no comparable standalone value after ADR-0021:

- ADR-0021 made `--worktree-id` optional across all primary commands via git-state
  auto-discovery. Every primary command now validates worktree identity inline as
  part of `readCommonOptions` / `discoverWorktreeId`.
- If a user passes an invalid worktree id (e.g. whitespace-only string) to `derive`,
  they get an actionable refusal immediately. There is no scenario where
  pre-validating the string with `validate-worktree` adds meaningful value.
- No scenario document describes a user needing to validate a worktree identity
  string standalone. No guide workflow uses it. The only test coverage is from
  Slice 10 — an early CLI proving exercise.
- Its behavior (`worktreeId.trim().length === 0` → error) is so thin that it serves
  mainly as a test artifact, not a user-facing feature.

**What "remove" means in practice:**
- Remove the `validate-worktree` dispatch case from `runCli()`
- Remove the `handleValidateWorktree` function
- Remove `validate-worktree` from `USAGE_LINES`
- Remove or update `tests/acceptance/dev-slice-10.acceptance.test.ts` (the worktree
  validation cases), and the Slice 41 test that checks usage string content for it
- This IS a breaking change for any caller that currently uses `validate-worktree`
  directly. Given the command is not documented in the guide and has no established
  user workflow, the blast radius is expected to be low.

**User-facing clarity:** High. The surface becomes: five primary workflow commands
plus one utility command (`validate-repository`) with a clear, distinct purpose.

**Source-of-truth consistency:** Consistent with the intent. The removal rationale is
directly sourced from ADR-0021 (worktree identity is now embedded in primary commands)
and the absence of any scenario or guide usage. However, no ADR currently says
"remove `validate-worktree`." A short rationale note (ADR amendment or a new ADR
decision record) would be appropriate.

**Implementation cost:** Low-moderate. Code removal is straightforward. Test updates
are bounded. A short decision-record note is needed.

**Migration implications:** Breaking change. Unknown callers of `validate-worktree`
would receive an "unknown command" usage error. Given the command's undocumented
status, this is low risk in practice.

**ADR required:** A short rationale record is appropriate — either as a note to an
existing ADR (ADR-0021 is the natural anchor, since the rationale follows from it)
or as a standalone one-paragraph decision record. A full ADR with its own number is
probably heavier than needed.

**When to choose this:** If you want to close the surface question cleanly in 0.7.x
and the removal risk is acceptable. This is the recommendation for 0.7.x if
action is preferred over deferral.

---

### Option C — Move utility commands under a narrower namespace / separate surface

For example: `multiverse util validate-worktree`, `multiverse util validate-repository`,
or a separate subcommand group.

**User-facing clarity:** High if done well. Clear structural separation of workflow
commands from diagnostic tools.

**Source-of-truth consistency:** No current ADR or spec supports a subcommand structure.
Requires new design work.

**Implementation cost:** Moderate. New dispatch structure, new help text, multiple
changes across tests and docs.

**Migration implications:** Breaking change for anyone using top-level commands.

**ADR required:** Yes, a new ADR defining the subcommand namespace and design rules.

**Assessment:** Too broad for 0.7.x. Not recommended for this wave. Defer to post-1.0
if a richer CLI structure is wanted.

---

### Option D — Keep current behavior and defer beyond 0.7.x

No changes. The current state after Slice 54 is: both commands work, both are labeled
as utility commands, both are excluded from the output-shape stability contract.

**User-facing clarity:** The surface is not actively confusing. The Slice 54 label
helps. The section in the guide reference simply does not exist, which is consistent
with their undocumented status.

**Source-of-truth consistency:** Fully consistent. Nothing requires action.

**Implementation cost:** Zero.

**Migration implications:** None.

**ADR required:** No.

**Assessment:** Valid if the 0.7.x goal is "good enough for now" rather than "fully
intentional." The open question is whether leaving `validate-worktree` alive on an
undocumented surface is consistent with the 0.7.x goal of making the CLI surface
intentional. If the answer is "a labeled, undocumented command that does nothing
primary commands do not already do is acceptable," defer. If the answer is "the
surface should contain only commands with clear, user-facing purpose," remove it.

---

## Tradeoff summary

| | A (keep both + guide docs) | B (keep repo, remove worktree) | C (restructure) | D (defer) |
|---|---|---|---|---|
| Surface clarity | Moderate | High | High | Moderate |
| Source-of-truth support | Full | Full (with rationale note) | Needs new ADR | Full |
| Breaking change | No | Yes (worktree only) | Yes (both) | No |
| 0.7.x appropriate | Yes | Yes | No | Yes |
| ADR/record needed | No | Short rationale note | New ADR | No |
| Closes the question | Partially | Yes | Yes (later) | No |

---

## Recommendation

**Option B: keep `validate-repository`, remove `validate-worktree`.**

The rationale is directly sourced from ADR-0021: worktree identity validation is now
embedded in every primary command's path. `validate-worktree` replicates behavior that
already exists in the primary command error path. It has no documented user workflow and
no scenario coverage. Keeping it on the CLI surface implies it has standalone user value
that it does not have.

`validate-repository` is different: it performs config-file linting independent of any
isolation operation. That genuinely does not exist elsewhere on the surface.

**If Option B is chosen:**

The implementation scope for the follow-on slice is:
1. Remove `handleValidateWorktree` and its dispatch case from `apps/cli/src/index.ts`
2. Remove `validate-worktree` from `USAGE_LINES`
3. Update `tests/acceptance/dev-slice-10.acceptance.test.ts` (remove the two worktree
   validation cases; the repository config test cases should be kept or moved to a
   new file)
4. Update `tests/acceptance/dev-slice-41.acceptance.test.ts` (remove the test that
   checks `validate-worktree` appears in the usage string)
5. Add a rationale note to ADR-0021 or a short standalone decision record explaining
   the removal follows from ADR-0021's inline validation behavior
6. Update `USAGE_LINES` acceptance test in `cli-help-flag.acceptance.test.ts` if needed
7. `current-state.md` proving entry

**If Option D is preferred:**

Close this memo as "deferred beyond 0.7.x." Update `current-state.md` to reflect
that the open question is a post-0.7.x backlog item, not active 0.7.x work.
The CLI surface as labeled after Slice 54 is acceptable for 0.7.x exit.

---

## What this memo does not decide

- Whether to document `validate-repository` in the guide (separate question; can be done
  independently of the surface decision)
- Whether the output shape of `validate-repository` should ever be added to
  `cli-output-shapes.md` (would require a spec update and stability commitment)
- Any post-0.7.x CLI restructuring (Option C)
