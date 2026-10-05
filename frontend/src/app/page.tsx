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
  Trophy,
  MessageSquare,
} from "lucide-react";
import { GlobalNav } from "@/components/layout/global-nav";
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
import { ReadinessDial } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { pricingTiers, faqs } from "@/lib/marketing-content";
import { CAREER_CATEGORIES, CAREER_PATH_COUNT, CAREER_ORDER } from "@/lib/career-categories";

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
// career-detail page itself reads), not written for this page. The full
// catalogue is still listed below by category for anyone who wants the complete
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
    summary: "The broad craft of designing, building, testing and maintaining software, before you choose to specialise in frontend, backend, full-stack or mobile.",
    difficulty: 3,
    entryRole: "Junior Software Engineer",
    tools: ["Python", "JavaScript", "Git/GitHub", "SQL"],
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity",
    icon: Shield,
    summary: "The broad foundation of security: how attacks work, how defences are built, and which specialisation fits you best.",
    difficulty: 3,
    entryRole: "Junior Security Analyst",
    tools: ["Wireshark", "Linux", "Python", "Nmap"],
  },
  {
    slug: "cloud-engineering",
    name: "Cloud Engineering",
    icon: Cloud,
    summary: "Build and run the cloud foundations software depends on: compute, storage, networking, access control and automation as code.",
    difficulty: 3,
    entryRole: "Junior Cloud Engineer",
    tools: ["AWS", "Azure", "Terraform", "Linux"],
  },
  {
    slug: "devops-engineering",
    name: "DevOps Engineering",
    icon: Workflow,
    summary: "Automate how software is built, tested, deployed and observed, so teams can ship often without breaking things.",
    difficulty: 3,
    entryRole: "Junior DevOps Engineer",
    tools: ["Docker", "GitHub Actions", "Kubernetes", "Terraform"],
  },
  {
    slug: "product-design",
    name: "Product Design",
    icon: PenTool,
    summary: "Own the whole product experience: frame the problem, design the flows, build the design system and ship alongside engineers.",
    difficulty: 2,
    entryRole: "Junior Product Designer",
    tools: ["Figma", "Design systems", "Prototyping"],
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

// The Discover scene's product excerpt: the real first chapter of the
// onboarding journey (frontend/src/lib/discovery.ts), same question, same
// options, same chapter names, not written for this page. `short` is the
// compact label the small phone frame uses.
const JOURNEY_CHAPTERS = ["Interests", "Strengths", "Working style", "Goals", "Technology", "Direction", "Starting point"];
const ASSESSMENT_QUESTION = "What could you lose a whole afternoon to?";
const ASSESSMENT_OPTIONS: { label: string; short: string; hint: string; icon: typeof Briefcase }[] = [
  { label: "Designing how things look and feel", short: "Designing interfaces", hint: "Layouts, type, interactions", icon: PenTool },
  { label: "Building things people use", short: "Building products", hint: "Apps, tools, products", icon: Code2 },
  { label: "Protecting systems, or testing how they break", short: "Protecting systems", hint: "Defence and attack", icon: Shield },
  { label: "Finding patterns in numbers", short: "Finding patterns", hint: "Charts, spreadsheets, trends", icon: BarChart3 },
  { label: "Automating repetitive work", short: "Automating work", hint: "Make the boring part run itself", icon: Workflow },
];

// An example result, shaped exactly like the real /assessment/results page
// (Career DNA, Best Match with a fit score, Strong Alternative, Wild Card).
// It is labelled as an example in the interface; the values are illustrative.
const RESULT_DNA = [
  { label: "Creativity", value: 78 },
  { label: "Communication", value: 74 },
  { label: "People", value: 66 },
  { label: "Problem solving", value: 52 },
  { label: "Systems", value: 44 },
  { label: "Mathematics", value: 40 },
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

// The full Cybersecurity roadmap, phase titles verbatim from
// backend/app/seed/roadmap_content.py (the "Phase N, " prefix is dropped
// because the interface numbers them itself). Nine complete and Phase 10
// active is the example state the roadmap scene shows.
const ROADMAP_PHASES = [
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
const ROADMAP_ACTIVE = 9; // zero-based index of "Portfolio"

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

// Career readiness. The five signals and their weights are the real ones
// (backend/app/services/readiness_service.py: knowledge 25%, projects 30%,
// portfolio 15%, interview 15%, practical 15%); the values are an example
// learner part-way through a path. Overall is the weighted sum, rounded.
const READINESS_SIGNALS = [
  { key: "knowledge_pct", label: "Knowledge", weight: 25, value: 72 },
  { key: "projects_pct", label: "Projects", weight: 30, value: 58 },
  { key: "portfolio_pct", label: "Portfolio", weight: 15, value: 40 },
  { key: "interview_pct", label: "Interview readiness", weight: 15, value: 35 },
  { key: "practical_pct", label: "Practical skills", weight: 15, value: 66 },
];
const READINESS_OVERALL = Math.round(READINESS_SIGNALS.reduce((n, r) => n + (r.value * r.weight) / 100, 0));
// The two lowest signals, with the app's own "what would move your score" lines.
const READINESS_NEXT = [
  "Try a real-world simulation scenario to build interview readiness.",
  "Generate a portfolio write-up for a completed project, it's a quick, high-leverage win.",
];

// The five-stage shape of the whole journey, in its plainest typographic
// form (Learn, Build, Prove, Apply, Get hired), each tied to a real page.
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
      <GlobalNav />
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
                <PhoneFrame label="Discover your direction, 01 / 07">
                  <div className="flex h-full flex-col justify-between p-4">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-wide text-ink-500">01 / 07 · Interests</p>
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
                          {o.short}
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
              { value: String(CAREER_CATEGORIES.length), label: "categories to filter by, from security to design" },
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
                <Link
                  key={cat.slug}
                  href={`/careers?category=${cat.slug}`}
                  className="focus-ring text-ink-400 transition-colors hover:text-accent-light"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            SCENE 03, DISCOVER. The real first chapter of onboarding, shown
            as a large product interface: the seven chapters down the left,
            the Interests question with real options on the right, and a
            running record of what you have told us. Typography on the left,
            product on the right: the first shift in rhythm after the hero. */}
        <SectionDivider label="Discover" className="pt-4" />
        <section id="how-it-works" className="overflow-hidden py-16 sm:py-24">
          <div className="container-page grid items-center gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
            <Reveal>
              <p className="eyebrow gap-2 text-ink-400">
                <Sparkles className="h-3.5 w-3.5" /> Discover your direction
              </p>
              <h2 className="mt-4 max-w-lg font-display text-display font-semibold tracking-tight text-ink-100">
                It starts with you, not a menu of jobs.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-500">
                Seven short chapters: what you could lose an afternoon to, what you are already good at,
                how you like to work, what you want from tech, which technology pulls you in, how clear your
                direction is and where you are starting from. Nothing is a trick question.
              </p>
              <Link href="/how-it-works" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline">
                Read the full walkthrough <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Reveal>

            <Reveal delayMs={120} className="perspective-scene relative pb-6 sm:pb-10">
              <div className="relative sm:-rotate-1">
                <InterfaceFrame label="Discover your direction, chapter 1 of 7">
                  <div className="grid sm:grid-cols-[11rem_1fr]">
                    <ol className="hidden border-r border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.025)] p-5 sm:block">
                      {JOURNEY_CHAPTERS.map((c, i) => (
                        <li key={c} className="flex items-baseline gap-3 py-1.5">
                          <span className={cn("w-5 font-mono text-[10px]", i === 0 ? "text-accent-light" : "text-ink-500")}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className={cn("font-display text-sm", i === 0 ? "font-semibold text-ink-100" : "text-ink-500")}>{c}</span>
                        </li>
                      ))}
                    </ol>
                    <div className="p-5 sm:p-7">
                      <p className="font-mono text-[10px] uppercase tracking-wide text-accent-light">01 / 07 · Interests</p>
                      <p className="mt-2 font-display text-xl font-semibold leading-snug tracking-tight text-ink-100 sm:text-2xl">
                        {ASSESSMENT_QUESTION}
                      </p>
                      <div className="mt-5">
                        {ASSESSMENT_OPTIONS.map((o, i) => {
                          const on = i === 0 || i === 1;
                          return (
                            <div
                              key={o.label}
                              className={cn(
                                "flex items-center gap-3 border-b py-2.5",
                                on ? "border-accent-light" : "border-[rgb(var(--fg-tint)/0.1)]"
                              )}
                            >
                              <span
                                className={cn(
                                  "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[3px] border",
                                  on ? "border-accent-light bg-accent-light text-[#0b0d0a]" : "border-[rgb(var(--fg-tint)/0.3)] text-transparent"
                                )}
                              >
                                <Check className="h-2.5 w-2.5" />
                              </span>
                              <span className="min-w-0">
                                <span className={cn("block text-sm font-medium leading-snug", on ? "text-ink-100" : "text-ink-300")}>{o.label}</span>
                                <span className="block text-[11px] text-ink-500">{o.hint}</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="mt-3 font-mono text-[10px] uppercase tracking-wide text-ink-500">2 of 5 chosen</p>
                    </div>
                  </div>
                </InterfaceFrame>
              </div>
              <div className="absolute -bottom-2 right-2 hidden w-52 rotate-2 rounded-xl border border-[rgb(var(--fg-tint)/0.12)] bg-paper p-4 shadow-raised sm:block lg:-right-4">
                <p className="font-mono text-[9px] uppercase tracking-wide text-ink-500">What we have heard so far</p>
                <ul className="mt-2 space-y-1 text-xs text-ink-300">
                  <li>Designing how things look and feel</li>
                  <li>Building things people use</li>
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============================================================
            SCENE 03b, THE RESULT. What the journey produces, shown as the
            real results interface (Career DNA, Best Match with a fit score
            and the reason in the person's own words, Strong Alternative,
            Wild Card) so "a match you can read" is demonstrated, not said.
            Labelled as an example. */}
        <SectionDivider label="Your match" />
        <section className="bg-paper py-16 sm:py-24">
          <div className="container-page grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
            <Reveal>
              <p className="eyebrow gap-2 text-ink-400">
                <Target className="h-3.5 w-3.5" /> Your result
              </p>
              <h2 className="mt-4 max-w-md font-display text-display font-semibold tracking-tight text-ink-100">
                A match you can read, not a quiz score.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-500">
                You get a Best Match, a Strong Alternative and a Wild Card from a different field, each with a
                fit score and the reason in your own words. Your Career DNA shows the shape of how you work, so
                you can see why, and disagree with it if you want to.
              </p>
              <p className="mt-6 text-xs leading-relaxed text-ink-500">
                Shown: an example result for someone who picked design and building in chapter one.
              </p>
            </Reveal>

            <Reveal delayMs={120}>
              <InterfaceFrame label="Your results, example">
                <div className="grid gap-0 sm:grid-cols-[1fr_15rem]">
                  <div className="p-6 sm:p-8">
                    <span className="inline-flex items-center gap-1.5 rounded-[0.25rem] bg-warm/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-warm">
                      <Trophy className="h-3 w-3" /> Best Match
                    </span>
                    <div className="mt-4 flex items-end justify-between gap-4">
                      <h3 className="font-display text-display font-semibold tracking-tight text-ink-100">UI/UX Design</h3>
                      <p className="flex-shrink-0 text-right">
                        <span className="font-display text-4xl font-semibold text-warm">87</span>
                        <span className="block font-mono text-[10px] uppercase tracking-wide text-ink-500">/ 100 fit</span>
                      </p>
                    </div>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-400">
                      This is your strongest match: designing interfaces that are easy and pleasant for people to
                      use. You told us you are drawn to designing how things look and feel and building things people use.
                    </p>
                    <p className="mt-4 font-mono text-[10px] uppercase tracking-wide text-ink-500">Entry roles</p>
                    <p className="mt-1 text-sm text-ink-300">Junior UX Designer, UI Designer</p>
                    <div className="mt-6 grid gap-px overflow-hidden rounded-lg border border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.1)] sm:grid-cols-2">
                      {[
                        { tier: "Strong Alternative", name: "Product Design", score: 85 },
                        { tier: "Wild Card", name: "Technical Writing", score: 77 },
                      ].map((r) => (
                        <div key={r.tier} className="bg-paper px-4 py-3">
                          <p className="font-mono text-[9px] uppercase tracking-wide text-ink-500">{r.tier}</p>
                          <p className="mt-1 flex items-baseline justify-between gap-2">
                            <span className="font-display text-base font-semibold text-ink-100">{r.name}</span>
                            <span className="font-mono text-xs text-ink-400">{r.score}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.025)] p-6 sm:border-l sm:border-t-0">
                    <p className="font-mono text-[10px] uppercase tracking-wide text-accent-light">Your Career DNA</p>
                    <ul className="mt-4 space-y-3.5">
                      {RESULT_DNA.map((d) => (
                        <li key={d.label}>
                          <div className="flex items-baseline justify-between text-xs">
                            <span className="text-ink-300">{d.label}</span>
                            <span className="font-mono text-ink-500">{d.value}</span>
                          </div>
                          <div className="mt-1.5 h-1 rounded-full bg-[rgb(var(--fg-tint)/0.1)]">
                            <div className="h-1 rounded-full bg-accent-light" style={{ width: `${d.value}%` }} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </InterfaceFrame>
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
                  {String(CAREER_ORDER.indexOf(FEATURED_CAREER.slug) + 1).padStart(2, "0")}
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
              {CATALOGUE.map((c) => (
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
                  <span className="font-display text-2xl text-ink-500 sm:text-3xl">{String(CAREER_ORDER.indexOf(c.slug) + 1).padStart(2, "0")}</span>
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

            {/* The rest of the library: all six fields with every career in
                them, so six featured rows read as a sample of a much larger
                catalogue rather than the whole of it. */}
            <div className="mt-20">
              <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b border-[rgb(var(--fg-tint)/0.14)] pb-5">
                <h3 className="font-display text-display font-semibold tracking-tight text-ink-100">
                  The full library: {CAREER_PATH_COUNT} careers.
                </h3>
                <p className="max-w-sm text-sm text-ink-500">
                  Every one has its own roadmap, projects, tools and entry roles. None repeats another.
                </p>
              </div>
              <div className="mt-8 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {CAREER_CATEGORIES.map((cat) => (
                  <div key={cat.slug}>
                    <div className="flex items-baseline justify-between gap-3">
                      <Link
                        href={`/careers?category=${cat.slug}`}
                        className="focus-ring font-display text-xl font-semibold tracking-tight text-ink-100 hover:text-accent-light"
                      >
                        {cat.name}
                      </Link>
                      <span className="font-mono text-[10px] uppercase tracking-wide text-ink-500">{cat.paths.length} careers</span>
                    </div>
                    <p className="mt-1 max-w-xs text-xs leading-relaxed text-ink-500">{cat.blurb}</p>
                    <ul className="mt-4 border-t border-[rgb(var(--fg-tint)/0.1)]">
                      {cat.paths.map((p) => (
                        <li key={p.slug} className="border-b border-[rgb(var(--fg-tint)/0.06)]">
                          <Link
                            href={`/careers/${p.slug}`}
                            className="focus-ring group flex items-center gap-3 py-2 text-sm text-ink-300 transition-colors hover:text-accent-light"
                          >
                            <p.icon className="h-3.5 w-3.5 flex-shrink-0 text-ink-500 group-hover:text-accent-light" aria-hidden="true" />
                            {p.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
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

            <div className="mt-14 grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
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

              <Reveal className="relative">
                <InterfaceFrame label="Cybersecurity roadmap" tone="ink">
                  <div className="border-b border-white/10 px-5 py-4 sm:px-6">
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="font-display text-lg font-semibold tracking-tight text-[#f4f5f0]">Cybersecurity</p>
                      <p className="font-mono text-[10px] uppercase tracking-wide text-white/50">
                        {ROADMAP_ACTIVE} of {ROADMAP_PHASES.length} phases complete
                      </p>
                    </div>
                    <div className="mt-3 flex gap-1" aria-hidden="true">
                      {ROADMAP_PHASES.map((t, i) => (
                        <span
                          key={t}
                          className={cn(
                            "h-1 flex-1 rounded-full",
                            i < ROADMAP_ACTIVE ? "bg-[#8fd18a]" : i === ROADMAP_ACTIVE ? "bg-[#c3d19a]" : "bg-white/12"
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-[1fr_1fr]">
                    <ol className="divide-y divide-white/[0.07] border-white/10 sm:border-r">
                      {ROADMAP_PHASES.map((title, i) => {
                        const state = i < ROADMAP_ACTIVE ? "done" : i === ROADMAP_ACTIVE ? "active" : "upcoming";
                        return (
                          <li key={title} className="flex items-center gap-3 px-5 py-2.5 sm:px-6">
                            <span className="w-5 font-mono text-[10px] text-white/35">{String(i + 1).padStart(2, "0")}</span>
                            <span
                              className={cn(
                                "min-w-0 flex-1 truncate text-sm",
                                state === "active" ? "font-medium text-[#f4f5f0]" : state === "done" ? "text-white/65" : "text-white/35"
                              )}
                            >
                              {title}
                            </span>
                            {state === "done" && <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-[#8fd18a]" aria-label="Complete" />}
                            {state === "active" && <span className="h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 border-[#c3d19a]" aria-label="In progress" />}
                            {state === "upcoming" && <Lock className="h-3 w-3 flex-shrink-0 text-white/30" aria-label="Locked" />}
                          </li>
                        );
                      })}
                    </ol>

                    <div className="border-t border-white/10 p-5 sm:border-t-0 sm:p-6">
                      <p className="font-mono text-[10px] uppercase tracking-wide text-[#c3d19a]">Now: Phase 10, Portfolio</p>
                      <p className="mt-2 text-xs leading-relaxed text-white/55">
                        Turn your completed projects into a portfolio that gets you interviews.
                      </p>
                      <ul className="mt-5 space-y-4">
                        <li className="flex gap-3">
                          <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-white/45" aria-hidden="true" />
                          <span>
                            <span className="block text-sm text-[#f4f5f0]">What makes a security portfolio stand out</span>
                            <span className="block font-mono text-[10px] uppercase tracking-wide text-white/40">Lesson · 15 min</span>
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <FolderGit2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#c3d19a]" aria-hidden="true" />
                          <span>
                            <span className="block text-sm text-[#f4f5f0]">{FEATURED_PROJECT.title}</span>
                            <span className="block font-mono text-[10px] uppercase tracking-wide text-white/40">Project · {FEATURED_PROJECT.difficultyLabel}</span>
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <Award className="mt-0.5 h-4 w-4 flex-shrink-0 text-white/45" aria-hidden="true" />
                          <span>
                            <span className="block text-sm text-[#f4f5f0]">Checkpoint: Portfolio</span>
                            <span className="block font-mono text-[10px] uppercase tracking-wide text-white/40">Quiz · pass at 70%</span>
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </InterfaceFrame>
                <p className="surface-ink-muted relative mt-4 text-xs leading-relaxed">
                  Every path has its own full set of phases like these, each with lessons, exercises, projects and a
                  checkpoint. These are the real phases of the Cybersecurity roadmap.
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
                  <p className="mt-0.5 text-sm text-ink-400">Cloud Security Mentor | Cloud Engineer</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {[
                      "Cloud Security",
                      "Cloud Engineering",
                      "AWS Security",
                      "Security Automation",
                      "DevSecOps",
                    ].map((t) => (
                      <Badge key={t} tone="warm">{t}</Badge>
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-ink-500">
                    One-on-one mentorship for cloud and security careers: your roadmap, hands-on cloud security
                    projects, portfolio review and interview preparation, from CareerFound&apos;s founder.
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
                Every mentor is a real person with a real profile. Filter by career path, read how they
                work, and request a session when one fits.
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
            JOB READY. The last layer of the product, shown as the real
            Tech Readiness Score (five weighted signals, what would move
            it up) next to a real interview simulation, so "job ready" is
            something you can measure and rehearse, not a closing slogan.
            The Learn / Build / Prove / Apply / Get hired line closes it. */}
        <SectionDivider label="Job ready" />
        <section className="bg-paper py-20 sm:py-28">
          <div className="container-page">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
              <Reveal>
                <p className="eyebrow gap-2 text-ink-400">
                  <Gauge className="h-3.5 w-3.5" /> Career readiness
                </p>
                <h2 className="mt-4 max-w-md font-display text-display font-semibold tracking-tight text-ink-100">
                  Know when you are ready, not just when you have finished.
                </h2>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-500">
                  Your Tech Readiness Score is built from five signals of your own activity: what you have learned,
                  built, published, rehearsed and proven. It tells you what would move it up next, and the
                  simulations are where you practise the part that is hardest to fake: thinking out loud under pressure.
                </p>
                <Link href="/pricing" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline">
                  Start free <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Reveal>

              <Reveal delayMs={120} className="grid gap-6 sm:grid-cols-[1.15fr_1fr]">
                <InterfaceFrame label="Tech Readiness Score, example">
                  <div className="p-6">
                    <div className="flex items-center justify-center">
                      <ReadinessDial
                        size={168}
                        overall={READINESS_OVERALL}
                        segments={READINESS_SIGNALS.map((r) => ({ key: r.key, label: r.label, value: r.value }))}
                      />
                    </div>
                    <ul className="mt-6 space-y-3">
                      {READINESS_SIGNALS.map((r) => (
                        <li key={r.key}>
                          <div className="flex items-baseline justify-between text-xs">
                            <span className="text-ink-300">
                              {r.label} <span className="font-mono text-[10px] text-ink-500">{r.weight}% of score</span>
                            </span>
                            <span className="font-mono text-ink-400">{r.value}%</span>
                          </div>
                          <div className="mt-1.5 h-1 rounded-full bg-[rgb(var(--fg-tint)/0.1)]">
                            <div className="h-1 rounded-full bg-accent-light" style={{ width: `${r.value}%` }} />
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 border-t border-[rgb(var(--fg-tint)/0.1)] pt-4">
                      <p className="text-xs font-medium text-ink-300">What would move your score up</p>
                      <ul className="mt-2 space-y-2 text-xs leading-relaxed text-ink-500">
                        {READINESS_NEXT.map((a) => (
                          <li key={a} className="flex gap-2">
                            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-accent" aria-hidden="true" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </InterfaceFrame>

                <InterfaceFrame label="Simulation, SOC triage" className="sm:mt-12">
                  <div className="p-6">
                    <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-accent-light">
                      <MessageSquare className="h-3 w-3" /> Real-world simulation
                    </p>
                    <p className="mt-3 font-display text-lg font-semibold leading-snug tracking-tight text-ink-100">
                      SOC Triage: Which alert do you investigate first?
                    </p>
                    <p className="mt-3 text-xs leading-relaxed text-ink-500">
                      You are a Tier 1 SOC analyst. Your SIEM has raised three alerts in the last 10 minutes.
                    </p>
                    <ul className="mt-4 space-y-2 text-xs leading-relaxed text-ink-300">
                      <li className="rounded-md border border-[rgb(var(--fg-tint)/0.1)] px-3 py-2">
                        <span className="font-mono text-ink-500">A</span> One failed admin login, from the usual office IP.
                      </li>
                      <li className="rounded-md border border-accent bg-accent/10 px-3 py-2 text-ink-100">
                        <span className="font-mono text-accent-light">B</span> 400 failed logins on one account in 2 minutes, from a country with no employees.
                      </li>
                      <li className="rounded-md border border-[rgb(var(--fg-tint)/0.1)] px-3 py-2">
                        <span className="font-mono text-ink-500">C</span> A file renamed on a marketing laptop at 2:15pm.
                      </li>
                    </ul>
                    <p className="mt-4 text-xs leading-relaxed text-ink-500">
                      Prioritising by volume, anomaly and business impact is the core triage skill.
                    </p>
                  </div>
                </InterfaceFrame>
              </Reveal>
            </div>

            <Reveal>
              <div className="mt-20 flex flex-col border-t border-[rgb(var(--fg-tint)/0.1)] pt-10 sm:flex-row sm:items-center">
                {READINESS_STAGES.map((s, i) => (
                  <div key={s.label} className="flex flex-1 flex-col items-center sm:flex-row">
                    <Link href={s.href} className="group block w-full py-5 text-center sm:py-2">
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
