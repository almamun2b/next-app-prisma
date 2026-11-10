# Architecture

Keystone is a full-stack Next.js 16 application organised as a **modular MVC** codebase. Every request — whether it arrives as a Server Component render, a Server Action or a REST call — flows through the same service and repository layers.

## Directory map

```
src/
├─ app/                         Routing only (thin): pages, layouts, route handlers, metadata routes
│  ├─ (marketing)/              Public: landing (/), login (/login) — header + footer layout
│  ├─ (app)/                    Authenticated: dashboard, users, users/[id], profile, design-system
│  ├─ api/auth/[...nextauth]/   Auth.js handlers
│  ├─ api/users/…               REST: /api/users, /api/users/[id], /api/users/me
│  └─ robots.ts sitemap.ts manifest.ts opengraph-image.tsx error.tsx not-found.tsx …
├─ modules/                     Feature modules (the MVC core)
│  ├─ auth/                     schema · service · guard (DAL) · actions · errors · components · providers
│  ├─ user/                     schema · dto · repository · service · controller · actions · url · components
│  ├─ marketing/                landing sections
│  └─ design-system/            component gallery
├─ components/{ui,layout,seo,providers}   Shared, feature-agnostic UI
├─ hooks/                       Reusable client hooks
├─ lib/                         Cross-cutting: errors, http, safe-action, prisma, env, zod, seo, logger, rate-limit
├─ config/site.ts               Site name, URL, nav (feeds metadata, sitemap, JSON-LD)
├─ auth.ts · auth.config.ts     Auth.js (Node) and runtime-agnostic config
└─ proxy.ts                     Next 16 Proxy (formerly middleware): optimistic route gating
```

## Layers

| Layer             | File                                      | Responsibility                                                                                     | May import                          |
| ----------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Model (data)      | `*.repository.ts`                         | All Prisma access; `publicUserSelect` allowlist; list queries via `query-builder-prisma`           | `@/lib/prisma`                      |
| Model (contract)  | `*.schema.ts`, `*.dto.ts`                 | zod input schemas (shared client/server), safe output types                                        | `@/lib/zod`                         |
| Service           | `*.service.ts`                            | Business rules, authorization policy, invariants (last admin, self-protection, session revocation) | repository, `AppError`, password    |
| Controller (HTTP) | `*.controller.ts` → `app/api/**/route.ts` | Authenticate → parse/validate → service → `apiOk`                                                  | service, guard, `withRouteHandler`  |
| Controller (RPC)  | `*.actions.ts` (`"use server"`)           | Same as above for client events; returns `ActionResult`                                            | service, `createAction`             |
| View              | `components/`, `app/**/page.tsx`          | Server Components read via services; client components call actions                                | services (server), actions (client) |

Rules: only repositories import Prisma; client code never `fetch`es app APIs; pages and actions never contain business rules.

## Request flows

```
Browser ──GET page──▶ proxy.ts (JWT check, redirects) ──▶ Server Component
                                                          └─▶ requireUser()/requireAdmin() ─▶ service ─▶ repository ─▶ Prisma
Browser ──click/form──▶ Server Action (createAction: auth → zod → handler) ─▶ service ─▶ repository
                         └─▶ ActionResult {ok,data|error} ─▶ useServerAction (toast, field errors) + revalidatePath
API client ──REST──▶ app/api/users/route.ts ─▶ userController (withRouteHandler) ─▶ service ─▶ repository
                         └─▶ { success, data, meta } | { success:false, error:{ code, message, details } }
```

The REST API (`/api/users*`) exposes the same capabilities to external/HTTP clients; the web UI uses Server Components and Server Actions over the shared service layer (no extra network hop, no cookie forwarding, compatible with static prerendering).

## Error handling

- `AppError` (`src/lib/errors/app-error.ts`): `statusCode`, stable `code`, client-safe `message`, optional `details.fieldErrors`, `isOperational`. Factories: `badRequest`, `validation`, `unauthorized`, `forbidden`, `notFound`, `conflict`, `tooManyRequests`, `serviceUnavailable`, `internal`.
- `toAppError` / `handleError` (`handle-error.ts`) is the **single global normalizer**:
  - `ZodError` → 422 `VALIDATION_ERROR` with per-field messages (`normalize-zod.ts`)
  - Prisma errors by **error code** (`normalize-prisma.ts`): `P2002` → 409 with offending fields (supports driver-adapter `constraint.index`), `P2025/P2001/P2018` → 404, `P2003/P2014` → 409, `P2000/P2006/P2007/P2011–P2013` → 400, `P2024/P1001/P1002/P1008` and init/panic → 503, validation → 400
  - malformed JSON → 400, anything else → 500
  - Non-operational errors are logged; in production 5xx messages are replaced by a generic one.
- Boundaries: `withRouteHandler` (Route Handlers), `createAction` (Server Actions, re-throws framework redirects via `unstable_rethrow`), `app/error.tsx` and `app/global-error.tsx` (rendering), `not-found.tsx`, `forbidden.tsx`, `unauthorized.tsx` (`authInterrupts`).

## Authentication & sessions

- **Auth.js v5**, Credentials provider, **JWT** sessions (8 h max age, 1 h update age, httpOnly cookies). Admin is created by `prisma/seed.ts` from `ADMIN_*` env vars; there is no public sign-up.
- `authService.authenticate`: rate limited (5 attempts / 15 min per IP + email, in-memory — replace with Redis for multi-instance deployments), timing-safe for unknown emails, rejects inactive users, records `lastLoginAt`.
- **Revocation**: `User.tokenVersion` is embedded in the JWT and checked against the DB on every server-side session read (`auth.ts` → `authService.refreshToken`). Password change, role change and deactivation increment it, so sessions die immediately.
- `proxy.ts` uses the DB-free `auth.config.ts` for optimistic gating (redirects to `/login?callbackUrl=…`, admins-only `/users`). The authoritative checks are in the DAL (`auth.guard.ts`) and in services.
- Client components get the user from `AuthProvider`/`useAuth()`, populated on the server — the browser never calls `/api/auth/session`.
- Login is a progressive-enhancement `<form action>` (`useActionState`); post-login redirects are validated by `safeCallbackUrl` (same-origin only).

## Rendering & caching

- `cacheComponents` + `partialPrefetching`: every route is prerendered to a static shell; session- or request-dependent parts stream inside `<Suspense>` boundaries (each app page owns one so client navigations are instant). `getSessionUser` calls `connection()` before reading the session.
- `/`, `/login` and the metadata routes are static/PPR; the footer year uses `"use cache"`.
- Mutations call `revalidatePath` for affected routes. `reactCompiler` and `typedRoutes` are enabled.

## Security

- Headers (`next.config.ts`): CSP (`frame-ancestors 'none'`, `object-src 'none'`, `form-action 'self'`; `'unsafe-inline'` scripts are required by the static shell without per-request nonces), HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP; `poweredByHeader: false`.
- Passwords: bcrypt (12 rounds), strong policy in `passwordSchema`, never selected outside the auth lookup.
- All inputs validated with zod on the server; API errors never leak internals; Server Actions have Next.js origin checks; zod runs `jitless` so CSP can forbid `eval`.

## Testing

| Suite       | Location             | Tooling                                                                                      |
| ----------- | -------------------- | -------------------------------------------------------------------------------------------- |
| Unit        | `src/**/*.test.ts`   | Vitest (node): errors, schemas, services (mocked repository), utils                          |
| Component   | `src/**/*.test.tsx`  | Vitest + jsdom + Testing Library + user-event                                                |
| Integration | `tests/integration/` | Vitest against a real PostgreSQL test DB: route handlers and Server Actions (session mocked) |
| E2E         | `e2e/`               | Playwright (desktop + mobile) with axe-core WCAG 2.1 AA scans, admin/member storage states   |

CI (`.github/workflows/test.yml`) runs Vitest with coverage and Playwright against PostgreSQL 16. Lint, formatting and type-checking run locally in husky hooks.
