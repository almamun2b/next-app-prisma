"use client";

import { cn } from "cn";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useId, useMemo, useRef, type ReactNode } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useControllableState } from "@/hooks/use-controllable-state";
import { useListbox } from "@/hooks/use-listbox";
import { controlStyles } from "./input";

export type SelectOption = {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
};

type SelectProps = {
  options: SelectOption[];
  value?: string | undefined;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  /** Renders a hidden input so the value is submitted with native forms. */
  name?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean | undefined;
  "aria-describedby"?: string | undefined;
};

/**
 * Custom select (WAI-ARIA select-only combobox): rich options with icons and
 * descriptions, full keyboard support (arrows, Home/End, typeahead, Esc).
 */
export function Select({
  options,
  value,
  defaultValue = "",
  onValueChange,
  placeholder = "Select…",
  name,
  disabled,
  className,
  id,
  ...aria
}: SelectProps) {
  const generatedId = useId();
  const buttonId = id ?? `${generatedId}-button`;
  const listId = `${generatedId}-listbox`;
  const optionId = (index: number) => `${generatedId}-option-${index}`;

  const [selected, setSelected] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const listbox = useListbox({ items: options, selectedValue: selected, onSelect: setSelected });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const refs = useMemo(() => [buttonRef, listRef], []);

  useClickOutside(refs, listbox.close, listbox.isOpen);

  useEffect(() => {
    if (!listbox.isOpen) return;
    document.getElementById(optionId(listbox.activeIndex))?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- optionId is stable per render
  }, [listbox.isOpen, listbox.activeIndex]);

  const current = options.find((o) => o.value === selected);

  return (
    <div className={cn("relative", className)}>
      {name ? <input type="hidden" name={name} value={selected} /> : null}
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={listbox.isOpen}
        aria-controls={listId}
        aria-activedescendant={listbox.isOpen ? optionId(listbox.activeIndex) : undefined}
        disabled={disabled}
        onClick={() => {
          if (listbox.isOpen) listbox.close();
          else listbox.open();
        }}
        onKeyDown={listbox.onKeyDown}
        className={cn(
          controlStyles,
          "flex h-10 cursor-pointer items-center justify-between gap-2 text-left",
        )}
        {...aria}
      >
        <span
          className={cn(
            "flex min-w-0 items-center gap-2 truncate",
            !current && "text-muted-foreground",
          )}
        >
          {current?.icon}
          {current?.label ?? placeholder}
        </span>
        <ChevronsUpDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      </button>

      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-labelledby={buttonId}
        tabIndex={-1}
        hidden={!listbox.isOpen}
        className="absolute z-50 mt-1.5 max-h-64 w-full min-w-40 animate-slide-up overflow-auto rounded-lg border border-border bg-surface p-1 shadow-lg"
      >
        {options.map((option, index) => {
          const isSelected = option.value === selected;
          return (
            <li
              key={option.value}
              id={optionId(index)}
              role="option"
              aria-selected={isSelected}
              aria-disabled={option.disabled ? true : undefined}
              data-active={index === listbox.activeIndex || undefined}
              onPointerMove={() => {
                if (!option.disabled) listbox.setActiveIndex(index);
              }}
              onClick={() => {
                listbox.commit(index);
                buttonRef.current?.focus();
              }}
              className={cn(
                "flex cursor-pointer items-start gap-2 rounded-md px-2.5 py-2 text-sm",
                "data-active:bg-accent data-active:text-accent-foreground",
                "aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
              )}
            >
              <span className="mt-0.5 flex size-4 shrink-0 items-center">
                {isSelected ? (
                  <Check aria-hidden="true" className="size-4 text-primary" />
                ) : (
                  option.icon
                )}
              </span>
              <span className="grid gap-0.5">
                <span className="font-medium">{option.label}</span>
                {option.description ? (
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
