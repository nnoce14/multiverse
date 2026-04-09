# Dev Slice 44 — Scenario Map

## Purpose

This document maps each of the six 0.6.x semantic seams identified in `dev-slice-44.md`
to their current source-of-truth coverage, identifies the gaps, and notes which follow-on
slice addresses each gap.

Source-of-truth precedence order (from CLAUDE.md):
1. `docs/adr/`
2. `docs/spec/`
3. `docs/scenarios/`
4. `docs/development/`

---

## Seam 1 — Lifecycle semantics across provider types

### Relevant source-of-truth documents

| Document | Relevance |
|---|---|
| `docs/spec/provider-model.md` | Defines derive, validate, reset, cleanup at the capability level |
| `docs/spec/resource-isolation.md` | Defines scoped reset and cleanup at the resource level |
| `docs/adr/0005-providers-implement-isolation-contracts.md` | Establishes optional capability pattern |
| `docs/adr/0015-path-scoped-providers-manage-explicit-child-processes.md` | Governs process-scoped lifecycle semantics |
| `docs/scenarios/provider-model.scenarios.md` | Scenarios for provider capability behavior |
| `docs/scenarios/resource-isolation.scenarios.md` | Scenarios for scoped reset/cleanup isolation |
| `docs/guides/provider-authoring-guide.md` | Practical implementation guidance for reset/cleanup |

### Current coverage

| Topic | Coverage status |
|---|---|
| Reset is optional and must be explicitly declared | ✓ Covered in spec and ADR-0005 |
| Cleanup is optional and must be explicitly declared | ✓ Covered in spec and ADR-0005 |
| Destructive action may not execute implicitly | ✓ Covered in spec and scenarios |
| Destructive action refused when scope cannot be determined | ✓ Covered in spec, ADR-0008, and scenarios |
| **Scope-confirmation vs effectful distinction** | **✗ Not in any spec or scenario doc** |
| **Reset intent: prepare for next use vs cleanup intent: permanent removal** | **✗ Spec language is ambiguous ("reinitializes or destroys")** |
| Process-scoped: reset re-launches; cleanup terminates only | Partially covered in ADR-0015 rules 3–4 |
| **Process-scoped readiness: current contract is fixed 500ms wait** | **✗ Not documented anywhere** |
| **`{PORT}` placeholder substitution in process-port-scoped** | **✗ Not in any spec, ADR, or guide** |
| Name-scoped: reset/cleanup are scope-confirmation only | ✗ Not stated explicitly in spec or guide |

### Gaps and responsible slice

- **Slice 45**: Add scope-confirmation vs effectful distinction to `docs/spec/provider-model.md`
  and `docs/guides/provider-authoring-guide.md`
- **Slice 45**: Clarify reset vs cleanup intent in `docs/spec/provider-model.md`
- **Slice 45**: Add scenarios for scope-confirmation and intent distinction to
  `docs/scenarios/provider-model.scenarios.md`
- **Slice 45**: Document process-scoped fixed-interval readiness and `{PORT}` substitution
  in `docs/guides/provider-authoring-guide.md`

---

## Seam 2 — Validate capability

### Relevant source-of-truth documents

| Document | Relevance |
|---|---|
| `docs/spec/provider-model.md` | Lists validate as an optional provider capability |
| `docs/spec/endpoint-model.md` | Lists validate as an optional endpoint provider capability |
| `docs/spec/resource-isolation.md` | Lists resource declaration requirements (validate absent) |
| `docs/spec/safety-and-refusal.md` | Lists validate as an operation subject to refusal |
| `docs/adr/0005-providers-implement-isolation-contracts.md` | Establishes optional capability pattern |
| `docs/adr/0008-unsafe-operations-are-refused-in-1-0.md` | Applies refusal to validate |
| `docs/scenarios/provider-model.scenarios.md` | Has scenario for providers that declare validate |
| `docs/scenarios/safety-and-refusal.scenarios.md` | Has scenario for unsafe scope during validation |
| `docs/guides/provider-authoring-guide.md` | Does not show validate in capabilities example |

### Current coverage

| Topic | Coverage status |
|---|---|
| Validate is an optional provider capability | ✓ Covered in spec |
| Validate is subject to refusal when scope unsafe | ✓ Covered in spec and scenarios |
| Validate is provider-specific | ✓ Covered in spec |
| **`scopedValidate` field in resource declarations** | **✗ Not listed in `docs/spec/resource-isolation.md`** |
| **No first-party provider implements `validateResource()`** | **✗ Not documented as gap or deferral** |
| **`scopedValidate: true` has no current effect** | **✗ Not documented** |
| Validate in provider authoring guide capabilities example | ✗ Absent from guide |

### Gaps and responsible slice

- **Slice 46**: Decision required — implement path-scoped validate or explicitly defer
- **Slice 46**: Add `scopedValidate` to `docs/spec/resource-isolation.md` declaration requirements
- **Slice 46**: Update `docs/guides/provider-authoring-guide.md` to show validate in
  capabilities section (either with implementation example or with explicit deferral note)
- **Slice 46**: If deferring: add explicit notation to the spec that no first-party provider
  currently implements validate, and what `scopedValidate: true` does in practice

---

## Seam 3 — Refusal and error-boundary semantics

### Relevant source-of-truth documents

| Document | Relevance |
|---|---|
| `docs/spec/safety-and-refusal.md` | Primary spec; defines four categories and all refusal rules |
| `docs/adr/0008-unsafe-operations-are-refused-in-1-0.md` | Establishes refusal as first-class behavior |
| `docs/adr/0009-core-provider-repository-and-application-boundaries-are-explicit.md` | Defines which layer owns refusal |
| `docs/scenarios/safety-and-refusal.scenarios.md` | Scenarios for all four categories |
| `@multiverse/provider-contracts` (Refusal type) | Machine-readable category identifiers |

### Current coverage

| Topic | Coverage status |
|---|---|
| Four refusal categories defined | ✓ In spec and ADR-0008 |
| Core vs provider refusal responsibility | ✓ In spec and ADR-0009 |
| All four categories covered in scenarios | ✓ In `safety-and-refusal.scenarios.md` |
| Refusal applies to non-destructive operations | ✓ In spec and scenarios |
| **Spec uses spaces; contract uses underscores; split not documented** | **✗ Split is correct but unexplained** |
| **CLI output consistency per category across all commands** | **✗ Not audited; not in any doc** |
| **All category × command combinations have scenario coverage** | **Partially — needs audit** |

### Gaps and responsible slice

- **Slice 47**: Add a note to `docs/spec/safety-and-refusal.md` documenting that category
  names correspond to `category` field values in the provider `Refusal` type (underscore form)
- **Slice 47**: Audit CLI output per category across all five commands
- **Slice 47**: Fix any messages that conflate categories or are not actionable
- **Slice 47**: Add scenario coverage for any missing category × command combinations

---

## Seam 4 — Naming and terminology

### Relevant source-of-truth documents

| Document | Relevance |
|---|---|
| `docs/spec/` (all) | Canonical terminology source |
| `docs/adr/` (all) | Canonical decision language |
| `docs/guides/provider-authoring-guide.md` | Guides use of terms for provider authors |
| `docs/guides/external-demo-guide.md` | Consumer-facing terminology |

### Current coverage

| Term/concept | Coverage status |
|---|---|
| "worktree instance" (spec) vs "worktree" (common usage) | ✓ Spec uses "worktree instance" consistently |
| "handle" for resources vs "address" for endpoints | ✓ Correctly distinct in spec and contracts |
| `MULTIVERSE_*` env var naming convention (uppercase, hyphens → underscores) | ✓ In ADR-0013 and external-demo-guide |
| Capability names: derive, validate, reset, cleanup | ✓ Consistent in spec and contracts |
| **"scope-confirmation" semantic** | **✗ Implementation term not in any spec doc** |
| **"effectful" lifecycle semantic** | **✗ Implementation term not in any spec doc** |
| **Spec category names (spaces) vs contract `category` field (underscores)** | **✗ Split correct but undocumented** |
| **`{PORT}` placeholder in process-port-scoped** | **✗ Absent from all source-of-truth docs** |

### Gaps and responsible slice

- **Slice 45**: Introduce "scope-confirmation" and "effectful" as documented concepts in
  the provider authoring guide (or equivalent spec language for what these mean)
- **Slice 47**: Document the spec/contract naming split
- **Slice 45**: Document `{PORT}` placeholder

---

## Seam 5 — Consumer integration semantics

### Relevant source-of-truth documents

| Document | Relevance |
|---|---|
| `docs/adr/0018-explicit-app-native-env-mapping-for-run.md` | Establishes appEnv for resources and string-alias endpoints |
| `docs/adr/0019-explicit-typed-endpoint-mapping.md` | Establishes typed endpoint appEnv mapping |
| `docs/adr/0012-explicit-process-wrapper-run.md` | Establishes run semantics and env injection boundaries |
| `docs/guides/external-demo-guide.md` | Documents consumer-facing usage patterns |
| `apps/sample-compose/` | Proving app for mixed-provider consumer workflow |

### Current coverage

| Topic | Coverage status |
|---|---|
| `appEnv` string-alias for resources | ✓ ADR-0018; proven in sample-compose |
| `appEnv` string-alias for endpoints | ✓ ADR-0018; proven in sample-compose |
| `appEnv` typed mapping for endpoints (`url`, `port`) | ✓ ADR-0019; proven in sample-compose |
| Conflict behavior (appEnv name collides with parent env) | ✓ ADR-0018/0019 |
| Canonical `MULTIVERSE_*` vars always injected alongside appEnv | ✓ ADR-0018 |
| **`appEnv` excluded from `derive --format=env`** | **✓ Excluded in ADR-0018, but not explicitly classified as deferred** |
| **Typed resource appEnv mapping** | **✓ Explicitly deferred in ADR-0019** |
| **Multiple appEnv aliases for one declaration** | **✓ Explicitly deferred in ADR-0018** |
| Application-owned runtime-config boundary pattern | ✓ Proven in sample-compose; described in external-demo-guide |

### Gaps and responsible slice

- **Slice 49**: Add explicit deferred classification for `appEnv` injection in
  `derive --format=env` to ADR-0018 or a brief follow-on note; clarify this was excluded
  by design and is not an oversight
- The remainder of this seam is well-covered and stable

---

## Seam 6 — Worktree identity scenario alignment

### Relevant source-of-truth documents

| Document | Relevance |
|---|---|
| `docs/scenarios/worktree-identity.scenarios.md` | Primary scenario coverage |
| `docs/adr/0021-git-worktree-path-conventional-default-for-worktree-id.md` | Governs auto-discovery behavior |
| `docs/adr/0002-branch-name-is-metadata.md` | Branch name is not identity |
| `docs/adr/0003-main-checkout-uses-reserved-main-identity.md` | Main checkout reserved identity |
| `docs/adr/0001-git-worktrees-only-1.0.md` | Scope constraint |

### Current coverage

| Topic | Coverage status |
|---|---|
| Main checkout identity is `"main"` (explicit flag case) | ✓ In scenarios; ADR-0003 |
| Linked worktree receives unique identity | ✓ In scenarios |
| Same branch, different worktrees → different identities | ✓ In scenarios |
| Branch name is metadata only | ✓ In scenarios; ADR-0002 |
| **Main checkout identity in auto-discovery = path basename, not guaranteed `"main"`** | **✗ Scenario does not reflect ADR-0021 behavior** |
| **Auto-discovery success scenario** | **✗ Not in scenarios** |
| **Auto-discovery refusal scenario (git unavailable, no matching path)** | **✗ Not in scenarios** |
| **Recreated worktree gets new lifecycle identity** | ✗ In scenarios as aspirational; explicitly requires registry (deferred) |

### Gaps and responsible slice

- **Slice 48**: Annotate the "main checkout identity is `main`" scenario to clarify it
  applies when `--worktree-id main` is explicitly supplied
- **Slice 48**: Add a scenario for auto-discovery behavior: discovered id = path basename,
  which may differ from `"main"` for the primary checkout
- **Slice 48**: Add a scenario for auto-discovery refusal (git unavailable or no matching
  worktree path)
- The "recreated worktree" scenario remains aspirational and deferred (requires a persistent
  registry); no change needed


---

## Summary: gap inventory by slice

| Slice | Seams addressed | Nature of work |
|---|---|---|
| 45 | Seam 1, Seam 4 | Spec + scenarios + guide update; docs-only |
| 46 | Seam 2 | Decision + narrow implementation or explicit deferral |
| 47 | Seam 3, Seam 4 | Docs + targeted CLI messaging audit; narrow fixes only |
| 48 | Seam 6 | Docs-only; worktree identity scenario annotation |
| 49 | Seam 5 | Docs-only; appEnv/derive deferred classification |

## Items confirmed stable — no 0.6.x work required

The following areas were reviewed and are adequately covered by existing source-of-truth docs:

- Core/provider/repository/application boundary rules (ADR-0009; spec confirmed consistent)
- `run` process wrapper semantics (ADR-0012; no open issues)
- `derive --format=env` behavior (ADR-0013; consistent)
- `appEnv` for resources and endpoints including typed endpoint mapping (ADR-0018/0019; stable)
- Conventional defaults for `--config`, `--providers`, `--worktree-id` (ADR-0014, ADR-0021; stable)
- Deterministic derivation guarantees (product-spec; stable across all providers)
- Worktree isolation guarantees (product-spec; stable)
- Provider selection is explicit; no inference (ADR-0005; stable)
- Process-scoped orchestration boundary (ADR-0015; stable)
- Fixed-host-port provider model (ADR-0020; stable)
