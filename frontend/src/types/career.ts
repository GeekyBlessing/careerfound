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

export interface JobAnalysisResult {
  recognised: number;
  match_pct: number | null;
  verdict: "ready" | "strengthen" | "unclear";
  verdict_label: string;
  reasons: string[];
  strong_matches: { skill: string; requirement: "required" | "preferred"; mentions: number; evidence: string[] }[];
  in_progress: { skill: string; requirement: "required" | "preferred"; evidence: string[]; close_with: { kind: string; title: string; href: string } | null }[];
  gaps: { skill: string; requirement: "required" | "preferred"; close_with: { kind: string; title: string; href: string } | null; listed_by_you: boolean }[];
  listed_not_proven: string[];
  before_applying: { title: string; href: string; why: string }[];
  not_on_your_roadmap: string[];
  flags: { key: string; text: string }[];
  method: string;
}

export interface JobAnalysisSummary {
  id: string;
  title: string;
  company: string;
  source_url: string;
  match_pct: number | null;
  verdict: "ready" | "strengthen" | "unclear";
  verdict_label: string;
  analysed_at: string | null;
  created_at: string | null;
}

export interface JobAnalysis extends JobAnalysisSummary {
  description: string;
  result: JobAnalysisResult;
}

export interface CaseStudyFields {
  title: string;
  overview: string;
  problem: string;
  solution: string;
  architecture: string;
  challenges: string;
  results: string;
  technologies: string[];
  screenshots: string[];
}

export interface CaseStudyView {
  case_study: CaseStudyFields;
  github: string;
  live_demo: string;
  status: "none" | "draft" | "edited";
  generated_at: string | null;
  needs_input: string[];
  publishable: boolean;
  sources?: Record<string, string>;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  status: "earned" | "in_progress";
  year: number | null;
  credential_url: string;
  self_reported: true;
}

export interface MyProfile {
  exists: boolean;
  suggested_username?: string;
  username?: string;
  headline?: string;
  bio?: string;
  location?: string;
  github_url?: string;
  linkedin_url?: string;
  website_url?: string;
  is_public?: boolean;
  show_readiness?: boolean;
  show_skills?: boolean;
  show_certifications?: boolean;
  path?: string;
  published_projects: number;
}

export interface PublicPortfolio {
  username: string;
  name: string;
  headline: string;
  bio: string;
  location: string;
  links: { label: string; url: string }[];
  career: { slug: string; name: string } | null;
  projects: {
    id: string;
    title: string;
    summary: string;
    skills: string[];
    cv_bullet: string;
    github: string;
    live_demo: string;
    level: string | null;
    badge: { title: string; tier: "verified" | "evidence_checked" } | null;
    verified_by: string;
    verified_on: string | null;
    case_study: CaseStudyFields | null;
  }[];
  achievements: { label: string; value: number }[];
  skills: { with_evidence: { label: string; status: string }[]; self_reported: string[] } | null;
  certifications: { name: string; issuer: string; status: string; year: number | null; credential_url: string }[] | null;
  readiness: { score: number; band: string; signals: { label: string; pct: number }[] } | null;
  labels: { verified: string; checked: string; note: string };
}
