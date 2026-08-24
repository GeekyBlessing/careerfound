export interface User {
  id: string;
  email: string;
  full_name: string;
  country: string | null;
  timezone: string | null;
  persona: string | null;
  goal: string | null;
  device_access: string | null;
  time_budget_minutes_per_day: number | null;
  beginner_mode: boolean;
  plan: "free" | "pro";
  role: "user" | "mentor" | "admin";
  email_verified: boolean;
  marketing_opt_in: boolean;
}

export interface CareerPath {
  id: string;
  slug: string;
  name: string;
  summary: string;
  beginner_summary: string;
  difficulty: number;
  avg_timeline_weeks: number;
  entry_roles: string[];
  tools: string[];
  remote_potential: number;
  earning_notes: string;
  icon: string;
}

export interface SkillTransfer {
  skill: string;
  why_it_transfers: string;
}

export interface CareerRecommendation {
  path_slug: string;
  tier: "best_match" | "strong_alternative" | "wild_card";
  fit_score: number;
  why_it_fits: string;
  transferable_skills: SkillTransfer[];
  skills_to_develop: string[];
  difficulty_label: string;
  timeline_label: string;
  entry_roles: string[];
  example_projects: string[];
  tools: string[];
  earning_notes: string;
  remote_potential_label: string;
  recommended_next_step: string;
}

export interface CareerDNA {
  problem_solving: number;
  mathematics: number;
  creativity: number;
  people_orientation: number;
  systems_thinking: number;
  communication: number;
  summary: string;
}

export interface AssessmentResult {
  id: string;
  created_at: string;
  career_dna: CareerDNA;
  recommendations: CareerRecommendation[];
}

export interface LessonItem {
  id: string;
  order_index: number;
  title: string;
  concept_summary: string;
  beginner_explainer: string;
  content_md: string;
  est_minutes: number;
  status: "not_started" | "in_progress" | "completed";
}

export interface ProjectItem {
  id: string;
  order_index: number;
  title: string;
  teaches: string;
  prerequisites: string[];
  expected_output: string;
  steps: string[];
  hints: string[];
  common_mistakes: string[];
  difficulty: number;
  difficulty_label: "Beginner" | "Intermediate" | "Expert";
  estimated_duration: string;
  status: "not_started" | "in_progress" | "completed";
}

export interface CareerProjectItem extends ProjectItem {
  phase_title: string;
}

export interface RoleProjectCatalogEntry {
  path: CareerPath;
  projects: CareerProjectItem[];
}

export interface QuizItem {
  id: string;
  title: string;
  passing_score: number;
  questions: { id: string; prompt: string; options: string[]; correct_option?: string }[];
  status: "not_started" | "in_progress" | "completed";
}

export interface PhaseItem {
  id: string;
  order_index: number;
  title: string;
  summary: string;
  lessons: LessonItem[];
  projects: ProjectItem[];
  quizzes: QuizItem[];
  progress_pct: number;
}

export interface Roadmap {
  id: string;
  path_slug: string;
  path_name: string;
  status: string;
  phases: PhaseItem[];
}

export interface RoadmapCustomItem {
  id: string;
  title: string;
  description: string;
  item_type: "skill" | "project" | "follow_up";
  status: "pending" | "done";
  order_index: number;
}

export interface MissionTask {
  type: "learn" | "practice" | "challenge" | "reflection";
  title: string;
  est_minutes: number;
  done: boolean;
  ref_id: string | null;
}

export interface TodayMission {
  date: string;
  total_minutes: number;
  tasks: MissionTask[];
  rationale: string;
}

export interface ReadinessScore {
  overall: number;
  knowledge_pct: number;
  projects_pct: number;
  portfolio_pct: number;
  interview_pct: number;
  practical_pct: number;
  next_actions: string[];
}

export interface Dashboard {
  greeting: string;
  has_active_roadmap: boolean;
  path_name: string | null;
  path_slug: string | null;
  today_mission: TodayMission | null;
  readiness: ReadinessScore | null;
  current_streak_days: number;
  current_project_title: string | null;
  upcoming_milestone: string | null;
  recommended_next_action: string;
}

export interface SkillGraphNode {
  id: string;
  key: string;
  label: string;
  category: string;
  mastery_pct: number;
}

export interface SkillGraphEdge {
  from_id: string;
  to_id: string;
}

export interface SkillGraph {
  nodes: SkillGraphNode[];
  edges: SkillGraphEdge[];
}

export interface MentorChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface MentorChatResponse {
  conversation_id: string;
  reply: string;
  follow_up_questions: string[];
  history: MentorChatMessage[];
}

export interface PortfolioItem {
  id: string;
  project_id: string;
  title: string;
  project_description: string;
  readme_draft: string;
  cv_bullet: string;
  linkedin_blurb: string;
  case_study_md: string;
  skills_demonstrated: string[];
  is_published: boolean;
}

export interface Mentor {
  id: string;
  display_name: string;
  headline: string;
  bio: string;
  avatar_seed: string;
  avatar_url: string | null;
  paths: string[];
  years_experience: number | null;
  hourly_rate_cents: number;
  currency: string;
  rating_avg: number;
  rating_count: number;
  is_verified: boolean;
  is_demo: boolean;
  is_founding_mentor: boolean;
  languages: string[];
  mentorship_formats: string[];
  session_durations_minutes: number[];
  value_proposition: string;
  availability_note: string;
  mentee_count: number;
  mentorship_duration_label: string;
  mentorship_price_label: string;
  consultation_duration_label: string;
  consultation_price_label: string;
}

export type HelpTopic =
  | "choose_career"
  | "start_cybersecurity"
  | "need_roadmap"
  | "project_help"
  | "portfolio_guidance"
  | "career_advice"
  | "other";

export const HELP_TOPIC_OPTIONS: { value: HelpTopic; label: string }[] = [
  { value: "choose_career", label: "I don't know which tech career to choose" },
  { value: "start_cybersecurity", label: "I want to start cybersecurity" },
  { value: "need_roadmap", label: "I need a learning roadmap" },
  { value: "project_help", label: "I need help with a project" },
  { value: "portfolio_guidance", label: "I need portfolio guidance" },
  { value: "career_advice", label: "I want career advice" },
  { value: "other", label: "Other" },
];

export interface MentorSession {
  id: string;
  mentor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: "requested" | "confirmed" | "completed" | "cancelled";
  price_cents: number;
  currency: string;
  help_topic: HelpTopic | null;
  mentee_message: string;
  mentee_summary: string;
  payment_integration_note: string;
}

export interface MentorSessionDetail extends MentorSession {
  mentee_id: string;
  mentee_name: string;
}

export interface MentorNote {
  what_to_work_on: string;
  recommended_resources: string[];
  recommended_projects: string[];
  next_steps: string;
  follow_up_date: string | null;
}

export interface RecommendationItem {
  title: string;
  description: string;
  item_type: "skill" | "project" | "follow_up";
}

export interface MentorRecommendation {
  id: string;
  session_id: string;
  mentor_id: string;
  items: RecommendationItem[];
  created_at: string;
}

export interface SkillGapItem {
  key: string;
  label: string;
  category: string;
  mastery_pct: number;
}

export interface SkillSnapshot {
  path_slug: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Not started";
  mastery_avg: number;
  gaps: SkillGapItem[];
}

export interface MentorMatch {
  mentor: Mentor;
  score: number;
  reason: string;
}

export interface MentorRecommendationRequest {
  snapshot: SkillSnapshot;
  matches: MentorMatch[];
}

export interface MentorEarningsSummary {
  total_sessions: number;
  completed_sessions: number;
  upcoming_sessions: number;
  pending_requests: number;
  total_earned_cents: number;
  currency: string;
  note: string;
}

export interface MentorApplication {
  id: string;
  applicant_name: string;
  applicant_email: string;
  headline: string;
  bio: string;
  paths: string[];
  years_experience: number | null;
  status: "pending" | "approved" | "rejected";
  reviewer_note: string;
  created_at: string;
}

export interface PublicConfig {
  google_auth_enabled: boolean;
  payments_enabled: boolean;
  ai_provider: string;
  environment: string;
}
