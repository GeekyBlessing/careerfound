import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Compass,
  Map,
  Code2,
  MessageCircle,
  FolderGit2,
  Users2,
  Check,
  Shield,
  Cloud,
  BarChart3,
  Server,
  Palette,
  Headphones,
} from "lucide-react";
import { MarketingNav } from "@/components/layout/marketing-nav";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const careerPreview = [
  { name: "Cybersecurity", icon: Shield, blurb: "Protect systems and stop attackers before they cause damage." },
  { name: "Software Engineering", icon: Code2, blurb: "Build the applications and systems people use every day." },
  { name: "Cloud Engineering", icon: Cloud, blurb: "Run computing systems that live on the internet, not one machine." },
  { name: "Data Analysis", icon: BarChart3, blurb: "Turn raw numbers into insights that drive decisions." },
  { name: "Backend Engineering", icon: Server, blurb: "Build the servers and APIs that power an app behind the scenes." },
  { name: "UI/UX Design", icon: Palette, blurb: "Design interfaces that are effortless for people to use." },
  { name: "IT Support", icon: Headphones, blurb: "The most accessible first tech job, often a launchpad into more." },
  { name: "+ 13 more paths", icon: Sparkles, blurb: "From DevOps to Product Management to AI/ML Engineering." },
];

const steps = [
  {
    title: "1. Discover your path",
    body: "Answer honest questions about your time, budget, interests, and goals. Get a Best Match, Strong Alternative, and Wild Card, not a random guess.",
    icon: Compass,
  },
  {
    title: "2. Get a personalized roadmap",
    body: "Phased lessons, exercises, and projects generated for your chosen path, not a static PDF everyone gets.",
    icon: Map,
  },
  {
    title: "3. Build real projects",
    body: "Learn by shipping real projects (a password checker, a port scanner, a full-stack app) with AI feedback on every submission.",
    icon: FolderGit2,
  },
  {
    title: "4. Get job-ready",
    body: "Track your Tech Readiness Score, practice real-world simulations, and build a portfolio that gets you interviews.",
    icon: MessageCircle,
  },
];

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Everything you need to discover your path and start learning.",
    features: ["Career discovery assessment", "Basic personalized roadmap", "Selected lessons per path", "Community access"],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "The full accelerator, for people serious about landing a role.",
    features: [
      "Full AI Mentor access",
      "Complete roadmap, all phases",
      "Advanced projects + AI project reviewer",
      "Portfolio builder",
      "Mock interviews & readiness analysis",
    ],
    cta: "Find My Tech Path",
    highlighted: true,
  },
  {
    name: "Mentorship",
    price: "Pay-per-session",
    period: "",
    description: "1:1 time with working professionals when you need a human.",
    features: ["30-min consultations", "Portfolio & CV reviews", "Mock interviews", "Career guidance"],
    cta: "Browse mentors",
    highlighted: false,
  },
];

const faqs = [
  {
    q: "I know nothing about tech. Is this actually for me?",
    a: "Yes, that's specifically who CareerFound is built for. Turn on 'I Know Nothing' mode and every technical term gets a plain-language explanation before we use it.",
  },
  {
    q: "How is this different from a course platform like Udemy or Coursera?",
    a: "Those platforms hand you a catalog and hope you pick the right thing. CareerFound tells you what to do today, adapts your roadmap to your actual progress, and builds a portfolio and readiness score alongside your learning: it's a system, not a library.",
  },
  {
    q: "What if I only have a smartphone and limited data?",
    a: "CareerFound is mobile-first and designed for low-bandwidth use, with lightweight pages and downloadable lesson content for offline review.",
  },
  {
    q: "Do I need to know what career I want before I start?",
    a: "No, that's the whole point of the 'Find Your Tech Path' assessment. Most people start with zero clarity and leave with a specific, personalized recommendation.",
  },
  {
    q: "Is the AI mentor a real person?",
    a: "It's an AI trained to behave like a patient senior engineer, explaining simply, giving hints before answers, and adjusting to your level. Human mentors are available separately in the Mentorship Marketplace.",
  },
];

export default function LandingPage() {
  return (
    <>
      <MarketingNav />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden py-20 sm:py-28">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] opacity-40"
            style={{ background: "radial-gradient(600px circle at 50% 0%, rgba(91,108,255,0.25), transparent 70%)" }}
          />
          <div className="container-page text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.04)] px-3.5 py-1.5 text-xs font-medium text-ink-300 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5 text-accent-light" />
              AI career advisor · roadmap generator · project accelerator, in one place
            </div>
            <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-gradient sm:text-6xl animate-fade-in">
              You don&apos;t need to know where to start. We&apos;ll help you find your path.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base text-ink-300 sm:text-lg animate-fade-in">
              Discover the right tech career, get a personalized roadmap, build real projects, and
              become job-ready, one step at a time.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row animate-fade-in">
              <Link href="/onboarding">
                <Button size="lg" className="gap-2">
                  Find My Tech Path <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#careers">
                <Button size="lg" variant="secondary">
                  Explore Careers
                </Button>
              </a>
            </div>
            <p className="mt-5 text-xs text-ink-500">No credit card required · Takes about 5 minutes</p>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20">
          <div className="container-page">
            <SectionHeading eyebrow="How it works" title="From confused to job-ready, one clear step at a time" />
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s) => (
                <Card key={s.title} className="p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent-light">
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
                <Card key={c.name} className="p-5">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[rgb(var(--fg-tint)/0.06)] text-ink-300">
                    <c.icon className="h-4.5 w-4.5" />
                  </div>
                  <p className="text-sm font-semibold text-ink-100">{c.name}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{c.blurb}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* AI Mentor + project learning */}
        <section id="mentor" className="py-20">
          <div className="container-page grid gap-6 lg:grid-cols-2">
            <Card className="p-8">
              <Badge tone="accent">AI Mentor</Badge>
              <h3 className="mt-4 text-xl font-semibold text-ink-100">A patient senior engineer, not a generic chatbot</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                Gives hints before answers, explains with real-world analogies before jargon, reviews
                your code, runs mock interviews, and adjusts your roadmap when it notices you&apos;re
                struggling.
              </p>
              <div className="mt-6 space-y-3 rounded-xl border border-[rgb(var(--fg-tint)/0.1)] bg-base-950/60 p-4 text-sm">
                <p className="text-ink-500">You: <span className="text-ink-300">&ldquo;I don&apos;t understand DNS.&rdquo;</span></p>
                <p className="text-ink-300">
                  Mentor: <span className="text-ink-100">&ldquo;That&apos;s okay. Let&apos;s forget the technical
                  definition for a moment. Imagine you want to visit a friend&apos;s house but only
                  know their name, not their address…&rdquo;</span>
                </p>
              </div>
            </Card>
            <Card className="p-8">
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
              <Badge tone="accent">Portfolio Builder</Badge>
              <h3 className="mt-4 text-xl font-semibold text-ink-100">Turn projects into proof, automatically</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                Instead of &ldquo;Built a Python scanner,&rdquo; get: &ldquo;Developed a multithreaded
                TCP port scanner in Python capable of identifying exposed services across target
                hosts, reducing scan time through concurrent socket operations.&rdquo; Fully editable.
              </p>
            </Card>
            <Card className="p-8">
              <Badge tone="accent">Mentorship Marketplace</Badge>
              <h3 className="mt-4 text-xl font-semibold text-ink-100">Real professionals, when you need a human</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                Book 30-minute sessions for portfolio reviews, mock interviews, and career guidance
                with working professionals, filtered by the exact career path you&apos;re pursuing.
              </p>
              <Link href="/mentors" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline">
                Browse mentors <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>
          </div>
        </section>

        {/* Success stories */}
        <section className="py-20">
          <div className="container-page">
            <SectionHeading eyebrow="Success stories" title="People who had no idea where to start" />
            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {[
                { name: "Amara, Lagos", quote: "I didn't know cybersecurity had entry points that didn't require a 4-year degree. The roadmap made it concrete week by week.", role: "Now: SOC Analyst (Tier 1)" },
                { name: "Jordan, Austin", quote: "The AI mentor caught that I was stuck on the same concept for three days and adjusted my roadmap before I even asked for help.", role: "Now: Junior Software Engineer" },
                { name: "Priya, Manila", quote: "The portfolio builder turned my messy project notes into something I was actually proud to put on LinkedIn.", role: "Now: Junior Cloud Security Analyst" },
              ].map((s) => (
                <Card key={s.name} className="p-6">
                  <p className="text-sm italic leading-relaxed text-ink-300">&ldquo;{s.quote}&rdquo;</p>
                  <p className="mt-4 text-sm font-medium text-ink-100">{s.name}</p>
                  <p className="text-xs text-ink-500">{s.role}</p>
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
                <Card key={tier.name} className={cn("flex flex-col p-8", tier.highlighted && "border-accent/40 shadow-glow")}>
                  {tier.highlighted && <Badge tone="accent" className="mb-4 w-fit">Most popular</Badge>}
                  <h3 className="text-lg font-semibold text-ink-100">{tier.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-semibold text-ink-100">{tier.price}</span>
                    <span className="text-sm text-ink-500">{tier.period}</span>
                  </div>
                  <p className="mt-3 text-sm text-ink-500">{tier.description}</p>
                  <ul className="mt-6 flex-1 space-y-2.5 text-sm text-ink-300">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/onboarding" className="mt-8">
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
                <details key={f.q} className="group rounded-xl border border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.03)] p-5 open:bg-[rgb(var(--fg-tint)/0.05)]">
                  <summary className="cursor-pointer list-none text-sm font-medium text-ink-100 marker:content-none">
                    {f.q}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-ink-500">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="container-page">
            <Card className="flex flex-col items-center gap-6 px-8 py-16 text-center">
              <h2 className="max-w-lg text-2xl font-semibold text-ink-100 sm:text-3xl">
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

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-accent-light">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold text-ink-100 sm:text-3xl">{title}</h2>
      {description && <p className="mt-3 text-sm text-ink-500">{description}</p>}
    </div>
  );
}

