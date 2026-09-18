import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
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
  MessageCircle,
  Gauge,
  Bot,
  CheckCircle2,
  Lock,
  FileText,
  Award,
} from "lucide-react";
import { MarketingNav } from "@/components/layout/marketing-nav";
import { Footer } from "@/components/layout/footer";
import { SectionHeading } from "@/components/marketing/section-heading";
import { SectionDivider } from "@/components/marketing/section-divider";
import { JourneySteps } from "@/components/marketing/journey-steps";
import { CareerExplorerSearch } from "@/components/marketing/career-explorer-search";
import { PathTrack, type PathWaypoint } from "@/components/marketing/path-track";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconTile } from "@/components/ui/icon-tile";
import { DifficultyMeter } from "@/components/ui/difficulty-meter";
import { cn } from "@/lib/utils";
import { steps, pricingTiers, faqs } from "@/lib/marketing-content";
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

// Six real paths, verbatim from backend/app/seed/career_paths.py, presented
// as a curated catalogue index rather than another row of icon cards. The
// full 21 are still listed below by category for anyone who wants the
// complete directory.
const CATALOGUE: {
  slug: string;
  name: string;
  icon: typeof Code2;
  summary: string;
  difficulty: number;
}[] = [
  {
    slug: "software-engineering",
    name: "Software Engineering",
    icon: Code2,
    summary: "Design, build, and maintain the applications and systems that power products people use every day.",
    difficulty: 3,
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity",
    icon: Shield,
    summary: "Protect organizations from attackers by finding, fixing, and defending against security weaknesses.",
    difficulty: 3,
  },
  {
    slug: "cloud-engineering",
    name: "Cloud Engineering",
    icon: Cloud,
    summary: "Set up and run computer systems that live on the internet instead of one physical machine.",
    difficulty: 3,
  },
  {
    slug: "devops",
    name: "DevOps",
    icon: Workflow,
    summary: "Make sure software gets built, tested, and delivered smoothly and reliably.",
    difficulty: 3,
  },
  {
    slug: "product-design",
    name: "Product Design",
    icon: PenTool,
    summary: "Shape how a product looks, feels, and solves a user's problem.",
    difficulty: 2,
  },
  {
    slug: "data-analysis",
    name: "Data Analysis",
    icon: BarChart3,
    summary: "Turn raw numbers into insights that help people make decisions.",
    difficulty: 2,
  },
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

const OUTCOMES = [
  { title: "Clarity on a path", body: "Stop guessing which tech career fits you and start with one that matches how you actually think and work.", icon: Target },
  { title: "A roadmap you can follow", body: "A staged plan for your chosen path, beginner through advanced, so you always know what to focus on next.", icon: Map },
  { title: "A portfolio of real work", body: "Projects you actually build and can show, not just courses you watched.", icon: Briefcase },
  { title: "Interview readiness", body: "Practice with the AI mentor and preparation material built around the questions your target role actually asks.", icon: MessageCircle },
  { title: "Access to human guidance", body: "A path to a real conversation, whether that's the mentor marketplace or 1:1 mentorship with Toriola, when software isn't enough.", icon: Users },
  { title: "Momentum, not overwhelm", body: "One clear next step at a time instead of a hundred open tabs and no plan.", icon: Gauge },
];

export default function LandingPage() {
  return (
    <>
      <MarketingNav />
      <main>
        {/* ============================================================
            DISCOVER — Hero. An editorial split, not a centered SaaS hero:
            copy on the left, a layered product composition on the right
            (the real 5-stage journey panel, plus a smaller offset stat
            card behind it for depth), instead of a single flat box. */}
        <section className="relative overflow-hidden border-b border-[rgb(var(--fg-tint)/0.08)] py-16 sm:py-24">
          <div className="bg-contour pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px]" />
          <div className="container-page grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
            <div>
              <p className="eyebrow gap-2 text-ink-400">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-light" aria-hidden="true" />
                Career discovery, for people breaking into tech
              </p>
              <h1 className="mt-5 max-w-xl font-display text-hero font-semibold tracking-tight text-ink-100">
                Find your tech career. Build the proof you did the work.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-300">
                Find the tech career that actually fits you, follow a roadmap built for it, and build
                real projects that prove you can do the work. When you want a second opinion, get
                guidance from an AI mentor or from Toriola directly.
              </p>
              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
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

            {/* Layered composition: a small offset stat chip sits behind
                the main panel (negative margin + slight rotation) so the
                hero reads as an assembled editorial spread rather than one
                flat bordered box. Both pieces show real, sourced numbers,
                not decorative filler. */}
            <div className="relative pb-10 pr-6 sm:pb-14 sm:pr-10">
              <div className="relative rounded-2xl border border-[rgb(var(--fg-tint)/0.12)] bg-[rgb(var(--fg-tint)/0.025)]">
                <div className="flex items-center justify-between border-b border-[rgb(var(--fg-tint)/0.1)] px-5 py-3">
                  <span className="font-mono text-[10px] uppercase tracking-wide text-ink-500">Your Career Path</span>
                  <Badge tone="accent">Discover</Badge>
                </div>
                <div className="p-6">
                  <PathTrack waypoints={heroWaypoints} orientation="vertical" size="sm" />
                </div>
              </div>

              {/* The offset stat chip: bottom-right, outside the panel's own
                  box (the wrapper's pb/pr padding reserves the room), so it
                  reads as a second layered piece instead of colliding with
                  the "Discover" badge in the panel header. */}
              <div className="absolute -bottom-2 -right-2 hidden w-40 rotate-2 rounded-xl border border-[rgb(var(--fg-tint)/0.12)] bg-base-950 p-4 shadow-raised sm:block">
                <p className="font-display text-2xl font-semibold text-ink-100">{CAREER_PATH_COUNT}</p>
                <p className="mt-0.5 text-xs leading-snug text-ink-500">real tech career paths, each with its own roadmap</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            UNDERSTAND — How it works. Left intro, right connected path,
            asymmetric rather than a centered heading over a centered
            list. */}
        <SectionDivider label="Understand" className="pt-16" />
        <section id="how-it-works" className="py-14">
          <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <SectionHeading eyebrow="How it works" title="From confused to job-ready, one clear step at a time" align="left" />
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-500">
                Four stages, each building on the last. No stage is optional and none of them are
                busywork, the roadmap and projects only exist because the assessment pointed you at
                a specific path.
              </p>
              <Link href="/how-it-works" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline">
                Read the full walkthrough <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <JourneySteps steps={steps} className="mx-0 max-w-none" />
          </div>
        </section>

        {/* ============================================================
            CHOOSE — Career Explorer. A real search box (filters the live
            catalog as you type) plus a curated, numbered index, in place
            of a spotlight-card grid. The full 21 are still listed below,
            grouped by discipline, as plain typography, not cards. */}
        <SectionDivider label="Choose" />
        <section id="careers" className="py-14">
          <div className="container-page">
            <SectionHeading
              eyebrow="Career paths"
              title="Where could your career take you?"
              description="We don't just ask what you want to learn, we help you discover what actually fits how you think and what you enjoy."
              align="left"
            />

            <div className="mt-10 max-w-2xl">
              <CareerExplorerSearch />
            </div>

            <div className="mt-16 border-t border-[rgb(var(--fg-tint)/0.08)]">
              {CATALOGUE.map((c, i) => (
                <Link
                  key={c.slug}
                  href={`/careers/${c.slug}`}
                  className="focus-ring group grid grid-cols-[3rem_1fr] gap-x-4 border-b border-[rgb(var(--fg-tint)/0.08)] py-7 sm:grid-cols-[4rem_1fr_auto] sm:items-center sm:gap-x-8"
                >
                  <span className="font-display text-2xl text-ink-500 sm:text-3xl">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
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
                  </div>
                  <span className="col-span-2 mt-4 flex items-center gap-1.5 text-sm font-medium text-accent-light sm:col-span-1 sm:mt-0">
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
            BUILD — Roadmap. CareerFound's signature progression visual,
            given its own full-width band on the green "mist" surface so it
            reads as a distinct moment, not another section on the default
            background. Real phase titles (from the Cybersecurity roadmap)
            stand in for what a phase list actually looks like once you're
            on a path: done, active, and locked/upcoming states. */}
        <SectionDivider label="Build" />
        <section className="bg-mist py-16">
          <div className="container-page">
            <SectionHeading eyebrow="Roadmap" title="Know what to learn next" description="Not a generic timeline: a staged plan for your specific path, with real phases you unlock in order." align="left" />
            <div className="mt-12 grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              <JourneySteps
                steps={roadmapStory.map((s) => ({ title: s.title, body: s.body, icon: s.icon }))}
                className="mx-0 max-w-none"
              />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wide text-ink-500">Example, inside the Cybersecurity roadmap</p>
                <div className="mt-4 divide-y divide-[rgb(var(--fg-tint)/0.1)] rounded-2xl border border-[rgb(var(--fg-tint)/0.1)] bg-base-950">
                  {samplePhases.map((phase) => (
                    <div key={phase.title} className="flex items-center gap-3 px-5 py-4">
                      {phase.state === "done" && <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success" />}
                      {phase.state === "active" && <span className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-accent-light" />}
                      {phase.state === "upcoming" && <Lock className="h-3.5 w-3.5 flex-shrink-0 text-ink-500" />}
                      <span
                        className={cn(
                          "text-sm",
                          phase.state === "active" ? "font-medium text-ink-100" : phase.state === "done" ? "text-ink-300" : "text-ink-500"
                        )}
                      >
                        {phase.title}
                      </span>
                      {phase.state === "active" && <Badge tone="accent" className="ml-auto">In progress</Badge>}
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-ink-500">
                  Every path has its own full set of phases like these, each with lessons, exercises, and projects. This
                  is a real excerpt, not a mockup.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Projects: an editorial portfolio composition (one large featured
            build, two smaller supporting ones) instead of a 3-card feature
            grid. Content is copied verbatim from the real project catalog,
            not written for this page. */}
        <section className="py-16">
          <div className="container-page">
            <SectionHeading eyebrow="Projects" title="We don't just tell you what to learn. We help you build proof." align="left" />
            <div className="mt-12 grid gap-12 lg:grid-cols-[1.3fr_1fr]">
              <div className="border-t-2 border-ink-100 pt-6">
                <p className="font-mono text-[11px] uppercase tracking-wide text-ink-500">{FEATURED_PROJECT.path} · {FEATURED_PROJECT.phase}</p>
                <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-100 sm:text-3xl">{FEATURED_PROJECT.title}</h3>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-400">{FEATURED_PROJECT.teaches}</p>
                <ol className="mt-6 space-y-2.5 text-sm text-ink-300">
                  {FEATURED_PROJECT.steps.map((s, i) => (
                    <li key={s} className="flex gap-3">
                      <span className="font-mono text-xs text-ink-500">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
                <span className="mt-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-ink-500">
                  <DifficultyMeter level={FEATURED_PROJECT.difficulty} /> {FEATURED_PROJECT.difficultyLabel}
                </span>
              </div>

              <div className="space-y-10">
                {SUPPORTING_PROJECTS.map((p) => (
                  <div key={p.title} className="border-t border-[rgb(var(--fg-tint)/0.1)] pt-5">
                    <p className="font-mono text-[10px] uppercase tracking-wide text-ink-500">{p.path}</p>
                    <h4 className="mt-1.5 font-display text-base font-semibold text-ink-100">{p.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-ink-500">{p.teaches}</p>
                    <span className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-ink-500">
                      <DifficultyMeter level={p.difficulty} /> {p.difficultyLabel}
                    </span>
                  </div>
                ))}
                <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline">
                  Browse every project <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            SHOW YOUR WORK — Portfolio. The flow from learning to proof,
            shown as a connected sequence rather than restated in prose. */}
        <SectionDivider label="Show your work" />
        <section className="bg-paper py-16">
          <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
            <div>
              <SectionHeading eyebrow="Portfolio" title="Turn learning into proof" align="left" />
              <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-500">
                Every completed project can become a portfolio piece: a README, a CV bullet, and a
                LinkedIn blurb, drafted from what you actually built and then yours to personalize
                before you publish or apply.
              </p>
              <Link href="/portfolio" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline">
                See the Portfolio Builder <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              {[
                { label: "Learning", icon: Compass },
                { label: "Projects", icon: FolderGit2 },
                { label: "Portfolio", icon: FileText },
                { label: "Job applications", icon: Briefcase },
              ].map((step, i, arr) => (
                <div key={step.label} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-[rgb(var(--fg-tint)/0.12)] bg-base-950 px-4 py-3">
                    <step.icon className="h-4 w-4 text-accent-light" />
                    <span className="font-medium text-ink-100">{step.label}</span>
                  </div>
                  {i < arr.length - 1 && <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-ink-500" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            GET GUIDANCE — Mentorship first (the premium, human, photo-led
            moment), AI Mentor second and visually subordinate: one section
            among several, not the dominant idea on the page. */}
        <SectionDivider label="Get guidance" />
        <section className="py-16">
          <div className="container-page">
            <SectionHeading eyebrow="Human mentorship" title="Sometimes you need a human" description="Get practical guidance from people who have done the work. Separate from the AI Mentor below: real professionals, paid, by design." align="left" />

            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              {/* Toriola: founder mentorship, real photo, real pricing. */}
              <div className="border-t-2 border-warm pt-6">
                <div className="flex gap-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/mentors/toriola.jpg"
                    alt="Toriola Opeyemi, CareerFound founder and mentor"
                    className="h-32 w-28 flex-shrink-0 rounded-xl object-cover object-top sm:h-40 sm:w-32"
                  />
                  <div className="min-w-0">
                    <p className="font-display text-lg font-semibold text-ink-100">Toriola Opeyemi</p>
                    <p className="mt-0.5 text-sm text-ink-400">Software Engineer | Cybersecurity Expert</p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {["Software Engineering", "Cybersecurity", "Cloud Security", "DevSecOps"].map((t) => (
                        <Badge key={t} tone="warm">{t}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-500">
                  Direct, one-on-one mentorship: roadmap, project guidance, portfolio review, and interview
                  preparation, from CareerFound&apos;s founder.
                </p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-ink-100">$200</span>
                  <span className="text-xs text-ink-500">or ₦250,000, 2 months</span>
                </div>
                <Link href="/mentorship" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline">
                  Request mentorship <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Mobile Engineering Mentor: real photo, real pricing, no
                  invented name/experience/employer. */}
              <div className="border-t-2 border-warm pt-6">
                <div className="flex gap-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/mentors/mobile-engineering-mentor.jpg"
                    alt="Mobile Engineering Mentor, a real CareerFound mentor"
                    className="h-32 w-28 flex-shrink-0 rounded-xl object-cover object-top sm:h-40 sm:w-32"
                  />
                  <div className="min-w-0">
                    <p className="font-display text-lg font-semibold text-ink-100">Mobile Engineering Mentor</p>
                    <p className="mt-0.5 text-sm text-ink-400">Mobile Engineer</p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {["Mobile Engineering", "Mobile Development", "App Development"].map((t) => (
                        <Badge key={t} tone="warm">{t}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-500">
                  Practical guidance on mobile development: building real applications, structuring projects,
                  debugging, and preparing for a career in mobile engineering.
                </p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-ink-100">$200</span>
                  <span className="text-xs text-ink-500">or ₦250,000, 2 months</span>
                </div>
                <Link href="/mentors" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline">
                  View profile <ArrowRight className="h-3.5 w-3.5" />
                </Link>
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

            {/* AI Mentor: deliberately smaller and plain (no glow, no
                "AI-powered everything" framing) so it reads as one part of
                the guidance story, not the headline act. */}
            <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.02)] p-6 sm:flex-row sm:items-center">
              <Bot className="h-5 w-5 flex-shrink-0 text-ink-400" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink-100">AI Mentor, on call whenever you&apos;re stuck</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-500">
                  Software, not a person: it gives hints before answers, reviews your code, and adjusts your
                  roadmap when it notices you&apos;re struggling. One part of CareerFound, not the whole product.
                </p>
              </div>
              <Badge className="flex-shrink-0">Included free</Badge>
            </div>
          </div>
        </section>

        {/* ============================================================
            JOB READY — Outcomes, pricing, FAQ, final CTA. */}
        <SectionDivider label="Job ready" />
        <section className="bg-paper py-16">
          <div className="container-page grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <SectionHeading
              eyebrow="What CareerFound is built for"
              title="What we're designed to help you achieve"
              description="These are the outcomes we design toward, not a guarantee or a claim about any specific user."
              align="left"
            />
            <div className="divide-y divide-[rgb(var(--fg-tint)/0.08)] border-y border-[rgb(var(--fg-tint)/0.08)]">
              {OUTCOMES.map((o) => (
                <div key={o.title} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                  <o.icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-light" />
                  <div>
                    <h3 className="text-h3 font-display font-semibold text-ink-100">{o.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{o.body}</p>
                  </div>
                </div>
              ))}
            </div>
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

        {/* Final CTA */}
        <section className="relative overflow-hidden border-t border-[rgb(var(--fg-tint)/0.08)] py-20">
          <div className="bg-contour pointer-events-none absolute inset-x-0 top-0 -z-10 h-full opacity-70" />
          <div className="container-page flex flex-col items-center gap-6 text-center">
            <p className="eyebrow justify-center">Ready when you are</p>
            <h2 className="max-w-lg font-display text-display font-semibold tracking-tight text-ink-100">
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
