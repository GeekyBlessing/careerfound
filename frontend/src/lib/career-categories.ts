import {
  Activity,
  BarChart3,
  Bot,
  Boxes,
  BrainCircuit,
  Bug,
  Clapperboard,
  ClipboardList,
  Cloud,
  Code2,
  Cpu,
  Database,
  DatabaseZap,
  FileSearch,
  FileText,
  FlaskConical,
  Gamepad2,
  Gauge,
  Handshake,
  HardDrive,
  Headphones,
  KeyRound,
  Layers,
  Layout,
  LifeBuoy,
  LucideIcon,
  Microscope,
  MousePointerClick,
  Network,
  Palette,
  PenTool,
  Radar,
  Scale,
  Search,
  Server,
  ServerCog,
  Shapes,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Table2,
  Target,
  Terminal,
  TestTube2,
  Ticket,
  Wand2,
  Workflow,
} from "lucide-react";

/**
 * The canonical catalogue taxonomy: 6 categories and 48 careers and the careers inside them
 * (mirrors backend/app/seed/career_paths.py and
 * backend/app/services/career_taxonomy.py; a backend test keeps the three in
 * sync).
 *
 * A category is a way to filter, group and navigate the catalogue. It is
 * never a career: nothing here makes a category selectable as a path. A
 * career belongs to exactly one category; related careers link across them.
 *
 * The first career listed in each category is the broad entry point; the
 * rest are specialisations or neighbouring paths. Order inside a category is
 * the order the catalogue shows them in.
 */
export interface CareerCategoryPath {
  slug: string;
  name: string;
  icon: LucideIcon;
}

export interface CareerCategory {
  slug: string;
  name: string;
  blurb: string;
  paths: CareerCategoryPath[];
}

export const CAREER_CATEGORIES: CareerCategory[] = [
  {
    slug: "engineering",
    name: "Software Engineering",
    blurb: "Build software for the web, phones, games and devices.",
    paths: [
      { slug: "software-engineering", name: "Software Engineering", icon: Code2 },
      { slug: "frontend-development", name: "Frontend Development", icon: Layout },
      { slug: "backend-engineering", name: "Backend Development", icon: Server },
      { slug: "full-stack-development", name: "Full-Stack Development", icon: Layers },
      { slug: "mobile-development", name: "Mobile Engineering", icon: Smartphone },
      { slug: "game-development", name: "Game Development", icon: Gamepad2 },
      { slug: "qa-engineering", name: "QA Engineering", icon: TestTube2 },
      { slug: "embedded-systems-engineering", name: "Embedded Systems Engineering", icon: Cpu },
    ],
  },
  {
    slug: "cloud-infrastructure",
    name: "Cloud, Infrastructure & DevOps",
    blurb: "Run, ship and design the platforms software lives on.",
    paths: [
      { slug: "cloud-engineering", name: "Cloud Engineering", icon: Cloud },
      { slug: "devops-engineering", name: "DevOps Engineering", icon: Workflow },
      { slug: "site-reliability-engineering", name: "Site Reliability Engineering (SRE)", icon: Activity },
      { slug: "platform-engineering", name: "Platform Engineering", icon: Boxes },
      { slug: "solutions-architecture", name: "Solutions Architecture", icon: Sparkles },
      { slug: "systems-administration", name: "Systems Administration", icon: ServerCog },
      { slug: "network-engineering", name: "Network Engineering", icon: Network },
      { slug: "database-administration", name: "Database Administration", icon: HardDrive },
    ],
  },
  {
    slug: "security",
    name: "Cybersecurity",
    blurb: "Protect systems, detect threats and test defences.",
    paths: [
      { slug: "cybersecurity", name: "Cybersecurity", icon: Shield },
      { slug: "security-operations", name: "Security Operations (SOC Analyst)", icon: Search },
      { slug: "penetration-testing", name: "Penetration Testing", icon: Terminal },
      { slug: "cloud-security", name: "Cloud Security Engineering", icon: ShieldAlert },
      { slug: "application-security", name: "Application Security Engineering", icon: Bug },
      { slug: "digital-forensics-incident-response", name: "Digital Forensics and Incident Response", icon: FileSearch },
      { slug: "security-engineering", name: "Security Engineering", icon: ShieldCheck },
      { slug: "identity-access-management", name: "Identity and Access Management (IAM)", icon: KeyRound },
      { slug: "governance-risk-compliance", name: "Governance, Risk and Compliance (GRC)", icon: Scale },
      { slug: "detection-engineering", name: "Detection Engineering", icon: Radar },
    ],
  },
  {
    slug: "data-ai",
    name: "Data & Artificial Intelligence",
    blurb: "Turn data into decisions, pipelines, models and AI products.",
    paths: [
      { slug: "data-analysis", name: "Data Analysis", icon: Database },
      { slug: "business-intelligence-engineering", name: "Business Intelligence Engineering", icon: BarChart3 },
      { slug: "data-engineering", name: "Data Engineering", icon: DatabaseZap },
      { slug: "data-science", name: "Data Science", icon: FlaskConical },
      { slug: "machine-learning-engineering", name: "Machine Learning Engineering", icon: BrainCircuit },
      { slug: "ai-engineering", name: "AI Engineering", icon: Bot },
      { slug: "mlops-engineering", name: "MLOps Engineering", icon: Gauge },
      { slug: "analytics-engineering", name: "Analytics Engineering", icon: Table2 },
    ],
  },
  {
    slug: "design-product",
    name: "Design & Product",
    blurb: "Shape what gets built and how it looks, feels and works.",
    paths: [
      { slug: "ui-ux-design", name: "UI/UX Design", icon: Palette },
      { slug: "product-design", name: "Product Design", icon: PenTool },
      { slug: "graphic-design", name: "Graphic Design", icon: Shapes },
      { slug: "motion-design", name: "Motion Design", icon: Clapperboard },
      { slug: "product-management", name: "Product Management", icon: Target },
      { slug: "business-analysis", name: "Business Analysis", icon: ClipboardList },
      { slug: "ux-research", name: "UX Research", icon: Microscope },
    ],
  },
  {
    slug: "operations-digital",
    name: "IT, Automation & Technical Communication",
    blurb: "Support teams, automate work and explain technical ideas.",
    paths: [
      { slug: "it-support", name: "IT Support", icon: Headphones },
      { slug: "it-service-management", name: "IT Service Management", icon: Ticket },
      { slug: "no-code-development", name: "No-Code Development", icon: MousePointerClick },
      { slug: "workflow-automation", name: "Workflow Automation", icon: Wand2 },
      { slug: "technical-writing", name: "Technical Writing", icon: FileText },
      { slug: "solutions-consulting", name: "Solutions Consulting", icon: Handshake },
      { slug: "technical-support-engineering", name: "Technical Support Engineering", icon: LifeBuoy },
    ],
  },
];

export const CAREER_PATH_COUNT = CAREER_CATEGORIES.reduce((n, c) => n + c.paths.length, 0);

/**
 * Old career URLs and stored references keep working: a legacy slug maps to
 * the career that replaced it (kept in step with LEGACY_SLUG_REDIRECTS in
 * backend/app/services/career_taxonomy.py and the redirects in
 * next.config.mjs).
 */
export const LEGACY_CAREER_SLUGS: Record<string, string> = {
  "ai-ml-engineering": "ai-engineering",
  "no-code-automation": "workflow-automation",
  "soc-analysis": "security-operations",
  devops: "devops-engineering",
};

export function canonicalCareerSlug(slug: string): string {
  return LEGACY_CAREER_SLUGS[slug] ?? slug;
}

const CATEGORY_BY_CAREER_SLUG: Record<string, CareerCategory> = {};
const CAREER_BY_SLUG: Record<string, CareerCategoryPath> = {};
for (const category of CAREER_CATEGORIES) {
  for (const path of category.paths) {
    CATEGORY_BY_CAREER_SLUG[path.slug] = category;
    CAREER_BY_SLUG[path.slug] = path;
  }
}

export function categoryForCareer(slug: string): CareerCategory | undefined {
  return CATEGORY_BY_CAREER_SLUG[canonicalCareerSlug(slug)];
}

export function careerBySlug(slug: string): CareerCategoryPath | undefined {
  return CAREER_BY_SLUG[canonicalCareerSlug(slug)];
}

/** Position of a career in the catalogue (1-based), used for the "01" index. */
export const CAREER_ORDER: string[] = CAREER_CATEGORIES.flatMap((c) => c.paths.map((p) => p.slug));
