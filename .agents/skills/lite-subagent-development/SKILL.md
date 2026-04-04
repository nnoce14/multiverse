---
name: lite-subagent-development
description: Use this skill when a Multiverse task may benefit from limited subagent decomposition, especially for separating planning, implementation, and review while preserving slice boundaries, controlling token usage, and avoiding parallel edits to the same core seam.
---

# Lite Subagent Development

Use this skill when a Multiverse task may benefit from limited subagent use without turning one slice into a multi-agent ceremony.

## Read first

1. `AGENTS.md`
2. the active task document under `docs/development/tasks/` if one exists
3. the active slice document under `docs/development/`
4. the active slice scenario map under `docs/development/` if one exists
5. `CLAUDE.md` only if additional repo guidance is needed

> In the Claude version, swap steps 1 and 5 so `CLAUDE.md` is first and `AGENTS.md` is secondary.

## Use this skill when

Use this skill when:

- a task is large enough that planning, implementation, and review benefit from separation
- parts of the task are separable without multiple agents editing the same shared seam
- you want a spec-compliance review before commit or PR creation
- you want faster iteration without relaxing the slice boundary

## Do not use this skill when

Do not use this skill when:

- the task is small enough for one agent to handle directly
- multiple subagents would need to edit the same core file or contract surface in parallel
- the slice boundary is unclear
- the task would create more coordination overhead than implementation value

## Modes

Choose the lightest mode that fits the task.

### Solo

Use one agent only.

Use when:
- the task is narrow
- the implementation seam is small
- review can happen in the main session

### Paired

Use:
- one implementation agent
- one review agent

Use when:
- the task is still narrow but spec-compliance review would help
- review can happen after implementation rather than in parallel

This is the default mode for Multiverse.

### Decomposed

Use:
- one controller
- up to 2 or 3 narrowly scoped subagents

Use only when work is clearly separable, such as:
- acceptance or coverage planning
- contract-test authoring
- implementation review against slice docs

Do not use decomposed mode for parallel edits to the same core seam.

## Workflow

1. Read the active slice, task, and scenario-map docs.
2. Decide whether the task should use solo, paired, or decomposed mode.
3. Keep one agent responsible for the integrated implementation path.
4. If subagents are used, give each one a narrow, non-overlapping responsibility.
5. Have review focus on:
   - slice compliance
   - refusal behavior
   - boundary preservation
   - validation placement
6. Reconcile findings in the main thread.
7. Continue with normal branch, commit, push, and PR workflow.

## Good subagent splits

Good examples:

- one agent derives executable coverage
- one agent reviews coverage against the slice and scenario map
- one agent implements the minimal provider contract extension
- one agent reviews the diff against the task acceptance criteria

## Bad subagent splits

Bad examples:

- two agents editing `packages/core/src/index.ts` in parallel
- two agents changing the same acceptance file in parallel
- one agent inventing business behavior while another implements it
- adding review subagents when the task is too small to justify them

## Review priorities

Review should check these first:

1. does the change stay within the active slice?
2. does it preserve refusal over guessing?
3. does it preserve explicit boundaries between core, provider contracts, providers, and configuration?
4. is validation logic placed in the correct layer?
5. are tests aligned with the current task rather than future slices?

## Budget discipline

- default to solo or paired mode
- use decomposed mode only when separation is clearly beneficial
- keep subagent prompts narrow
- avoid repeated full-repo rereads when the active task docs already define scope
- stop adding subagents when coordination cost exceeds implementation value

## Output

Provide:

- the chosen mode
- the reason that mode was chosen
- the subagent responsibilities if any are used
- the main implementation or review findings
- the recommended next step

## Stop conditions

Stop if:

- the slice boundary is unclear
- subagent responsibilities overlap materially
- the task would require multiple agents to mutate the same core seam in parallel
- business truth would need to be invented rather than derived from repo documents