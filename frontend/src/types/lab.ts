export type LabLevel = "beginner" | "intermediate" | "advanced" | "job_ready";
export type LabStageKey = "started" | "in_progress" | "completed" | "published" | "portfolio_ready" | "interview_ready";

export interface LabFlags {
  started: boolean;
  in_progress: boolean;
  completed: boolean;
  published: boolean;
  portfolio_ready: boolean;
  interview_ready: boolean;
}

export type VerificationTier = "none" | "evidence_checked" | "in_review" | "changes_requested" | "verified";

export interface VerificationBadge {
  title: string;
  tier: "verified" | "evidence_checked";
}

export interface LabVerification {
  tier: VerificationTier;
  badge: VerificationBadge | null;
  copy: string;
  stale: boolean;
  can_submit: boolean;
  submit_blockers: string[];
  review_status: string;
  submitted_at: string | null;
  reviewer_name: string;
  reviewed_at: string | null;
  review_note: string;
  repo_url: string;
  automated_checks: { public: boolean; readme: boolean; commits: boolean; no_env_committed: boolean; gitignore: boolean; tests: boolean; license: boolean };
}

export interface LabProjectSummary {
  id: string;
  slug: string;
  title: string;
  level: LabLevel;
  level_label: string;
  difficulty: number;
  est_hours: number;
  kind: "code" | "case_study";
  summary: string;
  skills: string[];
  deliverable: string;
  stage: LabStageKey | null;
  stage_label: string;
  flags: LabFlags;
  milestones_done: number;
  milestones_total: number;
  recommended_before: string[];
  ready: boolean;
  verification?: { tier: VerificationTier; badge: VerificationBadge | null };
}

export interface LabCurriculum {
  career: { slug: string; name: string };
  available: boolean;
  levels: { level: LabLevel; label: string; blurb: string; projects: LabProjectSummary[] }[];
  totals: { projects?: number; completed?: number; published?: number; portfolio_ready?: number; interview_ready?: number; hours?: number };
  next_project_id: string | null;
  evidence_note?: string;
}

export interface LabOverview {
  available: boolean;
  career?: { slug: string; name: string };
  totals?: LabCurriculum["totals"];
  current?: LabProjectSummary | null;
  next?: LabProjectSummary | null;
  completed?: LabProjectSummary[];
  projects?: LabProjectSummary[];
  evidence_note?: string;
}

export interface LabMilestone {
  key: string;
  stage: "build" | "test" | "document";
  title: string;
  detail: string;
  done: boolean;
}

export interface LabJourneyStep {
  key: string;
  title: string;
  stage: string;
  done: boolean;
  manual: boolean;
}

export interface LabCommand {
  cmd: string;
  explain: string;
}

export interface LabPublishStep {
  key: string;
  title: string;
  why: string;
  commands: LabCommand[];
  note?: string;
}

export interface LabCheckItem {
  key: string;
  label: string;
  checked: boolean;
  verified: boolean | null;
}

export interface LabRepoCheck {
  url?: string;
  checked_at?: string;
  reachable?: boolean;
  public?: boolean;
  readme?: boolean;
  gitignore?: boolean;
  env_committed?: boolean;
  commit_count?: number;
  error?: string;
  passed?: boolean;
  checks?: { public: boolean; readme: boolean; commits: boolean; gitignore: boolean; no_env_committed: boolean };
}

export interface LabInterviewQuestion {
  key: string;
  q: string;
  covers: string;
  answer: string;
}

export interface LabLink {
  id: string;
  slug: string;
  title: string;
  level: LabLevel;
  stage: LabStageKey | null;
  stage_label: string;
  completed: boolean;
}

export interface LabProjectDetail {
  id: string;
  slug: string;
  title: string;
  level: LabLevel;
  level_label: string;
  difficulty: number;
  est_hours: number;
  kind: "code" | "case_study";
  career: { slug: string; name: string };
  summary: string;
  overview: { build: string; problem: string; why: string };
  skills: string[];
  tools: { name: string; reason: string }[];
  deliverable: string;
  requirements: string[];
  milestones: LabMilestone[];
  journey: LabJourneyStep[];
  documentation: { key: string; title: string; detail: string }[];
  security_notes: string[];
  hints: string[];
  common_mistakes: string[];
  cv_bullet: string;
  criteria: { key: string; text: string; checked: boolean }[];
  interview: {
    technical: LabInterviewQuestion[];
    universal: LabInterviewQuestion[];
    min_chars: number;
    min_universal: number;
    technical_answered: number;
    technical_total: number;
    universal_answered: number;
    universal_required: number;
    ready: boolean;
  };
  github: {
    steps: LabPublishStep[];
    checklist: LabCheckItem[];
    security_checklist: LabCheckItem[];
    security_guidance: string;
    repo_url: string;
    repo_check: LabRepoCheck;
    repo_ok: boolean;
  };
  readme: { sections: { key: string; title: string; guidance: string; prefill: string }[] };
  stage: LabStageKey | null;
  stage_label: string;
  flags: LabFlags;
  verification: LabVerification;
  lifecycle: { key: string; label: string; reached: boolean }[];
  stages: { key: LabStageKey; label: string; description: string; reached: boolean }[];
  milestones_done: number;
  milestones_total: number;
  completion: { can_complete: boolean; missing: string[]; completed: boolean };
  credited_by_history: boolean;
  started: boolean;
  portfolio: { item_id: string | null; is_published: boolean };
  recommended_before: LabLink[];
  ready_for: LabLink[];
  evidence_note: string;
}

export interface LabCareerOption {
  slug: string;
  name: string;
  projects: number;
}
