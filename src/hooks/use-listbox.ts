"use client";

import { useRef, useState, type KeyboardEvent } from "react";

type Item = { value: string; label: string; disabled?: boolean | undefined };

type Options<T extends Item> = {
  items: T[];
  selectedValue: string | undefined;
  onSelect: (value: string) => void;
};

/**
 * Keyboard + typeahead state machine for a select-only combobox
 * (WAI-ARIA APG "Select-Only Combobox"). Rendering is left to the caller.
 */
export function useListbox<T extends Item>({ items, selectedValue, onSelect }: Options<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const typeahead = useRef({
    query: "",
    timer: undefined as ReturnType<typeof setTimeout> | undefined,
  });

  const enabled = (i: number) => items[i] !== undefined && !items[i].disabled;
  const selectedIndex = items.findIndex((item) => item.value === selectedValue);

  function move(from: number, step: 1 | -1) {
    for (let i = from + step; i >= 0 && i < items.length; i += step) if (enabled(i)) return i;
    return from;
  }
  const first = () => move(-1, 1);
  const last = () => move(items.length, -1);

  function open(index = selectedIndex >= 0 ? selectedIndex : first()) {
    setIsOpen(true);
    setActiveIndex(index);
  }
  function close() {
    setIsOpen(false);
  }
  function commit(index: number) {
    const item = items[index];
    if (item && !item.disabled) onSelect(item.value);
    close();
  }

  function findByTypeahead(char: string) {
    const state = typeahead.current;
    clearTimeout(state.timer);
    state.query += char.toLowerCase();
    state.timer = setTimeout(() => {
      state.query = "";
    }, 500);
    const start = isOpen ? activeIndex : selectedIndex;
    const ordered = [...items.keys()].map((_, i) => (start + 1 + i) % items.length);
    return ordered.find((i) => enabled(i) && items[i]?.label.toLowerCase().startsWith(state.query));
  }

  function onKeyDown(event: KeyboardEvent) {
    const { key } = event;
    const handled = (fn: () => void) => {
      event.preventDefault();
      fn();
    };

    if (!isOpen) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(key)) {
        handled(() => {
          open(key === "ArrowUp" && selectedIndex < 0 ? last() : undefined);
        });
      } else if (key === "Home" || key === "End") {
        handled(() => {
          open(key === "Home" ? first() : last());
        });
      } else if (key.length === 1) {
        const match = findByTypeahead(key);
        if (match !== undefined) commit(match);
      }
      return;
    }

    switch (key) {
      case "ArrowDown":
        handled(() => {
          setActiveIndex((i) => move(i, 1));
        });
        break;
      case "ArrowUp":
        handled(() => {
          setActiveIndex((i) => move(i, -1));
        });
        break;
      case "Home":
      case "PageUp":
        handled(() => {
          setActiveIndex(first());
        });
        break;
      case "End":
      case "PageDown":
        handled(() => {
          setActiveIndex(last());
        });
        break;
      case "Enter":
      case " ":
        handled(() => {
          commit(activeIndex);
        });
        break;
      case "Escape":
        handled(close);
        break;
      case "Tab":
        commit(activeIndex);
        break;
      default:
        if (key.length === 1) {
          const match = findByTypeahead(key);
          if (match !== undefined) setActiveIndex(match);
        }
    }
  }

  return { isOpen, activeIndex, setActiveIndex, open, close, commit, onKeyDown };
}
