# Dev Slice 11 — Scenario Map

## Slice theme

Explicit CLI reset command

## Scenario goal

Demonstrate that the CLI can request explicit scoped reset through the explicit `--providers <module-path>` boundary seam without introducing discovery or hidden defaults.

The scenario set is intentionally narrow.
It proves the CLI reset seam, not command breadth.

## Primary feature area

### Feature area A — Execute explicit reset through the CLI

#### Scenario A1.1

Given a declared resource with scoped reset intent and a provider module path  
When the CLI requests reset  
Then the CLI returns structured success output from core

### Feature area B — Refuse reset at the CLI boundary when required inputs are missing

#### Scenario B1.1

Given a reset request without `--providers`  
When the CLI parses the command  
Then the CLI refuses with a structured usage error

### Feature area C — Preserve core refusal categories

#### Scenario C1.1

Given a provider that does not support reset  
When the CLI requests reset  
Then the CLI returns `unsupported_capability` unchanged

#### Scenario C1.2

Given a reset request with unsafe worktree scope  
When the CLI requests reset  
Then the CLI returns `unsafe_scope` unchanged

## Recommended test layering

### Acceptance / behavior tests

Use these to prove:

- explicit reset succeeds
- missing provider input is refused
- refusal categories remain stable

## Minimum viable scenario set

The leanest proof set for this slice is:

1. reset succeeds through the CLI
2. missing providers input is refused
3. unsupported reset capability is preserved
4. unsafe reset scope is preserved
