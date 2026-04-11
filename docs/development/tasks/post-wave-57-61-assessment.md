# Post-Wave Assessment: 0.8.x Support Boundary Definition

## Purpose

This document records the completion assessment for the `0.8.x` support boundary
definition wave (Slices 57–61) and the rationale for the posture move to
`0.9.0-alpha.1`.

## Wave summary

The `0.8.x` wave set out to answer one proving question:

> Can Multiverse's support boundaries be made explicit enough that a user can tell what
> the tool officially supports for 1.0, without reading the source code?

Five slices addressed four planned seams:

| Slice | Seam | Deliverable |
|---|---|---|
| 57 | Planning baseline | Four-seam audit and proposed slice sequence |
| 58 | Provider support classification | `docs/spec/provider-support-classification.md` |
| 59 | Official supported workflow | `docs/spec/supported-workflow.md` |
| 60 | Consumer integration model | `docs/spec/consumer-integration-model.md` |
| 61 | Core/extension boundary | `docs/spec/core-extension-boundary.md` |

No production code changes were made in this wave. All work was docs and classification.

## 0.8.x exit criteria audit

The roadmap defines five exit criteria for moving beyond `0.8.x`. Each is assessed
against the source-of-truth docs as of Slice 61.

**"Users can tell what Multiverse officially supports"**

Met. Four new specs now give explicit answers to the four support-boundary questions:
which providers are first-class (Slice 58), which workflow is common-case (Slice 59),
which consumer integration patterns are supported (Slice 60), and what the
core/extension boundary is (Slice 61). Before this wave, the answers existed in code,
ADRs, and guide text but required reading several documents without a consolidated view.

**"Users can tell what remains experimental or deferred"**

Met. Every new spec includes an explicit "What is deferred" section enumerating named
deferred items. Nothing material is left ambiguous as "maybe supported" without a clear
classification.

**"The core-versus-extension boundary is understandable"**

Met by Slice 61. `docs/spec/core-extension-boundary.md` synthesizes ADR-0005, ADR-0009,
and the provider authoring guide into a single readable reference.

**"The supported consumer integration model is explicit"**

Met by Slice 60. `docs/spec/consumer-integration-model.md` classifies three supported
patterns with explicit "when to use" guidance, and states the `run` stderr refusal
routing as a stable 1.0 behavior.

**"1.0 no longer depends on broad or ambiguous promises"**

Met. Each boundary is now named and explicit. The deferred items in each spec make the
1.0 scope narrower and more honest, not broader.

## Contradiction check

No contradictions were found between ADRs, specs, or guide docs. The boundary work
found that truth was distributed but consistent — it needed consolidation, not
correction.

## What remains open (not blocking 0.9.x)

The following items remain open but belong to 0.9.x hardening, not 0.8.x boundary
definition:

- `validate-repository` guide documentation — still optional; flagged since 0.7.x; no
  user workflow depends on it being in the guide
- `repo-map.md` slice narrative — still describes through Slice 43; not incorrect but
  would benefit from a 0.9.x accuracy pass
- Final guide accuracy pass — the external-demo-guide and README accurately reflect the
  current CLI surface but have not been reviewed against the now-explicit support specs;
  a 0.9.x accuracy pass should check alignment
- End-to-end validation of supported workflows against final support specs

None of these are support-boundary gaps. They are hardening work appropriate for 0.9.x.

## Posture recommendation: move to 0.9.0-alpha.1

The `0.8.x` wave is complete in substance. All five exit criteria are met. The
Immediate direction items in `roadmap.md` are all marked complete.

Moving to `0.9.0-alpha.1` is honest: the product has stopped discovering its identity
and is now ready to harden the defined boundaries through final validation, guide
accuracy, and CLI polish.

The next highest-signal proving question for `0.9.x` is:

> Do the defined support boundaries hold up under final workflow validation? Can a user
> read the support specs, follow the guide, and reproduce the documented experience
> without gaps or surprises?

The `0.9.x` wave should not invent new boundaries — it should verify that the
already-stated boundaries are accurate and trustworthy in practice.
