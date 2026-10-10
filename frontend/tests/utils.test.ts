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


describe("mentorPriceLabel", () => {
  const base = { hourly_rate_cents: 0, currency: "USD", is_founding_mentor: false, consultation_price_label: "", mentorship_price_label: "" };

  it("shows the program price for a regular mentor who has one, never Free", async () => {
    const { mentorPriceLabel } = await import("@/lib/utils");
    expect(mentorPriceLabel({ ...base, mentorship_price_label: "₦250,000 ($200)" })).toBe("₦250,000 ($200)");
  });

  it("keeps the founding mentor's From-price and the See pricing fallback", async () => {
    const { mentorPriceLabel } = await import("@/lib/utils");
    expect(mentorPriceLabel({ ...base, is_founding_mentor: true, consultation_price_label: "₦10,000 ($7)", mentorship_price_label: "x" })).toBe("From ₦10,000 ($7)");
    expect(mentorPriceLabel({ ...base, is_founding_mentor: true })).toBe("See pricing");
  });

  it("is Free only when there is no price of any kind", async () => {
    const { mentorPriceLabel } = await import("@/lib/utils");
    expect(mentorPriceLabel(base)).toBe("Free");
    expect(mentorPriceLabel({ ...base, hourly_rate_cents: 2500 })).toBe("$25.00/hr");
  });
});
