import { cn } from "cn";
import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { controlStyles } from "./input";

export type NativeSelectOption = { value: string; label: string; disabled?: boolean };

type NativeSelectProps = ComponentProps<"select"> & {
  options: NativeSelectOption[];
  placeholder?: string;
};

/**
 * Styled native `<select>`. Prefer it on forms and mobile: zero JS, the OS
 * picker, and perfect accessibility. Use `Select` for rich custom options.
 */
export function NativeSelect({ className, options, placeholder, ...props }: NativeSelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(controlStyles, "h-10 cursor-pointer appearance-none pr-9", className)}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}
