# Keystone — user management

A production-grade, full-stack user management system: **Next.js 16** (App Router, Cache Components, React 19), **Prisma 7** on PostgreSQL, **NextAuth v5**, **Tailwind CSS v4** and a hand-built accessible UI kit.

- Admin-only user directory: search, filter, sort, paginate, create, edit, (de)activate, delete
- Role-based access (ADMIN / USER), instant session revocation, rate-limited login
- Server-rendered everywhere (static shell + streaming); no client-side API calls
- REST API (`/api/users`, `/api/users/[id]`, `/api/users/me`) sharing the same service layer
- WCAG 2.1 AA, SEO (metadata, sitemap, robots, JSON-LD, OG image), strict security headers
- Unit, component, integration and E2E (with axe) test suites

See [ARCHITECTURE.md](./ARCHITECTURE.md), [DESIGN.md](./DESIGN.md) and [AGENTS.md](./AGENTS.md).

## Requirements

- Node.js ≥ 22.12, pnpm 11 (`corepack enable`)
- PostgreSQL 16+

## Getting started

```bash
pnpm install                 # also generates the Prisma client
cp .env.example .env         # set DATABASE_URL, AUTH_SECRET (openssl rand -base64 32), ADMIN_*
pnpm db:migrate              # apply migrations
pnpm db:seed                 # create the admin (+ demo users outside production)
pnpm dev                     # http://localhost:3000
```

Sign in at `/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Demo users share the password `Demo@12345`.

## Scripts

| Script                                                                                  | Description                                                    |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `dev`, `build`, `start`                                                                 | Develop, build, serve the production build                     |
| `lint`, `lint:fix`, `format`, `format:check`, `typecheck`                               | Code quality (also run by git hooks)                           |
| `test`, `test:unit`, `test:integration`, `test:watch`, `test:coverage`                  | Vitest suites (integration needs the test DB from `.env.test`) |
| `test:e2e`, `test:e2e:ui`                                                               | Playwright (run `pnpm build` first)                            |
| `db:generate`, `db:migrate`, `db:deploy`, `db:push`, `db:seed`, `db:studio`, `db:reset` | Prisma                                                         |
| `design:detect`                                                                         | Impeccable design anti-pattern scan                            |

## Testing locally

```bash
createdb next_app_test                       # once; URL in .env.test
pnpm test                                    # unit + components + integration
pnpm build && pnpm test:e2e                  # end-to-end with accessibility scans
```

## Workflow

- Conventional Commits (commitlint). Pre-commit runs ESLint --fix, Prettier and `tsc`; CI (`.github/workflows/test.yml`) runs the test suites.
- VS Code: recommended extensions in `.vscode/extensions.json`; format + ESLint fix on save.
- AI tooling: `AGENTS.md` / `CLAUDE.md`, `.claude/settings.json`, MCP servers in `.mcp.json` (Prisma, Next DevTools, Context7, Playwright), Prisma and Impeccable skills.

## Deployment

`output: "standalone"` is enabled. Build with `pnpm build`, run migrations with `pnpm db:deploy`, then serve `node .next/standalone/server.js` (copy `public/` and `.next/static/` alongside) or `pnpm start`. Set `APP_URL` to the public HTTPS origin (enables `upgrade-insecure-requests`), `AUTH_URL`, `AUTH_SECRET`, `DATABASE_URL`. Replace the in-memory login rate limiter with a shared store when running multiple instances.
