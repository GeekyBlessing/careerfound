export interface CareerAction {
  title: string;
  reason: string;
  href: string;
  cta: string;
}

export interface ReadinessSignal {
  key: "learning" | "skills" | "projects" | "documentation" | "proof" | "portfolio" | "interview";
  label: string;
  available: boolean;
  weight: number;
  pct: number | null;
  points: number;
  potential: number;
  detail: string;
  action: CareerAction | null;
}

export interface CareerReadiness {
  has_path: boolean;
  has_activity: boolean;
  has_lab: boolean;
  score: number;
  band: string;
  career: { slug: string; name: string } | null;
  signals: ReadinessSignal[];
  why: string;
  biggest_opportunity: { signal: string; label: string; gain: number; text: string; action: CareerAction } | null;
  next_action: CareerAction;
  not_counted: string;
  formula?: string;
}

export type SkillStatus = "strong" | "developing" | "missing";

export interface SkillNextStep {
  title: string;
  href: string;
  cta: string;
  kind: "lesson" | "project";
}

export interface SkillGapSkill {
  key: string;
  label: string;
  category: "foundation" | "core" | "advanced" | string;
  status: SkillStatus;
  status_label: string;
  pct: number;
  done: number;
  total: number;
  lessons: { id: string; title: string; minutes: number; done: boolean; href: string }[];
  projects: { id: string; title: string; state: "not_started" | "started" | "completed"; level: string | null; lab: boolean; href: string }[];
  employer_expects: string[];
  interview_questions: string[];
  listed_by_you: string | null;
  next_step: SkillNextStep | null;
}

export interface ListedSkill {
  id: string;
  name: string;
  level: "learning" | "comfortable" | "strong";
  self_reported: true;
}

export interface SkillGap {
  has_path: boolean;
  career?: { slug: string; name: string };
  skills?: SkillGapSkill[];
  counts?: Record<SkillStatus, number>;
  total?: number;
  focus?: { key: string; label: string; status: SkillStatus; next_step: SkillNextStep }[];
  uncovered_expectations?: string[];
  other_interview_questions?: string[];
  certifications?: string[];
  resources?: { label: string; note: string }[];
  listed_skills?: ListedSkill[];
  how_it_works?: string;
}
