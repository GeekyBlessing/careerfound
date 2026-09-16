"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  Target,
  ListOrdered,
  Sparkles,
  FolderGit2,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { SkeletonCard } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/api";
import { track } from "@/lib/analytics";
import type { ProjectItem, PortfolioItem } from "@/types";

interface ReviewFinding {
  severity: "must_fix" | "should_fix" | "nice_to_have" | "praise";
  comment: string;
}
interface ReviewResult {
  overall_assessment: string;
  findings: ReviewFinding[];
  skills_demonstrated: string[];
  suggested_next_project: string;
}

const SEVERITY_META: Record<ReviewFinding["severity"], { tone: "danger" | "warning" | "neutral" | "success"; label: string }> = {
  must_fix: { tone: "danger", label: "Must fix" },
  should_fix: { tone: "warning", label: "Should fix" },
  nice_to_have: { tone: "neutral", label: "Nice to have" },
  praise: { tone: "success", label: "What's working" },
};

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [submission, setSubmission] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const [marking, setMarking] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem | null>(null);
  const [generating, setGenerating] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<ProjectItem>(`/projects/${params.id}`)
      .then(setProject)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this project."))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function requestReview() {
    if (!submission.trim()) {
      setReviewError("Paste your code or a description of what you built first.");
      return;
    }
    setReviewing(true);
    setReviewError(null);
    try {
      const res = await api.post<ReviewResult>(`/mentor/projects/${params.id}/review`, { submission_text: submission });
      setReview(res);
    } catch (err) {
      setReviewError(err instanceof ApiError ? err.message : "Couldn't get feedback right now.");
    } finally {
      setReviewing(false);
    }
  }

  async function markComplete() {
    setMarking(true);
    setCompleteError(null);
    try {
      await api.post(`/projects/${params.id}/submit`);
      setProject((p) => (p ? { ...p, status: "completed" } : p));
      track("project_completed");
    } catch (err) {
      setCompleteError(err instanceof ApiError ? err.message : "Couldn't mark this project complete.");
    } finally {
      setMarking(false);
    }
  }

  async function generatePortfolio() {
    setGenerating(true);
    setPortfolioError(null);
    try {
      const res = await api.post<PortfolioItem>("/portfolio/generate", { project_id: params.id, submission_text: submission });
      setPortfolio(res);
      track("portfolio_item_generated");
    } catch (err) {
      setPortfolioError(err instanceof ApiError ? err.message : "Couldn't generate portfolio copy.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <AppShell>
      <Button variant="ghost" size="sm" className="mb-6 gap-1.5" onClick={() => router.push("/roadmap")}>
        <ArrowLeft className="h-3.5 w-3.5" /> Back to roadmap
      </Button>

      {loading && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      )}
      {error && <Alert>{error}</Alert>}

      {project && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone={project.status === "completed" ? "success" : "accent"}>
                {project.status === "completed" ? "Completed" : `Difficulty ${project.difficulty}/5`}
              </Badge>
            </div>
            <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight text-ink-100">
              <FolderGit2 className="h-5 w-5 text-ink-500" aria-hidden="true" /> {project.title}
            </h1>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardContent className="space-y-5 p-6">
                  <Section icon={Target} title="What this teaches">
                    <p className="text-sm leading-relaxed text-ink-400">{project.teaches}</p>
                  </Section>

                  {project.prerequisites.length > 0 && (
                    <Section icon={CheckCircle2} title="Prerequisites">
                      <div className="flex flex-wrap gap-1.5">
                        {project.prerequisites.map((p) => (
                          <Badge key={p}>{p}</Badge>
                        ))}
                      </div>
                    </Section>
                  )}

                  <Section icon={Target} title="Expected output">
                    <p className="text-sm leading-relaxed text-ink-400">{project.expected_output}</p>
                  </Section>

                  <Section icon={ListOrdered} title="Step-by-step guidance">
                    <ol className="space-y-2 text-sm text-ink-400">
                      {project.steps.map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[rgb(var(--fg-tint)/0.08)] text-xs text-ink-300">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </Section>

                  {project.hints.length > 0 && (
                    <Section icon={Lightbulb} title="Hints">
                      <ul className="space-y-1.5 text-sm text-ink-400">
                        {project.hints.map((h, i) => (
                          <li key={i} className="flex gap-2">
                            <Lightbulb className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-accent-light" aria-hidden="true" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </Section>
                  )}

                  {project.common_mistakes.length > 0 && (
                    <Section icon={AlertTriangle} title="Common mistakes">
                      <ul className="space-y-1.5 text-sm text-ink-400">
                        {project.common_mistakes.map((m, i) => (
                          <li key={i} className="flex gap-2">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-warning" aria-hidden="true" />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </Section>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/12 text-accent-light">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <p className="mb-1 text-sm font-semibold text-ink-100">AI Project Reviewer</p>
                  <p className="mb-4 text-xs text-ink-500">
                    Paste your code or a description of what you built for structured, senior-engineer-style feedback.
                  </p>
                  <Textarea
                    rows={8}
                    placeholder="Paste your code or describe what you built..."
                    value={submission}
                    onChange={(e) => setSubmission(e.target.value)}
                    className="font-mono text-xs"
                  />
                  {reviewError && <Alert className="mt-3">{reviewError}</Alert>}
                  <Button className="mt-4 gap-1.5" onClick={requestReview} loading={reviewing}>
                    <Sparkles className="h-3.5 w-3.5" /> Get feedback
                  </Button>

                  {review && (
                    <div className="mt-6 animate-fade-in-up space-y-4 border-t border-[rgb(var(--fg-tint)/0.1)] pt-5">
                      <p className="text-sm text-ink-300">{review.overall_assessment}</p>
                      <div className="space-y-2">
                        {review.findings.map((f, i) => (
                          <div key={i} className="flex items-start gap-2.5 rounded-lg border border-[rgb(var(--fg-tint)/0.06)] bg-[rgb(var(--fg-tint)/0.02)] px-3 py-2.5">
                            <Badge tone={SEVERITY_META[f.severity].tone} className="mt-0.5 flex-shrink-0">
                              {SEVERITY_META[f.severity].label}
                            </Badge>
                            <p className="text-xs leading-relaxed text-ink-400">{f.comment}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-ink-500">
                        <span className="font-medium text-ink-300">Suggested next step: </span>
                        {review.suggested_next_project}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/12 text-accent-light">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  </div>
                  <p className="text-sm font-semibold text-ink-100">Ready to submit?</p>
                  <p className="mt-1 text-xs text-ink-500">Mark this project complete once you&apos;re happy with it.</p>
                  {completeError && <Alert className="mt-3">{completeError}</Alert>}
                  <Button
                    className="mt-4 w-full"
                    variant={project.status === "completed" ? "secondary" : "primary"}
                    onClick={markComplete}
                    loading={marking}
                    disabled={project.status === "completed"}
                  >
                    {project.status === "completed" ? "Completed" : "Mark project complete"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/12 text-accent-light">
                    <FolderGit2 className="h-4.5 w-4.5" />
                  </div>
                  <p className="text-sm font-semibold text-ink-100">Add to portfolio</p>
                  <p className="mt-1 text-xs text-ink-500">
                    {project.status === "completed"
                      ? "Auto-generate a project description, README, CV bullet, and LinkedIn post."
                      : "Mark the project complete first, this only generates copy for work you've actually finished."}
                  </p>
                  {portfolioError && <Alert className="mt-3">{portfolioError}</Alert>}
                  <Button
                    variant="secondary"
                    className="mt-4 w-full gap-1.5"
                    onClick={generatePortfolio}
                    loading={generating}
                    disabled={project.status !== "completed"}
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Generate portfolio copy
                  </Button>

                  {portfolio && (
                    <div className="mt-4 animate-fade-in-up space-y-3 rounded-xl border border-[rgb(var(--fg-tint)/0.1)] bg-base-950/60 p-3 text-xs">
                      <p className="text-ink-300">{portfolio.cv_bullet}</p>
                      <Button variant="ghost" size="sm" className="w-full gap-1.5" onClick={() => router.push("/portfolio")}>
                        Edit in Portfolio Builder <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
        <Icon className="h-3.5 w-3.5" /> {title}
      </p>
      {children}
    </div>
  );
}
