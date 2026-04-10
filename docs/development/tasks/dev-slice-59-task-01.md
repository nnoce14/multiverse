# Task: Dev Slice 59 — Official Common-Case Workflow Statement

## Slice

59 — official common-case workflow statement for 1.0

## Purpose

Produce a source-of-truth document that explicitly states the officially supported 1.0
common-case developer workflow. The goal is to let a user answer "what workflow does
Multiverse officially support for 1.0?" without inferring it from the external-demo-guide
or reading ADRs.

This is a docs-only slice. No production code changes. No new providers. No workflow changes.

## Active file set

- `docs/spec/supported-workflow.md` — new workflow statement spec (primary deliverable)
- `docs/development/tasks/dev-slice-59-task-01.md` — this task doc (new)
- `docs/development/current-state.md` — add Slice 59 proving result
- `docs/development/roadmap.md` — mark workflow item complete in Immediate direction

## Pre-work audit performed

The following source-of-truth docs were consulted: ADR-0012, ADR-0014, ADR-0017, ADR-0018,
ADR-0019, ADR-0021, product-spec.md, external-demo-guide.md, README.md, current-state.md,
roadmap.md, provider-support-classification.md, cli-output-shapes.md.

## Workflow classification

**Common-case (officially supported):**
- `pnpm cli run -- <cmd>` from the multiverse workspace
- `multiverse.json` and `providers.ts` at CWD (conventional defaults apply)
- Worktree identity auto-discovered from git state (ADR-0021)
- `appEnv` aliases with typed endpoint extraction as the preferred consumer pattern
- Lifecycle: `pnpm cli reset`, `pnpm cli cleanup`
- Inspection: `pnpm cli derive [--format env]`

**Outside common case but supported:**
- Explicit `--worktree-id`, `--config`, `--providers` overrides
- Formal compiled binary (`node apps/cli/bin/multiverse.js`) — same behavior, requires build
- Globally-linked `multiverse` binary — within-workspace proof only
- `validate` command — supported but optional in the normal workflow

**Deferred:**
- Outside-workspace usage (provider packages not on npm)
- Standalone global binary for non-workspace repos
- Configuration overlay or profile selection

## Explicit out-of-scope

- No new invocation paths
- No workflow changes
- No new CLI commands or flags
- No packaging or distribution work
- No changes to existing ADRs or behavior

## Acceptance criteria

- `supported-workflow.md` exists at `docs/spec/`
- The common-case workflow is stated explicitly as a bounded support statement
- The invocation path limitation (workspace-only) is honest and documented
- What is outside the common case but supported is listed separately
- What is deferred is listed explicitly
- `current-state.md` records the Slice 59 proving result
- `roadmap.md` marks the workflow item complete
- No production code is changed
