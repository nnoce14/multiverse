# Dev Slice 49 — Task 01

## Title

Consumer integration alignment — explicit deferred classification for appEnv exclusion from `derive --format=env`

## Sources of truth

- `docs/development/dev-slice-44.md` — Seam 5 gap inventory
- `docs/development/dev-slice-44-scenario-map.md` — Seam 5 gap details
- `docs/adr/0018-explicit-app-native-env-mapping-for-run.md` — primary appEnv ADR
- `docs/adr/0019-explicit-typed-endpoint-mapping.md` — typed endpoint appEnv ADR
- `docs/guides/external-demo-guide.md` — consumer-facing usage guide

## Audit findings

**`derive --format=env` exclusion exists but is not classified.**

Both ADR-0018 and ADR-0019 list `derive --format=env` in their Excluded sections. The
exclusion is present, but neither ADR explains the rationale or classifies it as deferred
vs permanent design. A second engineer reading the Excluded list might reasonably ask:
"Was this intentionally left out, or is it an accidental omission?" — there is currently
no answer in any source-of-truth doc.

The design rationale: `appEnv` is a run-time process-launch concern — it produces
app-native variable names for the child process environment at `run` time. `derive
--format=env` is an inspection tool that outputs canonical `MULTIVERSE_*` variables for
scripting and verification. Adding appEnv aliases to `derive --format=env` is technically
possible and may make sense in the future, but the current slice explicitly scoped appEnv
to `run` only. This exclusion was intentional, not an oversight.

**`external-demo-guide.md` Step 6 is misleading.**

The guide states: "The `--format env` output uses the same variable names that `pnpm cli
run` injects."

This was accurate when written (before ADR-0018 introduced appEnv aliases). After ADR-0018
and ADR-0019, `pnpm cli run` also injects declared `appEnv` aliases (e.g. `DATABASE_PATH`,
`PORT`) which are NOT present in `derive --format=env` output. The sentence creates a false
impression of equivalence.

## In scope

- `docs/adr/0018-explicit-app-native-env-mapping-for-run.md`
  - Add a brief note in the Excluded section explaining that `derive --format=env` is
    excluded intentionally: appEnv is scoped to `run` (run-time process launch), not to
    derivation inspection. Adding appEnv aliases to `derive --format=env` is deferred; no
    follow-on ADR has been accepted for this.

- `docs/guides/external-demo-guide.md`
  - Fix the Step 6 sentence to accurately describe what `--format env` outputs (canonical
    `MULTIVERSE_*` vars only) and note that `appEnv` aliases are injected by `run` but
    not included in `derive --format=env` output.

- `docs/development/tasks/dev-slice-49-task-01.md` (this file)

- `docs/development/current-state.md`
  - Add Slice 49 proving result entry

## Out of scope

- Changing `derive --format=env` behavior to include appEnv aliases
- Changes to ADR-0019 (follows ADR-0018 on this exclusion)
- New scenarios (Seam 5 is otherwise well-covered by ADR-0018/0019)
- Consumer workflow redesign of any kind
- Slice 48 work (already merged)

## Acceptance criteria

- ADR-0018 Excluded section explicitly states that the `derive --format=env` exclusion is
  intentional and that appEnv-in-derive is deferred
- `external-demo-guide.md` Step 6 accurately distinguishes what `derive --format=env`
  outputs (canonical vars only) from what `pnpm cli run` injects (canonical vars + appEnv)
- No implementation changes introduced
- `pnpm test:contracts` and `pnpm test:acceptance` remain green (docs-only slice)
