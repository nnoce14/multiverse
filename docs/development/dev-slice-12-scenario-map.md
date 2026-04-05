# Dev Slice 12 — Scenario Map

## Slice theme

Explicit CLI cleanup command

## Scenario goal

Demonstrate that the CLI can request explicit scoped cleanup through the provider-module boundary seam without introducing discovery or hidden defaults.

The scenario set is intentionally narrow.
It proves the CLI cleanup seam, not command breadth.

## Primary feature area

### Feature area A — Execute explicit cleanup through the CLI

#### Scenario A1.1

Given a declared resource with scoped cleanup intent and a provider module path  
When the CLI requests cleanup  
Then the CLI returns structured success output from core

### Feature area B — Refuse cleanup at the CLI boundary when required inputs are missing

#### Scenario B1.1

Given a cleanup request without `--providers`  
When the CLI parses the command  
Then the CLI refuses with a structured usage error

### Feature area C — Preserve core refusal categories

#### Scenario C1.1

Given a provider that does not support cleanup  
When the CLI requests cleanup  
Then the CLI returns `unsupported_capability` unchanged

#### Scenario C1.2

Given a cleanup request with unsafe worktree scope  
When the CLI requests cleanup  
Then the CLI returns `unsafe_scope` unchanged

#### Scenario C1.3

Given cleanup intent is not declared in repository configuration  
When the CLI requests cleanup  
Then the CLI returns `invalid_configuration` unchanged

## Recommended test layering

### Acceptance / behavior tests

Use these to prove:

- explicit cleanup succeeds
- missing provider input is refused
- refusal categories remain stable

## Minimum viable scenario set

The leanest proof set for this slice is:

1. cleanup succeeds through the CLI
2. missing providers input is refused
3. unsupported cleanup capability is preserved
4. invalid cleanup intent is preserved
5. unsafe cleanup scope is preserved
