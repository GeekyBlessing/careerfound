"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { ProgressBar } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { api, ApiError } from "@/lib/api";

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
  { value: "student", label: "Student" },
  { value: "graduate", label: "Graduate" },
  { value: "working", label: "Working full-time" },
  { value: "switcher", label: "Career switcher" },
  { value: "entrepreneur", label: "Entrepreneur" },
  { value: "other", label: "Other" },
];

const GOAL_OPTIONS = [
  { value: "job", label: "Get a job" },
  { value: "freelance", label: "Freelance" },
  { value: "startup", label: "Build a startup" },
  { value: "remote", label: "Remote career" },
  { value: "explore", label: "Explore tech" },
];

const DEVICE_OPTIONS = [
  { value: "laptop", label: "Laptop" },
  { value: "smartphone", label: "Smartphone" },
  { value: "both", label: "Both" },
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
  options: { value: T; label: string }[];
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
            "rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-150 ease-smooth focus-ring active:translate-y-px",
            value === opt.value
              ? "border-accent bg-accent/15 text-accent-light shadow-xs"
              : "border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.03)] text-ink-300 hover:border-[rgb(var(--fg-tint)/0.2)] hover:bg-[rgb(var(--fg-tint)/0.05)] hover:text-ink-100"
          )}
        >
          {opt.label}
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
          "rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-150 ease-smooth focus-ring active:translate-y-px",
          value === true ? "border-accent bg-accent/15 text-accent-light shadow-xs" : "border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.03)] text-ink-300 hover:bg-[rgb(var(--fg-tint)/0.05)] hover:text-ink-100"
        )}
      >
        Yes
      </button>
      <button
        type="button"
        aria-pressed={value === false}
        onClick={() => onChange(false)}
        className={cn(
          "rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-150 ease-smooth focus-ring active:translate-y-px",
          value === false ? "border-accent bg-accent/15 text-accent-light shadow-xs" : "border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.03)] text-ink-300 hover:bg-[rgb(var(--fg-tint)/0.05)] hover:text-ink-100"
        )}
      >
        Not really
      </button>
    </div>
  );
}

const TOTAL_STEPS = 10;

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

  // step is zero-indexed, so add 1 before dividing, otherwise the bar reads
  // 90% on the final step while the "Step 10 of 10" label beside it reads
  // done, which looks broken/contradictory.
  const progress = useMemo(() => Math.round(((step + 1) / TOTAL_STEPS) * 100), [step]);

  async function handleFinalSubmit() {
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
          and at the end we&apos;ll tell you exactly which tech careers fit you, and why.
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
              "rounded-xl border px-4 py-3.5 text-sm font-medium transition-all duration-150 ease-smooth focus-ring active:translate-y-px",
              answers.enjoys_people === true ? "border-accent bg-accent/15 text-accent-light shadow-xs" : "border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.03)] text-ink-300 hover:bg-[rgb(var(--fg-tint)/0.05)] hover:text-ink-100"
            )}
          >
            People
          </button>
          <button
            type="button"
            aria-pressed={answers.prefers_systems === true}
            onClick={() => {
              update("enjoys_people", false);
              update("prefers_systems", true);
            }}
            className={cn(
              "rounded-xl border px-4 py-3.5 text-sm font-medium transition-all duration-150 ease-smooth focus-ring active:translate-y-px",
              answers.prefers_systems === true ? "border-accent bg-accent/15 text-accent-light shadow-xs" : "border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.03)] text-ink-300 hover:bg-[rgb(var(--fg-tint)/0.05)] hover:text-ink-100"
            )}
          >
            Systems
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

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div className="bg-dot-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]" />
      <Link href="/" className="mb-8 flex items-center gap-2 font-semibold text-ink-100 focus-ring rounded-lg">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent shadow-xs">
          <Compass className="h-4 w-4 text-white" />
        </span>
        CareerFound
      </Link>

      <div className="w-full max-w-lg">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-ink-500">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-accent-light">
            <Sparkles className="h-3.5 w-3.5" />
            Step {step + 1} of {steps.length}
          </span>
          <span>{progress}% complete</span>
        </div>
        <ProgressBar value={progress} trackClassName="mb-6" />

        <Card className="p-8 shadow-raised">
          <div key={step} className="animate-fade-in-up">
            <h1 className="text-xl font-semibold tracking-tight text-ink-100">{current.title}</h1>
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
