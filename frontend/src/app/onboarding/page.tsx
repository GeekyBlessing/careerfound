"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { GlobalNav } from "@/components/layout/global-nav";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { api, ApiError } from "@/lib/api";
import { track } from "@/lib/analytics";
import { CAREER_CATEGORIES } from "@/lib/career-categories";
import {
  DEVICE_CHOICES,
  DIRECTION_CHOICES,
  EMPTY_JOURNEY,
  GOAL_CHOICES,
  INTEREST_CHOICES,
  KNOWLEDGE_CHOICES,
  MAX_PICKS,
  PERSONA_CHOICES,
  STRENGTH_CHOICES,
  TECH_CHOICES,
  TIMELINE_CHOICES,
  TIME_CHOICES,
  buildAnswers,
  signalLabels,
  toggle,
  type Choice,
  type JourneyState,
} from "@/lib/discovery";

/**
 * "Discover Your Direction": the first chapter of the CareerFound journey,
 * not a questionnaire. Seven short chapters (interests, strengths, working
 * style, goals, technology, direction, starting point), each its own full
 * screen, with a live record of what you have told us so far beside it, and
 * a result that is built from those answers. The final step still posts the
 * same payload to /assessment and the same profile fields to /users/me.
 */

const CHAPTERS = [
  { name: "Interests", prompt: "What could you lose a whole afternoon to?", sub: "Pick up to five. Go with your gut, not with what sounds impressive." },
  { name: "Strengths", prompt: "What are you already good at?", sub: "Pick up to five. Strengths you use outside tech count too." },
  { name: "Working style", prompt: "How do you like to work?", sub: "Four quick choices. None of them is the right answer." },
  { name: "Goals", prompt: "What are you hoping tech will do for you?", sub: "This changes which careers we put first, and how we pace your roadmap." },
  { name: "Technology", prompt: "Which parts of technology pull you in?", sub: "Pick up to five. You do not need to know much about them yet." },
  { name: "Direction", prompt: "How clear is your direction right now?", sub: "Any answer is fine. We use it to decide how much to narrow down for you." },
  { name: "Starting point", prompt: "Last thing: where are you starting from?", sub: "So the roadmap fits your real week, not an imaginary one." },
] as const;

function Tile({
  selected,
  onClick,
  label,
  hint,
  multi,
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  hint?: string;
  multi?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "focus-ring group flex min-h-[3.5rem] w-full items-center gap-4 border-b px-1 py-3.5 text-left transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40",
        selected ? "border-accent-light" : "border-[rgb(var(--fg-tint)/0.12)] hover:border-[rgb(var(--fg-tint)/0.35)]"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex h-5 w-5 flex-shrink-0 items-center justify-center border transition-colors",
          multi ? "rounded-[3px]" : "rounded-full",
          selected ? "border-accent-light bg-accent-light text-[#0b0d0a]" : "border-[rgb(var(--fg-tint)/0.3)] text-transparent"
        )}
      >
        <Check className="h-3 w-3" />
      </span>
      <span className="min-w-0">
        <span className={cn("block text-base font-medium leading-snug", selected ? "text-ink-100" : "text-ink-200")}>{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-ink-500">{hint}</span>}
      </span>
    </button>
  );
}

function ChoiceList({
  choices,
  selected,
  onToggle,
  max = MAX_PICKS,
  columns = true,
}: {
  choices: Choice[];
  selected: string[];
  onToggle: (id: string) => void;
  max?: number;
  columns?: boolean;
}) {
  const full = selected.length >= max;
  return (
    <div>
      <div className={cn("grid gap-x-10", columns && "sm:grid-cols-2")}>
        {choices.map((c) => (
          <Tile
            key={c.id}
            multi
            label={c.label}
            hint={c.hint}
            selected={selected.includes(c.id)}
            disabled={full && !selected.includes(c.id)}
            onClick={() => onToggle(c.id)}
          />
        ))}
      </div>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-wide text-ink-500" aria-live="polite">
        {selected.length} of {max} chosen
      </p>
    </div>
  );
}

function Segmented<T extends string | number | boolean>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: { value: T; label: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink-200">{legend}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "focus-ring min-h-[2.75rem] rounded-lg border px-4 text-sm font-medium transition-colors",
              value === o.value
                ? "border-accent-light bg-accent/15 text-accent-light"
                : "border-[rgb(var(--fg-tint)/0.14)] text-ink-300 hover:border-[rgb(var(--fg-tint)/0.35)] hover:text-ink-100"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, register, login } = useAuth();
  // 0 = the opening screen; 1..7 = the seven chapters.
  const [step, setStep] = useState(0);
  const [journey, setJourney] = useState<JourneyState>(EMPTY_JOURNEY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signup" | "login">("signup");

  function set<K extends keyof JourneyState>(key: K, value: JourneyState[K]) {
    setJourney((j) => ({ ...j, [key]: value }));
  }

  async function handleFinalSubmit() {
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
      const answers = buildAnswers(journey);
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

  const chapterIndex = step - 1;
  const chapter = step > 0 ? CHAPTERS[chapterIndex]! : null;
  const isLast = step === CHAPTERS.length;

  const canContinue = (() => {
    switch (step) {
      case 1: return journey.interests.length > 0;
      case 2: return journey.strengths.length > 0;
      case 3:
        return (
          journey.peoplePreference !== undefined &&
          journey.workStyle !== undefined &&
          journey.pace !== undefined &&
          journey.wantsRemote !== undefined
        );
      case 4: return !!journey.goal && !!journey.timeline;
      case 5: return journey.techInterests.length > 0;
      case 6: return !!journey.direction;
      case 7: return !!journey.persona && !!journey.device && !!journey.minutesPerDay;
      default: return true;
    }
  })();

  const heard = signalLabels(journey);

  function renderChapter() {
    switch (step) {
      case 1:
        return <ChoiceList choices={INTEREST_CHOICES} selected={journey.interests} onToggle={(id) => set("interests", toggle(journey.interests, id))} />;
      case 2:
        return <ChoiceList choices={STRENGTH_CHOICES} selected={journey.strengths} onToggle={(id) => set("strengths", toggle(journey.strengths, id))} />;
      case 3:
        return (
          <div className="space-y-8">
            <Segmented
              legend="My best days involve mostly..."
              value={journey.peoplePreference}
              onChange={(v) => set("peoplePreference", v)}
              options={[
                { value: "people", label: "People" },
                { value: "systems", label: "Systems and tools" },
                { value: "both", label: "A real mix" },
              ]}
            />
            <Segmented
              legend="I do my best thinking..."
              value={journey.workStyle}
              onChange={(v) => set("workStyle", v)}
              options={[
                { value: "independent", label: "On my own" },
                { value: "collaborative", label: "With a team" },
                { value: "mixed", label: "Depends on the day" },
              ]}
            />
            <Segmented
              legend="The pace I like..."
              value={journey.pace}
              onChange={(v) => set("pace", v)}
              options={[
                { value: "steady", label: "Calm and steady" },
                { value: "fast", label: "Fast, high stakes" },
              ]}
            />
            <Segmented
              legend="Working remotely is..."
              value={journey.wantsRemote}
              onChange={(v) => set("wantsRemote", v)}
              options={[
                { value: true, label: "Something I want" },
                { value: false, label: "Not a priority" },
              ]}
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-8">
            <div>
              {GOAL_CHOICES.map((c) => (
                <Tile key={c.id} label={c.label} hint={c.hint} selected={journey.goal === c.id} onClick={() => set("goal", c.id)} />
              ))}
            </div>
            <Segmented
              legend="I would like to be working in tech..."
              value={journey.timeline}
              onChange={(v) => set("timeline", v)}
              options={TIMELINE_CHOICES.map((c) => ({ value: c.id, label: c.label }))}
            />
          </div>
        );
      case 5:
        return <ChoiceList choices={TECH_CHOICES} selected={journey.techInterests} onToggle={(id) => set("techInterests", toggle(journey.techInterests, id))} />;
      case 6:
        return (
          <div className="space-y-8">
            <div>
              {DIRECTION_CHOICES.map((c) => (
                <Tile
                  key={c.id}
                  label={c.label}
                  hint={c.hint}
                  selected={journey.direction === c.id}
                  onClick={() => setJourney((j) => ({ ...j, direction: c.id, category: c.id === "open" ? undefined : j.category }))}
                />
              ))}
            </div>
            {(journey.direction === "know" || journey.direction === "narrowed") && (
              <div className="animate-fade-in-up">
                <p className="text-sm font-medium text-ink-200">
                  {journey.direction === "know" ? "Which area is it in?" : "Which area is closest?"}{" "}
                  <span className="font-normal text-ink-500">(optional)</span>
                </p>
                <div className="mt-2 grid gap-x-10 sm:grid-cols-2">
                  {CAREER_CATEGORIES.map((c) => (
                    <Tile
                      key={c.slug}
                      label={c.name}
                      hint={c.blurb}
                      selected={journey.category === c.slug}
                      onClick={() => set("category", journey.category === c.slug ? undefined : c.slug)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 7:
        return (
          <div className="space-y-8">
            <Segmented legend="Right now I am a..." value={journey.persona} onChange={(v) => set("persona", v)} options={PERSONA_CHOICES.map((c) => ({ value: c.id, label: c.label }))} />
            <Segmented legend="I can realistically give it..." value={journey.minutesPerDay} onChange={(v) => set("minutesPerDay", v)} options={TIME_CHOICES} />
            <Segmented legend="I learn on a..." value={journey.device} onChange={(v) => set("device", v)} options={DEVICE_CHOICES.map((c) => ({ value: c.id, label: c.label }))} />
            <Segmented legend="My experience with tech so far..." value={journey.knowledge} onChange={(v) => set("knowledge", v)} options={KNOWLEDGE_CHOICES.map((c) => ({ value: c.id, label: c.label }))} />
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <>
    <GlobalNav />
    <div className="lg:grid lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[minmax(0,26rem)_1fr]">
      {/* The journey so far: a fixed dark panel on desktop, a slim header
          on mobile. It shows where you are in the chapters and, as you
          answer, what we have heard from you, so the next screen reads as
          a conversation rather than a form. */}
      <aside className="surface-ink relative flex flex-col overflow-hidden px-6 py-5 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:px-10 lg:py-10">
        <div className="lg:hidden">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#9fd6a8]">
            {chapter ? `Chapter ${String(step).padStart(2, "0")} of 07 · ${chapter.name}` : "Discover your direction"}
          </p>
          <div className="mt-3 flex gap-1" aria-hidden="true">
            {CHAPTERS.map((_, i) => (
              <span key={i} className={cn("h-1 flex-1 rounded-full", i < chapterIndex ? "bg-[#9fd6a8]/60" : i === chapterIndex ? "bg-[#9fd6a8]" : "bg-white/10")} />
            ))}
          </div>
        </div>

        <div className="hidden flex-1 flex-col lg:flex">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#9fd6a8]">Discover your direction</p>
          <ol className="mt-6 space-y-1">
            {CHAPTERS.map((c, i) => {
              const state = i < chapterIndex ? "done" : i === chapterIndex ? "active" : "upcoming";
              return (
                <li key={c.name} className="flex items-baseline gap-4 py-1.5">
                  <span className={cn("w-6 font-mono text-xs", state === "upcoming" ? "text-white/30" : "text-[#9fd6a8]")}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "font-display text-xl tracking-tight transition-colors",
                      state === "active" ? "text-white" : state === "done" ? "text-white/60" : "text-white/30"
                    )}
                  >
                    {c.name}
                  </span>
                  {state === "done" && <Check className="h-3.5 w-3.5 self-center text-[#9fd6a8]" aria-label="Done" />}
                </li>
              );
            })}
          </ol>

          <div className="surface-ink-line mt-auto border-t pt-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] surface-ink-muted">What we have heard so far</p>
            {heard.length === 0 ? (
              <p className="mt-3 text-sm leading-relaxed surface-ink-muted">Your answers collect here, and shape the careers we show you at the end.</p>
            ) : (
              <ul className="mt-3 max-h-44 space-y-1.5 overflow-hidden text-sm text-white/85" aria-live="polite">
                {heard.slice(0, 7).map((l) => (
                  <li key={l} className="flex items-baseline gap-2.5">
                    <span className="h-1 w-1 flex-shrink-0 -translate-y-0.5 rounded-full bg-[#9fd6a8]" aria-hidden="true" />
                    {l}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </aside>

      <main className="relative flex flex-col justify-center px-6 py-10 sm:px-12 lg:min-h-[calc(100vh-4rem)] lg:px-20">
        <div className="bg-contour pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]" />
        <div className="mx-auto w-full max-w-2xl">
          <div key={step} className="animate-fade-in-up">
            {step === 0 ? (
              <>
                <p className="eyebrow">The first chapter</p>
                <h1 className="mt-4 font-display text-hero font-semibold tracking-tight text-ink-100">
                  Discover your direction.
                </h1>
                <p className="mt-6 max-w-lg text-deck leading-relaxed text-ink-300">
                  Seven short chapters about what interests you, what you are good at, how you like to work and
                  where you want to end up. At the end you get a career match built from your own answers,
                  not a quiz score.
                </p>
                <ul className="mt-8 grid max-w-md grid-cols-2 lg:hidden gap-x-6 gap-y-2 text-sm text-ink-400">
                  {CHAPTERS.map((c, i) => (
                    <li key={c.name} className="flex items-baseline gap-3">
                      <span className="font-mono text-xs text-ink-500">{String(i + 1).padStart(2, "0")}</span>
                      {c.name}
                    </li>
                  ))}
                </ul>
                <p className="mt-8 text-xs text-ink-500">About 5 minutes. No wrong answers. Free.</p>
              </>
            ) : (
              <>
                <p className="eyebrow">
                  {String(step).padStart(2, "0")} / 07 · {chapter!.name}
                </p>
                <h1 className="mt-4 font-display text-display font-semibold tracking-tight text-ink-100">{chapter!.prompt}</h1>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">{chapter!.sub}</p>
                <div className="mt-8">{renderChapter()}</div>
              </>
            )}
          </div>

          {isLast && !user && (
            <div className="mt-10 space-y-3 border-t border-[rgb(var(--fg-tint)/0.12)] pt-6">
              <p className="text-sm font-medium text-ink-100">
                {mode === "signup" ? "Create your free account to see your direction" : "Log in to see your direction"}
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

          {isLast && error && user && <Alert className="mt-4">{error}</Alert>}

          <div className="mt-10 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
            {isLast ? (
              <Button onClick={handleFinalSubmit} loading={submitting} disabled={!canContinue} className="gap-1.5">
                Reveal my direction <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canContinue} className="gap-1.5">
                {step === 0 ? "Begin" : "Continue"} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
    </>
  );
}
