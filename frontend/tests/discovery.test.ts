import { describe, expect, it } from "vitest";
import { CAREER_CATEGORIES } from "@/lib/career-categories";
import {
  CATEGORY_CHOICES,
  CHAPTERS,
  DIRECTION_CATEGORIES,
  EMPTY_JOURNEY,
  INTEREST_CHOICES,
  MAX_PICKS,
  QUESTION_COUNT,
  STORAGE_KEY,
  UNSURE_CATEGORY,
  activeQuestions,
  buildAnswers,
  chapterComplete,
  missingQuestions,
  parseProgress,
  progressOf,
  requiredQuestions,
  serializeProgress,
  signalLabels,
  toggle,
  type JourneyState,
} from "@/lib/discovery";

const FULL: JourneyState = {
  interests: ["puzzles", "security"],
  strengths: ["logic", "detail"],
  problemStyles: ["trace"],
  peoplePreference: "systems",
  workStyle: "independent",
  pace: "steady",
  goal: "job",
  timeline: "6_months",
  remote: "yes",
  techInterests: ["security"],
  direction: "narrowed",
  category: "security",
  persona: "switcher",
  knowledge: "none",
  minutes: "60",
  device: "laptop",
  learning: "building",
};

describe("discovery journey", () => {
  it("toggle adds, removes and caps at the maximum", () => {
    let list: string[] = [];
    for (const c of INTEREST_CHOICES) list = toggle(list, c.id);
    expect(list).toHaveLength(MAX_PICKS);
    expect(toggle(list, list[0]!)).toHaveLength(MAX_PICKS - 1);
  });

  it("has seven chapters, each with a purpose and at least one question", () => {
    expect(CHAPTERS.map((c) => c.name)).toEqual([
      "Interests", "Strengths", "Working style", "Goals", "Technology", "Direction", "Starting point",
    ]);
    for (const c of CHAPTERS) {
      expect(c.purpose.length).toBeGreaterThan(10);
      expect(c.questions.length).toBeGreaterThan(0);
    }
  });

  it("the question count shown to people matches the questions actually required", () => {
    expect(requiredQuestions(FULL)).toHaveLength(QUESTION_COUNT);
    expect(QUESTION_COUNT).toBe(16);
  });

  it("every option has a unique id and a label per question", () => {
    for (const c of CHAPTERS) {
      for (const q of c.questions) {
        const ids = q.options.map((o) => o.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const o of q.options) expect(o.label.length).toBeGreaterThan(0);
      }
    }
  });

  it("does not infer ability from topics of interest", () => {
    const a = buildAnswers({ ...EMPTY_JOURNEY, interests: ["data", "ai", "puzzles", "interfaces", "writing"] });
    expect(a.enjoys_math).toBe(false);
    expect(a.enjoys_problem_solving).toBe(false);
    expect(a.enjoys_creativity).toBe(false);
    expect(a.things_enjoyed).toEqual(["data", "ai", "puzzles", "interfaces", "writing"]);
  });

  it("derives the working-style flags from strengths and preferred ways of working", () => {
    const a = buildAnswers({
      ...EMPTY_JOURNEY,
      strengths: ["communication", "numbers"],
      problemStyles: ["sketch", "map"],
      peoplePreference: "systems",
      pace: "fast",
      remote: "no",
      minutes: "120",
    });
    expect(a.enjoys_creativity).toBe(true);
    expect(a.enjoys_math).toBe(true);
    expect(a.enjoys_people).toBe(true);
    expect(a.prefers_systems).toBe(true);
    expect(a.risk_tolerant).toBe(true);
    expect(a.wants_remote).toBe(false);
    expect(a.time_budget_minutes_per_day).toBe(120);
  });

  it("drops the preferred category when direction is open or the person is unsure", () => {
    expect(buildAnswers({ ...EMPTY_JOURNEY, direction: "open", category: "security" }).preferred_category).toBeUndefined();
    expect(buildAnswers({ ...EMPTY_JOURNEY, direction: "know", category: UNSURE_CATEGORY }).preferred_category).toBeUndefined();
    expect(buildAnswers({ ...EMPTY_JOURNEY, direction: "know", category: "security" }).preferred_category).toBe("security");
  });

  it("category ids match the catalogue taxonomy", () => {
    expect(DIRECTION_CATEGORIES.map((c) => c.id)).toEqual(CAREER_CATEGORIES.map((c) => c.slug));
    expect(CATEGORY_CHOICES.slice(0, -1).map((c) => c.id)).toEqual(CAREER_CATEGORIES.map((c) => c.slug));
  });

  it("signalLabels returns readable labels", () => {
    expect(signalLabels({ ...EMPTY_JOURNEY, interests: ["puzzles"], strengths: ["logic"] })).toEqual([
      "Working out why something is broken",
      "Thinking things through in order",
    ]);
  });
});

describe("progress and validation", () => {
  it("counts only answered required questions", () => {
    expect(progressOf(EMPTY_JOURNEY)).toMatchObject({ answered: 0, total: 16, pct: 0 });
    expect(progressOf(FULL)).toMatchObject({ answered: 16, total: 16, pct: 100 });
    expect(progressOf({ ...FULL, interests: [], goal: undefined }).answered).toBe(14);
  });

  it("names the unanswered questions in a chapter", () => {
    const working = CHAPTERS[2]!;
    expect(missingQuestions(working, EMPTY_JOURNEY).map((q) => q.key)).toEqual(["problemStyles", "peoplePreference", "workStyle", "pace"]);
    expect(missingQuestions(working, { ...EMPTY_JOURNEY, problemStyles: ["trace"], pace: "fast" }).map((q) => q.key)).toEqual([
      "peoplePreference", "workStyle",
    ]);
    expect(chapterComplete(working, FULL)).toBe(true);
  });

  it("only asks about an area after you say you lean toward one, and never requires it", () => {
    const direction = CHAPTERS[5]!;
    expect(activeQuestions(direction, { ...EMPTY_JOURNEY, direction: "open" }).map((q) => q.key)).toEqual(["direction"]);
    expect(activeQuestions(direction, { ...EMPTY_JOURNEY, direction: "know" }).map((q) => q.key)).toEqual(["direction", "category"]);
    expect(chapterComplete(direction, { ...EMPTY_JOURNEY, direction: "know" })).toBe(true);
  });
});

describe("saved progress", () => {
  it("round-trips answers and the current step", () => {
    const saved = parseProgress(serializeProgress(4, FULL, 1000));
    expect(saved).not.toBeNull();
    expect(saved!.step).toBe(4);
    expect(saved!.journey).toEqual(FULL);
    expect(saved!.savedAt).toBe(1000);
  });

  it("ignores nothing-answered, broken, unversioned and foreign data", () => {
    expect(parseProgress(null)).toBeNull();
    expect(parseProgress("not json")).toBeNull();
    expect(parseProgress(JSON.stringify({ v: 1, step: 2, journey: FULL }))).toBeNull();
    expect(parseProgress(serializeProgress(1, EMPTY_JOURNEY))).toBeNull();
  });

  it("drops unknown ids and over-long lists so an old save cannot break the page", () => {
    const raw = JSON.stringify({
      v: 2,
      step: 99,
      savedAt: 5,
      journey: { interests: ["puzzles", "nope", "data", "ai", "apps", "writing"], pace: "warp", goal: "job", strengths: "logic" },
    });
    const saved = parseProgress(raw)!;
    expect(saved.journey.interests).toEqual(["puzzles", "data", "ai", "apps"]);
    expect(saved.journey.pace).toBeUndefined();
    expect(saved.journey.goal).toBe("job");
    expect(saved.journey.strengths).toEqual([]);
    expect(saved.step).toBe(0);
  });

  it("uses a versioned storage key that holds no account details", () => {
    expect(STORAGE_KEY).toMatch(/onboarding\.v2$/);
    expect(serializeProgress(1, FULL)).not.toMatch(/password|email/i);
  });
});
