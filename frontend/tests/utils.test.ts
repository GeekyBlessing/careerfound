import { describe, expect, it } from "vitest";
import { cn, formatMinutes, initials, formatCents } from "@/lib/utils";

describe("formatMinutes", () => {
  it("formats sub-hour durations as minutes", () => {
    expect(formatMinutes(45)).toBe("45 min");
  });

  it("formats exact hours without a minutes suffix", () => {
    expect(formatMinutes(120)).toBe("2h");
  });

  it("formats mixed hours and minutes", () => {
    expect(formatMinutes(95)).toBe("1h 35m");
  });
});

describe("initials", () => {
  it("returns the first letter of up to two words", () => {
    expect(initials("Amara Chukwu")).toBe("AC");
  });

  it("handles a single name", () => {
    expect(initials("Amara")).toBe("A");
  });

  it("ignores extra whitespace", () => {
    expect(initials("  Amara   Chukwu  ")).toBe("AC");
  });
});

describe("formatCents", () => {
  it("formats whole-dollar amounts", () => {
    expect(formatCents(5000)).toBe("$50.00");
  });

  it("respects a provided currency", () => {
    expect(formatCents(1999, "USD")).toBe("$19.99");
  });
});

describe("cn", () => {
  it("merges class names and resolves Tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("drops falsy values", () => {
    expect(cn("text-sm", false && "hidden", undefined, "font-medium")).toBe("text-sm font-medium");
  });
});
