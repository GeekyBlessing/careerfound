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
  Bot,
  Users,
} from "lucide-react";
import { GlobalNav } from "@/components/layout/global-nav";
import { Footer } from "@/components/layout/footer";
import { SectionHeading } from "@/components/marketing/section-heading";
import { SectionDivider } from "@/components/marketing/section-divider";
import { CareerExplorerSearch } from "@/components/marketing/career-explorer-search";
import { Reveal } from "@/components/marketing/reveal";
import { Parallax } from "@/components/marketing/parallax";
import { StageLine } from "@/components/marketing/stage-line";
import { Laptop, Monitor, Phone, Tablet } from "@/components/devices/devices";
import { PhotoBackdrop } from "@/components/devices/photo-backdrop";
import {
  AssessmentScreen,
  DashboardScreen,
  InterviewScreen,
  LabCurriculumScreen,
  MatchesScreen,
  MentorChatScreen,
  MentorshipScreen,
  PhoneAssessmentScreen,
  PhoneLabScreen,
  PhonePortfolioScreen,
  PhoneRoadmapScreen,
  PortfolioScreen,
  PublishScreen,
  ReadinessScreen,
  RoadmapScreen,
  WorkspaceScreen,
} from "@/components/screens/screens";
import { JOURNEY } from "@/components/screens/example";
import {
  MatchFragment,
  PortfolioFragment,
  ProjectFragment,
  RoadmapFragment,
  SkillsFragment,
  StageFragment,
} from "@/components/home/fragments";
import { LabProgress } from "@/components/home/lab-progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DifficultyMeter } from "@/components/ui/difficulty-meter";
import { cn } from "@/lib/utils";
import { pricingTiers, faqs } from "@/lib/marketing-content";
import { CAREER_CATEGORIES, CAREER_PATH_COUNT, CAREER_ORDER } from "@/lib/career-categories";
import lab from "@/data/lab-cybersecurity.json";

export const metadata: Metadata = {
  title: "CareerFound: Find your tech career, step by step",
  description:
    "Discover your tech career, get a personalized roadmap, build real projects, and become job-ready. Start with a free honest assessment, no credit card required.",
  alternates: { canonical: "/" },
};

// Staged entrance for the hero's pieces: plain CSS (no client JS), each piece
// arriving a beat after the last so the composition assembles rather than
// appearing all at once. Reduced motion collapses the duration globally.
const enter = "animate-fade-in-up [animation-fill-mode:both]";

const LAB_PROJECT_COUNT = lab.levels.reduce((n, l) => n + l.projects.length, 0);

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
// The spotlight is the career the Project Lab is built around; the rest follow
// the catalogue's own order. Rows are numbered by their place in this sample.
const SPOTLIGHT_SLUG = "cybersecurity";
CATALOGUE.sort((a, b) => {
  const rank = (slug: string) => (slug === SPOTLIGHT_SLUG ? -1 : CAREER_ORDER.indexOf(slug));
  return rank(a.slug) - rank(b.slug);
});
const FEATURED_CAREER = CATALOGUE[0]!;
const SECONDARY_CAREERS = CATALOGUE.slice(1, 4);

export default function LandingPage() {
  return (
    <>
      <GlobalNav />
      <main>
        {/* ============================================================
            HERO. Poster headline on the left; on the right a large laptop
            running the real dashboard, a phone behind it, and three
            fragments of the interface lifted out at full size and anchored
            to the laptop's edges. The person photograph (supplied by the
            team, see lib/photos.ts) sits behind the devices when present;
            until then the composition is device-led. */}
        <section className="relative overflow-hidden border-b border-[rgb(var(--fg-tint)/0.08)] pb-0 pt-14 sm:pt-20">
          <div className="bg-contour pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px]" />
          <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-4">
            <div className="relative z-20 lg:pb-10">
              <p className="eyebrow gap-2 text-ink-400">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-light" aria-hidden="true" />
                Career discovery, for people breaking into tech
              </p>
              <h1 className="mt-6 max-w-[27rem] font-display text-[clamp(2.9rem,1.7rem+3.4vw,4.4rem)] font-semibold leading-[1.0] tracking-[-0.03em] text-ink-100">
                Find your tech career.
                <br />
                <span className="text-accent-light">Build the proof</span> you did the work.
              </h1>
              <p className="mt-7 max-w-sm text-deck leading-relaxed text-ink-300">
                Find the tech career that actually fits you, follow a roadmap built for it, and build
                real projects that prove you can do the work. When you want a second opinion, get
                guidance from an AI mentor or from a real mentor.
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

            {/* Wide screens: laptop foreground, the AI Mentor on a phone
                behind and above it, three fragments anchored to the
                laptop's edges (skills above-left, portfolio below-left,
                a career match lower right). Nothing here repeats what the
                laptop screen already shows. */}
            <div className="relative hidden sm:block lg:ml-4 lg:-mr-[max(2rem,calc((100vw-72rem)/2+2rem))]">
              <Parallax range={16} className="pointer-events-none absolute -right-6 -top-10 bottom-10 left-[22%]">
                <PhotoBackdrop slot="hero" bare fade="left" className="h-full w-full" />
              </Parallax>
              <div className={cn(enter, "absolute right-[3%] top-[-12%] z-0 w-[20%] rotate-[5deg]")} style={{ animationDelay: "380ms" }}>
                <Phone label="CareerFound on a phone: the AI Mentor helping break down an AWS security project. Example conversation.">
                  <MentorChatScreen />
                </Phone>
              </div>
              <div className={cn(enter, "relative z-10 mt-[10%] w-[90%] transition-transform duration-500 ease-smooth hover:-translate-y-1")} style={{ animationDelay: "120ms" }}>
                <Laptop label="CareerFound on a laptop: a Cybersecurity roadmap at 68 percent complete and a Project Lab project in progress. Example data.">
                  <DashboardScreen />
                </Laptop>
              </div>
              <Parallax range={10} className="absolute left-[3%] top-[0%] z-20 hidden w-[15.5rem] lg:block">
                <div className={enter} style={{ animationDelay: "620ms" }}>
                  <SkillsFragment />
                </div>
              </Parallax>
              <Parallax range={-12} className="absolute -bottom-12 left-[9%] z-20 hidden w-[17rem] lg:block">
                <div className={enter} style={{ animationDelay: "760ms" }}>
                  <PortfolioFragment />
                </div>
              </Parallax>
              <Parallax range={-14} className="absolute bottom-[-6%] right-[6%] z-20 w-[16rem]">
                <div className={enter} style={{ animationDelay: "880ms" }}>
                  <MatchFragment />
                </div>
              </Parallax>
            </div>

            {/* Phones: a recomposition, not a shrunken laptop. One phone big
                enough to read, with two fragments overlapping it at full size. */}
            <div className="relative mx-auto w-full max-w-[21rem] pb-24 pt-14 sm:hidden">
              <div className={cn(enter, "ml-[2%] w-[66%]")} style={{ animationDelay: "100ms" }}>
                <Phone label="CareerFound on a phone: your career matches, with Cloud Security at 92 percent">
                  <MatchesScreen />
                </Phone>
              </div>
              <div className={cn(enter, "absolute right-0 top-0 w-[60%]")} style={{ animationDelay: "420ms" }}>
                <RoadmapFragment />
              </div>
              <div className={cn(enter, "absolute bottom-0 left-0 w-[90%]")} style={{ animationDelay: "640ms" }}>
                <ProjectFragment />
              </div>
            </div>
          </div>

          <p className="container-page mt-10 text-[11px] text-ink-500 sm:mt-6">
            Screens are the real CareerFound interface with an example learner. Progress and scores shown are examples.
          </p>

          <div className="container-page mt-8 grid grid-cols-2 gap-6 border-t border-[rgb(var(--fg-tint)/0.08)] py-8 sm:grid-cols-4">
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
            DISCOVER. A person answering the assessment on a tablet, the
            real first chapter of onboarding on its screen, and the result
            (a phone) overlapping it. On phones it recomposes to one phone
            and one fragment. */}
        <SectionDivider label="Discover" className="pt-4" />
        <section id="how-it-works" className="overflow-hidden py-16 sm:py-24">
          <div className="container-page grid items-center gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:gap-10">
            <Reveal className="relative z-10">
              <p className="eyebrow gap-2 text-ink-400">01 · Discover</p>
              <h2 className="mt-4 max-w-md font-display text-display font-semibold tracking-tight text-ink-100">
                Start with what fits you, not a list of jobs.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-500">
                Seven short chapters on how you think, what you enjoy and where you are starting from. The
                result is a ranked set of careers with a fit score for each, not a menu to browse and guess at.
              </p>
              <ul className="mt-6 max-w-md space-y-2 text-sm text-ink-300">
                {["Interests, strengths and working style", "Goals, technology and starting point", "A Best Match, a Strong Alternative and a Wild Card"].map((t) => (
                  <li key={t} className="flex items-start gap-2.5"><Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-light" />{t}</li>
                ))}
              </ul>
              <Link href="/onboarding" className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline">
                Take the assessment <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Reveal>

            <Reveal delayMs={120} className="relative">
              <div className="relative hidden pb-12 sm:block">
                <Parallax range={14}>
                  <PhotoBackdrop slot="discover" bare className="absolute inset-x-0 top-0 h-[88%]" fade="bottom" />
                </Parallax>
                <div className="relative w-[84%]">
                  <Tablet label="CareerFound on a tablet: the career assessment asking what you could lose a whole afternoon to. Example data.">
                    <AssessmentScreen />
                  </Tablet>
                </div>
                <div className="absolute -bottom-2 right-0 z-10 w-[27%] rotate-[4deg]">
                  <Phone label="CareerFound on a phone: your strongest matches, Cloud Security 92 percent, Cloud Engineering 87 percent, Cybersecurity 82 percent. Example data.">
                    <MatchesScreen />
                  </Phone>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-[21rem] pb-20 sm:hidden">
                <div className="w-[68%]">
                  <Phone label="CareerFound on a phone: the career assessment. Example data.">
                    <PhoneAssessmentScreen />
                  </Phone>
                </div>
                <MatchFragment className="absolute bottom-0 right-0 w-[78%]" />
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
                  <span className="font-display text-2xl text-ink-500 sm:text-3xl">{String(CATALOGUE.indexOf(c) + 1).padStart(2, "0")}</span>
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
            LEARN. The one fixed-dark band on the page. The whole journey
            as large editorial type whose stages light up in turn, beside
            the real roadmap running on a laptop. */}
        <SectionDivider label="Learn" />
        <section className="surface-ink relative overflow-hidden py-20 sm:py-28">
          <div className="container-page relative grid items-start gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-8">
            <div>
              <p className="eyebrow justify-start text-[#c3d19a]">02 · The path</p>
              <h2 className="mt-3 max-w-md font-display text-display font-semibold tracking-tight">Know what to learn next.</h2>
              <p className="surface-ink-muted mt-4 max-w-md text-sm leading-relaxed">
                One connected line from the first question to a job-ready portfolio. Every stage is a real part of
                CareerFound, and each one starts where the last one left off.
              </p>
              <div className="mt-10">
                <StageLine stages={JOURNEY} tone="ink" />
              </div>
            </div>

            <Reveal className="relative lg:sticky lg:top-28">
              <div className="hidden pb-8 sm:block lg:-mr-24 lg:mt-24">
                <div className="w-[96%] transition-transform duration-500 ease-smooth hover:-translate-y-1">
                  <Laptop label="CareerFound on a laptop: the Cybersecurity roadmap, seven phases complete and Cloud Security in progress. Example data.">
                    <RoadmapScreen />
                  </Laptop>
                </div>
              </div>
              <div className="mx-auto w-full max-w-[19rem] sm:hidden">
                <Phone label="CareerFound on a phone: the Cybersecurity roadmap, seven phases complete and Cloud Security in progress. Example data.">
                  <PhoneRoadmapScreen />
                </Phone>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============================================================
            BUILD. The strongest section. The Project Lab is the proof
            engine, so it gets the widest composition on the page: a person
            at a laptop (photo, once supplied) with the real curriculum on a
            monitor and the real project workspace on a laptop in front. */}
        <SectionDivider label="Build" />
        <section className="overflow-hidden bg-paper py-20 sm:py-28">
          <div className="container-page">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
              <Reveal>
                <p className="eyebrow gap-2 text-ink-400">03 · Project Lab</p>
                <h2 className="mt-4 max-w-xl font-display text-hero font-semibold tracking-tight text-ink-100">
                  Build the proof, not just the lessons.
                </h2>
                <p className="mt-6 max-w-lg text-deck leading-relaxed text-ink-300">
                  {LAB_PROJECT_COUNT} Cybersecurity projects across four levels, from a port scanner you write in an
                  afternoon to a cloud security operations platform. Each one ends in the same place: a public
                  repository, a README, a portfolio entry and your own interview answers.
                </p>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-500">
                  CareerFound checks that your evidence exists. It does not run or grade your code, and it says so.
                </p>
                <Link href="/projects" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline">
                  See the Project Lab <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Reveal>
              <Reveal delayMs={140}>
                <LabProgress />
              </Reveal>
            </div>

            <Reveal className="relative mt-16 lg:-mx-14">
              <div className="relative hidden sm:block">
                <Parallax range={18}>
                  <PhotoBackdrop slot="projectLab" bare fade="bottom" className="absolute inset-x-0 top-0 h-[80%]" />
                </Parallax>
                <div className="relative grid grid-cols-12 items-end pb-[6%]">
                  <div className="col-span-8 col-start-1 row-start-1 transition-transform duration-500 ease-smooth hover:-translate-y-1">
                    <Monitor label="CareerFound on a monitor: the Project Lab curriculum, twelve Cybersecurity projects in four levels. Example data.">
                      <LabCurriculumScreen />
                    </Monitor>
                  </div>
                  <div className="relative z-10 col-span-6 col-start-7 row-start-1 translate-y-[10%] self-end transition-transform duration-500 ease-smooth hover:-translate-y-0">
                    <Laptop label="CareerFound on a laptop: the Network Reconnaissance Tool project, build and test done, document, GitHub, portfolio and interview still ahead. Example data.">
                      <WorkspaceScreen />
                    </Laptop>
                  </div>
                </div>
                <SkillsFragment className="absolute -top-8 left-[44%] z-20 hidden w-[16rem] lg:block" />
              </div>

              <div className="relative mx-auto w-full max-w-[21rem] pb-16 sm:hidden">
                <div className="w-[70%]">
                  <Phone label="CareerFound on a phone: the Network Reconnaissance Tool project, build and test done. Example data.">
                    <PhoneLabScreen />
                  </Phone>
                </div>
                <SkillsFragment className="absolute right-0 top-10 w-[62%]" />
                <ProjectFragment className="absolute bottom-0 left-0 w-[90%]" />
              </div>
            </Reveal>

            <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-[rgb(var(--fg-tint)/0.14)] pt-8 sm:mt-28 sm:grid-cols-4">
              {[
                { k: String(LAB_PROJECT_COUNT), v: "projects in the Cybersecurity track" },
                { k: "4", v: "levels: Beginner, Intermediate, Advanced, Job Ready" },
                { k: "6", v: "evidence stages from Started to Interview ready" },
                { k: "1", v: "career built end to end first, before any other" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="font-display text-4xl font-semibold tracking-tight text-ink-100">{s.k}</dt>
                  <dd className="mt-1 max-w-[14rem] text-xs leading-snug text-ink-500">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ============================================================
            DOCUMENT AND PUBLISH. The README Builder and the GitHub
            evidence checks, on a tablet, with the three real checks lifted
            out beside it. */}
        <SectionDivider label="Document and publish" />
        <section className="overflow-hidden py-20 sm:py-28">
          <div className="container-page grid items-center gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
            <Reveal className="relative order-2 lg:order-1">
              <div className="relative hidden pb-10 sm:block">
                <div className="w-[92%] transition-transform duration-500 ease-smooth hover:-translate-y-1">
                  <Tablet label="CareerFound on a tablet: publishing a project, with a public GitHub repository, a README and three commits checked. Example data.">
                    <PublishScreen />
                  </Tablet>
                </div>
                <StageFragment className="absolute -bottom-2 right-0 z-10 w-[15rem]" />
              </div>
              <div className="relative mx-auto w-full max-w-[21rem] pb-4 sm:hidden">
                <StageFragment />
              </div>
            </Reveal>

            <Reveal delayMs={100} className="order-1 lg:order-2">
              <p className="eyebrow gap-2 text-ink-400">04 · Document, publish</p>
              <h2 className="mt-4 max-w-md font-display text-display font-semibold tracking-tight text-ink-100">
                Finished work no one can see is not proof.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-500">
                The README Builder turns your own answers into a README you can edit. Then the project goes on a
                public GitHub repository, and CareerFound checks the three things a reviewer looks for first.
              </p>
              <ol className="mt-7 max-w-md divide-y divide-[rgb(var(--fg-tint)/0.1)] border-y border-[rgb(var(--fg-tint)/0.1)]">
                {[
                  ["Document", "A README that explains the tool and its limits, written from what you actually built."],
                  ["Publish", "A public repository with a README and at least three commits, so the history is real."],
                  ["Honest by design", "We check that this evidence exists. We do not run or grade your code."],
                ].map(([t, b]) => (
                  <li key={t} className="py-3.5">
                    <p className="font-display text-lg font-semibold tracking-tight text-ink-100">{t}</p>
                    <p className="mt-1 text-sm leading-snug text-ink-500">{b}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        {/* ============================================================
            SHOWCASE. The portfolio as a person would show it. */}
        <SectionDivider label="Showcase" />
        <section className="overflow-hidden bg-paper py-20 sm:py-28">
          <div className="container-page grid items-center gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:gap-10">
            <Reveal>
              <p className="eyebrow gap-2 text-ink-400">05 · Showcase</p>
              <h2 className="mt-4 max-w-md font-display text-display font-semibold tracking-tight text-ink-100">
                A portfolio that is the work itself.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-500">
                Every published project becomes an entry: what you built, the skills it used, and links to the
                repository, the README and the case study. Nothing is padded, because every entry traces back to
                evidence you produced.
              </p>
              <Link href="/portfolio" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline">
                Build your portfolio <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Reveal>
            <Reveal delayMs={120} className="relative">
              <div className="relative hidden pb-8 sm:block lg:-mr-16">
                <Parallax range={14}>
                  <PhotoBackdrop slot="portfolio" bare fade="left" className="absolute inset-y-0 right-0 w-[60%]" />
                </Parallax>
                <div className="relative w-[94%] transition-transform duration-500 ease-smooth hover:-translate-y-1">
                  <Laptop label="CareerFound on a laptop: a published portfolio for a Cybersecurity Engineer with three projects. Example data.">
                    <PortfolioScreen />
                  </Laptop>
                </div>
                <div className="absolute -bottom-6 right-[1%] z-10 hidden w-[17%] rotate-[4deg] lg:block">
                  <Phone label="CareerFound on a phone: the same published portfolio. Example data.">
                    <PhonePortfolioScreen />
                  </Phone>
                </div>
              </div>
              <div className="relative mx-auto w-full max-w-[21rem] pb-16 sm:hidden">
                <div className="w-[70%]">
                  <Phone label="CareerFound on a phone: a published portfolio with three projects. Example data.">
                    <PhonePortfolioScreen />
                  </Phone>
                </div>
                <PortfolioFragment className="absolute bottom-0 right-0 w-[78%]" />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============================================================
            GUIDANCE. Humans first and large: real portraits, real names,
            real prices. The AI Mentor follows as one part of the product,
            smaller and plainly labelled as software. */}
        <SectionDivider label="Guidance" />
        <section className="overflow-hidden py-20 sm:py-28">
          <div className="container-page">
            <Reveal>
              <p className="eyebrow gap-2 text-ink-400">
                <Users className="h-3.5 w-3.5" /> 06 · Human mentorship
              </p>
              <h2 className="mt-4 max-w-3xl font-display text-hero font-semibold tracking-tight text-ink-100">
                Real people.
                <br />
                Real guidance.
              </h2>
              <p className="mt-6 max-w-lg text-deck leading-relaxed text-ink-300">
                Some questions need someone who has done the job. Every mentor here is a real, named professional
                with a profile you can read before you ask for a session.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-10">
              <Reveal className="lg:col-span-7">
                <article>
                  <div className="relative">
                    <div className="relative overflow-hidden rounded-3xl bg-[rgb(var(--color-accent-mist))]">
                      <Parallax range={-12}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/mentors/toriola.jpg"
                          alt="Toriola Opeyemi, CareerFound founder and mentor"
                          className="aspect-[4/5] w-full scale-[1.06] object-cover object-[50%_18%] sm:aspect-[4/4.2]"
                        />
                      </Parallax>
                      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
                      <div className="absolute bottom-5 left-5 right-5 text-white">
                        <p className="font-mono text-[11px] uppercase tracking-wide text-white/75">Founder and mentor</p>
                        <p className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Toriola Opeyemi</p>
                      </div>
                    </div>
                    <div className="absolute -bottom-14 right-5 hidden w-[24%] rotate-[3deg] md:block">
                      <Phone label="CareerFound on a phone: requesting mentorship from Toriola Opeyemi, Cloud Security Mentor and Cloud Engineer.">
                        <MentorshipScreen />
                      </Phone>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end md:pr-[28%]">
                    <div>
                      <p className="text-sm font-medium text-ink-200">Cloud Security Mentor | Cloud Engineer</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {["Cloud Security", "Cloud Engineering", "AWS Security", "DevSecOps"].map((t) => (
                          <Badge key={t} tone="warm">{t}</Badge>
                        ))}
                      </div>
                      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-500">
                        One-on-one mentorship for cloud and security careers: your roadmap, hands-on cloud security
                        projects, portfolio review and interview preparation.
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-2xl font-semibold text-ink-100">$200</p>
                      <p className="text-xs text-ink-500">or &#8358;250,000, 2 months</p>
                      <Link href="/mentorship" className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline">
                        Request mentorship <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>

              <Reveal delayMs={140} className="lg:col-span-5 lg:mb-24">
                <article>
                  <div className="relative overflow-hidden rounded-3xl bg-[rgb(var(--color-accent-mist))]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/mentors/mobile-engineering-mentor.jpg"
                      alt="David Oladotun Egundey, a real CareerFound mobile engineering mentor"
                      className="aspect-[4/5] w-full object-cover object-[50%_20%]"
                    />
                    <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <p className="font-mono text-[11px] uppercase tracking-wide text-white/75">Mobile Engineering Mentor</p>
                      <p className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">David Oladotun Egundey</p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm font-medium text-ink-200">Mobile Engineer &middot; 4 years of experience</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {["Mobile Engineering", "App Development"].map((t) => (
                      <Badge key={t} tone="warm">{t}</Badge>
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-ink-500">
                    Practical guidance on building real applications, structuring projects, debugging, and
                    preparing for a career in mobile engineering.
                  </p>
                  <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                    <span><span className="text-2xl font-semibold text-ink-100">$200</span> <span className="text-xs text-ink-500">or &#8358;250,000, 2 months</span></span>
                    <span className="flex items-center gap-4">
                      <Link href="/mentors/mobile-engineering-mentor" className="text-sm font-medium text-ink-400 hover:underline">View profile</Link>
                      <Link href="/mentors/mobile-engineering-mentor?action=request" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline">
                        Request mentorship <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </span>
                  </div>
                </article>
              </Reveal>
            </div>

            <div className="mt-14 flex flex-wrap items-center gap-4 border-t border-[rgb(var(--fg-tint)/0.08)] pt-6">
              <p className="flex items-center gap-2 text-sm text-ink-500">
                <Users className="h-4 w-4 text-ink-400" />
                More mentors join as they are reviewed and verified. Filter by career path and read how each one works.
              </p>
              <Link href="/mentors" className="ml-auto flex-shrink-0 text-sm font-medium text-accent-light hover:underline">
                Browse mentors
              </Link>
            </div>
          </div>
        </section>

        {/* AI Mentor: one part of the product, shown as the real chat. */}
        <section className="overflow-hidden bg-paper py-16 sm:py-20">
          <div className="container-page grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <Reveal className="relative flex justify-center">
              <div className="w-[16rem] -rotate-2 sm:w-[17rem]">
                <Phone label="CareerFound on a phone: the AI Mentor asking what you are working on and helping break down an AWS security project. Example conversation.">
                  <MentorChatScreen />
                </Phone>
              </div>
            </Reveal>
            <Reveal delayMs={100}>
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink-500">
                <Bot className="h-4 w-4" /> AI Mentor
              </p>
              <h3 className="mt-3 max-w-md font-display text-h1 font-semibold tracking-tight text-ink-100">
                And on call at 11pm, when you are stuck.
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-500">
                Software, not a person: it gives hints before answers, knows which phase and project you are on,
                and adjusts your roadmap when it notices you struggling. One part of CareerFound, not the whole product.
              </p>
              <Badge className="mt-4">Included free</Badge>
            </Reveal>
          </div>
        </section>

        {/* ============================================================
            INTERVIEW AND JOB READY. */}
        <SectionDivider label="Interview and job ready" />
        <section className="overflow-hidden py-20 sm:py-28">
          <div className="container-page grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
            <Reveal>
              <p className="eyebrow gap-2 text-ink-400">07 · Interview, job ready</p>
              <h2 className="mt-4 max-w-md font-display text-display font-semibold tracking-tight text-ink-100">
                Know when you are ready, not just when you have finished.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-500">
                Each project comes with the questions an interviewer will ask about it, and you write the answers
                in your own words. Your Career Readiness Score is built from seven signals of your own activity:
                what you have learned, built, documented, proven, published and rehearsed. Skills you only list yourself
                and certifications you only claim never raise it. It shows exactly why the score is what it is, and the one
                thing that would move it most.
              </p>
              <Link href="/pricing" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline">
                Start free <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Reveal>
            <Reveal delayMs={120} className="relative">
              <div className="mx-auto flex max-w-[34rem] items-start justify-center gap-5 sm:gap-8 lg:max-w-none lg:justify-end">
                <div className="w-[46%] sm:mt-14 sm:w-[40%] lg:w-[40%]">
                  <Phone label="CareerFound on a phone: interview preparation, written answers to questions about the Network Reconnaissance Tool. Example data.">
                    <InterviewScreen />
                  </Phone>
                </div>
                <div className="w-[46%] -rotate-1 sm:w-[40%] lg:w-[40%]">
                  <Phone label="CareerFound on a phone: a Career Readiness Score built from seven signals. Example data.">
                    <ReadinessScreen />
                  </Phone>
                </div>
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
            08
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
