# Dev Slice 25 — Formalize `multiverse` Binary (CLI Package Build)

## Status

Done

## Intent

Implement the changes defined in ADR-0017: give `apps/cli` a real `bin` entry, a `tsc`-based build, and a shebang wrapper so that `multiverse` can be invoked as a compiled binary rather than only via the `pnpm cli` dev shortcut.

## Slice objective

1. Export `main` from `apps/cli/src/index.ts`
2. Add `apps/cli/bin/multiverse.js` — shebang wrapper that imports and awaits `main` from the compiled output
3. Add `apps/cli/tsconfig.build.json` — extends root tsconfig, compiles `src/` → `dist/`
4. Update `apps/cli/package.json` — add `bin`, `main`, and `build` entries
5. Add `build` script to root `package.json`
6. Add `build-cli` job to CI as a required validation check

## Scope

- `docs/adr/0017-...` — mark Accepted
- `apps/cli/src/index.ts` — export `main`
- `apps/cli/bin/multiverse.js` — new shebang wrapper (version-controlled)
- `apps/cli/tsconfig.build.json` — new build tsconfig
- `apps/cli/package.json` — bin, main, build entries
- `package.json` (root) — build script
- `.github/workflows/ci.yml` — build-cli job

## Out of scope

- Global install / npm publish
- Bundling
- Changing the `pnpm cli` dev shortcut
- Modifying `runCli` or any business logic
- Integration tests for the binary invocation path

## Two-surface invariant

After this slice:
- `pnpm cli <args>` invokes tsx → `src/index.ts` → `main()` via `isMainModule` guard
- `node apps/cli/bin/multiverse.js <args>` (or `multiverse <args>` if linked) invokes compiled `dist/index.js` → `main()` explicitly from the wrapper

Both paths call the same `main()` function. No behavior difference.

## Acceptance criteria

- `pnpm --filter @multiverse/cli build` succeeds and produces `apps/cli/dist/index.js`
- `node apps/cli/bin/multiverse.js` runs without error (outputs usage)
- `pnpm cli` continues to work as before
- All existing 210 tests remain green
- CI `build-cli` job passes

## Definition of done

The `multiverse` binary compiles cleanly, the bin wrapper is executable, both dev and formal paths produce the same CLI behavior, and CI enforces build cleanliness.
