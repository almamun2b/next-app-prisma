import { describe, expect, it, vi } from "vitest";
import { getPageWindow } from "@/components/ui/pagination";
import { getInitials } from "@/components/ui/avatar";
import { formatRelative } from "./format";
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("blocks after the limit and resets after the window", () => {
    vi.useFakeTimers();
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(limiter.hit("k").allowed).toBe(true);
    expect(limiter.hit("k").allowed).toBe(true);
    expect(limiter.hit("k").allowed).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(limiter.hit("k").allowed).toBe(true);
    vi.useRealTimers();
  });
});

describe("getPageWindow", () => {
  it("shows all pages when few", () => {
    expect(getPageWindow(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });
  it("collapses distant pages into gaps", () => {
    expect(getPageWindow(10, 20)).toEqual([1, null, 9, 10, 11, null, 20]);
    expect(getPageWindow(1, 20)).toEqual([1, 2, null, 20]);
  });
});

describe("formatters", () => {
  it("formats relative times", () => {
    const now = new Date("2026-01-10T12:00:00Z");
    expect(formatRelative(new Date("2026-01-08T12:00:00Z"), now)).toBe("2 days ago");
    expect(formatRelative(now, now)).toBe("just now");
  });
  it("derives initials", () => {
    expect(getInitials("Ada Lovelace")).toBe("AL");
    expect(getInitials("Cher")).toBe("C");
    expect(getInitials("  ")).toBe("?");
  });
});
