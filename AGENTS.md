<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Keystone — project rules for AI agents and contributors

Production-grade user management app: **Next.js 16 (App Router, Cache Components) · React 19 · Prisma 7 (PostgreSQL) · NextAuth v5 · Tailwind CSS v4 · strict TypeScript**. Read [ARCHITECTURE.md](./ARCHITECTURE.md) before backend work and [DESIGN.md](./DESIGN.md) before UI work.

## Commands

| Task                                     | Command                                                                          |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| Dev server                               | `pnpm dev`                                                                       |
| Production build / start                 | `pnpm build` / `pnpm start`                                                      |
| Lint / auto-fix                          | `pnpm lint` / `pnpm lint:fix`                                                    |
| Format / check                           | `pnpm format` / `pnpm format:check`                                              |
| Type-check (generates route types first) | `pnpm typecheck`                                                                 |
| All Vitest projects                      | `pnpm test`                                                                      |
| One Vitest project                       | `pnpm exec vitest run --project unit` (`components`, `integration`)              |
| One test file / test name                | `pnpm exec vitest run src/modules/user/user.service.test.ts -t "last active"`    |
| E2E (needs `pnpm build` first)           | `pnpm test:e2e`                                                                  |
| One E2E spec                             | `pnpm exec playwright test e2e/admin.spec.ts --project=setup --project=chromium` |
| DB migrate (dev) / deploy / seed         | `pnpm db:migrate` / `pnpm db:deploy` / `pnpm db:seed`                            |
| Design anti-pattern scan                 | `pnpm design:detect` (or `npx impeccable detect http://localhost:3000/`)         |

Integration tests need a database whose URL contains `test` (`.env.test` → `next_app_test`); E2E uses `.env`. In sandboxes without the bundled Playwright browser, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

## Non-negotiable rules

1. **Layering (modular MVC).** `src/modules/<module>/` owns everything for a feature:
   `*.schema.ts` (zod, shared client/server) → `*.repository.ts` (**the only place that imports `@/lib/prisma`**) → `*.service.ts` (business rules + authorization) → controllers: `*.controller.ts` (Route Handlers) and `*.actions.ts` (Server Actions) → `components/` (views).
   Pages, components, actions and controllers never touch Prisma directly.
2. **No client-side API calls.** Client components never `fetch` app APIs and never use `SessionProvider`. Mutations go through Server Actions (`useServerAction` hook or `<form action>`); reads happen in Server Components. Filters/pagination change the URL, not data.
3. **Every mutation is validated and authorized on the server**: wrap Server Actions with `createAction` (`src/lib/safe-action.ts`) and Route Handlers with `withRouteHandler` (`src/lib/http/with-route-handler.ts`). Services re-check roles (defence in depth). Throw `AppError` (`src/lib/errors`) — never return ad-hoc error shapes.
4. **Auth reads only through the DAL** `src/modules/auth/auth.guard.ts` (`getSessionUser`, `requireUser`, `requireAdmin`, `authenticate`, `authenticateAdmin`). Session reads must sit inside a `<Suspense>` boundary (Cache Components); every app page owns its own boundary.
5. **Size limits (ESLint-enforced):** functions ≤ **150** lines, component files (`*.tsx`) ≤ **200** lines. Split into sub-components/hooks instead of disabling the rule.
6. **UI kit is hand-built** (`src/components/ui`) in shadcn style with `cva` + `cn` (the `cn` package). Do **not** add shadcn CLI output, Radix, TanStack or other headless/table libraries. Reuse existing components and tokens; never hard-code colors — use the semantic tokens in `globals.css`.
7. **Strict TypeScript.** No `any`, no non-null assertions in app code, no `@ts-ignore`. Import `z` from `@/lib/zod` (CSP-safe jitless config), not from `"zod"`.
8. **Prisma 7 only** (`prisma`, `@prisma/client`, `@prisma/adapter-pg` pinned to `^7`). Do not upgrade to Prisma 8. Generated client lives in `src/generated/prisma` (git-ignored, created on `postinstall`). Change the schema only via migrations.
9. **Public pages stay light**: keep validation libraries and heavy client components off `/` and `/login` (login is a progressive-enhancement `<form action>`). Don't animate LCP content in from `opacity: 0`.
10. **Accessibility is a release gate**: WCAG 2.1 AA, semantic landmarks, labelled controls, visible focus, keyboard support. Playwright runs axe on every page — keep it at zero violations.
11. **Tests accompany changes**: unit tests beside the code (`*.test.ts[x]`), integration tests in `tests/integration`, E2E in `e2e/`.

## Git

- Work on the branch you are told to use; never create extra branches without being asked.
- Conventional Commits (enforced by commitlint). Husky runs lint-staged (ESLint --fix + Prettier) and `pnpm typecheck` on every commit; CI only runs tests.
- **Never add Claude (or any AI) as commit author or co-author**: no `Co-Authored-By` / `Generated with` trailers, no AI attribution in commit messages or PR descriptions. Commits use the developer's git identity.
