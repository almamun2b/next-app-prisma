#!/usr/bin/env bash
# PostToolUse hook: auto-format (and lint-fix) a file Claude just edited.
# Reads the hook JSON from stdin and extracts tool_input.file_path.
set -euo pipefail

file=$(node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{process.stdout.write(JSON.parse(d).tool_input?.file_path??"")}catch{}})')

[[ -z "$file" || ! -f "$file" ]] && exit 0

case "$file" in
  */node_modules/*|*/.next/*|*/src/generated/*) exit 0 ;;
  *.ts|*.tsx|*.mts)
    pnpm exec prettier --write --log-level=warn "$file" >/dev/null 2>&1 || true
    pnpm exec eslint --fix "$file" >/dev/null 2>&1 || true
    ;;
  *.js|*.mjs|*.json|*.md|*.css|*.yml|*.yaml)
    pnpm exec prettier --write --log-level=warn "$file" >/dev/null 2>&1 || true
    ;;
esac
exit 0
