"use client";

import { cn } from "cn";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useId } from "react";
import { useMounted } from "@/hooks/use-mounted";

const THEMES = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "system", label: "System", Icon: Monitor },
  { value: "dark", label: "Dark", Icon: Moon },
] as const;

/** Segmented light / system / dark switch (native radios for a11y). */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const name = useId();
  const active = mounted ? (theme ?? "system") : undefined;

  return (
    <fieldset
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-border bg-muted p-0.5",
        className,
      )}
    >
      <legend className="sr-only">Color theme</legend>
      {THEMES.map(({ value, label, Icon }) => (
        <label
          key={value}
          title={label}
          className={cn(
            "relative inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors",
            "hover:text-foreground has-checked:bg-surface has-checked:text-foreground has-checked:shadow-sm",
            "has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-ring",
          )}
        >
          <input
            type="radio"
            name={name}
            value={value}
            checked={active === value}
            onChange={() => {
              setTheme(value);
            }}
            className="sr-only"
          />
          <Icon aria-hidden="true" className="size-4" />
          <span className="sr-only">{label}</span>
        </label>
      ))}
    </fieldset>
  );
}
