# Dev Slice 53 — Task 01

## Title

Guide and README alignment with established CLI surface (Slices 50–52)

## Sources of truth

- `docs/development/current-state.md` — "Practical instruction" step 1 lists "audit the remaining
  guide and documentation surface for inconsistencies with the now-established help text (Slice 50),
  output shape spec (Slice 51), and complete Options section (Slice 52)" as the top priority
- `docs/development/roadmap.md` — 0.7.x goal: guide examples feel intentional rather than provisional
- `README.md` — `pnpm cli` in Common commands block exits 1 with no args; `Key docs` omits
  `docs/spec/cli-output-shapes.md`
- `docs/guides/external-demo-guide.md` — Reference section does not mention `--help`/`-h`;
  Step 6 does not point readers to the output-shape spec

## Audit findings

### `README.md` — Common commands block

`pnpm cli` is listed alongside `pnpm test`, `pnpm test:acceptance`, etc. in the "Common commands"
block. Unlike the others, `pnpm cli` with no arguments exits 1 and writes usage to stderr —
it is not a useful bare invocation. `pnpm cli --help` is already shown in the "CLI usage" section
below; the Common commands block should surface the same form.

### `README.md` — Key docs section

`docs/spec/cli-output-shapes.md` (added in Slice 51) is not listed. A contributor reading
`README.md` cannot discover it from the Key docs section.

### Guide — Reference section

The Reference section documents all primary commands and common flags but does not mention
`--help`/`-h`, which was added as a supported flag in Slice 50 and documented in Slice 52.

### Guide — Step 6

Step 6 shows `derive` in both JSON and env formats but does not point readers to
`docs/spec/cli-output-shapes.md` for the authoritative JSON field contract. A reader
wishing to parse the JSON output has no pointer to the spec.

## In scope

- `README.md`
  - Change `pnpm cli` → `pnpm cli --help` in Common commands block
  - Add `docs/spec/cli-output-shapes.md` to the "Core product and architecture docs" list
    in the Key docs section

- `docs/guides/external-demo-guide.md`
  - Reference section: add a note that `pnpm cli --help` shows the full option list
  - Step 6: add a sentence pointing to `docs/spec/cli-output-shapes.md` for JSON field details

- `docs/development/current-state.md`
  - Add Slice 53 proving result
  - Update "What kinds of work are highest-value right now" to reflect that
    guide/README alignment is now complete

- `docs/development/tasks/dev-slice-53-task-01.md` (this file)

## Out of scope

- Utility-command classification (`validate-worktree`, `validate-repository`) — deferred
- Per-command help text
- Any CLI behavior or code changes
- Test changes (no new executable contract introduced)
- Guide restructuring or new guide sections

## Acceptance criteria

- `README.md` Common commands block contains `pnpm cli --help`, not bare `pnpm cli`
- `README.md` Key docs section lists `docs/spec/cli-output-shapes.md`
- Guide Reference section mentions `--help`/`-h`
- Guide Step 6 references `docs/spec/cli-output-shapes.md`
- `pnpm test` passes (no code changes; existing tests continue to pass)

## Safety / refusal expectations

No code changes. No refusal behavior is touched.
