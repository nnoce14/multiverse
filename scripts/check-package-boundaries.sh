#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")/.."

pattern="from ['\"](\\./\\./)+packages/|from ['\"](\\./\\./)+provider-contracts/"

if rg -n "$pattern" packages tests; then
  echo
  echo "Cross-package relative imports are not allowed."
  echo "Use workspace package entrypoints instead."
  exit 1
fi

echo "Package boundary check passed."
