---
name: slice-review
description: Use this skill when reviewing a Multiverse diff, branch, or implementation result against the active slice, task, and scenario-map documents to check slice compliance, refusal behavior, boundary preservation, and test alignment without re-implementing the task.
---

# Slice Review

Use this skill to review a Multiverse change against the active slice and task documents.

## Read first

1. `AGENTS.md`
2. the active task document under `docs/development/tasks/`
3. the active slice document under `docs/development/`
4. the active slice scenario map under `docs/development/`
5. `CLAUDE.md` only if additional repo guidance is needed

> In the Claude version, swap steps 1 and 5 so `CLAUDE.md` is first and `AGENTS.md` is secondary.

## Use this skill when

Use this skill when:

- reviewing a branch, diff, or PR against the active slice
- checking whether a change stayed in scope
- checking whether tests align with the slice and task docs
- checking whether refusal and boundary rules were preserved

## Do not use this skill when

Do not use this skill when:

- the active slice or task doc is missing
- the task is still at the planning stage only
- the goal is implementation rather than review

## Review priorities

Check these in order:

1. slice compliance
2. refusal behavior
3. boundary preservation
4. validation placement
5. test alignment
6. incidental or future-slice expansion

## Review questions

Ask:

- does the change stay within the active slice?
- does it preserve refusal over guessing?
- does it preserve explicit boundaries between core, provider contracts, providers, and configuration?
- are tests aligned with the current slice rather than future slices?
- did the change introduce convenience behavior, inference, or hidden defaults?
- did the task broaden beyond what the task doc required?

## Output

Provide:

- a concise review verdict
- what is correct
- what is out of scope or risky
- any required follow-up before commit or PR
- whether the change is ready for the normal git-task workflow

## Stop conditions

Stop if:

- the active slice or task is unclear
- the review would require inventing business truth
- the change cannot be evaluated without higher-priority source clarification
