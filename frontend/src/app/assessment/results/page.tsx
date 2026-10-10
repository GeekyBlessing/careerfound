"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Award } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { CareerDnaRadar } from "@/components/charts/career-dna-radar";
import { api, ApiError } from "@/lib/api";
import { careerBySlug } from "@/lib/career-categories";
import { cn } from "@/lib/utils";
import type { AssessmentResult, CareerRecommendation } from "@/types";

const TIER_LABEL = {
  best_match: "Closest match",
  strong_alternative: "Strong alternative",
  wild_card: "A different angle",
} as const;

function nameOf(rec: CareerRecommendation): string {
  return careerBySlug(rec.path_slug)?.name ?? rec.path_slug.replace(/-/g, " ");
}

export default function AssessmentResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingPath, setStartingPath] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<AssessmentResult>("/assessment/latest")
      .then(setResult)
      .catch((err) => setError(err instanceof ApiError ? err.message : "We could not load your results. Please refresh the page."))
      .finally(() => setLoading(false));
  }, []);

  const recs = result?.recommendations ?? [];
  // Results saved before the reasons and project links existed have no summary.
  const older = recs.length > 0 && recs.every((r) => !r.summary);

  async function startRoadmap(slug: string) {
    setStartingPath(slug);
    setError(null);
    try {
      await api.post("/roadmaps", { path_slug: slug });
      router.push("/roadmap");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We could not start that roadmap. Please try again.");
      setStartingPath(null);
    }
  }

  return (
    <AppShell>
      <div className="mb-10 max-w-3xl">
        <p className="eyebrow">Your results</p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-100 sm:text-3xl">
          Three careers to look at first
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-400">
          These came from your answers and from what each career involves. &quot;Fit&quot; here means potential: how closely your answers match the
          work. It does not measure ability, and it does not promise a job. Treat it as a good place to start looking.
        </p>
      </div>

      {loading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {error && <Alert className="mb-6">{error}</Alert>}

      {result && (
        <div className="space-y-14">
          {older && (
            <Alert variant="info">
              These results were saved before we added the reasons and project links. Retake the assessment to see the fuller version.
            </Alert>
          )}

          <section aria-labelledby="lean-heading" className="grid gap-8 lg:grid-cols-[300px_1fr] lg:items-center">
            <CareerDnaRadar dna={result.career_dna} />
            <div className="max-w-xl">
              <h2 id="lean-heading" className="font-display text-xl font-semibold tracking-tight text-ink-100">
                Where your answers lean
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-300">{result.career_dna.summary}</p>
            </div>
          </section>

          {recs.length > 0 ? (
            <>
              {!older && <CompareSection recs={recs} />}
              <div className="space-y-14">
                {recs.map((rec) => (
                  <CareerResult
                    key={rec.path_slug}
                    rec={rec}
                    older={older}
                    onStart={startRoadmap}
                    starting={startingPath === rec.path_slug}
                  />
                ))}
              </div>
              <section aria-labelledby="limits-heading" className="max-w-2xl border-t border-[rgb(var(--fg-tint)/0.12)] pt-8">
                <h2 id="limits-heading" className="font-display text-lg font-semibold text-ink-100">
                  What this result can and cannot tell you
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-400">
                  It ranks careers by how well they match what you told us you enjoy, what you bring and how you like to work. It cannot know how
                  you will take to the work, so the first project in each result is the real test. If a career turns out not to suit you, nothing
                  is lost: the foundations overlap, and you can retake the assessment or start a different roadmap at any time.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/onboarding">
                    <Button variant="secondary" size="sm">Retake the assessment</Button>
                  </Link>
                  <Link href="/careers">
                    <Button variant="ghost" size="sm">Browse all careers</Button>
                  </Link>
                </div>
              </section>
            </>
          ) : (
            <EmptyState
              icon={Award}
              title="No recommendations yet"
              description="We could not match you to a career from these answers. Retake the assessment to try again."
              action={
                <Link href="/onboarding">
                  <Button>Retake the assessment</Button>
                </Link>
              }
            />
          )}
        </div>
      )}
    </AppShell>
  );
}

/** The three careers side by side, one row per question a person would ask. */
function CompareSection({ recs }: { recs: CareerRecommendation[] }) {
  const rows: { label: string; value: (r: CareerRecommendation) => string }[] = [
    { label: "Area", value: (r) => r.category_label || "Not listed" },
    { label: "The work", value: (r) => r.summary ?? "" },
    { label: "Where people start", value: (r) => r.entry_roles.slice(0, 3).join(", ") },
    { label: "First project", value: (r) => r.first_project?.title ?? "See the career page" },
    { label: "Time to learn", value: (r) => r.timeline_label },
    { label: "How hard to start", value: (r) => r.difficulty_label },
  ];
  return (
    <section aria-labelledby="compare-heading">
      <h2 id="compare-heading" className="font-display text-xl font-semibold tracking-tight text-ink-100">
        How the three differ
      </h2>
      <div className="mt-6 grid gap-8 lg:grid-cols-3 lg:gap-10">
        {recs.map((rec) => (
          <div key={rec.path_slug} className="min-w-0 border-t border-[rgb(var(--fg-tint)/0.2)] pt-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-500">{TIER_LABEL[rec.tier]}</p>
            <h3 className="mt-1 text-lg font-semibold tracking-tight text-ink-100">{nameOf(rec)}</h3>
            <dl className="mt-4 space-y-3 text-sm">
              {rows.map((row) => (
                <div key={row.label}>
                  <dt className="text-xs font-medium text-ink-500">{row.label}</dt>
                  <dd className="mt-0.5 leading-snug text-ink-300">{row.value(rec)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">{label}</h4>
      <div className="mt-2 text-sm leading-relaxed text-ink-300">{children}</div>
    </div>
  );
}

function CareerResult({
  rec,
  older,
  onStart,
  starting,
}: {
  rec: CareerRecommendation;
  older: boolean;
  onStart: (slug: string) => void;
  starting: boolean;
}) {
  const featured = rec.tier === "best_match";
  const name = nameOf(rec);
  const answersBy: { label: string; items: string[] }[] = [
    { label: "Interests", items: rec.matched_interests ?? [] },
    { label: "Technology", items: rec.matched_technology ?? [] },
    { label: "Working style", items: rec.matched_preferences ?? [] },
  ].filter((g) => g.items.length > 0);
  const hasAnswers = answersBy.length > 0 || rec.transferable_skills.length > 0;

  return (
    <article aria-labelledby={`result-${rec.path_slug}`} className={cn("border-t pt-8", featured ? "border-accent-light" : "border-[rgb(var(--fg-tint)/0.2)]")}>
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent-light">
        {TIER_LABEL[rec.tier]}
        {rec.category_label ? <span className="text-ink-500"> · {rec.category_label}</span> : null}
      </p>
      <h2
        id={`result-${rec.path_slug}`}
        className={cn("mt-2 font-display font-semibold tracking-tight text-ink-100", featured ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl")}
      >
        {name}
      </h2>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-300">{rec.why_it_fits}</p>

      {!featured && rec.how_it_differs && (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-400">
          <span className="font-medium text-ink-200">How it differs from your closest match. </span>
          {rec.how_it_differs}
        </p>
      )}

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <Fact label="What in your answers points here">
          {hasAnswers ? (
            <div className="space-y-3">
              {answersBy.map((g) => (
                <p key={g.label}>
                  <span className="text-ink-100">{g.label}: </span>
                  {g.items.join("; ")}
                </p>
              ))}
              {rec.transferable_skills.length > 0 && (
                <div>
                  <p className="text-ink-100">Strengths you named that this career uses</p>
                  <ul className="mt-1 space-y-1.5">
                    {rec.transferable_skills.map((s) => (
                      <li key={s.skill}>
                        <span className="text-ink-200">{s.skill}.</span> {s.why_it_transfers}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p>Nothing you chose points strongly at this career. It ranks here on your working style and direction, so the roadmap starts from the basics.</p>
          )}
        </Fact>

        <Fact label="Skills to build first">
          <ul className="list-disc space-y-1.5 pl-4 marker:text-ink-500">
            {rec.skills_to_develop.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Fact>

        <Fact label="Your first project">
          {rec.first_project ? (
            <>
              <p className="font-medium text-ink-100">{rec.first_project.title}</p>
              {rec.first_project.teaches && <p className="mt-1">{rec.first_project.teaches}</p>}
              <p className="mt-1 text-xs text-ink-500">{rec.first_project.difficulty_label}</p>
              <Link
                href={`/projects/${rec.first_project.id}`}
                className="focus-ring mt-2 inline-flex items-center gap-1 rounded text-sm font-medium text-accent-light hover:underline"
              >
                Open this project <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          ) : (
            <>
              <p>{older ? "The projects for this career are on its page." : "This career has no starter project listed yet."}</p>
              <Link
                href={`/careers/${rec.path_slug}`}
                className="focus-ring mt-2 inline-flex items-center gap-1 rounded text-sm font-medium text-accent-light hover:underline"
              >
                See the career page <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </Fact>

        <Fact label="Your next step">
          <p>{rec.first_phase ? rec.recommended_next_step : "Start the roadmap and work through its first phase."}</p>
          {rec.learning_note && <p className="mt-2 text-ink-400">{rec.learning_note}</p>}
        </Fact>

        <Fact label="Where people start">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {rec.entry_roles.map((r) => (
              <span key={r}>{r}</span>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-500">{rec.earning_notes}</p>
        </Fact>

        <Fact label="Worth knowing">
          <ul className="space-y-1.5">
            <li>{rec.difficulty_label} to start. {rec.timeline_label}.</li>
            <li>Remote work: {rec.remote_potential_label}</li>
            {(rec.things_to_consider ?? []).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Fact>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={() => onStart(rec.path_slug)} loading={starting} className="gap-1.5">
          Start the {name} roadmap <ArrowRight className="h-3.5 w-3.5" />
        </Button>
        <Link href={`/careers/${rec.path_slug}`}>
          <Button variant="secondary">Read about this career</Button>
        </Link>
        <Link href={`/mentors?path=${rec.path_slug}`}>
          <Button variant="ghost">Find a mentor</Button>
        </Link>
      </div>
    </article>
  );
}
