/**
 * The example learner the homepage screens show. Everything here is labelled
 * as example data in the interface; none of it is a real person or a real
 * statistic. The structure is the real product's: the roadmap phase titles are
 * the Cybersecurity roadmap's own (backend/app/seed/roadmap_content.py), the
 * readiness weights are the real ones (backend/app/services/readiness_service.py),
 * and the Project Lab titles come from the live curriculum snapshot.
 */

export const ROADMAP_PHASES = [
  "Computer Fundamentals",
  "Networking",
  "Linux",
  "Python",
  "Security Fundamentals",
  "SOC Fundamentals",
  "SIEM",
  "Cloud Security",
  "Detection Engineering",
  "Portfolio",
  "Job Preparation",
];

/** Zero-based index of the phase in progress: seven complete, "Cloud Security" under way. */
export const ROADMAP_ACTIVE = 7;
export const ROADMAP_PCT = Math.round(((ROADMAP_ACTIVE + 0.5) / ROADMAP_PHASES.length) * 100);

export const READINESS_SIGNALS = [
  { key: "knowledge_pct", label: "Knowledge", weight: 25, value: 72 },
  { key: "projects_pct", label: "Projects", weight: 30, value: 58 },
  { key: "portfolio_pct", label: "Portfolio", weight: 15, value: 40 },
  { key: "interview_pct", label: "Interview readiness", weight: 15, value: 35 },
  { key: "practical_pct", label: "Practical skills", weight: 15, value: 66 },
];
export const READINESS_OVERALL = Math.round(READINESS_SIGNALS.reduce((n, r) => n + (r.value * r.weight) / 100, 0));

/** The journey as one connected line, in the order the product walks it. */
export const JOURNEY = [
  { key: "discover", label: "Discover", body: "Answer honest questions about how you think and work." },
  { key: "learn", label: "Learn", body: "Follow a staged roadmap built for one specific career." },
  { key: "build", label: "Build", body: "Make real projects in the Project Lab." },
  { key: "document", label: "Document", body: "Write a README and capture the evidence." },
  { key: "publish", label: "Publish", body: "Put the work on a public GitHub repository." },
  { key: "showcase", label: "Showcase", body: "Present it in a portfolio people can open." },
  { key: "interview", label: "Interview", body: "Write the answers you will give about your own work." },
  { key: "job-ready", label: "Job ready", body: "Track a readiness score built from your real activity." },
] as const;

/** An example assessment result. The fit scores are illustrative. */
export const MATCHES = [
  { name: "Cloud Security", fit: 92, slug: "cloud-security", note: "Best match" },
  { name: "Cloud Engineering", fit: 87, slug: "cloud-engineering", note: "Strong alternative" },
  { name: "Cybersecurity", fit: 82, slug: "cybersecurity", note: "Wild card" },
];

export const EXAMPLE_TAG = "Example data";
