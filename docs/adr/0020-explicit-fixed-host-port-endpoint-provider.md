# ADR 0020: Explicit fixed-host plus derived-port endpoint provider

## Status

Draft

## Date

2026-04-06

## Context

The `0.3.x` line has now proven the common-case consumer workflow strongly
enough to treat it as credible:

- `multiverse run` injects canonical `MULTIVERSE_*` transport variables
- endpoint declarations can map app-native env names explicitly
- endpoint `appEnv` supports typed extraction for `url` and `port`
- a composed application can consume those values through one application-owned
  runtime-config boundary

The next proving question is not whether applications can consume Multiverse
values cleanly. The next question is whether the provider model can grow without
distorting the architecture.

Today, the endpoint provider seam is only proven by one concrete provider shape:
`local-port`. That shape is sufficient for `0.3.x`, but it is not enough to show
that endpoint extensibility is a credible platform seam.

The first `0.4.x` slice should therefore add one additional endpoint provider
shape while preserving:

- the existing endpoint contract
- ADR 0018 and ADR 0019 semantics
- explicit repository-owned configuration
- refusal-first behavior
- unchanged consumer-facing `run` behavior

## Decision

Multiverse will add a second endpoint provider shape named `fixed-host-port`.

This provider is an endpoint provider that returns a URL-shaped endpoint value
through the existing endpoint contract.

For this slice:

- the provider name is `fixed-host-port`
- the provider is derive-only
- the emitted scheme is fixed to `http`
- the emitted host is provider-owned and explicitly configured
- the emitted port is worktree-derived from provider configuration plus worktree
  and endpoint identity

This slice is intended to prove endpoint-provider extensibility without changing
consumer workflow semantics.

## Scope

Included:

- one new endpoint provider named `fixed-host-port`
- explicit repository declaration support for that provider's configuration
- deterministic URL derivation using a configured host and base port
- declaration validation for the provider's configuration
- refusal behavior for invalid or unsafe provider configuration
- one narrow acceptance proof showing that existing consumer behavior remains
  stable when the new provider is used

Excluded:

- changes to the endpoint provider contract
- redesign of `run`
- redesign of endpoint `appEnv`
- changes to ADR 0018 or ADR 0019 semantics
- plugin or extension discovery behavior
- provider auto-discovery
- routing, reverse proxy, or orchestration semantics
- additional endpoint value kinds beyond `url` and `port`
- optional endpoint lifecycle capabilities

## Provider declaration shape

For this slice, repositories declare the provider explicitly and configure it
explicitly.

The provider-owned configuration shape is:

```json
{
  "name": "http",
  "role": "application-http",
  "provider": "fixed-host-port",
  "host": "127.0.0.1",
  "basePort": 5400
}
```

Configuration fields:

- `provider`: must be `fixed-host-port`
- `host`: required non-empty hostname or IP literal
- `basePort`: required integer base port

No additional provider configuration fields are introduced in this slice.

## URL ownership and derivation semantics

For the derived endpoint URL:

- scheme is provider-owned and fixed to `http`
- host is provider-owned and repository-configured
- port is worktree-derived
- path, query, and fragment are not used in this slice

The provider derives the port deterministically from:

- configured `basePort`
- worktree identity
- endpoint name

The derived output remains a single URL string through the existing endpoint
contract.

Example:

```text
http://127.0.0.1:5421
```

This means ADR 0019 behavior remains unchanged:

- `url` extraction uses the full derived URL
- `port` extraction uses the numeric port from that URL

## Determinism and collision expectations

The provider must be deterministic for the same:

- declared endpoint
- configured `host`
- configured `basePort`
- worktree identity

Different worktrees should normally derive different ports for the same endpoint
under the same provider configuration.

Different endpoint names in the same worktree should normally derive different
ports under the same provider configuration.

This slice does not require runtime port-availability checks during `derive`.

This slice also does not promise global collision avoidance across arbitrary
overlapping repository configurations. Repository owners remain responsible for
choosing sensible configured base ports when multiple endpoint declarations or
multiple repositories may coexist on one machine.

The business rule being proven here is deterministic scoped derivation, not
dynamic port reservation.

## Refusal behavior

The provider or declaration-loading layer must refuse when configuration is
invalid or unsafe to derive from explicitly.

This ADR requires refusal for:

- missing `host`
- empty `host`
- missing `basePort`
- non-integer `basePort`
- `basePort` outside the valid TCP port range
- absent worktree identity during derivation

This ADR does not require refusing based on live port availability during
`derive`.

If future work needs runtime availability or reservation semantics, that should
be handled by a later ADR rather than smuggled into this first extensibility
slice.

## Scheme behavior

For this slice, scheme is fixed.

- allowed scheme: `http`
- configurable scheme: no

This keeps the first `0.4.x` slice narrow and avoids expanding the endpoint
business model before the extension seam itself is proven.

If future work needs explicit `https` or other scheme variation, that should be
considered separately.

## Capability behavior

This provider is derive-only in this slice.

It does not introduce:

- `validate`
- `reset`
- `cleanup`

This keeps the slice focused on endpoint-provider extensibility rather than
optional capability semantics.

## Narrow acceptance story

The acceptance proof for this slice should show:

1. a repository explicitly declares an endpoint using `fixed-host-port`
2. `multiverse run` injects the canonical endpoint variable with a URL-shaped
   value derived by that provider
3. existing endpoint `appEnv` mapping continues to work unchanged for:
   - `url`
   - `port`
4. different worktrees receive different derived URLs under the provider's
   deterministic rules

This acceptance story is sufficient because it proves:

- a second endpoint provider shape can be added
- core still consumes the normalized endpoint contract rather than a
  `local-port` special case
- the consumer workflow does not need redesign to accommodate the new provider

## Boundary ownership

This slice preserves existing boundaries:

- repository configuration explicitly selects the provider and supplies provider
  configuration
- the provider owns technology-specific URL derivation rules for this shape
- core owns declaration loading, validation coordination, provider dispatch, and
  `run` environment injection
- ADR 0018 and ADR 0019 behavior remains core-owned and unchanged

This slice does not authorize moving consumer behavior into provider code.

## Consequences

Positive:

- proves the endpoint provider seam is not synonymous with `local-port`
- keeps the existing endpoint contract intact
- preserves the current consumer workflow
- advances `0.4.x` with a narrow architecture-testing slice

Limitations:

- proves only one additional endpoint shape
- does not address dynamic port reservation
- does not add extension discovery or authoring workflow
- does not broaden endpoint lifecycle semantics

## Alternatives considered

### Add a subdomain-based endpoint provider first

Rejected for the first slice.

That would introduce additional business-truth questions around local DNS and
hostname expectations before the extension seam itself is proven.

### Add a path-prefixed endpoint provider first

Rejected for the first slice.

That risks introducing routing semantics and orchestration-adjacent concerns too
early.

### Make scheme configurable in the first slice

Rejected for now.

That broadens endpoint configuration without improving the core extensibility
proof.

## Follow-on implications

The implementation slice following this ADR may:

- add explicit declaration parsing and validation for `fixed-host-port`
- add one provider package implementing derive-only endpoint behavior
- add contract and acceptance coverage proving the second endpoint shape
- update roadmap and state docs to reflect the first `0.4.x` extensibility proof

It should not:

- redesign `run`
- redesign `appEnv`
- broaden endpoint value semantics
- introduce plugin ecosystem behavior
