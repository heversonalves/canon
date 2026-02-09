#!/usr/bin/env bash
set -euo pipefail

if rg -n "^(<<<<<<<|=======|>>>>>>>)" \
  --glob '!node_modules/**' \
  --glob '!canon-frontend/**' \
  --glob '!*dist/**' \
  .; then
  echo "\n❌ Merge conflict markers found. Resolve them before commit."
  exit 1
fi

echo "✅ No merge conflict markers found."
