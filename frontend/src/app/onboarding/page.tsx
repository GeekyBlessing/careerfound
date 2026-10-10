"use client";

import { useEffect, useRef, useState } from "react";
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
import {
  CHAPTERS,
  EMPTY_JOURNEY,
  QUESTION_COUNT,
  STORAGE_KEY,
  activeQuestions,
  buildAnswers,
  chapterComplete,
  missingQuestions,
  parseProgress,
  progressOf,
  serializeProgress,
  signalLabels,
  type Choice,
  type JourneyState,
  type Question,
  type SavedProgress,
} from "@/lib/discovery";

/**
 * The onboarding assessment. Seven chapters, each with one job (see
 * src/lib/discovery.ts), then an account step if you are not signed in.
 * Answers are kept in memory and mirrored to this browser's localStorage so a
 * refresh or a return visit can pick up where you stopped. Nothing else is
 * stored there: never the name, email or password. The final step posts the
 * same payload to /assessment and the same profile fields to /users/me.
 */

function ChoicePanel({
  option,
  type,
  name,
  checked,
  blocked,
  onSelect,
}: {
  option: Choice;
  type: "radio" | "checkbox";
  name: string;
  checked: boolean;
  /** A multi question that is full: unchosen panels look inactive. */
  blocked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "relative flex cursor-pointer items-start gap-3.5 rounded-lg border p-4 transition-colors duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-base-950",
        checked
          ? "border-accent-light bg-accent/10"
          : "border-[rgb(var(--fg-tint)/0.16)] hover:border-[rgb(var(--fg-tint)/0.4)]",
        blocked && !checked && "cursor-not-allowed opacity-60 hover:border-[rgb(var(--fg-tint)/0.16)]"
      )}
    >
      <input
        type={type}
        name={name}
        value={option.id}
        checked={checked}
        onChange={onSelect}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center border transition-colors",
          type === "checkbox" ? "rounded-[4px]" : "rounded-full",
          checked ? "border-accent-light bg-accent-light text-base-950" : "border-[rgb(var(--fg-tint)/0.4)] text-transparent"
        )}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
      <span className="min-w-0">
        <span className={cn("block text-[15px] font-medium leading-snug", checked ? "text-ink-100" : "text-ink-200")}>
          {option.label}
        </span>
        {option.hint && <span className="mt-1 block text-[13px] leading-snug text-ink-500">{option.hint}</span>}
      </span>
    </label>
  );
}

function QuestionBlock({
  question,
  journey,
  error,
  onChange,
}: {
  question: Question;
  journey: JourneyState;
  error?: string;
  onChange: (key: Question["key"], value: string[] | string) => void;
}) {
  const { key, kind, options, max = 4 } = question;
  const current = journey[key];
  const selected: string[] = Array.isArray(current) ? current : current === undefined ? [] : [current];
  const full = kind === "multi" && selected.length >= max;
  const [capNote, setCapNote] = useState(false);
  const errorId = `q-${key}-error`;
  const cols = question.compact ? (options.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2") : options.length >= 6 ? "sm:grid-cols-2" : "";

  function select(id: string) {
    if (kind === "single") {
      onChange(key, id);
      return;
    }
    if (selected.includes(id)) {
      setCapNote(false);
      onChange(key, selected.filter((x) => x !== id));
    } else if (full) {
      setCapNote(true);
    } else {
      setCapNote(false);
      onChange(key, [...selected, id]);
    }
  }

  return (
    <fieldset
      id={`q-${key}`}
      tabIndex={-1}
      aria-describedby={error ? errorId : undefined}
      aria-invalid={error ? true : undefined}
      className="min-w-0 border-0 p-0 outline-none"
    >
      <legend className="text-sm font-semibold text-ink-100">{question.legend}</legend>
      {question.help && <p className="mt-1 text-[13px] leading-relaxed text-ink-500">{question.help}</p>}
      <div className={cn("mt-3 grid gap-2.5", cols)}>
        {options.map((o) => (
          <ChoicePanel
            key={o.id}
            option={o}
            type={kind === "multi" ? "checkbox" : "radio"}
            name={`q-${key}`}
            checked={selected.includes(o.id)}
            blocked={full}
            onSelect={() => select(o.id)}
          />
        ))}
      </div>
      {kind === "multi" && (
        <p className="mt-3 text-[13px] text-ink-500" aria-live="polite">
          {capNote
            ? `You can choose up to ${max}. Untick one to choose a different answer.`
            : `${selected.length} of ${max} chosen`}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-3 text-[13px] font-medium text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function ago(ms: number): string {
  const mins = Math.max(0, Math.round((Date.now() - ms) / 60000));
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.round(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, register, login } = useAuth();
  // 0 = the opening screen; 1..7 = the seven chapters.
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [journey, setJourney] = useState<JourneyState>(EMPTY_JOURNEY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resumeOffer, setResumeOffer] = useState<SavedProgress | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const headingRef = useRef<HTMLHeadingElement>(null);
  const movedRef = useRef(false);

  // Offer to resume. Read once, after mount, so server and client render the same.
  useEffect(() => {
    try {
      const saved = parseProgress(window.localStorage.getItem(STORAGE_KEY));
      if (saved) setResumeOffer(saved);
    } catch {
      /* storage blocked: the assessment simply does not resume */
    }
    setHydrated(true);
  }, []);

  // Keep the saved copy current, but never overwrite it while the resume offer is still open.
  useEffect(() => {
    if (!hydrated || resumeOffer) return;
    try {
      if (progressOf(journey).answered > 0) window.localStorage.setItem(STORAGE_KEY, serializeProgress(step, journey));
    } catch {
      /* ignore */
    }
  }, [hydrated, resumeOffer, step, journey]);

  // Move focus to the new heading when the chapter changes, so screen readers announce it.
  useEffect(() => {
    if (!movedRef.current) return;
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [step]);

  function go(next: number) {
    movedRef.current = true;
    setErrors({});
    setError(null);
    setStep(next);
    setMaxStep((m) => Math.max(m, next));
  }

  function clearSaved() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  function resume() {
    if (!resumeOffer) return;
    setJourney(resumeOffer.journey);
    const target = Math.max(1, resumeOffer.step);
    setResumeOffer(null);
    setMaxStep(target);
    go(target);
  }

  function startOver() {
    clearSaved();
    setResumeOffer(null);
    setJourney(EMPTY_JOURNEY);
    setMaxStep(0);
  }

  function setAnswer(key: Question["key"], value: string[] | string) {
    setJourney((j) => {
      const next = { ...j, [key]: value } as JourneyState;
      if (key === "direction" && value === "open") next.category = undefined;
      return next;
    });
    setErrors((e) => {
      if (!e[key]) return e;
      const { [key]: _drop, ...rest } = e;
      return rest;
    });
  }

  const chapterIndex = step - 1;
  const chapter = step > 0 ? CHAPTERS[chapterIndex]! : null;
  const isLast = step === CHAPTERS.length;
  const progress = progressOf(journey);
  const heard = signalLabels(journey);

  function focusQuestion(key: string) {
    const el = document.getElementById(`q-${key}`);
    if (el) {
      el.scrollIntoView({ block: "center" });
      el.focus({ preventScroll: true });
    }
  }

  async function onContinue(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (step === 0) {
      go(1);
      return;
    }
    const missing = missingQuestions(chapter!, journey);
    if (missing.length > 0) {
      const next: Record<string, string> = {};
      for (const q of missing) next[q.key] = q.kind === "multi" ? "Choose at least one answer." : "Choose one answer.";
      setErrors(next);
      focusQuestion(missing[0]!.key);
      return;
    }
    if (!isLast) {
      go(step + 1);
      return;
    }
    await finish();
  }

  async function finish() {
    // A resumed or edited journey may be incomplete somewhere earlier: send them back to it.
    const firstIncomplete = CHAPTERS.findIndex((c) => !chapterComplete(c, journey));
    if (firstIncomplete !== -1) {
      go(firstIncomplete + 1);
      setError("A few answers are missing in an earlier part. Please complete them, then continue.");
      return;
    }
    setError(null);
    if (!user) {
      const fe: Record<string, string> = {};
      if (mode === "signup" && !fullName.trim()) fe.fullName = "Enter your name.";
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) fe.email = "Enter a valid email address.";
      if (mode === "signup" ? password.length < 8 : password.length === 0) {
        fe.password = mode === "signup" ? "Use at least 8 characters." : "Enter your password.";
      }
      setFieldErrors(fe);
      if (Object.keys(fe).length > 0) {
        document.getElementById(Object.keys(fe)[0]!)?.focus();
        return;
      }
    }
    setSubmitting(true);
    let accountReady = !!user;
    try {
      if (!user) {
        if (mode === "signup") await register(email.trim(), password, fullName.trim());
        else await login(email.trim(), password);
        accountReady = true;
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
      clearSaved();
      router.push("/assessment/results");
    } catch (err) {
      const message = err instanceof ApiError || err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(
        accountReady
          ? `Your account is ready, but we could not save your answers: ${message} Your answers are still here, so you can try again.`
          : message
      );
    } finally {
      setSubmitting(false);
    }
  }

  const questions = chapter ? activeQuestions(chapter, journey) : [];
  const errorCount = Object.keys(errors).length;

  return (
    <>
      <GlobalNav />
      <div className="lg:grid lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[minmax(0,26rem)_1fr]">
        {/* The journey so far: where you are in the seven chapters, how many
            questions are answered, and what you have told us. A fixed dark
            panel on desktop, a slim header on mobile. */}
        <aside className="surface-ink relative flex flex-col overflow-hidden px-6 py-5 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:px-10 lg:py-10" aria-label="Your progress">
          <div className="lg:hidden">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#9fd6a8]">
              {chapter ? `Part ${step} of ${CHAPTERS.length}: ${chapter.name}` : "Career assessment"}
            </p>
            <div
              className="mt-3 h-1 overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-label="Questions answered"
              aria-valuemin={0}
              aria-valuemax={progress.total}
              aria-valuenow={progress.answered}
            >
              <div className="h-full bg-[#9fd6a8] transition-[width] duration-200" style={{ width: `${progress.pct}%` }} />
            </div>
            <p className="mt-2 text-xs surface-ink-muted">
              {progress.answered} of {progress.total} questions answered
            </p>
          </div>

          <div className="hidden flex-1 flex-col lg:flex">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#9fd6a8]">Career assessment</p>
            <ol className="mt-6 space-y-0.5">
              {CHAPTERS.map((c, i) => {
                const done = chapterComplete(c, journey) && i + 1 < Math.max(step, maxStep + 1);
                const active = i === chapterIndex;
                const reachable = i + 1 <= maxStep && !active;
                const inner = (
                  <>
                    <span className={cn("w-6 font-mono text-xs", !active && !done && !reachable ? "text-white/30" : "text-[#9fd6a8]")}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "font-display text-xl tracking-tight transition-colors",
                        active ? "text-white" : done ? "text-white/70" : reachable ? "text-white/60" : "text-white/30"
                      )}
                    >
                      {c.name}
                    </span>
                    {done && !active && <Check className="h-3.5 w-3.5 self-center text-[#9fd6a8]" aria-label="Complete" />}
                  </>
                );
                return (
                  <li key={c.id}>
                    {reachable ? (
                      <button
                        type="button"
                        onClick={() => go(i + 1)}
                        className="focus-ring flex w-full items-baseline gap-4 rounded py-1.5 text-left hover:opacity-90"
                      >
                        {inner}
                      </button>
                    ) : (
                      <div className="flex items-baseline gap-4 py-1.5" aria-current={active ? "step" : undefined}>
                        {inner}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>

            <div className="mt-6" role="progressbar" aria-label="Questions answered" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.answered}>
              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-[#9fd6a8] transition-[width] duration-200" style={{ width: `${progress.pct}%` }} />
              </div>
              <p className="mt-2 text-xs surface-ink-muted">
                {progress.answered} of {progress.total} questions answered
              </p>
            </div>

            <div className="surface-ink-line mt-auto border-t pt-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] surface-ink-muted">What you have told us</p>
              {heard.length === 0 ? (
                <p className="mt-3 text-sm leading-relaxed surface-ink-muted">
                  Nothing yet. Your interests, strengths and working style will be listed here as you choose them, so you can see what your results are built from.
                </p>
              ) : (
                <ul className="mt-3 max-h-44 space-y-1.5 overflow-y-auto pr-1 text-sm text-white/85" aria-live="polite">
                  {heard.map((l) => (
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
          <form className="mx-auto w-full max-w-2xl" onSubmit={onContinue} noValidate>
            <div key={step} className="animate-fade-in-up motion-reduce:animate-none">
              {step === 0 ? (
                <>
                  <p className="eyebrow">Career assessment</p>
                  <h1 ref={headingRef} tabIndex={-1} className="mt-4 font-display text-hero font-semibold tracking-tight text-ink-100 outline-none">
                    Find the tech career that fits how you work.
                  </h1>
                  <p className="mt-6 max-w-xl text-deck leading-relaxed text-ink-300">
                    Tell us what you enjoy, what people already rely on you for, and how much time you really have.
                    We will suggest three careers, explain why each one came up, and show you a first project to try.
                    You do not need any experience with technology.
                  </p>

                  {resumeOffer && (
                    <div className="mt-8 rounded-lg border border-accent-light/40 bg-accent/10 p-4" role="region" aria-label="Saved answers">
                      <p className="text-sm font-medium text-ink-100">
                        Welcome back. You answered {progressOf(resumeOffer.journey).answered} of {QUESTION_COUNT} questions {ago(resumeOffer.savedAt)}.
                      </p>
                      <p className="mt-1 text-[13px] text-ink-400">Your answers are saved in this browser only.</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button type="button" size="sm" onClick={resume}>
                          Continue where I left off
                        </Button>
                        <Button type="button" size="sm" variant="secondary" onClick={startOver}>
                          Start again
                        </Button>
                      </div>
                    </div>
                  )}

                  <ol className="mt-8 divide-y divide-[rgb(var(--fg-tint)/0.1)] border-y border-[rgb(var(--fg-tint)/0.1)]">
                    {CHAPTERS.map((c, i) => (
                      <li key={c.id} className="flex items-baseline gap-4 py-2.5 text-sm">
                        <span className="w-6 flex-shrink-0 font-mono text-xs text-ink-500">{String(i + 1).padStart(2, "0")}</span>
                        <span className="w-32 flex-shrink-0 font-medium text-ink-100">{c.name}</span>
                        <span className="text-ink-400">{c.purpose}</span>
                      </li>
                    ))}
                  </ol>

                  <p className="mt-6 text-sm text-ink-400">
                    {QUESTION_COUNT} questions in {CHAPTERS.length} parts. You can go back to change any answer, and your answers are saved in this
                    browser as you go. There are no right answers, and it is free.
                  </p>

                  <details className="mt-4 text-sm text-ink-400">
                    <summary className="focus-ring cursor-pointer rounded text-ink-300 hover:text-ink-100">How your answers are used</summary>
                    <p className="mt-2 max-w-xl leading-relaxed">
                      Your interests, strengths, working style, technology choices and direction are matched against our catalogue of 48
                      careers, and the closest three are shown with the reasons. Your goals, timeline, time and way of learning do not change the
                      ranking. They shape the notes on each result. The result shows potential fit. It cannot tell you how well you will do.
                    </p>
                  </details>
                </>
              ) : (
                <>
                  <p className="eyebrow">
                    Part {step} of {CHAPTERS.length} · {chapter!.name}
                  </p>
                  <h1 ref={headingRef} tabIndex={-1} className="mt-4 font-display text-display font-semibold tracking-tight text-ink-100 outline-none">
                    {chapter!.prompt}
                  </h1>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-400">{chapter!.sub}</p>

                  {errorCount > 0 && (
                    <Alert className="mt-6">
                      {errorCount === 1 ? "One question still needs an answer." : `${errorCount} questions still need an answer.`} They are marked below.
                    </Alert>
                  )}

                  <div className="mt-8 space-y-9">
                    {questions.map((q) => (
                      <QuestionBlock key={q.key} question={q} journey={journey} error={errors[q.key]} onChange={setAnswer} />
                    ))}
                  </div>
                </>
              )}
            </div>

            {isLast && !user && (
              <div className="mt-10 space-y-3 border-t border-[rgb(var(--fg-tint)/0.12)] pt-6">
                <p className="text-sm font-medium text-ink-100">
                  {mode === "signup" ? "Create a free account to see your results" : "Log in to see your results"}
                </p>
                <p className="text-[13px] text-ink-500">Your results are saved to your account so you can come back to them.</p>
                {mode === "signup" && (
                  <div>
                    <Label htmlFor="fullName">Full name</Label>
                    <Input
                      id="fullName"
                      autoComplete="name"
                      value={fullName}
                      aria-invalid={fieldErrors.fullName ? true : undefined}
                      aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                    {fieldErrors.fullName && <p id="fullName-error" role="alert" className="mt-1 text-xs font-medium text-danger">{fieldErrors.fullName}</p>}
                  </div>
                )}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    aria-invalid={fieldErrors.email ? true : undefined}
                    aria-describedby={fieldErrors.email ? "email-error" : undefined}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {fieldErrors.email && <p id="email-error" role="alert" className="mt-1 text-xs font-medium text-danger">{fieldErrors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    value={password}
                    aria-invalid={fieldErrors.password ? true : undefined}
                    aria-describedby={fieldErrors.password ? "password-error" : mode === "signup" ? "password-hint" : undefined}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {fieldErrors.password ? (
                    <p id="password-error" role="alert" className="mt-1 text-xs font-medium text-danger">{fieldErrors.password}</p>
                  ) : (
                    mode === "signup" && <p id="password-hint" className="mt-1 text-xs text-ink-500">At least 8 characters.</p>
                  )}
                </div>
                <button
                  type="button"
                  className="focus-ring rounded text-xs text-ink-400 hover:text-ink-100"
                  onClick={() => {
                    setMode(mode === "signup" ? "login" : "signup");
                    setFieldErrors({});
                    setError(null);
                  }}
                >
                  {mode === "signup" ? "Already have an account? Log in instead" : "New here? Create an account instead"}
                </button>
              </div>
            )}

            {error && (
              <Alert className="mt-6">
                {error}
              </Alert>
            )}

            <div className="mt-10 flex items-center justify-between">
              <Button type="button" variant="ghost" size="sm" onClick={() => go(Math.max(0, step - 1))} disabled={step === 0 || submitting} className="gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
              <Button type="submit" loading={submitting} className="gap-1.5">
                {step === 0 ? "Start" : isLast ? "See my results" : "Continue"} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}
