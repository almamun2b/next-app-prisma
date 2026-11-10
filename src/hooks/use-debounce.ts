"use client";

import { useEffect, useRef, useState } from "react";

/** Returns `value` after it has stopped changing for `delay` ms. */
export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(value);
    }, delay);
    return () => {
      clearTimeout(id);
    };
  }, [value, delay]);
  return debounced;
}

/** Returns a debounced version of `callback` (latest callback always used). */
export function useDebouncedCallback<A extends unknown[]>(
  callback: (...args: A) => void,
  delay = 300,
) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latest = useRef(callback);
  useEffect(() => {
    latest.current = callback;
  }, [callback]);
  useEffect(
    () => () => {
      clearTimeout(timer.current);
    },
    [],
  );
  return (...args: A) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      latest.current(...args);
    }, delay);
  };
}
