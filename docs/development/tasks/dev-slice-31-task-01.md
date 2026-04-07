# Dev Slice 31 — Task 01

## Title

Add a narrow `multiverse run` integration proof for fixed-host-port endpoint consumers

## Sources of truth

- `docs/adr/0018-explicit-app-native-env-mapping-for-run.md`
- `docs/adr/0019-explicit-typed-endpoint-mapping-for-run.md`
- `docs/adr/0020-explicit-fixed-host-port-endpoint-provider.md`
- `docs/spec/endpoint-model.md`
- `docs/spec/provider-model.md`
- `docs/development/dev-slice-31.md`

## In scope

- one focused integration test under `tests/integration/`
- a tiny local child-process consumer launched through `multiverse run`
- fixed-host-port endpoint declaration with explicit endpoint `appEnv` mapping
- verification that the child process receives:
  - canonical `MULTIVERSE_ENDPOINT_*` endpoint env
  - declared app-native endpoint env aliases
  - correct typed `url` and `port` values
- `apps/cli/src/index.ts` only if the new proof reveals a real `run` gap

## Out of scope

- new providers
- new CLI surface
- endpoint-model redesign
- provider-contract redesign beyond the existing narrow fixed-host-port extension
- sample-app expansion beyond the tiny local child process needed for this proof

## Acceptance criteria

- `multiverse run` can launch a real child process using a fixed-host-port endpoint declaration
- the child process receives the canonical fixed-host-port endpoint env var unchanged
- the child process receives the declared app-native endpoint env aliases unchanged
- typed endpoint mapping still injects the full URL and extracted numeric port string
- different worktrees still receive correctly scoped fixed-host-port endpoint values through the same consumer workflow

## Version and status check

- This task changes only behavior and proof implemented on `main`.
- This task does not change the current project version posture.
- ADR or roadmap updates are not expected unless the proof reveals a truth mismatch.
