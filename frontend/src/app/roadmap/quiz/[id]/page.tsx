"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { SkeletonCard } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { QuizItem } from "@/types";

export default function QuizPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizItem | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number } | null>(null);

  useEffect(() => {
    api
      .get<QuizItem>(`/quizzes/${params.id}`)
      .then(setQuiz)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this checkpoint."))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post<{ score: number }>(`/quizzes/${params.id}/submit`, { answers: selected });
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't submit your answers.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <Button variant="ghost" size="sm" className="mb-6 gap-1.5" onClick={() => router.push("/roadmap")}>
        <ArrowLeft className="h-3.5 w-3.5" /> Back to roadmap
      </Button>

      {loading && <SkeletonCard />}
      {error && <Alert>{error}</Alert>}

      {quiz && !result && (
        <Card>
          <CardContent className="p-6">
            <Badge tone="accent">Checkpoint</Badge>
            <h1 className="mt-3 text-xl font-semibold text-ink-100">{quiz.title}</h1>
            <p className="mt-1 text-sm text-ink-500">Pass at {quiz.passing_score}% to complete this checkpoint.</p>

            <div className="mt-6 space-y-6">
              {quiz.questions.map((q, i) => (
                <div key={q.id}>
                  <p className="mb-3 text-sm font-medium text-ink-100">
                    {i + 1}. {q.prompt}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSelected((s) => ({ ...s, [q.id]: opt }))}
                        className={cn(
                          "w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors focus-ring",
                          selected[q.id] === opt
                            ? "border-accent bg-accent/15 text-accent-light"
                            : "border-white/10 bg-white/[0.02] text-ink-300 hover:border-white/20"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button
              className="mt-8 w-full"
              onClick={submit}
              loading={submitting}
              disabled={Object.keys(selected).length < quiz.questions.length}
            >
              Submit answers
            </Button>
          </CardContent>
        </Card>
      )}

      {result && quiz && (
        <Card>
          <CardContent className="flex flex-col items-center p-10 text-center">
            {result.score >= quiz.passing_score ? (
              <CheckCircle2 className="h-10 w-10 text-success" />
            ) : (
              <XCircle className="h-10 w-10 text-danger" />
            )}
            <h2 className="mt-4 text-xl font-semibold text-ink-100">
              {result.score >= quiz.passing_score ? "Checkpoint passed!" : "Not quite yet"}
            </h2>
            <p className="mt-1 text-sm text-ink-500">You scored {result.score}% (passing: {quiz.passing_score}%)</p>
            <div className="mt-6 flex gap-3">
              {result.score < quiz.passing_score && (
                <Button variant="secondary" onClick={() => { setResult(null); setSelected({}); }}>
                  Try again
                </Button>
              )}
              <Button onClick={() => router.push("/roadmap")}>Back to roadmap</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}
