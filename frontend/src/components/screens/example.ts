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

/** The seven signals and weights the product really uses (backend/app/services/career_readiness_service.py). Values are example data. */
export const READINESS_SIGNALS = [
  { key: "learning", label: "Learning", weight: 20, value: 72 },
  { key: "skills", label: "Skills", weight: 15, value: 64 },
  { key: "projects", label: "Projects", weight: 20, value: 58 },
  { key: "documentation", label: "Documentation", weight: 10, value: 50 },
  { key: "proof", label: "Proof of work", weight: 15, value: 40 },
  { key: "portfolio", label: "Portfolio", weight: 10, value: 33 },
  { key: "interview", label: "Interview preparation", weight: 10, value: 35 },
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
