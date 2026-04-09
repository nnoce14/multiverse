# Dev Slice 48 — Task 01

## Title

Worktree identity scenario alignment — distinguish explicit override from auto-discovery

## Sources of truth

- `docs/development/dev-slice-44.md` — Seam 6 gap inventory
- `docs/development/dev-slice-44-scenario-map.md` — Seam 6 gap details
- `docs/scenarios/worktree-identity.scenarios.md` — current scenario coverage (primary target)
- `docs/adr/0021-git-worktree-path-conventional-default-for-worktree-id.md` — auto-discovery algorithm and relationship to ADR-0003
- `docs/adr/0003-main-checkout-uses-reserved-main-identity.md` — reserved `main` identity rule
- `docs/adr/0002-branch-name-is-metadata.md` — branch name is not identity

## Audit findings

**"main checkout identity" scenario is false as a general statement.**

The scenario currently reads:
```
Given the main checkout
When the tool derives worktree identity
Then the Worktree ID is `main`
```

ADR-0021 (Section 1, "Relationship to ADR-0003") states:
> ADR-0003 establishes `"main"` as the reserved worktree identity for the primary checkout
> when supplied *explicitly* (via `--worktree-id main`). Auto-discovery does not enforce
> that reserved value: the primary checkout's discovered id is its directory basename,
> which may or may not be `"main"` depending on how the repository is checked out.

The scenario is only true in the explicit override case. Under auto-discovery, the identity
is `path.basename(primaryCheckout.path)` — which could be anything the user named their
clone directory. The scenario needs to be split into:
- Explicit case: `--worktree-id main` supplied → Worktree ID is `main` (ADR-0003, explicit)
- Discovery case: `--worktree-id` omitted → discovered id is directory basename (ADR-0021)

**Three missing scenarios.**

1. Auto-discovery success: when `--worktree-id` is omitted and cwd is inside a known git
   worktree, the discovered identity is the worktree directory basename (ADR-0021 Section 1).

2. Primary checkout identity under auto-discovery: discovered id is the directory basename of
   the primary checkout path, not guaranteed to be `"main"` (ADR-0021 relationship to ADR-0003).

3. Auto-discovery refusal: when `--worktree-id` is omitted and git is unavailable, or no
   worktree path matches cwd, the tool refuses with an actionable message directing the
   caller to supply `--worktree-id` explicitly (ADR-0021 Section 3).

**"recreated worktree" scenario is aspirational and needs annotation.**

ADR-0021 explicitly calls out:
> The "recreated worktree gets new lifecycle identity" scenario from
> `worktree-identity.scenarios.md` is not addressed here — it requires a persistent
> registry and is explicitly deferred.

The scenario as written implies this is current behavior. It should be annotated as
aspirational (requires a persistent registry) and deferred.

## In scope

- `docs/scenarios/worktree-identity.scenarios.md`
  - Revise "main checkout identity" to specify it applies when `--worktree-id main` is
    supplied explicitly (not under auto-discovery)
  - Add scenario: auto-discovery resolves identity from git worktree path basename
  - Add scenario: primary checkout identity under auto-discovery is directory basename,
    not guaranteed to be `"main"`
  - Add scenario: auto-discovery refuses when git unavailable or no matching worktree path
  - Annotate "recreated worktree" scenario as aspirational / deferred

- `docs/development/tasks/dev-slice-48-task-01.md` (this file)

- `docs/development/current-state.md`
  - Add Slice 48 proving result entry

## Out of scope

- Implementation changes of any kind
- Changes to ADR-0003 or ADR-0021
- Consumer integration / appEnv classification (Slice 49)
- General CLI docs polish
- New worktree identity semantics beyond what ADR-0021 already establishes

## Acceptance criteria

- "main checkout identity" scenario is true only in the explicit `--worktree-id main` case
- A scenario exists for auto-discovery success (id = directory basename)
- A scenario exists for the primary checkout identity under auto-discovery (not guaranteed
  to be `"main"`)
- A scenario exists for auto-discovery refusal (git unavailable or no matching path)
- "recreated worktree" scenario is annotated as aspirational / deferred
- No implementation changes introduced
- `pnpm test:contracts` and `pnpm test:acceptance` remain green (docs-only slice)
