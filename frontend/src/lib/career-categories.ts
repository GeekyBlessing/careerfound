import {
  Cloud,
  Code2,
  Database,
  FileText,
  Headphones,
  Layers,
  Layout,
  LucideIcon,
  Palette,
  PenTool,
  Search,
  Server,
  Shield,
  ShieldAlert,
  Sparkles,
  Terminal,
  Wand2,
  Workflow,
} from "lucide-react";

/**
 * The canonical grouping of CareerFound's 21 real career paths (from
 * backend/app/seed/career_paths.py), used anywhere the product needs to
 * present the catalog by discipline instead of one flat list: the nav
 * mega-menu, the career directory, and the homepage catalogue preview. A
 * single source of truth so these three places can't quietly drift into
 * three different groupings/icons for the same 21 paths.
 *
 * Slugs and names are copied verbatim from the seed data, not invented.
 */
export interface CareerCategory {
  name: string;
  paths: { slug: string; name: string; icon: LucideIcon }[];
}

export const CAREER_CATEGORIES: CareerCategory[] = [
  {
    name: "Security",
    paths: [
      { slug: "cybersecurity", name: "Cybersecurity", icon: Shield },
      { slug: "cloud-security", name: "Cloud Security", icon: ShieldAlert },
      { slug: "soc-analysis", name: "SOC Analysis", icon: Search },
      { slug: "penetration-testing", name: "Penetration Testing", icon: Terminal },
    ],
  },
  {
    name: "Engineering",
    paths: [
      { slug: "software-engineering", name: "Software Engineering", icon: Code2 },
      { slug: "frontend-development", name: "Frontend Development", icon: Layout },
      { slug: "backend-engineering", name: "Backend Engineering", icon: Server },
      { slug: "full-stack-development", name: "Full-Stack Development", icon: Layers },
      { slug: "cloud-engineering", name: "Cloud Engineering", icon: Cloud },
      { slug: "devops", name: "DevOps", icon: Workflow },
      { slug: "solutions-architecture", name: "Solutions Architecture", icon: Sparkles },
    ],
  },
  {
    name: "Data & AI",
    paths: [
      { slug: "data-analysis", name: "Data Analysis", icon: Database },
      { slug: "data-engineering", name: "Data Engineering", icon: Server },
      { slug: "ai-ml-engineering", name: "AI/ML Engineering", icon: Sparkles },
    ],
  },
  {
    name: "Design & Product",
    paths: [
      { slug: "product-design", name: "Product Design", icon: PenTool },
      { slug: "ui-ux-design", name: "UI/UX Design", icon: Palette },
      { slug: "product-management", name: "Product Management", icon: Layers },
      { slug: "technical-writing", name: "Technical Writing", icon: FileText },
    ],
  },
  {
    name: "Operations & Support",
    paths: [
      { slug: "qa-engineering", name: "QA Engineering", icon: Search },
      { slug: "no-code-automation", name: "No-Code / Automation", icon: Wand2 },
      { slug: "it-support", name: "IT Support", icon: Headphones },
    ],
  },
];

export const CAREER_PATH_COUNT = CAREER_CATEGORIES.reduce((n, c) => n + c.paths.length, 0);
