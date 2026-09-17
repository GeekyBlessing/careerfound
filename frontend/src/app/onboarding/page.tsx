"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  Check,
  Compass,
  GraduationCap,
  Globe,
  Hammer,
  Laptop,
  Layers,
  type LucideIcon,
  Map,
  RefreshCw,
  Rocket,
  Smartphone,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { BrandTile } from "@/components/brand/logo";
import { PathTrack, type PathWaypoint } from "@/components/marketing/path-track";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { api, ApiError } from "@/lib/api";
import { track } from "@/lib/analytics";

type Answers = {
  persona?: string;
  goal?: string;
  device_access?: string;
  time_budget_minutes_per_day?: number;
  age_range?: string;
  education_level?: string;
  country?: string;
  enjoys_problem_solving?: boolean;
  enjoys_math?: boolean;
  enjoys_creativity?: boolean;
  enjoys_people?: boolean;
  prefers_systems?: boolean;
  wants_remote?: boolean;
  career_timeline?: string;
  monthly_budget_usd?: number;
  current_technical_knowledge?: string;
};

const PERSONA_OPTIONS = [
  { value: "student", label: "Student", icon: GraduationCap },
  { value: "graduate", label: "Graduate", icon: Award },
  { value: "working", label: "Working full-time", icon: Briefcase },
  { value: "switcher", label: "Career switcher", icon: RefreshCw },
  { value: "entrepreneur", label: "Entrepreneur", icon: Rocket },
  { value: "other", label: "Other", icon: Sparkles },
];

const GOAL_OPTIONS = [
  { value: "job", label: "Get a job", icon: Briefcase },
  { value: "freelance", label: "Freelance", icon: Laptop },
  { value: "startup", label: "Build a startup", icon: Rocket },
  { value: "remote", label: "Remote career", icon: Globe },
  { value: "explore", label: "Explore tech", icon: Compass },
];

const DEVICE_OPTIONS = [
  { value: "laptop", label: "Laptop", icon: Laptop },
  { value: "smartphone", label: "Smartphone", icon: Smartphone },
  { value: "both", label: "Both", icon: Layers },
];

const TIME_OPTIONS = [
  { value: 30, label: "30 min / day" },
  { value: 60, label: "1 hour / day" },
  { value: 120, label: "2 hours / day" },
  { value: 240, label: "4+ hours / day" },
];

function OptionGrid<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; icon?: LucideIcon }[];
  value: T | undefined;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex min-h-[52px] items-center justify-between gap-2 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-150 ease-smooth focus-ring active:scale-[0.98]",
            value === opt.value
              ? "border-accent bg-accent/15 text-accent-light shadow-xs"
              : "border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.03)] text-ink-300 hover:border-[rgb(var(--fg-tint)/0.2)] hover:bg-[rgb(var(--fg-tint)/0.05)] hover:text-ink-100"
          )}
        >
          <span className="flex items-center gap-2.5">
            {opt.icon && (
              <opt.icon
                className={cn("h-4 w-4 shrink-0", value === opt.value ? "text-accent-light" : "text-ink-500")}
              />
            )}
            {opt.label}
          </span>
          {value === opt.value && <Check className="h-3.5 w-3.5 shrink-0" />}
        </button>
      ))}
    </div>
  );
}

function YesNo({ value, onChange }: { value: boolean | undefined; onChange: (v: boolean) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        aria-pressed={value === true}
        onClick={() => onChange(true)}
        className={cn(
          "flex min-h-[52px] items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-150 ease-smooth focus-ring active:scale-[0.98]",
          value === true ? "border-accent bg-accent/15 text-accent-light shadow-xs" : "border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.03)] text-ink-300 hover:bg-[rgb(var(--fg-tint)/0.05)] hover:text-ink-100"
        )}
      >
        Yes {value === true && <Check className="h-3.5 w-3.5" />}
      </button>
      <button
        type="button"
        aria-pressed={value === false}
        onClick={() => onChange(false)}
        className={cn(
          "flex min-h-[52px] items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-150 ease-smooth focus-ring active:scale-[0.98]",
          value === false ? "border-accent bg-accent/15 text-accent-light shadow-xs" : "border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.03)] text-ink-300 hover:bg-[rgb(var(--fg-tint)/0.05)] hover:text-ink-100"
        )}
      >
        Not really {value === false && <Check className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

// The overall CareerFound journey. Onboarding is entirely the DISCOVER
// stage, so it stays fixed for the whole flow rather than advancing with
// `step` - it's a map of where this flow sits in the bigger picture, not a
// second progress bar competing with the step tracker below it.
const JOURNEY_WAYPOINTS: PathWaypoint[] = [
  { label: "Discover", icon: Compass, state: "active" },
  { label: "Match", icon: Target, state: "upcoming" },
  { label: "Roadmap", icon: Map, state: "upcoming" },
  { label: "Build", icon: Hammer, state: "upcoming" },
  { label: "Job-ready", icon: Award, state: "upcoming" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, register, login } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline account creation, shown only if the user reaches submission
  // without being authenticated yet.
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signup" | "login">("signup");

  function update<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((a) => ({ ...a, [key]: value }));
  }

  async function handleFinalSubmit() {
    // Defense in depth: the Button component already disables itself while
    // `loading` is true, but guard the handler itself too in case it's ever
    // triggered from a second code path (e.g. a keyboard submit).
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      if (!user) {
        if (mode === "signup") {
          if (!fullName || !email || password.length < 8) {
            throw new Error("Please fill in your name, email, and an 8+ character password.");
          }
          await register(email, password, fullName);
        } else {
          if (!email || !password) throw new Error("Please enter your email and password.");
          await login(email, password);
        }
      }

      await api.patch("/users/me", {
        persona: answers.persona,
        goal: answers.goal,
        device_access: answers.device_access,
        time_budget_minutes_per_day: answers.time_budget_minutes_per_day,
      });

      await api.post("/assessment", { answers });
      track("assessment_completed");
      router.push("/assessment/results");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else if (err instanceof Error) setError(err.message);
      else setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const steps: { title: string; body: React.ReactNode; canContinue: boolean }[] = [
    {
      title: "Let's figure out your future in tech.",
      body: (
        <p className="text-sm leading-relaxed text-ink-500">
          Answer a few honest questions, there are no wrong answers. It takes about 5 minutes,
          and we&apos;ll recommend the tech careers that best match your interests, strengths, working style,
          and goals, and explain why.
        </p>
      ),
      canContinue: true,
    },
    {
      title: "What best describes you?",
      body: <OptionGrid options={PERSONA_OPTIONS} value={answers.persona} onChange={(v) => update("persona", v)} />,
      canContinue: !!answers.persona,
    },
    {
      title: "What are you hoping to achieve?",
      body: <OptionGrid options={GOAL_OPTIONS} value={answers.goal} onChange={(v) => update("goal", v)} />,
      canContinue: !!answers.goal,
    },
    {
      title: "What do you have access to?",
      body: <OptionGrid options={DEVICE_OPTIONS} value={answers.device_access} onChange={(v) => update("device_access", v)} />,
      canContinue: !!answers.device_access,
    },
    {
      title: "How much time can you realistically dedicate?",
      body: <OptionGrid options={TIME_OPTIONS} value={answers.time_budget_minutes_per_day} onChange={(v) => update("time_budget_minutes_per_day", v)} />,
      canContinue: !!answers.time_budget_minutes_per_day,
    },
    {
      title: "Do you enjoy problem solving?",
      body: (
        <>
          <p className="mb-4 text-sm text-ink-500">Think puzzles, debugging, figuring out why something broke.</p>
          <YesNo value={answers.enjoys_problem_solving} onChange={(v) => update("enjoys_problem_solving", v)} />
        </>
      ),
      canContinue: answers.enjoys_problem_solving !== undefined,
    },
    {
      title: "Do you enjoy math or working with numbers and logic?",
      body: <YesNo value={answers.enjoys_math} onChange={(v) => update("enjoys_math", v)} />,
      canContinue: answers.enjoys_math !== undefined,
    },
    {
      title: "Do you enjoy creative work, design, writing, visual thinking?",
      body: <YesNo value={answers.enjoys_creativity} onChange={(v) => update("enjoys_creativity", v)} />,
      canContinue: answers.enjoys_creativity !== undefined,
    },
    {
      title: "Do you prefer working with people, or with systems?",
      body: (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            aria-pressed={answers.enjoys_people === true}
            onClick={() => {
              update("enjoys_people", true);
              update("prefers_systems", false);
            }}
            className={cn(
              "flex min-h-[52px] items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-medium transition-all duration-150 ease-smooth focus-ring active:scale-[0.98]",
              answers.enjoys_people === true ? "border-accent bg-accent/15 text-accent-light shadow-xs" : "border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.03)] text-ink-300 hover:bg-[rgb(var(--fg-tint)/0.05)] hover:text-ink-100"
            )}
          >
            People {answers.enjoys_people === true && <Check className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            aria-pressed={answers.prefers_systems === true}
            onClick={() => {
              update("enjoys_people", false);
              update("prefers_systems", true);
            }}
            className={cn(
              "flex min-h-[52px] items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-medium transition-all duration-150 ease-smooth focus-ring active:scale-[0.98]",
              answers.prefers_systems === true ? "border-accent bg-accent/15 text-accent-light shadow-xs" : "border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.03)] text-ink-300 hover:bg-[rgb(var(--fg-tint)/0.05)] hover:text-ink-100"
            )}
          >
            Systems {answers.prefers_systems === true && <Check className="h-3.5 w-3.5" />}
          </button>
        </div>
      ),
      canContinue: answers.enjoys_people !== undefined || answers.prefers_systems !== undefined,
    },
    {
      title: "One last thing, do you want to work remotely?",
      body: <YesNo value={answers.wants_remote} onChange={(v) => update("wants_remote", v)} />,
      canContinue: answers.wants_remote !== undefined,
    },
  ];

  const isLastStep = step === steps.length - 1;
  const current = steps[step] ?? steps[0]!;

  const stepLabel = String(step + 1).padStart(2, "0");
  const totalLabel = String(steps.length).padStart(2, "0");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-8 sm:py-12">
      <div className="bg-contour pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]" />
      <Link href="/" className="mb-6 flex items-center gap-2 font-display font-semibold text-ink-100 focus-ring rounded-lg sm:mb-8">
        <BrandTile className="h-7 w-7" />
        CareerFound
      </Link>

      <div className="w-full max-w-lg">
        {/* The bigger CareerFound journey (Discover -> Match -> Roadmap ->
            Build -> Job-ready), kept small and fixed on Discover for the
            whole flow. This is context, not a second progress bar - the
            step tracker just below is what actually advances. */}
        <PathTrack waypoints={JOURNEY_WAYPOINTS} size="sm" className="mb-6 sm:mb-8" />

        {/* A waypoint-dot tracker instead of a plain progress bar - one
            small diamond per question, same node language as the hero and
            roadmap, so the assessment reads as a path being walked rather
            than a form being filled in. */}
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-wide text-ink-500">
            {stepLabel} / {totalLabel}
          </span>
          <span className="text-xs text-ink-500">Your career path is taking shape.</span>
        </div>
        <ol className="mb-6 flex items-center gap-1.5" aria-hidden="true">
          {steps.map((_, i) => (
            <li
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                i < step ? "bg-accent/50" : i === step ? "bg-accent-light" : "bg-[rgb(var(--fg-tint)/0.08)]"
              )}
            />
          ))}
        </ol>

        <Card className="p-6 shadow-raised sm:p-8">
          <div key={step} className="animate-fade-in-up">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-100">{current.title}</h1>
            <div className="mt-5">{current.body}</div>
          </div>

          {isLastStep && !user && (
            <div className="mt-6 space-y-3 border-t border-[rgb(var(--fg-tint)/0.1)] pt-6">
              <p className="text-sm font-medium text-ink-100">
                {mode === "signup" ? "Create your free account to see your results" : "Log in to see your results"}
              </p>
              {error && <Alert>{error}</Alert>}
              {mode === "signup" && (
                <div>
                  <Label htmlFor="fullName">Full name</Label>
                  <Input id="fullName" autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                  minLength={mode === "signup" ? 8 : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {mode === "signup" && <p className="mt-1 text-xs text-ink-500">At least 8 characters.</p>}
              </div>
              <button
                type="button"
                className="text-xs text-ink-500 hover:text-ink-300"
                onClick={() => setMode(mode === "signup" ? "login" : "signup")}
              >
                {mode === "signup" ? "Already have an account? Log in instead" : "New here? Create an account instead"}
              </button>
            </div>
          )}

          {isLastStep && error && user && <Alert className="mt-4">{error}</Alert>}

          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
            {isLastStep ? (
              <Button onClick={handleFinalSubmit} loading={submitting} className="gap-1.5">
                See my results <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!current.canContinue} className="gap-1.5">
                Continue <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
