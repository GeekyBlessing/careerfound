"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Clock, Globe, Wrench, Briefcase } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { SkeletonCard } from "@/components/ui/skeleton";
import { SmartMentorRecommendation } from "@/components/mentors/smart-mentor-recommendation";
import { api, ApiError } from "@/lib/api";
import type { CareerPath, CareerProjectItem } from "@/types";

const TIER_ORDER: CareerProjectItem["difficulty_label"][] = ["Beginner", "Intermediate", "Expert"];
const TIER_TONE: Record<CareerProjectItem["difficulty_label"], "success" | "accent" | "danger"> = {
  Beginner: "success",
  Intermediate: "accent",
  Expert: "danger",
};

export default function CareerDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const [path, setPath] = useState<CareerPath | null>(null);
  const [projects, setProjects] = useState<CareerProjectItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setPath(null);
    setProjects(null);
    setError(null);
    Promise.all([api.get<CareerPath>(`/careers/${slug}`), api.get<CareerProjectItem[]>(`/careers/${slug}/projects`)])
      .then(([p, proj]) => {
        setPath(p);
        setProjects(proj);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this career path."));
  }, [slug]);

  async function startRoadmap() {
    if (!path) return;
    setStarting(true);
    try {
      await api.post("/roadmaps", { path_slug: path.slug });
      router.push("/roadmap");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't start that roadmap.");
      setStarting(false);
    }
  }

  return (
    <PublicShell>
      {error && <Alert className="mb-4">{error}</Alert>}

      {!path && !error && (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {path && (
        <div className="space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-light">Career path</p>
            <h1 className="mt-1 text-2xl font-semibold text-ink-100">{path.name}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-400">{path.summary}</p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">{path.beginner_summary}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {path.entry_roles.map((role) => (
                <Badge key={role} tone="accent">
                  {role}
                </Badge>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Card className="p-4">
                <div className="flex items-center gap-2 text-xs text-ink-500">
                  <Clock className="h-3.5 w-3.5" /> Typical timeline
                </div>
                <p className="mt-1 text-sm font-semibold text-ink-100">~{path.avg_timeline_weeks} weeks</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 text-xs text-ink-500">
                  <Globe className="h-3.5 w-3.5" /> Remote potential
                </div>
                <p className="mt-1 text-sm font-semibold text-ink-100">{path.remote_potential}%</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 text-xs text-ink-500">
                  <Briefcase className="h-3.5 w-3.5" /> Difficulty
                </div>
                <p className="mt-1 text-sm font-semibold text-ink-100">{path.difficulty}/5</p>
              </Card>
            </div>

            <div className="mt-6">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-500">
                <Wrench className="h-3.5 w-3.5" /> Key skills
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {path.tools.map((tool) => (
                  <Badge key={tool}>{tool}</Badge>
                ))}
              </div>
            </div>

            <p className="mt-4 max-w-2xl text-xs leading-relaxed text-ink-500">{path.earning_notes}</p>

            <Button onClick={startRoadmap} loading={starting} className="mt-6 gap-1.5">
              Start this roadmap <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div>
            <h2 className="mb-1 text-lg font-semibold text-ink-100">What you&apos;ll actually build</h2>
            <p className="mb-5 text-sm text-ink-500">
              Real projects at every level, not a video course. Each one has step-by-step guidance, hints, and
              common mistakes to avoid.
            </p>

            {!projects && (
              <div className="grid gap-4 lg:grid-cols-3">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            )}

            {projects && projects.length === 0 && (
              <Alert>
                The full project catalog for this path is still being authored, check back soon, or take the
                assessment to see paths with a complete project set.
              </Alert>
            )}

            {projects && projects.length > 0 && (
              <div className="grid gap-4 lg:grid-cols-3">
                {TIER_ORDER.map((tier) => {
                  const tierProjects = projects.filter((p) => p.difficulty_label === tier);
                  if (tierProjects.length === 0) return null;
                  return (
                    <div key={tier} className="space-y-3">
                      <Badge tone={TIER_TONE[tier]} className="w-fit">
                        {tier}
                      </Badge>
                      {tierProjects.map((project) => (
                        <Card key={project.id} className="p-4">
                          <p className="text-sm font-semibold text-ink-100">{project.title}</p>
                          <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{project.teaches}</p>
                          <p className="mt-2 text-[11px] text-ink-500">
                            <span className="text-ink-300">You&apos;ll produce:</span> {project.expected_output}
                          </p>
                          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-500">
                            <Clock className="h-3 w-3" />
                            {project.estimated_duration}
                          </div>
                        </Card>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <SmartMentorRecommendation pathSlug={path.slug} pathName={path.name} />
        </div>
      )}
    </PublicShell>
  );
}
