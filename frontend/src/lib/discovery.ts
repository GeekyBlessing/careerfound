import { CAREER_CATEGORIES } from "@/lib/career-categories";

/**
 * "Discover Your Direction": the six chapters a new person walks through
 * before CareerFound recommends careers. The multi-choice ids here are the
 * vocabulary backend/app/ai/assessment_signals.py scores against (a backend
 * test checks the result changes with them), and buildAnswers() turns the
 * journey's state into the same payload POST /assessment has always taken,
 * so older fields (enjoys_problem_solving, prefers_systems, ...) are still
 * filled in rather than dropped.
 */

export interface Choice {
  id: string;
  label: string;
  hint?: string;
}

export const INTEREST_CHOICES: Choice[] = [
  { id: "puzzles", label: "Solving puzzles and debugging", hint: "Working out why something broke" },
  { id: "interfaces", label: "Designing how things look and feel", hint: "Layouts, type, interactions" },
  { id: "data", label: "Finding patterns in numbers", hint: "Charts, spreadsheets, trends" },
  { id: "apps", label: "Building things people use", hint: "Apps, tools, products" },
  { id: "security", label: "Protecting systems, or testing how they break", hint: "Defence and attack" },
  { id: "infrastructure", label: "Setting up the systems behind software", hint: "Servers, networks, pipelines" },
  { id: "ai", label: "Teaching machines to do useful things", hint: "Models, prediction, language" },
  { id: "writing", label: "Explaining complicated ideas clearly", hint: "Docs, guides, tutorials" },
  { id: "people", label: "Helping people and untangling their problems", hint: "Support, coordination" },
  { id: "automation", label: "Automating repetitive work", hint: "Make the boring part run itself" },
];

export const STRENGTH_CHOICES: Choice[] = [
  { id: "logic", label: "Logical thinking" },
  { id: "creativity", label: "Creativity" },
  { id: "communication", label: "Communication" },
  { id: "detail", label: "Attention to detail" },
  { id: "numbers", label: "Comfort with numbers" },
  { id: "patience", label: "Patience with hard problems" },
  { id: "organising", label: "Organising people and work" },
  { id: "teaching", label: "Explaining things to others" },
];

export const TECH_CHOICES: Choice[] = [
  { id: "web", label: "Websites and web apps" },
  { id: "mobile", label: "Mobile apps" },
  { id: "cloud", label: "Cloud and infrastructure" },
  { id: "ai", label: "AI and machine learning" },
  { id: "security", label: "Security" },
  { id: "data", label: "Data and analytics" },
  { id: "design", label: "Design tools" },
  { id: "automation", label: "Automation and no-code" },
];

export const GOAL_CHOICES: Choice[] = [
  { id: "job", label: "Get a job in tech", hint: "A first role, or a better one" },
  { id: "freelance", label: "Freelance", hint: "Clients and projects on my terms" },
  { id: "startup", label: "Build a startup", hint: "Make something of my own" },
  { id: "remote", label: "A remote career", hint: "Work from wherever I am" },
  { id: "explore", label: "Explore tech", hint: "Find out what is out there" },
];

export const TIMELINE_CHOICES: Choice[] = [
  { id: "3_months", label: "Within 3 months" },
  { id: "6_months", label: "Within 6 months" },
  { id: "12_months", label: "Within a year" },
  { id: "flexible", label: "No rush" },
];

export const DIRECTION_CHOICES: Choice[] = [
  { id: "know", label: "I know the field I want", hint: "Show me how to get there" },
  { id: "narrowed", label: "I have a few ideas", hint: "Help me choose between them" },
  { id: "open", label: "I have no idea yet", hint: "That is what this is for" },
];

export const PERSONA_CHOICES: Choice[] = [
  { id: "student", label: "Student" },
  { id: "graduate", label: "Graduate" },
  { id: "working", label: "Working full-time" },
  { id: "switcher", label: "Career switcher" },
  { id: "entrepreneur", label: "Entrepreneur" },
  { id: "other", label: "Something else" },
];

export const DEVICE_CHOICES: Choice[] = [
  { id: "laptop", label: "Laptop" },
  { id: "smartphone", label: "Smartphone" },
  { id: "both", label: "Both" },
];

export const TIME_CHOICES: { value: number; label: string }[] = [
  { value: 30, label: "30 minutes a day" },
  { value: 60, label: "1 hour a day" },
  { value: 120, label: "2 hours a day" },
  { value: 240, label: "4+ hours a day" },
];

export const KNOWLEDGE_CHOICES: Choice[] = [
  { id: "none", label: "Starting from zero" },
  { id: "some", label: "I have dabbled" },
  { id: "solid", label: "I have built a few things" },
];

export const DIRECTION_CATEGORIES = CAREER_CATEGORIES.map((c) => ({ id: c.slug, label: c.name, blurb: c.blurb }));

export type PeoplePreference = "people" | "systems" | "both";
export type WorkStyle = "independent" | "collaborative" | "mixed";
export type Pace = "steady" | "fast";

export interface JourneyState {
  interests: string[];
  strengths: string[];
  peoplePreference?: PeoplePreference;
  workStyle?: WorkStyle;
  pace?: Pace;
  wantsRemote?: boolean;
  goal?: string;
  timeline?: string;
  techInterests: string[];
  direction?: string;
  category?: string;
  persona?: string;
  device?: string;
  minutesPerDay?: number;
  knowledge?: string;
}

export const EMPTY_JOURNEY: JourneyState = { interests: [], strengths: [], techInterests: [] };

export const MAX_PICKS = 5;

export function toggle(list: string[], id: string, max = MAX_PICKS): string[] {
  if (list.includes(id)) return list.filter((x) => x !== id);
  if (list.length >= max) return list;
  return [...list, id];
}

/** The journey's state as the answers payload POST /assessment expects. */
export function buildAnswers(s: JourneyState) {
  const has = (list: string[], ...ids: string[]) => ids.some((id) => list.includes(id));
  return {
    things_enjoyed: s.interests,
    existing_skills: s.strengths,
    tech_interests: s.techInterests,
    enjoys_problem_solving:
      has(s.interests, "puzzles", "security", "infrastructure", "automation") || has(s.strengths, "logic", "patience"),
    enjoys_math: has(s.interests, "data", "ai") || has(s.strengths, "numbers"),
    enjoys_creativity: has(s.interests, "interfaces", "writing") || has(s.strengths, "creativity"),
    enjoys_people:
      s.peoplePreference === "people" ||
      s.peoplePreference === "both" ||
      has(s.interests, "people") ||
      has(s.strengths, "communication", "teaching"),
    prefers_systems: s.peoplePreference === "systems" || s.peoplePreference === "both",
    preferred_work_style: s.workStyle,
    risk_tolerant: s.pace === undefined ? undefined : s.pace === "fast",
    wants_remote: s.wantsRemote,
    goal: s.goal,
    career_timeline: s.timeline,
    career_direction: s.direction,
    preferred_category: s.direction === "open" ? undefined : s.category,
    persona: s.persona,
    device_access: s.device,
    time_budget_minutes_per_day: s.minutesPerDay,
    current_technical_knowledge: s.knowledge,
  };
}

/** Plain-English labels of what the person has told us so far. */
export function signalLabels(s: JourneyState): string[] {
  const pick = (choices: Choice[], ids: string[]) =>
    ids.map((id) => choices.find((c) => c.id === id)?.label).filter((l): l is string => !!l);
  return [
    ...pick(INTEREST_CHOICES, s.interests),
    ...pick(STRENGTH_CHOICES, s.strengths),
    ...pick(TECH_CHOICES, s.techInterests),
  ];
}
