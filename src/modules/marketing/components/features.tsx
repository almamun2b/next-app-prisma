import {
  Accessibility,
  Gauge,
  KeyRound,
  ListFilter,
  MonitorSmartphone,
  UserCog,
} from "lucide-react";
import { Container } from "@/components/layout/container";

const FEATURES = [
  {
    icon: UserCog,
    title: "Full account lifecycle",
    body: "Create, edit, deactivate and remove users with guard rails that keep at least one administrator active.",
  },
  {
    icon: KeyRound,
    title: "Role-based access",
    body: "Admin and user roles enforced at the proxy, the data layer and every API endpoint.",
  },
  {
    icon: ListFilter,
    title: "Search, filter, sort",
    body: "Server-side search with shareable URLs, so every view of your directory is a link.",
  },
  {
    icon: Gauge,
    title: "Instant navigation",
    body: "Server-rendered pages stream from a prerendered shell for near-zero perceived load time.",
  },
  {
    icon: Accessibility,
    title: "Accessible by default",
    body: "Keyboard support, visible focus, screen-reader labels and AA contrast in light and dark.",
  },
  {
    icon: MonitorSmartphone,
    title: "Works on any screen",
    body: "A responsive layout that stays usable from a phone in the field to a wide desktop.",
  },
] as const;

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="scroll-mt-20 border-t border-border bg-surface py-20 sm:py-24"
    >
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16">
        <header className="grid content-start gap-3 lg:sticky lg:top-28">
          <p className="text-sm font-semibold text-primary">Features</p>
          <h2 id="features-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything an admin needs. Nothing they don&apos;t.
          </h2>
          <p className="text-muted-foreground">
            One console for the whole account lifecycle, built on server-rendered pages and a strict
            access model.
          </p>
        </header>
        <dl className="grid divide-y divide-border border-y border-border">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="grid gap-2 py-6 sm:grid-cols-[14rem_1fr] sm:gap-8">
              <dt className="flex items-center gap-2.5 font-semibold">
                <Icon aria-hidden="true" className="size-4.5 shrink-0 text-primary" />
                {title}
              </dt>
              <dd className="text-sm leading-relaxed text-muted-foreground">{body}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
