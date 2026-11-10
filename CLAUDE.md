# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

All project rules, commands and conventions live in the files imported below — they are the single source of truth for every agent (Claude, Cursor, Codex…).

@AGENTS.md
@ARCHITECTURE.md
@DESIGN.md

## Claude Code specifics

- **No AI attribution**: never add Claude as author or co-author of commits, and never add `Co-Authored-By`, `Generated with Claude Code` or session links to commits or PRs. `.claude/settings.json` sets `includeCoAuthoredBy: false` and empty `attribution`.
- Edited files are auto-formatted by the `PostToolUse` hook (`.claude/hooks/format-file.sh`: Prettier + ESLint --fix). The Impeccable hooks run design checks after UI edits.
- Next.js 16 differs from training data: check `node_modules/next/dist/docs/` (or the `next-devtools` MCP server) before using an API.
- Project skills: `.claude/skills/` (Prisma 7 skills, `impeccable`). MCP servers (`.mcp.json`): prisma, next-devtools, context7, playwright.
- Never read `.env*` secrets (denied in settings); use `.env.example` / `.env.test` for reference.
