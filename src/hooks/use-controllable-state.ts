"use client";

import { useCallback, useState } from "react";

type Options<T> = {
  value?: T | undefined;
  defaultValue: T;
  onChange?: ((value: T) => void) | undefined;
};

/**
 * Supports both controlled (`value` + `onChange`) and uncontrolled
 * (`defaultValue`) usage with a single API — the pattern every input uses.
 */
export function useControllableState<T>({ value, defaultValue, onChange }: Options<T>) {
  const [internal, setInternal] = useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [current, setValue] as const;
}
