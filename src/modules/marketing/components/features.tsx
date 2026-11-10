import {
  Gauge,
  KeyRound,
  ListFilter,
  MonitorSmartphone,
  UserCog,
  Accessibility,
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
      <Container className="grid gap-12">
        <header className="grid max-w-2xl gap-3">
          <p className="text-sm font-semibold text-primary">Features</p>
          <h2 id="features-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything an admin needs. Nothing they don&apos;t.
          </h2>
        </header>
        <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="grid content-start gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
