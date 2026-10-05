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
