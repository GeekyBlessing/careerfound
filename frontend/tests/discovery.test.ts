import { describe, expect, it } from "vitest";
import { CAREER_CATEGORIES } from "@/lib/career-categories";
import {
  DIRECTION_CATEGORIES,
  EMPTY_JOURNEY,
  INTEREST_CHOICES,
  MAX_PICKS,
  buildAnswers,
  signalLabels,
  toggle,
} from "@/lib/discovery";

describe("discovery journey", () => {
  it("toggle adds, removes and caps at the maximum", () => {
    let list: string[] = [];
    for (const c of INTEREST_CHOICES) list = toggle(list, c.id);
    expect(list).toHaveLength(MAX_PICKS);
    expect(toggle(list, list[0]!)).toHaveLength(MAX_PICKS - 1);
  });

  it("derives the older trait flags from the new answers", () => {
    const a = buildAnswers({
      ...EMPTY_JOURNEY,
      interests: ["interfaces", "data"],
      strengths: ["communication"],
      peoplePreference: "systems",
      pace: "fast",
    });
    expect(a.enjoys_creativity).toBe(true);
    expect(a.enjoys_math).toBe(true);
    expect(a.enjoys_people).toBe(true);
    expect(a.prefers_systems).toBe(true);
    expect(a.risk_tolerant).toBe(true);
    expect(a.things_enjoyed).toEqual(["interfaces", "data"]);
  });

  it("drops the preferred category when direction is open", () => {
    const open = buildAnswers({ ...EMPTY_JOURNEY, direction: "open", category: "security" });
    expect(open.preferred_category).toBeUndefined();
    const known = buildAnswers({ ...EMPTY_JOURNEY, direction: "know", category: "security" });
    expect(known.preferred_category).toBe("security");
  });

  it("category ids match the catalogue taxonomy", () => {
    expect(DIRECTION_CATEGORIES.map((c) => c.id)).toEqual(CAREER_CATEGORIES.map((c) => c.slug));
  });

  it("signalLabels returns readable labels", () => {
    expect(signalLabels({ ...EMPTY_JOURNEY, interests: ["puzzles"], strengths: ["logic"] })).toEqual([
      "Solving puzzles and debugging",
      "Logical thinking",
    ]);
  });
});
