"use client";

import { useEffect, type RefObject } from "react";

/** Calls `handler` on pointer-down outside every given element. */
export function useClickOutside(
  refs: RefObject<HTMLElement | null>[],
  handler: (event: PointerEvent) => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;
    const listener = (event: PointerEvent) => {
      const target = event.target as Node;
      if (refs.some((ref) => ref.current?.contains(target))) return;
      handler(event);
    };
    document.addEventListener("pointerdown", listener);
    return () => {
      document.removeEventListener("pointerdown", listener);
    };
  }, [refs, handler, enabled]);
}
