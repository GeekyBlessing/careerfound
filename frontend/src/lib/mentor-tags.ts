/**
 * Mentor profiles list career slugs and skill slugs together in `paths`.
 * Most read fine as title-cased words, but acronyms and product names need
 * their real spelling ("sql" is SQL, not "Sql").
 */
const SPECIAL: Record<string, string> = {
  sql: "SQL",
  aws: "AWS",
  "aws-security": "AWS Security",
  "rest-apis": "REST APIs",
  "power-bi": "Power BI",
  devsecops: "DevSecOps",
  "devops-engineering": "DevOps Engineering",
  javascript: "JavaScript",
  typescript: "TypeScript",
  node: "Node.js",
  react: "React",
  figma: "Figma",
  "ui-ux-design": "UI/UX Design",
  "ux-research": "UX Research",
  git: "Git",
  excel: "Excel",
  python: "Python",
  tableau: "Tableau",
  "site-reliability-engineering": "Site Reliability Engineering",
};

export function mentorTagLabel(slug: string): string {
  const special = SPECIAL[slug];
  if (special) return special;
  return slug
    .split("-")
    .map((w) => (w.length > 0 ? w[0]!.toUpperCase() + w.slice(1) : w))
    .join(" ");
}
