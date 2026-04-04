#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"

export HOME="$ROOT/.codex/home"
export XDG_DATA_HOME="$ROOT/.codex/data"
export XDG_CACHE_HOME="$ROOT/.codex/cache"
export PNPM_HOME="$ROOT/.codex/pnpm-home"
export PNPM_STORE_DIR="$ROOT/.codex/pnpm-store"

mkdir -p \
  "$HOME" \
  "$XDG_DATA_HOME" \
  "$XDG_CACHE_HOME" \
  "$PNPM_HOME" \
  "$PNPM_STORE_DIR"

exec "$@"