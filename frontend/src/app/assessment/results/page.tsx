"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Award, Sparkles, Shuffle, Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { CareerDnaRadar } from "@/components/charts/career-dna-radar";
import { cn } from "@/lib/utils";
import { api, ApiError } from "@/lib/api";
import type { AssessmentResult, CareerRecommendation } from "@/types";

const TIER_META = {
  best_match: { label: "Best Match", icon: Award, tone: "accent" as const },
  strong_alternative: { label: "Strong Alternative", icon: Sparkles, tone: "success" as const },
  wild_card: { label: "Wild Card", icon: Shuffle, tone: "warning" as const },
};

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
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load your results."))
      .finally(() => setLoading(false));
  }, []);

  async function startRoadmap(slug: string) {
    setStartingPath(slug);
    try {
      await api.post("/roadmaps", { path_slug: slug });
      router.push("/roadmap");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't start that roadmap.");
      setStartingPath(null);
    }
  }

  return (
    <AppShell>
      <div className="mb-8">
        <p className="eyebrow">Your results</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-100">We found your strongest paths</h1>
        <p className="mt-1 text-sm text-ink-500">Based on your answers, not a generic list, your specific fit.</p>
      </div>

      {loading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {error && <Alert>{error}</Alert>}

      {result && (
        <div className="animate-fade-in-up space-y-8">
          <Card className="grid gap-8 p-8 shadow-raised lg:grid-cols-[280px_1fr] lg:items-center">
            <CareerDnaRadar dna={result.career_dna} />
            <div>
              <Badge tone="accent">Your Career DNA</Badge>
              <p className="mt-3 text-sm leading-relaxed text-ink-300">{result.career_dna.summary}</p>
            </div>
          </Card>

          {result.recommendations.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {result.recommendations.map((rec) => (
                <RecommendationCard key={rec.path_slug} rec={rec} onStart={startRoadmap} starting={startingPath === rec.path_slug} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Award}
              title="No recommendations yet"
              description="We couldn't match you to a path from these answers. Retake the assessment to try again."
              action={
                <Link href="/assessment">
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

function RecommendationCard({
  rec,
  onStart,
  starting,
}: {
  rec: CareerRecommendation;
  onStart: (slug: string) => void;
  starting: boolean;
}) {
  const meta = TIER_META[rec.tier];
  const Icon = meta.icon;
  const isBestMatch = rec.tier === "best_match";
  return (
    <Card
      className={cn(
        "relative",
        isBestMatch && "border-accent/40 shadow-raised lg:-translate-y-1.5"
      )}
    >
      {isBestMatch && (
        <div className="absolute inset-x-0 -top-px mx-auto h-px w-2/3 bg-gradient-to-r from-transparent via-accent-light to-transparent" />
      )}
      <CardContent className="flex h-full flex-col p-6">
        <Badge tone={meta.tone} className="w-fit gap-1">
          <Icon className="h-3 w-3" /> {meta.label}
        </Badge>
        <h2 className="mt-3 text-lg font-semibold capitalize tracking-tight text-ink-100">{rec.path_slug.replace(/-/g, " ")}</h2>
        <div className="mt-1 flex items-center gap-2 text-xs text-ink-500">
          <span>Fit score</span>
          <span className="font-semibold text-ink-300">{rec.fit_score}/100</span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-400">{rec.why_it_fits}</p>

        <div className="mt-4 space-y-2 text-xs text-ink-500">
          <p><span className="text-ink-300">Difficulty:</span> {rec.difficulty_label}</p>
          <p><span className="text-ink-300">Timeline:</span> {rec.timeline_label}</p>
          <p><span className="text-ink-300">Remote potential:</span> {rec.remote_potential_label}</p>
        </div>

        {rec.transferable_skills.length > 0 && (
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-medium text-ink-300">Skills you already have that transfer</p>
            <ul className="space-y-1 text-xs text-ink-500">
              {rec.transferable_skills.map((s) => (
                <li key={s.skill}>
                  <span className="text-ink-300">{s.skill}:</span> {s.why_it_transfers}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4">
          <p className="mb-1.5 text-xs font-medium text-ink-300">Entry-level roles</p>
          <div className="flex flex-wrap gap-1.5">
            {rec.entry_roles.map((r) => (
              <Badge key={r}>{r}</Badge>
            ))}
          </div>
        </div>

        <p className="mt-4 text-xs text-ink-500">{rec.earning_notes}</p>

        <div className="mt-6 flex-1" />
        <Button onClick={() => onStart(rec.path_slug)} loading={starting} className="mt-2 w-full gap-1.5">
          {rec.recommended_next_step} <ArrowRight className="h-3.5 w-3.5" />
        </Button>
        <Link href={`/careers/${rec.path_slug}`} className="mt-2 block">
          <Button variant="secondary" className="w-full gap-1.5">
            <Users className="h-3.5 w-3.5" /> See projects &amp; mentors
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
