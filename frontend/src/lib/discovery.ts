import { CAREER_CATEGORIES } from "@/lib/career-categories";

/**
 * The onboarding assessment: seven chapters, each with its own job.
 *
 *  1 Interests     what draws your attention        (ranks careers)
 *  2 Strengths     what you already bring           (ranks careers)
 *  3 Working style how you solve problems and work  (ranks careers)
 *  4 Goals         what you want from a career      (notes on each result)
 *  5 Technology    which products appeal            (ranks careers)
 *  6 Direction     how settled your thinking is     (ranks careers)
 *  7 Starting point your time, device, learning     (notes on each result)
 *
 * The answer ids are the vocabulary backend/app/ai/assessment_signals.py
 * scores against, and buildAnswers() turns the state into the payload that
 * POST /assessment takes. Interests are never turned into claims about
 * ability: the older "enjoys_*" flags come only from strengths, preferred
 * ways of working things out and the people or systems answer.
 */

export interface Choice {
  id: string;
  label: string;
  hint?: string;
}

export const INTEREST_CHOICES: Choice[] = [
  { id: "puzzles", label: "Working out why something is broken", hint: "A page that will not load, a total that is wrong, an app that crashes on one phone." },
  { id: "interfaces", label: "Making something clear and pleasant to use", hint: "Rearranging a screen so people stop getting lost, choosing type and spacing." },
  { id: "visual", label: "Making things look striking", hint: "Posters, logos, colour and layout for a brand or social media." },
  { id: "data", label: "Spotting patterns in numbers", hint: "Why sales dipped in March, which customers leave, what a chart really shows." },
  { id: "apps", label: "Building something people use", hint: "A booking tool, a habit tracker, a game, a small shop." },
  { id: "security", label: "Protecting systems or testing how they break", hint: "Thinking like an attacker to find the weak lock before someone else does." },
  { id: "infrastructure", label: "Setting up what software runs on", hint: "The servers, networks and automatic releases that keep a product online." },
  { id: "ai", label: "Teaching software to recognise or predict things", hint: "Sorting photos, flagging fraud, answering questions in plain language." },
  { id: "writing", label: "Explaining complicated things simply", hint: "A guide, help article or walkthrough that a stranger can follow." },
  { id: "people", label: "Helping people get unstuck", hint: "Working out what someone actually needs and getting them to a fix." },
  { id: "automation", label: "Making repetitive work run itself", hint: "Connecting tools so a form fills a sheet, sends an email and updates a board." },
];

export const STRENGTH_CHOICES: Choice[] = [
  { id: "logic", label: "Thinking things through in order", hint: "Breaking a problem into steps, spotting where a plan does not add up." },
  { id: "creativity", label: "Coming up with ideas", hint: "Finding a different way to say, show or solve something." },
  { id: "communication", label: "Putting things clearly", hint: "Explaining, writing, presenting or calming a tense conversation." },
  { id: "detail", label: "Noticing small mistakes", hint: "Catching the typo, the wrong figure or the step someone skipped." },
  { id: "numbers", label: "Being at ease with figures", hint: "Budgets, percentages and spreadsheets. Advanced maths is not needed." },
  { id: "patience", label: "Sticking with something hard", hint: "Staying with a problem for hours without giving up on it." },
  { id: "organising", label: "Keeping people and work on track", hint: "Plans, deadlines, rotas and who is doing what." },
  { id: "teaching", label: "Helping others understand", hint: "Showing a friend or colleague how something works until it clicks." },
];

export const PROBLEM_STYLE_CHOICES: Choice[] = [
  { id: "trace", label: "Trace it step by step until I find the cause", hint: "Think of a fault finder following a wire." },
  { id: "sketch", label: "Sketch a few different ways to fix it", hint: "Try several ideas on paper before picking one." },
  { id: "ask", label: "Talk to the people affected to see what they need", hint: "The problem is often not the one first described." },
  { id: "map", label: "Map how the parts connect before touching anything", hint: "Know what depends on what, so a fix does not break something else." },
  { id: "measure", label: "Measure what is happening and read the numbers", hint: "Let the evidence say where the trouble is." },
];

export const PEOPLE_CHOICES: Choice[] = [
  { id: "people", label: "With people", hint: "Helping, explaining, coordinating, listening." },
  { id: "systems", label: "With systems and tools", hint: "Building, fixing, configuring, testing." },
  { id: "both", label: "A real mix of both", hint: "I would want to move between the two." },
];

export const WORKSTYLE_CHOICES: Choice[] = [
  { id: "independent", label: "On my own", hint: "Long, uninterrupted stretches." },
  { id: "collaborative", label: "With a team", hint: "Thinking out loud and building on each other." },
  { id: "mixed", label: "Depends on the task", hint: "Solo to work it out, together to decide." },
];

export const PACE_CHOICES: Choice[] = [
  { id: "steady", label: "Steady and predictable", hint: "Clear expectations and time to do things properly." },
  { id: "fast", label: "Fast and high stakes", hint: "Changing priorities, quick decisions, real pressure." },
];

export const GOAL_CHOICES: Choice[] = [
  { id: "job", label: "A job in tech", hint: "A first role, or a move into a better one." },
  { id: "freelance", label: "Freelance work", hint: "Finding my own clients and setting my own terms." },
  { id: "startup", label: "A company of my own", hint: "Building a product or a business." },
  { id: "remote", label: "Location-free work", hint: "Working from home, or from anywhere." },
  { id: "explore", label: "Finding out what is out there", hint: "I want to understand the options before I commit." },
];

export const TIMELINE_CHOICES: Choice[] = [
  { id: "3_months", label: "Within 3 months" },
  { id: "6_months", label: "Within 6 months" },
  { id: "12_months", label: "Within a year" },
  { id: "flexible", label: "No fixed date" },
];

export const REMOTE_CHOICES: Choice[] = [
  { id: "yes", label: "I need or strongly prefer remote work", hint: "We will flag careers where early roles are often on site." },
  { id: "no", label: "I am happy on site or remote", hint: "Location will not narrow the options." },
];

export const TECH_CHOICES: Choice[] = [
  { id: "web", label: "Websites and web apps", hint: "Online shops, dashboards, booking tools." },
  { id: "mobile", label: "Mobile apps", hint: "Banking, delivery and social apps on a phone." },
  { id: "cloud", label: "Cloud and infrastructure", hint: "The servers and networks that keep products running." },
  { id: "ai", label: "AI and machine learning", hint: "Software that learns from examples." },
  { id: "security", label: "Security", hint: "Defending systems and finding their weaknesses." },
  { id: "data", label: "Data and analytics", hint: "Reports, dashboards and the data behind them." },
  { id: "design", label: "Design tools", hint: "Interfaces, prototypes and brand work." },
  { id: "automation", label: "Automation and no-code", hint: "Connecting tools without writing much code." },
];

export const DIRECTION_CHOICES: Choice[] = [
  { id: "know", label: "I already know the area I want", hint: "Show me how to get there." },
  { id: "narrowed", label: "I have a few areas in mind", hint: "Help me choose between them." },
  { id: "open", label: "I do not know yet", hint: "That is fine. Start from how I like to work." },
];

export const PERSONA_CHOICES: Choice[] = [
  { id: "student", label: "A student", hint: "Studying now." },
  { id: "graduate", label: "A recent graduate", hint: "Finished studying, looking for a first role." },
  { id: "working", label: "Working full-time", hint: "Employed and learning around my job." },
  { id: "switcher", label: "Changing careers", hint: "Moving from another field." },
  { id: "entrepreneur", label: "Running or starting a business", hint: "Tech is for my own venture." },
  { id: "other", label: "Something else" },
];

export const KNOWLEDGE_CHOICES: Choice[] = [
  { id: "none", label: "None yet", hint: "The first phase of every roadmap starts from here." },
  { id: "some", label: "A little", hint: "Some tutorials, a short course or a few tools." },
  { id: "solid", label: "I have built something", hint: "A site, a script, a spreadsheet model or a small project." },
];

export const TIME_CHOICES: Choice[] = [
  { id: "30", label: "About 30 minutes a day", hint: "Around 3 hours a week." },
  { id: "60", label: "About 1 hour a day", hint: "Around 7 hours a week." },
  { id: "120", label: "About 2 hours a day", hint: "Around 14 hours a week." },
  { id: "240", label: "4 hours or more a day", hint: "28 hours a week or more." },
];

export const DEVICE_CHOICES: Choice[] = [
  { id: "laptop", label: "A laptop or desktop" },
  { id: "smartphone", label: "A smartphone" },
  { id: "both", label: "Both" },
];

export const LEARNING_CHOICES: Choice[] = [
  { id: "building", label: "By building something and fixing it as it breaks" },
  { id: "guided", label: "By following a clear path, one step after another" },
  { id: "reading", label: "By reading and understanding before I try" },
  { id: "people", label: "By talking it through with other people" },
];

export const UNSURE_CATEGORY = "unsure";

export const DIRECTION_CATEGORIES = CAREER_CATEGORIES.map((c) => ({ id: c.slug, label: c.name, blurb: c.blurb }));

export const CATEGORY_CHOICES: Choice[] = [
  ...CAREER_CATEGORIES.map((c) => ({ id: c.slug, label: c.name, hint: c.blurb })),
  { id: UNSURE_CATEGORY, label: "Not sure yet", hint: "Leave it to the rest of my answers." },
];

export interface JourneyState {
  interests: string[];
  strengths: string[];
  problemStyles: string[];
  peoplePreference?: string;
  workStyle?: string;
  pace?: string;
  goal?: string;
  timeline?: string;
  remote?: string;
  techInterests: string[];
  direction?: string;
  category?: string;
  persona?: string;
  knowledge?: string;
  minutes?: string;
  device?: string;
  learning?: string;
}

export type QuestionKey = keyof JourneyState;

export const EMPTY_JOURNEY: JourneyState = { interests: [], strengths: [], problemStyles: [], techInterests: [] };

export interface Question {
  key: QuestionKey;
  legend: string;
  help?: string;
  kind: "multi" | "single";
  /** Most answers a multi question takes. */
  max?: number;
  options: Choice[];
  /** Skipping an optional question never blocks Continue. */
  optional?: boolean;
  /** Questions that only apply after an earlier answer. */
  appliesTo?: (s: JourneyState) => boolean;
  /** Short options sit in a row instead of as full-width panels. */
  compact?: boolean;
}

export interface Chapter {
  id: string;
  name: string;
  /** What this chapter is for, in one line. Shown before you begin. */
  purpose: string;
  prompt: string;
  sub: string;
  questions: Question[];
}

export const MAX_PICKS = 4;
export const MAX_TECH_PICKS = 3;
export const MAX_STYLE_PICKS = 2;

export const CHAPTERS: Chapter[] = [
  {
    id: "interests",
    name: "Interests",
    purpose: "What draws your attention",
    prompt: "What would you gladly spend an evening on?",
    sub: "Interests tell us where to look. They do not say what you are good at, so choose what pulls you in rather than what sounds impressive.",
    questions: [
      { key: "interests", legend: "Choose up to 4", kind: "multi", max: MAX_PICKS, options: INTEREST_CHOICES },
    ],
  },
  {
    id: "strengths",
    name: "Strengths",
    purpose: "What you already bring",
    prompt: "What do people already come to you for?",
    sub: "Strengths from school, jobs, family or volunteering all count. None of these needs a technical background.",
    questions: [
      { key: "strengths", legend: "Choose up to 4", kind: "multi", max: MAX_PICKS, options: STRENGTH_CHOICES },
    ],
  },
  {
    id: "working-style",
    name: "Working style",
    purpose: "How you solve problems and work with others",
    prompt: "How do you like to work things out?",
    sub: "Four short questions about how you approach problems and people. Every style has careers that suit it.",
    questions: [
      {
        key: "problemStyles",
        legend: "When something is not working, which first moves feel most natural? Choose up to 2.",
        kind: "multi",
        max: MAX_STYLE_PICKS,
        options: PROBLEM_STYLE_CHOICES,
      },
      { key: "peoplePreference", legend: "A good working day is mostly spent...", kind: "single", options: PEOPLE_CHOICES, compact: true },
      { key: "workStyle", legend: "I do my best thinking...", kind: "single", options: WORKSTYLE_CHOICES, compact: true },
      { key: "pace", legend: "The pace I prefer is...", kind: "single", options: PACE_CHOICES, compact: true },
    ],
  },
  {
    id: "goals",
    name: "Goals",
    purpose: "What you want from a career",
    prompt: "What do you want a tech career to do for you?",
    sub: "These answers shape the notes on each result, such as timing and remote work. They do not change which careers rank first.",
    questions: [
      { key: "goal", legend: "The main thing I want is...", kind: "single", options: GOAL_CHOICES },
      { key: "timeline", legend: "I would like to be doing professional work in tech...", kind: "single", options: TIMELINE_CHOICES, compact: true },
      { key: "remote", legend: "Working remotely is...", kind: "single", options: REMOTE_CHOICES, compact: true },
    ],
  },
  {
    id: "technology",
    name: "Technology",
    purpose: "Which kinds of products appeal",
    prompt: "Which kinds of products would you like to work on?",
    sub: "You do not need to know much about these yet. Choose what sounds interesting, not what sounds impressive.",
    questions: [
      { key: "techInterests", legend: "Choose up to 3", kind: "multi", max: MAX_TECH_PICKS, options: TECH_CHOICES },
    ],
  },
  {
    id: "direction",
    name: "Direction",
    purpose: "How settled your thinking is",
    prompt: "How settled is your thinking about a career?",
    sub: "Any answer is fine. If you already lean toward an area, it gets extra weight. If not, we rely on everything else you told us.",
    questions: [
      { key: "direction", legend: "Right now...", kind: "single", options: DIRECTION_CHOICES },
      {
        key: "category",
        legend: "Which area is closest?",
        help: "Optional. This adds a small push toward the area you pick. It never hides careers from other areas.",
        kind: "single",
        options: CATEGORY_CHOICES,
        optional: true,
        appliesTo: (s) => s.direction === "know" || s.direction === "narrowed",
      },
    ],
  },
  {
    id: "starting-point",
    name: "Starting point",
    purpose: "Your time, device and way of learning",
    prompt: "Where are you starting from?",
    sub: "These shape how we suggest you begin. They do not change which careers rank first.",
    questions: [
      { key: "persona", legend: "Which describes you best right now?", kind: "single", options: PERSONA_CHOICES },
      { key: "knowledge", legend: "How much have you worked with technology so far?", kind: "single", options: KNOWLEDGE_CHOICES },
      {
        key: "minutes",
        legend: "How much time can you realistically give this?",
        help: "Choose what you can keep up in a normal week, not your best week.",
        kind: "single",
        options: TIME_CHOICES,
      },
      { key: "device", legend: "What will you mostly learn on?", kind: "single", options: DEVICE_CHOICES, compact: true },
      { key: "learning", legend: "How do you like to learn something new?", kind: "single", options: LEARNING_CHOICES },
    ],
  },
];

export function activeQuestions(chapter: Chapter, s: JourneyState): Question[] {
  return chapter.questions.filter((q) => !q.appliesTo || q.appliesTo(s));
}

export function valueOf(s: JourneyState, key: QuestionKey): string[] {
  const v = s[key];
  if (Array.isArray(v)) return v;
  return v === undefined ? [] : [v];
}

export function isAnswered(s: JourneyState, q: Question): boolean {
  return valueOf(s, q.key).length > 0;
}

/** Questions in this chapter that still need an answer before moving on. */
export function missingQuestions(chapter: Chapter, s: JourneyState): Question[] {
  return activeQuestions(chapter, s).filter((q) => !q.optional && !isAnswered(s, q));
}

export function requiredQuestions(s: JourneyState): Question[] {
  return CHAPTERS.flatMap((c) => activeQuestions(c, s)).filter((q) => !q.optional);
}

/** Overall progress: required questions answered out of required questions. */
export function progressOf(s: JourneyState): { answered: number; total: number; pct: number } {
  const required = requiredQuestions(s);
  const answered = required.filter((q) => isAnswered(s, q)).length;
  return { answered, total: required.length, pct: required.length ? Math.round((answered / required.length) * 100) : 0 };
}

export function chapterComplete(chapter: Chapter, s: JourneyState): boolean {
  return missingQuestions(chapter, s).length === 0;
}

/** The number shown on the opening screen: every question that is always asked. */
export const QUESTION_COUNT = CHAPTERS.flatMap((c) => c.questions).filter((q) => !q.optional && !q.appliesTo).length;

export function toggle(list: string[], id: string, max = MAX_PICKS): string[] {
  if (list.includes(id)) return list.filter((x) => x !== id);
  if (list.length >= max) return list;
  return [...list, id];
}

/** The journey's state as the answers payload POST /assessment expects. */
export function buildAnswers(s: JourneyState) {
  const has = (list: string[], ...ids: string[]) => ids.some((id) => list.includes(id));
  const category = s.direction === "open" || s.category === UNSURE_CATEGORY ? undefined : s.category;
  return {
    things_enjoyed: s.interests,
    existing_skills: s.strengths,
    tech_interests: s.techInterests,
    problem_styles: s.problemStyles,
    // The flags below stand for "this is how I like to work" or "this is a
    // strength I named". They are never inferred from topics of interest.
    enjoys_problem_solving: has(s.problemStyles, "trace") || has(s.strengths, "logic", "patience"),
    enjoys_math: has(s.problemStyles, "measure") || has(s.strengths, "numbers"),
    enjoys_creativity: has(s.problemStyles, "sketch") || has(s.strengths, "creativity"),
    enjoys_people:
      s.peoplePreference === "people" ||
      s.peoplePreference === "both" ||
      has(s.problemStyles, "ask") ||
      has(s.strengths, "communication", "teaching"),
    prefers_systems: s.peoplePreference === "systems" || s.peoplePreference === "both" || has(s.problemStyles, "map"),
    people_preference: s.peoplePreference,
    preferred_work_style: s.workStyle,
    risk_tolerant: s.pace === undefined ? undefined : s.pace === "fast",
    wants_remote: s.remote === undefined ? undefined : s.remote === "yes",
    goal: s.goal,
    career_timeline: s.timeline,
    career_direction: s.direction,
    preferred_category: category,
    persona: s.persona,
    device_access: s.device,
    time_budget_minutes_per_day: s.minutes === undefined ? undefined : Number(s.minutes),
    current_technical_knowledge: s.knowledge,
    learning_style: s.learning,
  };
}

/** Plain-English labels of what the person has told us so far. */
export function signalLabels(s: JourneyState): string[] {
  const pick = (choices: Choice[], ids: string[]) =>
    ids.map((id) => choices.find((c) => c.id === id)?.label).filter((l): l is string => !!l);
  return [
    ...pick(INTEREST_CHOICES, s.interests),
    ...pick(STRENGTH_CHOICES, s.strengths),
    ...pick(PROBLEM_STYLE_CHOICES, s.problemStyles),
    ...pick(TECH_CHOICES, s.techInterests),
  ];
}

// ---- saved progress -------------------------------------------------------

export const STORAGE_KEY = "careerfound.onboarding.v2";

export interface SavedProgress {
  step: number;
  journey: JourneyState;
  savedAt: number;
}

export function serializeProgress(step: number, journey: JourneyState, now = Date.now()): string {
  return JSON.stringify({ v: 2, step, journey, savedAt: now });
}

/**
 * Reads saved progress back, keeping only ids that still exist so an old save
 * can never put the page into a state it cannot render. Returns null for
 * anything unreadable, empty or from another version.
 */
export function parseProgress(raw: string | null): SavedProgress | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as { v?: number; step?: unknown; journey?: Record<string, unknown>; savedAt?: unknown };
    if (!data || data.v !== 2 || typeof data.journey !== "object" || data.journey === null) return null;
    const valid = new Map<QuestionKey, Set<string>>();
    for (const c of CHAPTERS) for (const q of c.questions) valid.set(q.key, new Set(q.options.map((o) => o.id)));
    const journey: JourneyState = { ...EMPTY_JOURNEY, interests: [], strengths: [], problemStyles: [], techInterests: [] };
    const target = journey as unknown as Record<string, unknown>;
    for (const [key, ids] of valid) {
      const v = data.journey[key];
      if (Array.isArray(journey[key])) {
        const q = CHAPTERS.flatMap((c) => c.questions).find((x) => x.key === key)!;
        target[key] = Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && ids.has(x)).slice(0, q.max ?? MAX_PICKS) : [];
      } else if (typeof v === "string" && ids.has(v)) {
        target[key] = v;
      }
    }
    const step = typeof data.step === "number" && data.step >= 0 && data.step <= CHAPTERS.length ? Math.floor(data.step) : 0;
    const any = progressOf(journey).answered > 0 || journey.category !== undefined;
    if (!any) return null;
    return { step, journey, savedAt: typeof data.savedAt === "number" ? data.savedAt : Date.now() };
  } catch {
    return null;
  }
}
