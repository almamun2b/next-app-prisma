/** First focusable element: lets keyboard users bypass navigation (WCAG 2.4.1). */
export function SkipLink({ href = "#main" }: { href?: string }) {
  return (
    <a
      href={href}
      className="fixed top-3 left-3 z-[200] -translate-y-20 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-transform focus-visible:translate-y-0"
    >
      Skip to main content
    </a>
  );
}
