import {
  Bot,
  Briefcase,
  Compass,
  FolderGit2,
  Gauge,
  Layers,
  type LucideIcon,
  LayoutDashboard,
  Mail,
  Map,
  MessageCircle,
  Sparkles,
  UserCircle,
  UserCog,
  Users,
  Settings,
} from "lucide-react";
import { CAREER_PATH_COUNT, CAREER_CATEGORIES } from "@/lib/career-categories";

/**
 * The one source of truth for CareerFound's global navigation: the desktop
 * menus, the mobile overlay and the account menu all render from this, so
 * they can never drift apart. Every href is an existing route (a test walks
 * src/app and fails on a link to a page that does not exist).
 *
 * `match` lists the path prefixes that should light a link up as the
 * current page, segment-aware (so /mentors never lights up AI Mentor at
 * /mentor).
 */
export interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  match: string[];
}

export interface NavGroup {
  key: "explore" | "build" | "prepare" | "guidance";
  label: string;
  /** One editorial line shown beside the group's links. */
  blurb: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    key: "explore",
    label: "Explore",
    blurb: "Find the career that fits you, then see exactly what it takes to get there.",
    items: [
      {
        href: "/careers",
        label: "Careers",
        description: `${CAREER_PATH_COUNT} careers in ${CAREER_CATEGORIES.length} fields, each with its own roadmap.`,
        icon: Compass,
        match: ["/careers"],
      },
      {
        href: "/onboarding",
        label: "Career Assessment",
        description: "Seven short chapters that point you to your best-fit path.",
        icon: Sparkles,
        match: ["/onboarding", "/assessment"],
      },
      {
        href: "/roadmap",
        label: "Roadmaps",
        description: "A staged plan for your path, from first lesson to job-ready.",
        icon: Map,
        match: ["/roadmap"],
      },
    ],
  },
  {
    key: "build",
    label: "Build",
    blurb: "Turn what you learn into work you can show, with help when you are stuck.",
    items: [
      {
        href: "/projects",
        label: "Project Lab",
        description: "A project path for your career, from first tool to job ready.",
        icon: FolderGit2,
        match: ["/projects"],
      },
      {
        href: "/portfolio",
        label: "Portfolio",
        description: "Write finished projects up as proof you can send to an employer.",
        icon: Briefcase,
        match: ["/portfolio"],
      },
      {
        href: "/mentor",
        label: "AI Mentor",
        description: "Hints before answers, code review and mock interviews, on call.",
        icon: Bot,
        match: ["/mentor"],
      },
    ],
  },
  {
    key: "prepare",
    label: "Prepare",
    blurb: "Know where you stand before an employer does, and close the gaps that matter.",
    items: [
      {
        href: "/readiness",
        label: "Career Readiness",
        description: "One score from seven real signals, with the next thing to do.",
        icon: Gauge,
        match: ["/readiness"],
      },
    ],
  },
  {
    key: "guidance",
    label: "Guidance",
    blurb: "Talk to people who have done the work. Human, paid and separate from the AI.",
    items: [
      {
        href: "/mentors",
        label: "Mentorship",
        description: "Book a mentor by career path. Cloud security, mobile and more.",
        icon: Users,
        match: ["/mentors"],
      },
      {
        href: "/consultation",
        label: "Career Consultation",
        description: "One focused 30-minute conversation about your next step.",
        icon: Mail,
        match: ["/consultation"],
      },
      {
        href: "/mentorship",
        label: "1:1 with the founder",
        description: "Two months of direct mentorship with Toriola.",
        icon: UserCog,
        match: ["/mentorship"],
      },
      {
        href: "/community",
        label: "Community",
        description: "Learn alongside other people on the same path.",
        icon: Layers,
        match: ["/community"],
      },
    ],
  },
];

/** Secondary pages, reachable from every open menu and the mobile overlay. */
export const MORE_LINKS: { href: string; label: string }[] = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const ACCOUNT_LINKS: { href: string; label: string; icon: LucideIcon; match: string[] }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, match: ["/dashboard"] },
  { href: "/settings#profile", label: "Profile", icon: UserCircle, match: [] },
  { href: "/settings#settings", label: "Settings", icon: Settings, match: ["/settings"] },
];

export const ROLE_LINKS: Record<string, { href: string; label: string; icon: LucideIcon; match: string[] }> = {
  mentor: { href: "/mentor-dashboard", label: "Mentor dashboard", icon: MessageCircle, match: ["/mentor-dashboard"] },
  admin: { href: "/admin", label: "Admin", icon: UserCog, match: ["/admin"] },
};

export const SIGNED_OUT_ACCOUNT_LINKS = [
  { href: "/login", label: "Sign in" },
  { href: "/signup", label: "Create an account" },
];

export const GET_STARTED_HREF = "/onboarding";

/** Segment-aware: "/mentors" does not match the "/mentor" prefix. */
export function pathMatches(pathname: string | null, prefixes: string[]): boolean {
  if (!pathname) return false;
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function groupIsActive(pathname: string | null, group: NavGroup): boolean {
  return group.items.some((i) => pathMatches(pathname, i.match));
}

/** Where to send someone after they sign in, from a ?next= value. Only
 * same-site paths are allowed, so the login page can never be used to
 * bounce a visitor to another domain. */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next) return null;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return null;
  if (next.startsWith("/login") || next.startsWith("/signup")) return null;
  return next;
}
