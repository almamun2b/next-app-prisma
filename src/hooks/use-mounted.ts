"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;

/** `true` only after hydration — for UI that must match the server first render. */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
