# Dev Slice 10 — Scenario Map

## Slice theme

Thin CLI validation entrypoint

## Scenario goal

Demonstrate that the CLI can accept raw boundary input and return stable structured validation output without moving business rules into the app layer.

The scenario set is intentionally narrow.
It proves validation exposure, not command breadth.

## Primary feature area

### Feature area A — Validate worktree identity through the CLI

#### Scenario A1.1

Given raw worktree identity input that is valid  
When the CLI validates it  
Then the CLI returns structured success output

#### Scenario A1.2

Given raw worktree identity input that is missing or whitespace-only  
When the CLI validates it  
Then the CLI returns structured validation failure output

### Feature area B — Validate repository configuration through the CLI

#### Scenario B1.1

Given raw repository configuration input that is valid  
When the CLI validates it  
Then the CLI returns structured success output

#### Scenario B1.2

Given raw repository configuration input that is invalid  
When the CLI validates it  
Then the CLI returns structured validation failure output

### Feature area C — Preserve the thin-app boundary

#### Scenario C1.1

Given CLI validation commands  
When they run  
Then business validation remains in core and the CLI only parses and presents results

## Recommended test layering

### Acceptance / behavior tests

Use these to prove:

- valid raw CLI input succeeds
- invalid raw CLI input fails with stable structure
- the CLI remains thin

## Minimum viable scenario set

The leanest proof set for this slice is:

1. valid worktree identity input is accepted
2. invalid worktree identity input is rejected
3. valid repository configuration input is accepted
4. invalid repository configuration input is rejected
