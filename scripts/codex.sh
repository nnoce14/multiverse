#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"

mkdir -p \
  "$ROOT/.codex/home" \
  "$ROOT/.codex/data" \
  "$ROOT/.codex/cache" \
  "$ROOT/.codex/pnpm-store"

exec codex \
  --cd "$ROOT" \
  --profile multiverse \
  --add-dir "$ROOT/.codex/home" \
  --add-dir "$ROOT/.codex/data" \
  --add-dir "$ROOT/.codex/cache" \
  --add-dir "$ROOT/.codex/pnpm-store" \
  "$@"