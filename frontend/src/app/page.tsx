import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Shield,
  Cloud,
  Code2,
  BarChart3,
  Server,
  Palette,
  Headphones,
  Check,
  ChevronDown,
  Compass,
  Route,
  Hammer,
  Trophy,
  Bot,
  FolderGit2,
  Users,
  Target,
  Map,
  Briefcase,
  MessageCircle,
  Gauge,
} from "lucide-react";
import { MarketingNav } from "@/components/layout/marketing-nav";
import { Footer } from "@/components/layout/footer";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { steps, pricingTiers, faqs } from "@/lib/marketing-content";

const careerPreview = [
  { name: "Cybersecurity", slug: "cybersecurity", icon: Shield, blurb: "Protect systems and stop attackers before they cause damage." },
  { name: "Software Engineering", slug: "software-engineering", icon: Code2, blurb: "Build the applications and systems people use every day." },
  { name: "Cloud Engineering", slug: "cloud-engineering", icon: Cloud, blurb: "Run computing systems that live on the internet, not one machine." },
  { name: "Data Analysis", slug: "data-analysis", icon: BarChart3, blurb: "Turn raw numbers into insights that drive decisions." },
  { name: "Backend Engineering", slug: "backend-engineering", icon: Server, blurb: "Build the servers and APIs that power an app behind the scenes." },
  { name: "UI/UX Design", slug: "ui-ux-design", icon: Palette, blurb: "Design interfaces that are effortless for people to use." },
  { name: "IT Support", slug: "it-support", icon: Headphones, blurb: "The most accessible first tech job, often a launchpad into more." },
  { name: "+ 14 more paths", slug: null, icon: Sparkles, blurb: "From DevOps to Product Management to AI/ML Engineering." },
];

const journeySteps = [
  { icon: Compass, label: "Discover yourself" },
  { icon: Sparkles, label: "Find your career" },
  { icon: Route, label: "Get your roadmap" },
  { icon: Hammer, label: "Build real projects" },
  { icon: Trophy, label: "Become job-ready" },
];

export default function LandingPage() {
  return (
    <>
      <MarketingNav />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden py-20 sm:py-28">
          <div className="bg-dot-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]" />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] opacity-30"
            style={{ background: "radial-gradient(560px circle at 50% 0%, rgba(93,111,52,0.22), transparent 70%)" }}
          />
          <div className="container-page text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.04)] px-3.5 py-1.5 text-xs font-medium text-ink-300 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5 text-accent-light" />
              A career platform for people breaking into tech
            </div>
            <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tightest text-gradient sm:text-6xl animate-fade-in">
              Discover your tech career. Build the skills to get there.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base text-ink-300 sm:text-lg animate-fade-in">
              Find the tech career that actually fits you, follow a roadmap built for it, and build
              real projects that prove you can do the work. When you want a second opinion, get
              guidance from an AI mentor or from Toriola directly.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row animate-fade-in">
              <Link href="/onboarding">
                <Button size="lg" className="gap-2">
                  Find My Tech Path <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/careers">
                <Button size="lg" variant="secondary">
                  Explore Careers
                </Button>
              </Link>
            </div>
            <p className="mt-5 text-xs text-ink-500">No credit card required, takes about 5 minutes</p>

            {/* The path through CareerFound, made visible up front rather than
                left implicit across five different sections. */}
            <div className="mx-auto mt-16 hidden max-w-3xl items-center sm:flex animate-fade-in-up">
              {journeySteps.map((step, i) => (
                <div key={step.label} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/25 bg-[rgb(var(--fg-tint)/0.04)] text-accent-light">
                      <step.icon className="h-4 w-4" />
                    </div>
                    <p className="whitespace-nowrap text-[11px] font-medium text-ink-400">{step.label}</p>
                  </div>
                  {i < journeySteps.length - 1 && <div className="step-track mx-2 h-px flex-1 -translate-y-3" />}
                </div>
              ))}
            </div>
            <div className="mx-auto mt-8 flex max-w-xs flex-col gap-3 sm:hidden">
              {journeySteps.map((step, i) => (
                <div key={step.label} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-accent/25 bg-[rgb(var(--fg-tint)/0.04)] text-accent-light">
                    <step.icon className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xs font-medium text-ink-400">{step.label}</p>
                  {i < journeySteps.length - 1 && <span className="sr-only">, then</span>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20">
          <div className="container-page">
            <SectionHeading eyebrow="How it works" title="From confused to job-ready, one clear step at a time" />
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <Card key={s.title} className="relative p-6">
                  <span className="absolute right-5 top-5 text-2xl font-semibold text-ink-700">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/12 text-accent-light">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-ink-100">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{s.body}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Career paths */}
        <section id="careers" className="py-20">
          <div className="container-page">
            <SectionHeading
              eyebrow="Career paths"
              title="21 tech careers, one honest assessment to find yours"
              description="We don't just ask what you want to learn, we help you discover what actually fits how you think and what you enjoy."
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {careerPreview.map((c) => (
                <Link key={c.name} href={c.slug ? `/careers/${c.slug}` : "/careers"}>
                  <Card interactive className="h-full p-5">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/12 text-accent-light">
                      <c.icon className="h-4.5 w-4.5" />
                    </div>
                    <p className="text-sm font-semibold text-ink-100">{c.name}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{c.blurb}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* AI Mentor + project learning */}
        <section id="mentor" className="py-20">
          <div className="container-page grid gap-6 lg:grid-cols-2">
            <Card className="p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/12 text-accent-light">
                <Bot className="h-5 w-5" />
              </div>
              <Badge tone="accent">AI Mentor · one of several features</Badge>
              <h3 className="mt-4 text-xl font-semibold text-ink-100">An AI powered learning assistant, on call whenever you&apos;re stuck</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                It&apos;s software, not a person: it gives hints before answers, explains with
                real-world analogies before jargon, reviews your code, runs mock interviews, and
                adjusts your roadmap when it notices you&apos;re struggling. For a real professional&apos;s
                perspective, human mentorship and consultation are one message away.
              </p>
              <div className="mt-6 space-y-3 rounded-xl border border-[rgb(var(--fg-tint)/0.1)] bg-base-950/60 p-4 text-sm">
                <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">Example conversation</p>
                <p className="text-ink-500">You: <span className="text-ink-300">&ldquo;I don&apos;t understand DNS.&rdquo;</span></p>
                <p className="text-ink-300">
                  Mentor: <span className="text-ink-100">&ldquo;That&apos;s okay. Let&apos;s forget the technical
                  definition for a moment. Imagine you want to visit a friend&apos;s house but only
                  know their name, not their address…&rdquo;</span>
                </p>
              </div>
            </Card>
            <Card className="p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/12 text-accent-light">
                <Hammer className="h-5 w-5" />
              </div>
              <Badge tone="accent">Project-first learning</Badge>
              <h3 className="mt-4 text-xl font-semibold text-ink-100">Learn by shipping, not by watching</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                Every path is built around progressively harder real projects (a password-strength
                checker, a Python port scanner, a mini SOC dashboard), each with step-by-step
                guidance, hints, and common mistakes to avoid.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-ink-300">
                {["What the project teaches", "Step-by-step guidance + hints", "AI code review on submission", "Auto-generated README & CV bullet"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 flex-shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        {/* Portfolio + Mentorship */}
        <section className="py-20">
          <div className="container-page grid gap-6 lg:grid-cols-2">
            <Card className="p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/12 text-accent-light">
                <FolderGit2 className="h-5 w-5" />
              </div>
              <Badge tone="accent">Portfolio Builder</Badge>
              <h3 className="mt-4 text-xl font-semibold text-ink-100">Turn projects into proof, automatically</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                Instead of &ldquo;Built a Python scanner,&rdquo; get: &ldquo;Developed a multithreaded
                TCP port scanner in Python capable of identifying exposed services across target
                hosts, reducing scan time through concurrent socket operations.&rdquo; Fully editable.
              </p>
            </Card>
            <Card className="p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/12 text-accent-light">
                <Users className="h-5 w-5" />
              </div>
              <Badge tone="accent">Mentor marketplace</Badge>
              <h3 className="mt-4 text-xl font-semibold text-ink-100">A wider pool of working professionals</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                Book short sessions for portfolio reviews, mock interviews, and career guidance with
                working professionals across the community, filtered by the exact career path
                you&apos;re pursuing. Separate from Toriola&apos;s own 1:1 mentorship below.
              </p>
              <Link href="/mentors" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline">
                Browse mentors <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>
          </div>
        </section>

        {/* Outcomes */}
        <section className="py-20">
          <div className="container-page">
            <SectionHeading
              eyebrow="What CareerFound is built for"
              title="What we're designed to help you achieve"
              description="CareerFound is built around these outcomes. They're the goal we design toward, not a guarantee or a claim about any specific user."
            />
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Clarity on a path",
                  body: "Stop guessing which tech career fits you and start with one that matches how you actually think and work.",
                  icon: Target,
                },
                {
                  title: "A roadmap you can follow",
                  body: "A staged plan for your chosen path, beginner through advanced, so you always know what to focus on next.",
                  icon: Map,
                },
                {
                  title: "A portfolio of real work",
                  body: "Projects you actually build and can show, not just courses you watched.",
                  icon: Briefcase,
                },
                {
                  title: "Interview readiness",
                  body: "Practice with the AI mentor and preparation material built around the questions your target role actually asks.",
                  icon: MessageCircle,
                },
                {
                  title: "Access to human guidance",
                  body: "A path to a real conversation, whether that's the mentor marketplace or 1:1 mentorship with Toriola, when software isn't enough.",
                  icon: Users,
                },
                {
                  title: "Momentum, not overwhelm",
                  body: "One clear next step at a time instead of a hundred open tabs and no plan.",
                  icon: Gauge,
                },
              ].map((o) => (
                <Card key={o.title} className="p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/12 text-accent-light">
                    <o.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-ink-100">{o.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{o.body}</p>
                </Card>
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
                <Card
                  key={tier.name}
                  className={cn(
                    "relative flex flex-col p-8",
                    tier.highlighted && "border-accent/40 shadow-raised sm:-translate-y-2"
                  )}
                >
                  {tier.highlighted && (
                    <div className="absolute inset-x-0 -top-px mx-auto h-px w-2/3 bg-gradient-to-r from-transparent via-accent-light to-transparent" />
                  )}
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
        <section className="relative overflow-hidden py-20">
          <div className="container-page">
            <Card className="relative flex flex-col items-center gap-6 overflow-hidden px-8 py-16 text-center">
              <div className="bg-dot-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-full opacity-70" />
              <p className="eyebrow">Ready when you are</p>
              <h2 className="max-w-lg text-2xl font-semibold tracking-tight text-ink-100 sm:text-3xl">
                Your next step is one honest assessment away.
              </h2>
              <Link href="/onboarding">
                <Button size="lg" className="gap-2">
                  Find My Tech Path <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

