import {
  Cloud,
  Code2,
  Database,
  FileText,
  FlaskConical,
  Headphones,
  Layers,
  Layout,
  LucideIcon,
  Palette,
  PenTool,
  Search,
  Server,
  Shapes,
  Shield,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Target,
  Terminal,
  TestTube2,
  Wand2,
  Workflow,
} from "lucide-react";

/**
 * The canonical catalogue taxonomy: 6 categories and the careers inside them
 * (mirrors backend/app/seed/career_paths.py and
 * backend/app/services/career_taxonomy.py; a backend test keeps the three in
 * sync).
 *
 * A category is a way to filter, group and navigate the catalogue. It is
 * never a career: nothing here makes a category selectable as a path, and a
 * career's name never repeats its category.
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
    slug: "security",
    name: "Security",
    blurb: "Protect systems, detect threats and test defences.",
    paths: [
      { slug: "cybersecurity", name: "Cybersecurity", icon: Shield },
      { slug: "security-operations", name: "Security Operations (SOC)", icon: Search },
      { slug: "penetration-testing", name: "Penetration Testing", icon: Terminal },
      { slug: "cloud-security", name: "Cloud Security", icon: ShieldAlert },
    ],
  },
  {
    slug: "engineering",
    name: "Engineering",
    blurb: "Build software for the web, mobile and beyond.",
    paths: [
      { slug: "software-engineering", name: "Software Engineering", icon: Code2 },
      { slug: "frontend-development", name: "Frontend Development", icon: Layout },
      { slug: "backend-engineering", name: "Backend Engineering", icon: Server },
      { slug: "full-stack-development", name: "Full-Stack Development", icon: Layers },
      { slug: "mobile-development", name: "Mobile Development", icon: Smartphone },
      { slug: "qa-engineering", name: "QA Engineering", icon: TestTube2 },
    ],
  },
  {
    slug: "cloud-infrastructure",
    name: "Cloud & Infrastructure",
    blurb: "Run, ship and design the platforms software lives on.",
    paths: [
      { slug: "cloud-engineering", name: "Cloud Engineering", icon: Cloud },
      { slug: "devops-engineering", name: "DevOps Engineering", icon: Workflow },
      { slug: "solutions-architecture", name: "Solutions Architecture", icon: Sparkles },
    ],
  },
  {
    slug: "data-ai",
    name: "Data & AI",
    blurb: "Turn data into decisions, pipelines, models and AI products.",
    paths: [
      { slug: "data-analysis", name: "Data Analysis", icon: Database },
      { slug: "data-science", name: "Data Science", icon: FlaskConical },
      { slug: "data-engineering", name: "Data Engineering", icon: Server },
      { slug: "ai-engineering", name: "AI Engineering", icon: Sparkles },
    ],
  },
  {
    slug: "design-product",
    name: "Design & Product",
    blurb: "Shape what gets built and how it looks, feels and works.",
    paths: [
      { slug: "ui-ux-design", name: "UI/UX Design", icon: Palette },
      { slug: "product-design", name: "Product Design", icon: PenTool },
      { slug: "product-management", name: "Product Management", icon: Target },
      { slug: "graphic-design", name: "Graphic Design", icon: Shapes },
    ],
  },
  {
    slug: "operations-digital",
    name: "Operations & Digital",
    blurb: "Support teams, automate work and communicate technical ideas.",
    paths: [
      { slug: "it-support", name: "IT Support", icon: Headphones },
      { slug: "no-code-automation", name: "No-Code / Automation", icon: Wand2 },
      { slug: "technical-writing", name: "Technical Writing", icon: FileText },
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
  "machine-learning-engineering": "ai-engineering",
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
