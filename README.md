# Multiverse

Multiverse is a local runtime isolation tool for parallel development across multiple git worktrees of the same repository on one machine.

This fresh implementation begins with the agentic development foundation from OpenClinXR: evidence records, decision records, agent memory, iteration scorecards, and validation gates before product slices.

## Current Posture

This repository is a workflow and planning baseline. Product implementation has not started in this fresh tree.

Historical behavior and code in `../multiverse-old` are reference material, not automatic truth. Anything reused from the old attempt must be captured through a source record, decision record, scenario, or task brief.

## Verification

Use Node `22.19.0` and pnpm `10.33.0`.

```bash
scripts/codex-env.sh pnpm install
scripts/codex-env.sh pnpm agent:verify
scripts/codex-env.sh pnpm typecheck
scripts/codex-env.sh pnpm test
scripts/codex-env.sh pnpm docs:build
```

## Workflow Entry Points

- `AGENTS.md` - repository operating rules for agents
- `apps/docs/` - Docusaurus documentation application
- `docs/agent-factory/README.md` - agentic planning workflow
- `docs/development/current-state.md` - current implementation posture
- `docs/development/roadmap.md` - foundation-first roadmap
- `docs/development/repo-map.md` - repository layout
- `sources/` - source ledger records
- `decisions/` - machine-readable decision records
- `agents/` - agent charters, memory, and score history
