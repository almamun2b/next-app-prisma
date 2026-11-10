# Design system

Keystone's UI is a **hand-built, shadcn-style kit** (`src/components/ui`) on **Tailwind CSS v4**. No shadcn CLI, Radix or TanStack: components use native elements and WAI-ARIA patterns, `cva` for variants and `cn` (the `cn` package) for class merging. A live catalogue is available at `/design-system` (signed-in users).

## Principles

1. **Native first.** `<dialog>` for modals, Popover API for menus, native checkbox/radio/range/select. The browser gives us focus management, keyboard support and form participation for free.
2. **Accessible by default.** WCAG 2.1 AA contrast in both themes, visible `:focus-visible` rings, 40px+ hit targets, labelled controls, `aria-*` wiring handled by components (`FormField`, `Tooltip`, `Select`).
3. **Calm and dense.** An admin tool: neutral surfaces, one teal accent, restrained motion, tabular numbers for data.
4. **Fast.** CSS-only motion, no JS animation library, no animation on LCP content.

## Tokens (`src/app/globals.css`)

Colors are OKLCH CSS variables defined for `:root` (light) and `.dark`, then mapped to utilities with `@theme inline` — use the semantic utilities, never raw colors.

| Token                                                    | Utility examples                                    | Use                                                  |
| -------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------- |
| `background` / `foreground`                              | `bg-background text-foreground`                     | Page canvas and body text                            |
| `surface`                                                | `bg-surface`                                        | Cards, menus, dialogs, table container               |
| `muted` / `muted-foreground`                             | `bg-muted text-muted-foreground`                    | Secondary fills, hints, meta text (AA on background) |
| `subtle`                                                 | `bg-subtle`                                         | Skeletons, slider track                              |
| `primary` / `primary-hover` / `primary-foreground`       | `bg-primary hover:bg-primary-hover`                 | Primary actions, active states, links                |
| `secondary` / `secondary-foreground`                     | `bg-secondary`                                      | Soft accent fills (active nav, admin badge)          |
| `accent`                                                 | `hover:bg-accent`                                   | Hover backgrounds for ghost/outline controls         |
| `destructive` (+ `-hover`, `-foreground`), `danger-soft` | `bg-destructive`, `bg-danger-soft text-destructive` | Destructive actions, errors                          |
| `success`/`success-soft`, `warning`/`warning-soft`       | `bg-success-soft text-success`                      | Status badges                                        |
| `border`, `input`, `ring`, `overlay`                     | `border-border`, `border-input`, `outline-ring`     | Dividers, control borders, focus, modal backdrop     |

Radius: `--radius` (0.625rem) with `rounded-sm|md|lg|xl` derived from it. Typography: **Onest** variable (self-hosted via `next/font/local`, `--font-sans`), Geist Mono for code. Headings use `tracking-tight` and `text-wrap: balance`.

Theme: `next-themes` (class strategy, system default, no flash) with a light/system/dark segmented control (`ThemeToggle`).

## Components

| Component                                        | Notes                                                                                                                                                                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Button` / `buttonVariants`                      | `primary · secondary · outline · ghost · destructive · link`; sizes `sm · md · lg · icon · icon-sm`; `loading` (spinner + `aria-busy` + disabled). Use `buttonVariants()` to style `Link`s. Defaults to `type="button"`. |
| `Input`, `Textarea`, `Label`, `FormField`        | `FormField` render-prop wires `id`, `htmlFor`, `aria-describedby`, `aria-invalid`, `aria-required`. Adornments for icons/toggles.                                                                                        |
| `Select`                                         | Custom select-only combobox (APG): arrows, Home/End, PageUp/Down, typeahead, Esc, disabled options, hidden input for native forms.                                                                                       |
| `NativeSelect`                                   | Styled `<select>` — prefer on mobile and simple forms.                                                                                                                                                                   |
| `Checkbox`, `RadioGroup`, `Switch`, `Slider`     | Native inputs (switch = `role="switch"` button, slider = `input[type=range]` with `aria-valuetext`). Controlled or uncontrolled via `useControllableState`.                                                              |
| `Modal`                                          | Native `<dialog>.showModal()`, labelled by title/description, Esc + backdrop close, `dismissible` lock while pending.                                                                                                    |
| `Tooltip`                                        | Hover **and** focus, Esc-dismissible, hoverable, linked by `aria-describedby`; accepts server-rendered children. Supplementary info only.                                                                                |
| `Table`, `SortableHead`                          | Semantic table in a focusable scroll region; sorting via links with `aria-sort`.                                                                                                                                         |
| `Pagination`                                     | Link-based `<nav>`, `aria-current="page"`, ellipsis window, compact on mobile.                                                                                                                                           |
| `Badge`, `Avatar`, `Card`, `Skeleton`, `Spinner` | Avatar uses `next/image` or initials.                                                                                                                                                                                    |
| `ToastProvider` / `useToast`                     | Polite live region, auto-dismiss (5 s), dismiss button.                                                                                                                                                                  |

Reusable hooks (`src/hooks`): `useControllableState`, `useDisclosure`, `useDebouncedValue` / `useDebouncedCallback`, `useListbox`, `useClickOutside`, `useMediaQuery`, `useMounted`, `useServerAction`.

## Interaction states

Every interactive element defines: **hover** (color shift), **active** (`scale-[0.98]` on buttons), **focus-visible** (2px `ring` outline, offset 2), **disabled** (50% opacity, no pointer events), **invalid** (`aria-invalid` → destructive border/ring), **loading** (spinner + `aria-busy`), **selected/current** (`aria-current`, `aria-selected`, `aria-checked` drive styles via attribute variants).

## Motion

- Tokens: `--ease-out-quart`, `animate-fade-in` (180 ms), `animate-slide-up` (220 ms), `animate-toast-in`.
- Dialog and menu enter/exit use transitions + `@starting-style` + `transition-behavior: allow-discrete`.
- `prefers-reduced-motion: reduce` collapses all durations. Never fade in LCP content from `opacity: 0`.

## Layout & responsiveness

- `Container`: `max-w-6xl` with 16/24/32px gutters. App shell: sticky 16rem sidebar ≥ `lg`, horizontal scrollable nav below.
- Mobile first; no horizontal page scroll at 320px; tables scroll inside their region; secondary columns hide on small screens.
- Landmarks: skip link → `header` → `nav` (labelled) → `main#main` → `footer`.

## Quality gates

- Playwright + axe (WCAG 2.1 A/AA) on every page, light and dark.
- `npx impeccable detect src/` and `npx impeccable detect http://localhost:3000/` for design anti-patterns (Impeccable skill installed in `.claude/skills/impeccable`).
- Lighthouse targets: 100 accessibility / best practices / SEO; performance 100 on desktop.
