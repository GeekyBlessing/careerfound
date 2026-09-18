import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Shield,
  Code2,
  BarChart3,
  Cloud,
  Workflow,
  PenTool,
  Check,
  ChevronDown,
  Compass,
  Target,
  FolderGit2,
  Users,
  Map,
  Briefcase,
  Gauge,
  Bot,
  CheckCircle2,
  Lock,
  FileText,
  Award,
  GitCommit,
  Sparkles,
  Laptop,
  Rocket,
  Globe,
} from "lucide-react";
import { MarketingNav } from "@/components/layout/marketing-nav";
import { Footer } from "@/components/layout/footer";
import { SectionHeading } from "@/components/marketing/section-heading";
import { SectionDivider } from "@/components/marketing/section-divider";
import { CareerExplorerSearch } from "@/components/marketing/career-explorer-search";
import { InterfaceFrame } from "@/components/marketing/interface-frame";
import { PhoneFrame } from "@/components/marketing/phone-frame";
import { Reveal } from "@/components/marketing/reveal";
import { PathTrack, type PathWaypoint } from "@/components/marketing/path-track";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DifficultyMeter } from "@/components/ui/difficulty-meter";
import { cn } from "@/lib/utils";
import { pricingTiers, faqs } from "@/lib/marketing-content";
import { CAREER_CATEGORIES, CAREER_PATH_COUNT } from "@/lib/career-categories";

export const metadata: Metadata = {
  title: "CareerFound: Find your tech career, step by step",
  description:
    "Discover your tech career, get a personalized roadmap, build real projects, and become job-ready. Start with a free honest assessment, no credit card required.",
  alternates: { canonical: "/" },
};

// The hero's product panel: the whole CareerFound experience as five real
// stages, each with the one line that describes what actually happens
// there. Same <PathTrack> primitive the onboarding stepper and roadmap
// phase tracker reuse, so this reads as a real product surface rather than
// a one-off illustration.
const heroWaypoints: PathWaypoint[] = [
  { icon: Compass, label: "Discover", state: "active", caption: "Answer honest questions about how you think and work." },
  { icon: Target, label: "Career Match", state: "upcoming", caption: "A Best Match, a Strong Alternative, and a Wild Card." },
  { icon: Map, label: "Roadmap", state: "upcoming", caption: "A staged plan, beginner through advanced, for your path." },
  { icon: FolderGit2, label: "Projects", state: "upcoming", caption: "Real builds, with feedback on every submission." },
  { icon: Briefcase, label: "Portfolio", state: "upcoming", caption: "Finished work written up as proof you can show." },
];

// Six real paths, with real entry_roles/tools/skills_required copied
// verbatim from backend/app/seed/career_paths.py (the same fields the
// career-detail page itself reads), not written for this page. The full 21
// are still listed below by category for anyone who wants the complete
// directory.
const CATALOGUE: {
  slug: string;
  name: string;
  icon: typeof Code2;
  summary: string;
  difficulty: number;
  entryRole: string;
  tools: string[];
}[] = [
  {
    slug: "software-engineering",
    name: "Software Engineering",
    icon: Code2,
    summary: "Design, build, and maintain the applications and systems that power products people use every day.",
    difficulty: 3,
    entryRole: "Junior Software Engineer",
    tools: ["Python or JavaScript", "Git/GitHub", "SQL", "REST APIs"],
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity",
    icon: Shield,
    summary: "Protect organizations from attackers by finding, fixing, and defending against security weaknesses.",
    difficulty: 3,
    entryRole: "SOC Analyst (Tier 1)",
    tools: ["Wireshark", "Linux", "Python", "Nmap"],
  },
  {
    slug: "cloud-engineering",
    name: "Cloud Engineering",
    icon: Cloud,
    summary: "Set up and run computer systems that live on the internet instead of one physical machine.",
    difficulty: 3,
    entryRole: "Junior Cloud Engineer",
    tools: ["AWS/Azure/GCP basics", "Linux", "Terraform", "Docker"],
  },
  {
    slug: "devops",
    name: "DevOps",
    icon: Workflow,
    summary: "Make sure software gets built, tested, and delivered smoothly and reliably.",
    difficulty: 3,
    entryRole: "Junior DevOps Engineer",
    tools: ["Docker", "CI/CD (GitHub Actions)", "Linux", "Cloud basics"],
  },
  {
    slug: "product-design",
    name: "Product Design",
    icon: PenTool,
    summary: "Shape how a product looks, feels, and solves a user's problem.",
    difficulty: 2,
    entryRole: "Junior Product Designer",
    tools: ["Figma", "User research basics", "Prototyping"],
  },
  {
    slug: "data-analysis",
    name: "Data Analysis",
    icon: BarChart3,
    summary: "Turn raw numbers into insights that help people make decisions.",
    difficulty: 2,
    entryRole: "Junior Data Analyst",
    tools: ["SQL", "Excel/Sheets", "Python (pandas)"],
  },
];

// Non-null: CATALOGUE is a fixed, non-empty literal defined immediately
// above, so the first entry is always present.
const FEATURED_CAREER = CATALOGUE[0]!;
const SECONDARY_CAREERS = CATALOGUE.slice(1, 4);

// The Discover scene's device-frame excerpt: the real third onboarding
// question and its real options, copied verbatim from
// frontend/src/app/onboarding/page.tsx's GOAL_OPTIONS/steps array, not
// written for this page. Presented as "03 / 10" to match the real step
// count onboarding actually walks a new user through.
const ASSESSMENT_QUESTION = "What are you hoping to achieve?";
const ASSESSMENT_OPTIONS: { label: string; icon: typeof Briefcase }[] = [
  { label: "Get a job", icon: Briefcase },
  { label: "Freelance", icon: Laptop },
  { label: "Build a startup", icon: Rocket },
  { label: "Remote career", icon: Globe },
  { label: "Explore tech", icon: Compass },
];

// The homepage's "Build" stage: the same six-stage shape the roadmap page
// itself uses (discover, then a staged phase progression to job-ready),
// with real phase titles from the Cybersecurity roadmap
// (backend/app/seed/roadmap_content.py) standing in as a concrete example
// of what a phase list actually looks like once you're inside a path.
const roadmapStory = [
  { title: "Discover", body: "The assessment points you at one specific path, not a menu.", icon: Compass },
  { title: "Foundations", body: "Computer fundamentals, networking, the command line: the base every phase after this assumes.", icon: Map },
  { title: "Skills", body: "Path-specific skills, taught in order, each unlocked by the last.", icon: Gauge },
  { title: "Projects", body: "Real builds at each phase, with AI feedback on every submission.", icon: FolderGit2 },
  { title: "Portfolio", body: "Finished projects written up as proof, not just checked off a list.", icon: Briefcase },
  { title: "Job ready", body: "A Tech Readiness Score and interview practice built around your target role.", icon: Award },
];

const samplePhases = [
  { title: "Phase 9, Detection Engineering", state: "done" as const },
  { title: "Phase 10, Portfolio", state: "active" as const },
  { title: "Phase 11, Job Preparation", state: "upcoming" as const },
];

// Three real projects, verbatim from backend/app/seed/roadmap_content.py
// (title, teaches, and difficulty copied exactly). difficulty follows the
// same <=2 Beginner / 3 Intermediate / >3 Expert mapping used elsewhere in
// the backend (see app/schemas/roadmap.py::difficulty_label).
const FEATURED_PROJECT = {
  title: "Build an automated security alert system",
  path: "Cybersecurity",
  phase: "Phase 10, Portfolio",
  teaches: "Tying detection logic to real notifications, the last mile that makes a detection system actually useful.",
  steps: [
    "Define what counts as 'high severity' based on your log analyzer's logic.",
    "Add a notification step: console/log first, then optionally email or a webhook.",
    "Add basic rate limiting so one burst of events doesn't spam 50 notifications.",
  ],
  difficultyLabel: "Intermediate",
  difficulty: 3,
};

const SUPPORTING_PROJECTS = [
  {
    title: "Create a mini SOC dashboard",
    path: "Cybersecurity",
    teaches: "Pulling logs, alerts, and summary metrics into one view, the core idea behind SOC tooling.",
    difficultyLabel: "Intermediate",
    difficulty: 3,
  },
  {
    title: "Build a weather lookup app using a public API",
    path: "Software Engineering",
    teaches: "Calling a real external API, handling responses, and displaying results to a user.",
    difficultyLabel: "Beginner",
    difficulty: 2,
  },
];

// A realistic (not fabricated-content) excerpt of what the Portfolio
// Builder actually produces: a real project (see FEATURED_PROJECT/
// SUPPORTING_PROJECTS above) written up with a status, not invented case
// studies. Mirrors the fields /portfolio itself shows.
const PORTFOLIO_ENTRIES = [
  { title: "Build an automated security alert system", path: "Cybersecurity", status: "Published", icon: CheckCircle2 },
  { title: "Create a mini SOC dashboard", path: "Cybersecurity", status: "Published", icon: CheckCircle2 },
  { title: "Build a weather lookup app using a public API", path: "Software Engineering", status: "Draft", icon: GitCommit },
];

// Career readiness: the same five-stage shape as the hero/roadmap journey,
// reduced to its plainest typographic form for the closing transition
// (Learn -> Build -> Prove -> Apply -> Get hired), each stage tied to a
// real page rather than a decorative label.
const READINESS_STAGES: { label: string; body: string; href: string }[] = [
  { label: "Learn", body: "A staged roadmap for your path", href: "/roadmap" },
  { label: "Build", body: "Real projects, not just lessons", href: "/projects" },
  { label: "Prove", body: "A portfolio of finished work", href: "/portfolio" },
  { label: "Apply", body: "Interview prep and AI feedback", href: "/mentor" },
  { label: "Get hired", body: "A Tech Readiness Score you can track", href: "/assessment/results" },
];

export default function LandingPage() {
  return (
    <>
      <MarketingNav />
      <main>
        {/* ============================================================
            SCENE 01, DISCOVER. An editorial masthead, not a centered SaaS
            hero: a poster-scale headline claims the left ~60% of the row,
            a real product panel (the five-stage journey) sits layered on
            the right, and a sourced-numbers stat strip runs the full width
            underneath, so the first screen reads as a designed spread
            rather than a text block over a box. */}
        <section className="relative overflow-hidden border-b border-[rgb(var(--fg-tint)/0.08)] pb-0 pt-16 sm:pt-20">
          <div className="bg-contour pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px]" />
          <span
            aria-hidden="true"
            className="scene-figure pointer-events-none absolute -right-6 -top-4 hidden text-[13rem] text-ink-100 lg:block"
          >
            01
          </span>

          <div className="container-page grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-10">
            <div>
              <p className="eyebrow gap-2 text-ink-400">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-light" aria-hidden="true" />
                Career discovery, for people breaking into tech
              </p>
              <h1 className="mt-6 max-w-2xl font-display text-poster font-semibold tracking-tight text-ink-100">
                Find your tech career.
                <br />
                <span className="text-accent-light">Build the proof</span> you did the work.
              </h1>
              <p className="mt-7 max-w-lg text-deck leading-relaxed text-ink-300">
                Find the tech career that actually fits you, follow a roadmap built for it, and build
                real projects that prove you can do the work. When you want a second opinion, get
                guidance from an AI mentor or from Toriola directly.
              </p>
              <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <Link href="/onboarding">
                  <Button size="lg" className="gap-2">
                    Find My Tech Path <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/careers">
                  <Button size="lg" variant="secondary">
                    Explore {CAREER_PATH_COUNT} Careers
                  </Button>
                </Link>
              </div>
              <p className="mt-5 text-xs text-ink-500">No credit card required, takes about 5 minutes</p>
            </div>

            {/* Layered device composition, not a single flat card: a real
                assessment screen sits tilted behind, the journey panel
                sits in front and slightly counter-rotated, and a small
                offset stat chip anchors the bottom corner. perspective-scene
                gives the tilt real depth instead of a flat CSS rotation. */}
            <Reveal className="perspective-scene relative pb-14 pl-8 pr-6 pt-4 sm:pb-20 sm:pl-16 sm:pr-10">
              <div className="absolute -left-2 top-6 hidden -rotate-6 sm:block lg:-left-6">
                <PhoneFrame label="Assessment, 03 / 10">
                  <div className="flex h-full flex-col justify-between p-4">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-wide text-ink-500">03 / 10</p>
                      <p className="mt-2 text-sm font-semibold leading-snug text-ink-100">{ASSESSMENT_QUESTION}</p>
                    </div>
                    <div className="space-y-1.5">
                      {ASSESSMENT_OPTIONS.slice(0, 3).map((o, i) => (
                        <div
                          key={o.label}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[11px] font-medium",
                            i === 0
                              ? "border-accent bg-accent/15 text-accent-light"
                              : "border-[rgb(var(--fg-tint)/0.1)] text-ink-400"
                          )}
                        >
                          <o.icon className="h-3 w-3 flex-shrink-0" />
                          {o.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </PhoneFrame>
              </div>

              <div className="relative translate-x-2 rotate-2 sm:translate-x-6">
                <InterfaceFrame label="Your Career Path">
                  <div className="p-6">
                    <PathTrack waypoints={heroWaypoints} orientation="vertical" size="sm" />
                  </div>
                </InterfaceFrame>
              </div>

              <div className="absolute -bottom-4 right-0 hidden w-40 -rotate-2 rounded-xl border border-[rgb(var(--fg-tint)/0.12)] bg-warm/12 p-4 shadow-raised sm:block">
                <p className="font-display text-2xl font-semibold text-ink-100">{CAREER_PATH_COUNT}</p>
                <p className="mt-0.5 text-xs leading-snug text-ink-500">real tech career paths, each with its own roadmap</p>
              </div>
            </Reveal>
          </div>

          {/* Full-width stat strip: the hero's closing beat, a horizontal
              row of sourced numbers rather than trailing off with nothing
              after the CTA. */}
          <div className="container-page mt-14 grid grid-cols-2 gap-6 border-t border-[rgb(var(--fg-tint)/0.08)] py-8 sm:grid-cols-4">
            {[
              { value: String(CAREER_PATH_COUNT), label: "real career paths, not one generic track" },
              { value: "5", label: "categories, from security to design" },
              { value: "$0", label: "to assess, plan, and start building" },
              { value: "2", label: "real, named mentors to talk to" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl font-semibold text-ink-100">{s.value}</p>
                <p className="mt-1 max-w-[14rem] text-xs leading-snug text-ink-500">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================
            SCENE 02, a full-bleed search moment on its own warm surface,
            deliberately plain and huge rather than a small input tucked
            into a card, so it reads as a distinct beat rather than a
            continuation of the hero. */}
        <section className="bg-paper py-20">
          <div className="container-page">
            <p className="eyebrow justify-start">Search</p>
            <h2 className="mt-3 max-w-xl font-display text-hero font-semibold tracking-tight text-ink-100">
              Find where you belong in tech.
            </h2>
            <div className="mt-10 max-w-2xl">
              <CareerExplorerSearch />
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-500">
              <span className="font-mono uppercase tracking-wide">Browse by category</span>
              {CAREER_CATEGORIES.map((cat) => (
                <Link key={cat.name} href="/careers" className="focus-ring text-ink-400 transition-colors hover:text-accent-light">
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            SCENE 03, DISCOVER. A major product showcase: the real
            onboarding assessment, shown large in a phone frame with actual
            gentle tilt, beside a poster-scale headline. Typography-
            dominant on the left, product-imagery-dominant on the right,
            the first deliberate shift in visual rhythm after the hero. */}
        <SectionDivider label="Discover" className="pt-4" />
        <section id="how-it-works" className="overflow-hidden py-16 sm:py-20">
          <div className="container-page grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <Reveal>
              <p className="eyebrow gap-2 text-ink-400">
                <Sparkles className="h-3.5 w-3.5" /> How it works
              </p>
              <h2 className="mt-4 max-w-lg font-display text-hero font-semibold tracking-tight text-ink-100">
                Find the path that fits you.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-500">
                Ten honest questions about your time, budget, interests, and goals, not a random
                guess. Every answer feeds a Best Match, a Strong Alternative, and a Wild Card, each
                with a reason attached. Then a personalized roadmap, real projects, and a portfolio
                follow from whichever one you choose.
              </p>
              <Link href="/how-it-works" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline">
                Read the full walkthrough <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Reveal>

            <Reveal delayMs={120} className="perspective-scene relative flex justify-center py-6 lg:justify-end lg:py-10">
              <div className="absolute -right-4 top-8 hidden w-44 -rotate-3 rounded-xl border border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.03)] p-4 shadow-card sm:block lg:-right-8">
                <p className="font-mono text-[10px] uppercase tracking-wide text-ink-500">Best Match</p>
                <p className="mt-1.5 font-display text-lg font-semibold text-ink-100">Cybersecurity</p>
                <p className="mt-1 text-xs leading-snug text-ink-500">Based on your problem-solving and systems answers.</p>
              </div>
              <div className="rotate-3">
                <PhoneFrame label="Assessment">
                  <div className="flex h-full flex-col justify-between p-5">
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-wide text-ink-500">03 / 10</span>
                        <span className="flex gap-1" aria-hidden="true">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <span
                              key={i}
                              className={cn("h-1 w-3 rounded-full", i < 3 ? "bg-accent-light" : "bg-[rgb(var(--fg-tint)/0.1)]")}
                            />
                          ))}
                        </span>
                      </div>
                      <p className="text-base font-semibold leading-snug text-ink-100">{ASSESSMENT_QUESTION}</p>
                    </div>
                    <div className="space-y-2">
                      {ASSESSMENT_OPTIONS.map((o, i) => (
                        <div
                          key={o.label}
                          className={cn(
                            "flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-medium transition-colors",
                            i === 0
                              ? "border-accent bg-accent/15 text-accent-light shadow-xs"
                              : "border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.03)] text-ink-300"
                          )}
                        >
                          <o.icon className="h-4 w-4 flex-shrink-0" />
                          {o.label}
                          {i === 0 && <Check className="ml-auto h-3.5 w-3.5" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </PhoneFrame>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============================================================
            SCENE 04, CHOOSE. An art-directed grid: one large featured
            career (real tools/entry role, not a generic card) alongside
            three smaller ones stacked beside it, instead of six identical
            tiles. Each block uses its own color relationship (accent for
            the featured block, neutral for the rest) so the featured path
            reads as a deliberate spotlight, not just "the first item". */}
        <SectionDivider label="Choose" />
        <section id="careers" className="py-14">
          <div className="container-page">
            <SectionHeading
              eyebrow="Career paths"
              title="There's more than one way into tech."
              description="We don't just ask what you want to learn, we help you discover what actually fits how you think and what you enjoy."
              align="left"
            />

            <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <Link
                href={`/careers/${FEATURED_CAREER.slug}`}
                className="card-interactive group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-accent/25 bg-accent/10 p-8 sm:p-10"
              >
                <span aria-hidden="true" className="scene-figure pointer-events-none absolute -bottom-6 -right-2 text-[9rem] text-accent-light">
                  01
                </span>
                <div className="relative">
                  <FEATURED_CAREER.icon className="h-9 w-9 text-accent-light" />
                  <h3 className="mt-6 font-display text-hero font-semibold tracking-tight text-ink-100">
                    {FEATURED_CAREER.name}
                  </h3>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-300">{FEATURED_CAREER.summary}</p>
                </div>
                <div className="relative mt-8">
                  <div className="flex flex-wrap gap-1.5">
                    {FEATURED_CAREER.tools.map((t) => (
                      <Badge key={t} tone="accent">{t}</Badge>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-accent/20 pt-4">
                    <span className="text-xs text-ink-400">Entry role: {FEATURED_CAREER.entryRole}</span>
                    <span className="flex items-center gap-1.5 text-sm font-medium text-accent-light">
                      Explore <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </div>
              </Link>

              <div className="flex flex-col gap-4">
                {SECONDARY_CAREERS.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/careers/${c.slug}`}
                    className="card-interactive group flex flex-1 items-center gap-4 rounded-2xl border border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.02)] p-5"
                  >
                    <c.icon className="h-6 w-6 flex-shrink-0 text-accent-light" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display text-base font-semibold text-ink-100 group-hover:text-accent-light">{c.name}</h4>
                      <p className="mt-1 line-clamp-1 text-xs text-ink-500">{c.summary}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-ink-500 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>

            {/* The immersive numbered directory: large typography rows and
                separators, the way an institution's catalogue reads,
                rather than a second row of cards. */}
            <div className="mt-16 border-t border-[rgb(var(--fg-tint)/0.08)]">
              {CATALOGUE.map((c, i) => (
                <Link
                  key={c.slug}
                  href={`/careers/${c.slug}`}
                  className="focus-ring group relative grid grid-cols-[3rem_1fr] gap-x-4 overflow-hidden border-b border-[rgb(var(--fg-tint)/0.08)] py-7 transition-colors duration-200 hover:bg-accent/[0.03] sm:grid-cols-[4rem_1fr_auto] sm:items-center sm:gap-x-8"
                >
                  {/* Desktop hover preview: the path's own icon swells in as
                      a soft watermark and its entry role/tools surface, so
                      hovering reveals a real (if subtle) product detail
                      instead of just a color change. */}
                  <c.icon
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-4 top-1/2 hidden h-32 w-32 -translate-y-1/2 rotate-6 text-accent-light opacity-0 transition-all duration-300 ease-smooth group-hover:opacity-[0.07] group-hover:rotate-0 lg:block"
                  />
                  <span className="font-display text-2xl text-ink-500 sm:text-3xl">{String(i + 1).padStart(2, "0")}</span>
                  <div className="relative min-w-0">
                    <div className="flex items-center gap-2.5">
                      <c.icon className="h-4 w-4 flex-shrink-0 text-accent-light" />
                      <h3 className="font-display text-lg font-semibold tracking-tight text-ink-100 group-hover:text-accent-light sm:text-xl">
                        {c.name}
                      </h3>
                    </div>
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-500">{c.summary}</p>
                    <span className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-ink-500">
                      <DifficultyMeter level={c.difficulty} /> {c.difficulty}/5 difficulty
                    </span>
                    <div className="hidden max-h-0 overflow-hidden opacity-0 transition-all duration-300 ease-smooth group-hover:mt-3 group-hover:max-h-10 group-hover:opacity-100 lg:block">
                      <p className="text-xs text-ink-500">
                        Entry role: <span className="text-ink-300">{c.entryRole}</span> &middot; {c.tools[0]}
                      </p>
                    </div>
                  </div>
                  <span className="relative col-span-2 mt-4 flex items-center gap-1.5 text-sm font-medium text-accent-light sm:col-span-1 sm:mt-0">
                    Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
              {CAREER_CATEGORIES.map((cat) => (
                <div key={cat.name}>
                  <p className="font-mono text-[10px] uppercase tracking-wide text-ink-500">{cat.name}</p>
                  <ul className="mt-3 space-y-1.5">
                    {cat.paths.map((p) => (
                      <li key={p.slug}>
                        <Link href={`/careers/${p.slug}`} className="focus-ring text-sm text-ink-300 transition-colors hover:text-accent-light">
                          {p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <Link href="/careers" className="mt-10 inline-flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline">
              View the full directory <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* ============================================================
            SCENE 05, BUILD: Roadmap. A deliberately fixed dark surface
            (surface-ink, independent of the light/dark toggle) so this
            becomes the page's one "step into a dark room" moment, the way
            an institutional site drops in a fixed dark features band. */}
        <SectionDivider label="Build" />
        <section className="surface-ink relative overflow-hidden py-20">
          <span aria-hidden="true" className="scene-figure pointer-events-none absolute -right-4 -top-10 hidden text-[13rem] lg:block">
            05
          </span>
          <div className="container-page relative">
            <p className="eyebrow justify-start text-[#c3d19a]">Roadmap</p>
            <h2 className="mt-3 max-w-xl font-display text-hero font-semibold tracking-tight">Know what to learn next.</h2>
            <p className="surface-ink-muted mt-4 max-w-lg text-sm leading-relaxed">
              Not a generic timeline: a staged plan for your specific path, with real phases you unlock in order.
            </p>

            <div className="mt-14 grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              <ol className="space-y-0">
                {roadmapStory.map((s, i) => {
                  const isLast = i === roadmapStory.length - 1;
                  return (
                    <li key={s.title} className="flex gap-6">
                      <div className="flex flex-col items-center">
                        <span className="font-display text-2xl font-semibold text-[#c3d19a]">{String(i + 1).padStart(2, "0")}</span>
                        {!isLast && <div className="my-1 w-px flex-1 bg-white/12" />}
                      </div>
                      <div className={cn("min-w-0", !isLast && "pb-9")}>
                        <div className="flex items-center gap-2 pt-1">
                          <s.icon className="h-4 w-4 text-[#c3d19a]" aria-hidden="true" />
                          <h3 className="font-display text-base font-semibold tracking-tight">{s.title}</h3>
                        </div>
                        <p className="surface-ink-muted mt-1.5 text-sm leading-relaxed">{s.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>

              <Reveal className="perspective-scene relative pb-10 pr-6 sm:pb-14 sm:pr-10">
                {/* A second screen peeks out from behind, tilted the other
                    way: the project this phase's "Portfolio" milestone
                    actually produces, so the roadmap reads as one product
                    with projects attached rather than a standalone list. */}
                <div className="absolute -bottom-3 -right-3 hidden w-48 rotate-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 shadow-raised sm:block">
                  <p className="font-mono text-[9px] uppercase tracking-wide text-white/40">Phase 10 project</p>
                  <p className="surface-ink-muted mt-1.5 text-xs font-medium text-[#f4f5f0]">{FEATURED_PROJECT.title}</p>
                </div>
                <div className="relative -rotate-2">
                  <InterfaceFrame label="Cybersecurity roadmap, live excerpt" tone="ink">
                    <div className="divide-y divide-white/10">
                      {samplePhases.map((phase) => (
                        <div key={phase.title} className="flex items-center gap-3 px-5 py-4">
                          {phase.state === "done" && <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#8fd18a]" />}
                          {phase.state === "active" && <span className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-[#c3d19a]" />}
                          {phase.state === "upcoming" && <Lock className="h-3.5 w-3.5 flex-shrink-0 text-white/40" />}
                          <span
                            className={cn(
                              "text-sm",
                              phase.state === "active" ? "font-medium text-[#f4f5f0]" : phase.state === "done" ? "text-white/70" : "text-white/40"
                            )}
                          >
                            {phase.title}
                          </span>
                          {phase.state === "active" && (
                            <span className="ml-auto rounded-[0.25rem] border border-[#c3d19a]/40 bg-[#c3d19a]/15 px-2 py-0.5 text-xs font-medium text-[#c3d19a]">
                              In progress
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </InterfaceFrame>
                </div>
                <p className="surface-ink-muted relative mt-4 text-xs leading-relaxed">
                  Every path has its own full set of phases like these, each with lessons, exercises, and projects. This
                  is a real excerpt, not a mockup.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Projects: a case-study gallery. The featured build is framed as
            a real interface excerpt (its own steps list, live-rendered),
            and gets a full-width band to itself before the two smaller,
            supporting builds sit beneath in a tighter row. */}
        <section className="overflow-hidden py-20">
          <div className="container-page">
            <SectionHeading eyebrow="Projects" title="Don't just learn it. Build it." align="left" />

            <div className="mt-12 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wide text-ink-500">
                  {FEATURED_PROJECT.path} &middot; {FEATURED_PROJECT.phase}
                </p>
                <h3 className="mt-3 font-display text-display font-semibold tracking-tight text-ink-100">{FEATURED_PROJECT.title}</h3>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-400">{FEATURED_PROJECT.teaches}</p>
                <span className="mt-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-ink-500">
                  <DifficultyMeter level={FEATURED_PROJECT.difficulty} /> {FEATURED_PROJECT.difficultyLabel}
                </span>
                <Link href="/projects" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline">
                  Browse every project <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <Reveal className="perspective-scene relative pb-8 pr-10 sm:pb-12">
                {/* A phone showing the two supporting projects as a real
                    list peeks out behind the featured project's browser
                    frame, so the "case-study gallery" reads as layered
                    product screens rather than a browser frame plus a
                    separate text row underneath. */}
                <div className="absolute -bottom-6 -right-6 hidden rotate-6 sm:block">
                  <PhoneFrame label="Projects" className="w-[180px]">
                    <div className="divide-y divide-[rgb(var(--fg-tint)/0.08)] px-1">
                      {SUPPORTING_PROJECTS.map((p) => (
                        <div key={p.title} className="px-2.5 py-3">
                          <p className="font-mono text-[8px] uppercase tracking-wide text-ink-500">{p.path}</p>
                          <p className="mt-1 text-[11px] font-medium leading-snug text-ink-100">{p.title}</p>
                          <span className="mt-1.5 flex items-center gap-1.5">
                            <DifficultyMeter level={p.difficulty} /> <span className="text-[9px] text-ink-500">{p.difficultyLabel}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </PhoneFrame>
                </div>
                <div className="relative -rotate-1">
                  <InterfaceFrame label={FEATURED_PROJECT.title}>
                    <ol className="space-y-4 p-6">
                      {FEATURED_PROJECT.steps.map((s, i) => (
                        <li key={s} className="flex gap-4">
                          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[0.35rem] bg-accent/12 font-mono text-xs text-accent-light">
                            {i + 1}
                          </span>
                          <span className="text-sm leading-relaxed text-ink-300">{s}</span>
                        </li>
                      ))}
                    </ol>
                  </InterfaceFrame>
                </div>
              </Reveal>
            </div>

            {/* On mobile (where the layered phone peek is hidden), the two
                supporting projects still get a real, if plainer, row - see
                the hidden sm:block phone frame above for the desktop
                treatment of this same data. */}
            <div className="mt-14 grid gap-6 border-t border-[rgb(var(--fg-tint)/0.1)] pt-10 sm:hidden">
              {SUPPORTING_PROJECTS.map((p) => (
                <div key={p.title}>
                  <p className="font-mono text-[10px] uppercase tracking-wide text-ink-500">{p.path}</p>
                  <h4 className="mt-1.5 font-display text-base font-semibold text-ink-100">{p.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{p.teaches}</p>
                  <span className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-ink-500">
                    <DifficultyMeter level={p.difficulty} /> {p.difficultyLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            SHOW YOUR WORK, Portfolio. The product itself, shown as a real
            interface excerpt (three actual project entries, in the exact
            title-wrapped, statused shape /portfolio renders), not a row of
            icon chips standing in for a description. */}
        <SectionDivider label="Show your work" />
        <section className="overflow-hidden bg-paper py-20">
          <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
            <div>
              <SectionHeading eyebrow="Portfolio" title="Turn learning into proof" align="left" />
              <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-500">
                Every completed project can become a portfolio piece: a README, a CV bullet, and a
                LinkedIn blurb, drafted from what you actually built and then yours to personalize
                before you publish or apply.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
                {[
                  { label: "Learning", icon: Compass },
                  { label: "Projects", icon: FolderGit2 },
                  { label: "Portfolio", icon: FileText },
                  { label: "Job applications", icon: Briefcase },
                ].map((step, i, arr) => (
                  <span key={step.label} className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-ink-400">
                      <step.icon className="h-3.5 w-3.5 text-accent-light" />
                      {step.label}
                    </span>
                    {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-ink-500" />}
                  </span>
                ))}
              </div>
              <Link href="/portfolio" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline">
                See the Portfolio Builder <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <Reveal className="perspective-scene relative pb-10 pl-6 sm:pb-14 sm:pl-10">
              <div className="absolute -bottom-2 -left-2 hidden -rotate-3 rounded-xl border border-[rgb(var(--fg-tint)/0.12)] bg-accent/10 p-4 shadow-raised sm:block">
                <p className="font-display text-2xl font-semibold text-ink-100">
                  {PORTFOLIO_ENTRIES.filter((e) => e.status === "Published").length}/{PORTFOLIO_ENTRIES.length}
                </p>
                <p className="mt-0.5 max-w-[9rem] text-xs leading-snug text-ink-500">projects published and ready to share</p>
              </div>
              <div className="relative rotate-1">
                <InterfaceFrame label="Your Portfolio">
                  <div className="divide-y divide-[rgb(var(--fg-tint)/0.08)]">
                    {PORTFOLIO_ENTRIES.map((entry) => (
                      <div key={entry.title} className="flex items-center gap-4 p-5">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-accent/10">
                          <FolderGit2 className="h-5 w-5 text-accent-light" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink-100">{entry.title}</p>
                          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-500">{entry.path}</p>
                        </div>
                        <span className="flex flex-shrink-0 items-center gap-1.5 text-xs text-ink-400">
                          <entry.icon className={cn("h-3.5 w-3.5", entry.status === "Published" ? "text-success" : "text-ink-500")} />
                          {entry.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </InterfaceFrame>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============================================================
            GET GUIDANCE, Mentorship. Large portrait crops of the two real
            mentors, full-width above the AI Mentor's own smaller, clearly
            subordinate section further down (AI as one feature, not the
            identity of the page). */}
        <SectionDivider label="Get guidance" />
        <section className="py-20">
          <div className="container-page">
            <SectionHeading
              eyebrow="Human mentorship"
              title="Sometimes you need a human."
              description="Get practical guidance from people who have done the work. Separate from the AI Mentor below: real professionals, paid, by design."
              align="left"
            />

            <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
              {/* Toriola: founder mentorship, real photo, real pricing.
                  Slightly wider column and a taller crop than the second
                  card, an asymmetric pairing rather than two identical
                  boxes, since she's the founder's own offering. */}
              <div className="overflow-hidden rounded-3xl border border-warm/25 bg-warm/[0.04]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/mentors/toriola.jpg"
                  alt="Toriola Opeyemi, CareerFound founder and mentor"
                  className="h-80 w-full object-cover object-top sm:h-[26rem]"
                />
                <div className="p-7">
                  <p className="font-display text-xl font-semibold text-ink-100">Toriola Opeyemi</p>
                  <p className="mt-0.5 text-sm text-ink-400">Software Engineer | Cybersecurity Expert</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {[
                      "Software Engineering",
                      "Cybersecurity",
                      "Cloud Security",
                      "DevSecOps",
                      "Cloud Engineering",
                      "Security Automation",
                    ].map((t) => (
                      <Badge key={t} tone="warm">{t}</Badge>
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-ink-500">
                    Direct, one-on-one mentorship: roadmap, project guidance, portfolio review, and interview
                    preparation, from CareerFound&apos;s founder.
                  </p>
                  <div className="mt-5 flex flex-col items-start gap-3 border-t border-warm/20 pt-4 sm:flex-row sm:items-baseline sm:justify-between">
                    <span>
                      <span className="text-2xl font-semibold text-ink-100">$200</span>
                      <span className="mt-0.5 block text-xs text-ink-500">or &#8358;250,000, 2 months</span>
                    </span>
                    <Link href="/mentorship" className="flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline">
                      Request mentorship <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Mobile Engineering Mentor: real photo, real pricing, real
                  name/experience now that they've been supplied - no
                  invented employer/ratings/testimonials/certifications.
                  "View profile" and "Request mentorship" are two distinct
                  actions (per the routing fix below): the first is a plain
                  link to this mentor's own profile at
                  /mentors/mobile-engineering-mentor, the second links to
                  the same profile with ?action=request, which that page
                  reads to open the mentorship request flow directly,
                  instead of both collapsing onto the generic /mentors
                  marketplace list the way "View profile" incorrectly did
                  before. */}
              <div className="overflow-hidden rounded-3xl border border-warm/25 bg-warm/[0.04] lg:mt-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/mentors/mobile-engineering-mentor.jpg"
                  alt="David Oladotun Egundey, a real CareerFound mobile engineering mentor"
                  className="h-72 w-full object-cover object-top sm:h-80"
                />
                <div className="p-7">
                  <p className="eyebrow">Mobile Engineering Mentor</p>
                  <p className="mt-1.5 font-display text-xl font-semibold text-ink-100">David Oladotun Egundey</p>
                  <p className="mt-0.5 text-sm text-ink-400">Mobile Engineer &middot; 4 years of experience</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {["Mobile Engineering", "Mobile Development", "App Development"].map((t) => (
                      <Badge key={t} tone="warm">{t}</Badge>
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-ink-500">
                    Practical guidance on mobile development: building real applications, structuring projects,
                    debugging, and preparing for a career in mobile engineering.
                  </p>
                  <div className="mt-5 flex flex-col items-start gap-3 border-t border-warm/20 pt-4 sm:flex-row sm:items-baseline sm:justify-between">
                    <span>
                      <span className="text-2xl font-semibold text-ink-100">$200</span>
                      <span className="mt-0.5 block text-xs text-ink-500">or &#8358;250,000, 2 months</span>
                    </span>
                    <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <Link href="/mentors/mobile-engineering-mentor" className="text-sm font-medium text-ink-400 hover:underline">
                        View profile
                      </Link>
                      <Link
                        href="/mentors/mobile-engineering-mentor?action=request"
                        className="flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline"
                      >
                        Request mentorship <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-[rgb(var(--fg-tint)/0.08)] pt-6">
              <p className="flex items-center gap-2 text-sm text-ink-500">
                <Users className="h-4 w-4 text-ink-400" />
                Prefer a shorter, cheaper session? The Mentor Marketplace has working professionals for
                portfolio reviews and mock interviews, filtered by career path.
              </p>
              <Link href="/mentors" className="ml-auto flex-shrink-0 text-sm font-medium text-accent-light hover:underline">
                Browse mentors
              </Link>
            </div>
          </div>
        </section>

        {/* AI Mentor: its own small, sophisticated section, deliberately
            plain (no glow, no "AI-powered everything" framing), and shown
            through the product interface rather than described in prose,
            so it reads as one feature among several, not the identity of
            the page. */}
        <section className="overflow-hidden py-16">
          <div className="container-page grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink-500">
                <Bot className="h-4 w-4" /> AI Mentor
              </p>
              <h3 className="mt-3 font-display text-h1 font-semibold tracking-tight text-ink-100">On call whenever you&apos;re stuck</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-500">
                Software, not a person: it gives hints before answers, reviews your code, and adjusts your
                roadmap when it notices you&apos;re struggling. One part of CareerFound, not the whole product.
              </p>
              <Badge className="mt-4">Included free</Badge>
            </div>
            <Reveal className="perspective-scene flex justify-center py-4 lg:justify-end">
              <div className="-rotate-2">
                <PhoneFrame label="AI Mentor">
                  <div className="flex h-full flex-col p-4">
                    {/* Career/roadmap context stays visible above the chat,
                        so the AI reads as grounded in this mentee's actual
                        path and phase, not a floating chatbot. */}
                    <div className="mb-3 flex items-center gap-2 rounded-lg border border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.03)] px-3 py-2">
                      <Shield className="h-3.5 w-3.5 flex-shrink-0 text-accent-light" />
                      <p className="min-w-0 truncate text-[11px] text-ink-400">
                        Cybersecurity &middot; Phase 10, Portfolio
                      </p>
                    </div>
                    <div className="space-y-2.5">
                      <div className="max-w-[85%] rounded-lg border-l-2 border-accent/40 bg-accent/[0.06] px-3 py-2 text-xs leading-relaxed text-ink-200">
                        My detection script flags everything as high severity. What am I missing?
                      </div>
                      <div className="ml-auto max-w-[85%] rounded-lg bg-[rgb(var(--fg-tint)/0.04)] px-3 py-2 text-xs leading-relaxed text-ink-300">
                        Check your severity thresholds first, not the notification code. What counts as
                        &ldquo;high&rdquo; in your log analyzer right now?
                      </div>
                    </div>
                  </div>
                </PhoneFrame>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============================================================
            JOB READY: a typographic transition, not five outcome cards.
            Learn -> Build -> Prove -> Apply -> Get hired, each word its
            own real destination, connected by an arrow (a chevron on
            mobile) rather than boxed and bulleted. Pricing, FAQ, and the
            final CTA follow. */}
        <SectionDivider label="Job ready" />
        <section className="bg-paper py-20 sm:py-28">
          <div className="container-page">
            <p className="eyebrow justify-center">What CareerFound is built for</p>
            <Reveal>
              <div className="mt-12 flex flex-col sm:flex-row sm:items-center">
                {READINESS_STAGES.map((s, i) => (
                  <div key={s.label} className="flex flex-1 flex-col items-center sm:flex-row">
                    <Link href={s.href} className="group block w-full py-6 text-center sm:py-2">
                      <p className="font-display text-3xl font-semibold tracking-tight text-ink-100 transition-colors duration-200 group-hover:text-accent-light sm:text-2xl lg:text-3xl">
                        {s.label}
                      </p>
                      <p className="mx-auto mt-2 max-w-[9rem] text-xs leading-snug text-ink-500 sm:max-w-[7rem]">{s.body}</p>
                    </Link>
                    {i < READINESS_STAGES.length - 1 && (
                      <>
                        <ArrowRight className="hidden h-4 w-4 flex-shrink-0 text-ink-300 sm:block" aria-hidden="true" />
                        <ChevronDown className="h-4 w-4 flex-shrink-0 text-ink-300 sm:hidden" aria-hidden="true" />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20">
          <div className="container-page">
            <SectionHeading eyebrow="Pricing" title="Start free. Upgrade when you're ready to accelerate." />
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {pricingTiers.map((tier) => (
                <Card key={tier.name} className={cn("relative flex flex-col p-8", tier.highlighted && "border-accent/40")}>
                  {tier.paid ? (
                    <Badge tone="warning" className="mb-4 w-fit">Paid service</Badge>
                  ) : tier.highlighted ? (
                    <Badge tone="accent" className="mb-4 w-fit">Most popular</Badge>
                  ) : null}
                  <h3 className="text-lg font-semibold text-ink-100">{tier.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-semibold text-ink-100">{tier.price}</span>
                    <span className="text-sm text-ink-500">{tier.period}</span>
                  </div>
                  {tier.priceAlt && <p className="mt-0.5 text-xs text-ink-500">or {tier.priceAlt}</p>}
                  <p className="mt-3 text-sm text-ink-500">{tier.description}</p>
                  <ul className="mt-6 flex-1 space-y-2.5 text-sm text-ink-300">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={tier.href} className="mt-8">
                    <Button variant={tier.highlighted ? "primary" : "secondary"} className="w-full">
                      {tier.cta}
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20">
          <div className="container-page max-w-3xl">
            <SectionHeading eyebrow="FAQ" title="Questions people ask before starting" />
            <div className="mt-10 space-y-3">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-xl border border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.03)] p-5 transition-colors open:bg-[rgb(var(--fg-tint)/0.05)]"
                >
                  <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg text-sm font-medium text-ink-100 marker:content-none">
                    {f.q}
                    <ChevronDown className="h-4 w-4 flex-shrink-0 text-ink-500 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-ink-500">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Closing statement: the poster headline's bookend, on the same
            fixed dark surface as the roadmap scene so the page opens and
            closes on its two strongest typographic moments. */}
        <section className="surface-ink relative overflow-hidden py-24">
          <span aria-hidden="true" className="scene-figure pointer-events-none absolute -bottom-10 -left-6 hidden text-[13rem] lg:block">
            06
          </span>
          <div className="container-page relative flex flex-col items-center gap-7 text-center">
            <p className="eyebrow justify-center text-[#c3d19a]">Ready when you are</p>
            <h2 className="max-w-2xl font-display text-poster font-semibold tracking-tight">
              Your next step is one honest assessment away.
            </h2>
            <Link href="/onboarding">
              <Button size="lg" className="gap-2">
                Find My Tech Path <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
