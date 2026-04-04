# Dev Slice 03 — Scenario Map

## Slice theme

Validated core model at the application boundary

## Scenario goal

Demonstrate that raw external input is not trusted by the core until it passes explicit validation.

The scenario map below is intentionally narrow.
It should prove the seam, not model the entire system.

---

## Primary feature area

### Feature area A — Boundary validation for first trusted domain value

Recommended domain target:

- `WorktreeIdentity`

---

## Scenario groups

### Group A1 — Accept valid raw input

These scenarios prove that the boundary can admit acceptable raw input into the trusted core model.

#### Scenario A1.1

Given raw application input containing a valid worktree identity  
When the input is validated at the boundary  
Then a trusted worktree identity value is returned

#### Scenario A1.2

Given raw application input containing the reserved main identity in its allowed form  
When the input is validated at the boundary  
Then the trusted reserved main identity value is returned

> Include this only if the existing spec already defines the reserved-main behavior clearly.

---

### Group A2 — Reject missing or malformed raw input

These scenarios prove that invalid input is refused before core behavior begins.

#### Scenario A2.1

Given raw application input with a missing worktree identity  
When the input is validated at the boundary  
Then validation fails with a structured required-field error

#### Scenario A2.2

Given raw application input with an empty worktree identity  
When the input is validated at the boundary  
Then validation fails with a structured invalid-value error

#### Scenario A2.3

Given raw application input with a whitespace-only worktree identity  
When the input is validated at the boundary  
Then validation fails with a structured invalid-value error

#### Scenario A2.4

Given raw application input with a malformed worktree identity  
When the input is validated at the boundary  
Then validation fails and no trusted core value is constructed

> Only include specific malformed examples that are already implied by existing specs or glossary terms.
> Do not invent character rules unless they are already documented or clearly needed by the current implementation contract.

---

### Group A3 — Preserve boundary/core separation

These scenarios prove the seam itself, not just the validator.

#### Scenario A3.1

Given invalid raw application input  
When the boundary validation fails  
Then core behavior is not invoked

#### Scenario A3.2

Given valid raw application input  
When the boundary validation succeeds  
Then downstream core behavior receives only a trusted worktree identity value

#### Scenario A3.3

Given a validation failure  
When the failure is returned to the caller  
Then the result is stable and machine-testable without inspecting exception text

---

### Group A4 — Refuse accidental rule-smearing

These scenarios keep the slice from becoming too magical or too implicit.

#### Scenario A4.1

Given raw application input  
When validation occurs  
Then parsing and validation happen at the application boundary rather than inside provider code

#### Scenario A4.2

Given a trusted worktree identity value  
When core behavior uses it  
Then the core does not re-parse raw boundary input

---

## Recommended test layering

### Acceptance / behavior tests

Use these to prove:

- raw input enters through an application-facing seam
- valid input becomes trusted domain input
- invalid input returns structured failures
- core behavior is not entered on validation failure

### Unit tests

Use these to prove:

- rule behavior of the first validated value
- validation result semantics
- stable error shape

## Boundary hygiene note

The validation seam must respect package boundaries as well as domain boundaries.

For this slice, any cross-package dependency used in the validated boundary path must be imported through the owning package’s public entry point, not through internal source file paths.

---

## Minimum viable scenario set

If you want the leanest possible first cut, implement these first:

1. valid worktree identity is accepted
2. missing worktree identity is rejected
3. whitespace-only worktree identity is rejected
4. invalid boundary input does not invoke core behavior
5. valid boundary input reaches core behavior as a trusted value

That is enough to prove the seam without pretending the domain is finished.
