"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { api, ApiError } from "@/lib/api";

type Answers = {
  enjoys_problem_solving?: boolean;
  enjoys_math?: boolean;
  enjoys_creativity?: boolean;
  enjoys_people?: boolean;
  prefers_systems?: boolean;
  wants_remote?: boolean;
};

const QUESTIONS: { key: keyof Answers; prompt: string; helper: string }[] = [
  { key: "enjoys_problem_solving", prompt: "Do you enjoy problem solving?", helper: "Puzzles, debugging, figuring out why something broke." },
  { key: "enjoys_math", prompt: "Do you enjoy math or working with numbers and logic?", helper: "" },
  { key: "enjoys_creativity", prompt: "Do you enjoy creative work?", helper: "Design, writing, visual thinking." },
  { key: "enjoys_people", prompt: "Do you enjoy working directly with people?", helper: "" },
  { key: "prefers_systems", prompt: "Do you prefer working with systems and processes over people?", helper: "" },
  { key: "wants_remote", prompt: "Do you want to work remotely?", helper: "" },
];

export default function RetakeAssessmentPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      await api.post("/assessment", { answers });
      router.push("/assessment/results");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't run the assessment right now.");
    } finally {
      setSubmitting(false);
    }
  }

  const allAnswered = QUESTIONS.every((q) => answers[q.key] !== undefined);

  return (
    <AppShell>
      <div className="mx-auto max-w-xl">
        <div className="mb-6 text-center">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent-light">
            <Sparkles className="h-3.5 w-3.5" /> Find Your Tech Path
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-ink-100">Retake your assessment</h1>
          <p className="mt-1 text-sm text-ink-500">Answers update your recommendations — your progress stays untouched.</p>
        </div>

        <Card className="p-8">
          {error && <Alert className="mb-4">{error}</Alert>}
          <div className="space-y-6">
            {QUESTIONS.map((q) => (
              <div key={q.key}>
                <p className="text-sm font-medium text-ink-100">{q.prompt}</p>
                {q.helper && <p className="mt-0.5 text-xs text-ink-500">{q.helper}</p>}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [q.key]: true }))}
                    className={cn(
                      "rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors focus-ring",
                      answers[q.key] === true ? "border-accent bg-accent/15 text-accent-light" : "border-white/10 bg-white/[0.03] text-ink-300"
                    )}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [q.key]: false }))}
                    className={cn(
                      "rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors focus-ring",
                      answers[q.key] === false ? "border-accent bg-accent/15 text-accent-light" : "border-white/10 bg-white/[0.03] text-ink-300"
                    )}
                  >
                    Not really
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Button className="mt-8 w-full gap-1.5" onClick={submit} disabled={!allAnswered} loading={submitting}>
            See my results <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Card>
      </div>
    </AppShell>
  );
}
