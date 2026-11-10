"use client";

import { cn } from "cn";
import type { ComponentProps } from "react";
import { useControllableState } from "@/hooks/use-controllable-state";

type SwitchProps = Omit<ComponentProps<"button">, "onChange" | "value" | "defaultValue"> & {
  checked?: boolean | undefined;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: "sm" | "md";
};

/** WAI-ARIA switch (`role="switch"`), controlled or uncontrolled. */
export function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  size = "md",
  className,
  disabled,
  onClick,
  ...props
}: SwitchProps) {
  const [isOn, setIsOn] = useControllableState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      data-state={isOn ? "checked" : "unchecked"}
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setIsOn(!isOn);
      }}
      className={cn(
        "peer group inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
        "transition-colors duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "bg-input data-[state=checked]:bg-primary hover:data-[state=unchecked]:bg-muted-foreground/50",
        size === "sm" ? "h-5 w-9" : "h-6 w-11",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none block rounded-full bg-surface shadow-sm ring-0 transition-transform duration-200 ease-out",
          size === "sm"
            ? "size-4 group-data-[state=checked]:translate-x-4"
            : "size-5 group-data-[state=checked]:translate-x-5",
        )}
      />
    </button>
  );
}
