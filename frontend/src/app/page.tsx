import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Code2,
  BarChart3,
  Check,
  ChevronDown,
  Compass,
  Target,
  Hammer,
  FolderGit2,
  Users,
  Map,
  Briefcase,
  MessageCircle,
  Gauge,
  Bot,
  UserCog,
} from "lucide-react";
import { MarketingNav } from "@/components/layout/marketing-nav";
import { Footer } from "@/components/layout/footer";
import { SectionHeading } from "@/components/marketing/section-heading";
import { JourneySteps } from "@/components/marketing/journey-steps";
import { PathTrack, type PathWaypoint } from "@/components/marketing/path-track";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
// phase tracker reuse (now with an optional caption), so this reads as a
// real product surface rather than a one-off illustration.
const heroWaypoints: PathWaypoint[] = [
  { icon: Compass, label: "Discover", state: "active", caption: "Answer honest questions about how you think and work." },
  { icon: Target, label: "Career Match", state: "upcoming", caption: "A Best Match, a Strong Alternative, and a Wild Card." },
  { icon: Map, label: "Roadmap", state: "upcoming", caption: "A staged plan, beginner through advanced, for your path." },
  { icon: FolderGit2, label: "Projects", state: "upcoming", caption: "Real builds, with feedback on every submission." },
  { icon: Briefcase, label: "Portfolio", state: "upcoming", caption: "Finished work written up as proof you can show." },
];

// Three real, verbatim-sourced paths (see backend/app/seed/career_paths.py)
// used as catalogue spotlights. Depth fields (difficulty, entry roles,
// tools) live here rather than in lib/career-categories.ts, which only
// carries the light slug/name/icon index shared with the nav.
const SPOTLIGHTS = [
  {
    slug: "cybersecurity",
    name: "Cybersecurity",
    icon: Shield,
    summary: "Protect organizations from attackers by finding, fixing, and defending against security weaknesses across networks, systems, and applications.",
    difficulty: 3,
    entryRoles: ["SOC Analyst (Tier 1)", "IT Security Support"],
    tools: ["Wireshark", "Linux", "Nmap"],
  },
  {
    slug: "software-engineering",
    name: "Software Engineering",
    icon: Code2,
    summary: "Design, build, and maintain the applications and systems that power products people use every day.",
    difficulty: 3,
    entryRoles: ["Junior Software Engineer", "Associate Developer"],
    tools: ["Python or JavaScript", "Git", "SQL"],
  },
  {
    slug: "data-analysis",
    name: "Data Analysis",
    icon: BarChart3,
    summary: "Turn raw numbers into insights that drive decisions, using spreadsheets, SQL, and visualization tools.",
    difficulty: 2,
    entryRoles: ["Junior Data Analyst", "Reporting Analyst"],
    tools: ["Excel/Sheets", "SQL", "Tableau or Power BI"],
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
        {/* Hero: asymmetric two-column composition instead of a centered
            headline stack. The right column is a real product surface (the
            five-stage path panel), not a decorative illustration, so the
            hero communicates the mechanism, not just the pitch. */}
        <section className="relative overflow-hidden border-b border-[rgb(var(--fg-tint)/0.08)] py-14 sm:py-20">
          <div className="bg-contour pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px]" />
          <div className="container-page grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
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

            {/* The product panel: a real bordered surface with its own
                header row, not a floating stepper, so it reads as "an
                interface" rather than an icon row under the copy. */}
            <div className="rounded-2xl border border-[rgb(var(--fg-tint)/0.12)] bg-[rgb(var(--fg-tint)/0.025)]">
              <div className="flex items-center justify-between border-b border-[rgb(var(--fg-tint)/0.1)] px-5 py-3">
                <span className="font-mono text-[10px] uppercase tracking-wide text-ink-500">Your Career Path</span>
                <Badge tone="accent">Discover</Badge>
              </div>
              <div className="p-6">
                <PathTrack waypoints={heroWaypoints} orientation="vertical" size="sm" />
              </div>
            </div>
          </div>
        </section>

        {/* How it works: asymmetric, left-column intro beside the
            connected journey path, rather than a centered heading sitting
            on top of a centered list. */}
        <section id="how-it-works" className="bg-paper py-20">
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

        {/* Career catalogue: grouped by discipline like a real directory,
            not a flat grid of 8 identical icon cards. Three spotlighted
            paths carry real depth (difficulty, entry roles, tools); the
            rest of the 21 are listed by name under their category so the
            breadth of the catalog is visible at a glance. */}
        <section id="careers" className="py-20">
          <div className="container-page">
            <SectionHeading
              eyebrow="Career paths"
              title={`${CAREER_PATH_COUNT} tech careers, one honest assessment to find yours`}
              description="We don't just ask what you want to learn, we help you discover what actually fits how you think and what you enjoy."
              align="left"
            />

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {SPOTLIGHTS.map((s) => (
                <Link key={s.slug} href={`/careers/${s.slug}`}>
                  <Card interactive className="flex h-full flex-col p-6">
                    <s.icon className="h-5 w-5 text-accent-light" />
                    <p className="mt-3 font-display text-base font-semibold tracking-tight text-ink-100">{s.name}</p>
                    <p className="mt-2 flex-1 text-xs leading-relaxed text-ink-500">{s.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {s.entryRoles.map((r) => (
                        <Badge key={r}>{r}</Badge>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-[rgb(var(--fg-tint)/0.08)] pt-3">
                      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-ink-500">
                        <DifficultyMeter level={s.difficulty} /> {s.difficulty}/5
                      </span>
                      <span className="flex items-center gap-1 text-xs font-medium text-accent-light">
                        Explore <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-[rgb(var(--fg-tint)/0.08)] pt-10 sm:grid-cols-3 lg:grid-cols-5">
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

        {/* AI Mentor + project-first learning: one feature of the platform,
            explicitly not the visual centerpiece. Kept plain (no glow, no
            "AI-powered everything" framing). */}
        <section className="bg-paper py-20">
          <div className="container-page grid gap-6 lg:grid-cols-2">
            <Card className="p-8">
              <Bot className="h-5 w-5 text-ink-400" />
              <Badge className="mt-4 w-fit">AI Mentor, one of several features</Badge>
              <h3 className="mt-4 text-h2 font-display font-semibold text-ink-100">A learning assistant on call whenever you&apos;re stuck</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                It&apos;s software, not a person: it gives hints before answers, explains with
                real-world analogies before jargon, reviews your code, runs mock interviews, and
                adjusts your roadmap when it notices you&apos;re struggling.
              </p>
              <div className="mt-6 space-y-3 rounded-xl border border-[rgb(var(--fg-tint)/0.1)] bg-base-950/60 p-4 text-sm">
                <p className="font-mono text-[10px] uppercase tracking-wide text-ink-500">Example conversation</p>
                <p className="text-ink-500">You: <span className="text-ink-300">&ldquo;I don&apos;t understand DNS.&rdquo;</span></p>
                <p className="text-ink-300">
                  Mentor: <span className="text-ink-100">&ldquo;That&apos;s okay. Let&apos;s forget the technical
                  definition for a moment. Imagine you want to visit a friend&apos;s house but only
                  know their name, not their address…&rdquo;</span>
                </p>
              </div>
            </Card>
            <Card className="p-8">
              <Hammer className="h-5 w-5 text-ink-400" />
              <Badge className="mt-4 w-fit">Project-first learning</Badge>
              <h3 className="mt-4 text-h2 font-display font-semibold text-ink-100">Learn by shipping, not by watching</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                Every path is built around progressively harder real projects (a password-strength
                checker, a Python port scanner, a mini SOC dashboard), each with step-by-step
                guidance, hints, and common mistakes to avoid.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-ink-300">
                {["What the project teaches", "Step-by-step guidance and hints", "AI code review on submission", "Auto-generated README and CV bullet"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 flex-shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        {/* Human mentorship: deliberately separated from AI, with real
            pricing shown here rather than only on /pricing, and the warm
            secondary accent (reserved for signature moments elsewhere in
            the app) marking it as the premium, human track. */}
        <section className="py-20">
          <div className="container-page">
            <SectionHeading
              eyebrow="Human mentorship"
              title="When software isn't enough, talk to a person"
              description="Separate from the AI Mentor above: real professionals, paid, by design."
              align="left"
            />
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              <Card className="border-warm/30 p-7">
                <UserCog className="h-5 w-5 text-warm" />
                <Badge tone="warm" className="mt-4 w-fit">Paid service</Badge>
                <h3 className="mt-3 text-h3 font-display font-semibold text-ink-100">1:1 Career Mentorship</h3>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-semibold text-ink-100">$200</span>
                  <span className="text-xs text-ink-500">or ₦250,000 / 2 months</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">
                  Direct, one-on-one mentorship with Toriola: roadmap, project guidance, portfolio
                  review, and interview preparation.
                </p>
                <Link href="/mentorship" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline">
                  Request mentorship <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Card>
              <Card className="border-warm/30 p-7">
                <UserCog className="h-5 w-5 text-warm" />
                <Badge tone="warm" className="mt-4 w-fit">Paid service</Badge>
                <h3 className="mt-3 text-h3 font-display font-semibold text-ink-100">Career Consultation</h3>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-semibold text-ink-100">$7</span>
                  <span className="text-xs text-ink-500">or ₦10,000 / 30 minutes</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">
                  One focused conversation for a specific question or decision, not an ongoing
                  program.
                </p>
                <Link href="/consultation" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline">
                  Book a consultation <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Card>
              <Card className="p-7">
                <Users className="h-5 w-5 text-ink-400" />
                <Badge className="mt-4 w-fit">Marketplace</Badge>
                <h3 className="mt-3 text-h3 font-display font-semibold text-ink-100">Mentor Marketplace</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">
                  Book shorter sessions for portfolio reviews, mock interviews, and career guidance
                  with working professionals, filtered by career path.
                </p>
                <Link href="/mentors" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline">
                  Browse mentors <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Card>
            </div>
          </div>
        </section>

        {/* Outcomes: a divided list instead of six identical icon-tile
            cards, so the section reads as a considered statement rather
            than another feature grid. */}
        <section className="bg-paper py-20">
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
