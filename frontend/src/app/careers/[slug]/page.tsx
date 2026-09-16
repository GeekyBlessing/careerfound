"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  Award,
  Briefcase,
  BookOpen,
  ChevronDown,
  Clock,
  GraduationCap,
  Globe,
  MessageCircleQuestion,
  Wrench,
} from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { SkeletonCard } from "@/components/ui/skeleton";
import { SmartMentorRecommendation } from "@/components/mentors/smart-mentor-recommendation";
import { api, ApiError } from "@/lib/api";
import type { CareerPath, CareerProjectItem, RoadmapOutline } from "@/types";

const TIER_ORDER: CareerProjectItem["difficulty_label"][] = ["Beginner", "Intermediate", "Expert"];
const TIER_TONE: Record<CareerProjectItem["difficulty_label"], "success" | "accent" | "danger"> = {
  Beginner: "success",
  Intermediate: "accent",
  Expert: "danger",
};

const ROADMAP_TIERS: { key: keyof RoadmapOutline; label: string; tone: "success" | "accent" | "danger" }[] = [
  { key: "beginner", label: "Beginner", tone: "success" },
  { key: "intermediate", label: "Intermediate", tone: "accent" },
  { key: "advanced", label: "Advanced", tone: "danger" },
];

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
            <p className="eyebrow">Career path</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-100">{path.name}</h1>
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
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/12 text-accent-light">
                    <Clock className="h-3.5 w-3.5" />
                  </span>
                  Typical timeline
                </div>
                <p className="mt-2 text-sm font-semibold text-ink-100">~{path.avg_timeline_weeks} weeks</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 text-xs text-ink-500">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/12 text-accent-light">
                    <Globe className="h-3.5 w-3.5" />
                  </span>
                  Remote potential
                </div>
                <p className="mt-2 text-sm font-semibold text-ink-100">{path.remote_potential}%</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 text-xs text-ink-500">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/12 text-accent-light">
                    <Briefcase className="h-3.5 w-3.5" />
                  </span>
                  Difficulty
                </div>
                <p className="mt-2 text-sm font-semibold text-ink-100">{path.difficulty}/5</p>
              </Card>
            </div>

            {path.skills_required.length > 0 && (
              <div className="mt-6">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-500">
                  <GraduationCap className="h-3.5 w-3.5" /> Skills you&apos;ll build
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {path.skills_required.map((skill) => (
                    <Badge key={skill} tone="accent">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-500">
                <Wrench className="h-3.5 w-3.5" /> Tools &amp; technologies
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

          {(path.roadmap_outline.beginner.length > 0 ||
            path.roadmap_outline.intermediate.length > 0 ||
            path.roadmap_outline.advanced.length > 0) && (
            <div>
              <h2 className="mb-1 text-lg font-semibold tracking-tight text-ink-100">Your roadmap, stage by stage</h2>
              <p className="mb-5 text-sm text-ink-500">
                What to focus on at each stage. Pair this with the projects below to know what to learn and what
                to build next.
              </p>
              <div className="grid gap-4 lg:grid-cols-3">
                {ROADMAP_TIERS.map((tier) => {
                  const items = path.roadmap_outline[tier.key];
                  if (!items || items.length === 0) return null;
                  return (
                    <Card key={tier.key} className="p-4">
                      <Badge tone={tier.tone} className="w-fit">
                        {tier.label}
                      </Badge>
                      <ul className="mt-3 space-y-2">
                        {items.map((item) => (
                          <li key={item} className="flex gap-2 text-xs leading-relaxed text-ink-400">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-1 text-lg font-semibold tracking-tight text-ink-100">What you&apos;ll actually build</h2>
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

          {(path.certifications.length > 0 || path.interview_prep.length > 0 || path.learning_resources.length > 0) && (
            <div>
              <h2 className="mb-1 text-lg font-semibold tracking-tight text-ink-100">Getting job ready</h2>
              <p className="mb-5 text-sm text-ink-500">
                Certifications worth pursuing, what to expect in interviews, and where to go deeper.
              </p>
              <div className="space-y-3">
                {path.certifications.length > 0 && (
                  <details className="group rounded-xl border border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.03)] p-5 transition-colors open:bg-[rgb(var(--fg-tint)/0.05)]">
                    <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg text-sm font-medium text-ink-100 marker:content-none">
                      <span className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-accent-light" /> Certifications worth pursuing
                      </span>
                      <ChevronDown className="h-4 w-4 flex-shrink-0 text-ink-500 transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <ul className="mt-3 space-y-1.5">
                      {path.certifications.map((cert) => (
                        <li key={cert} className="text-sm leading-relaxed text-ink-500">
                          {cert}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                {path.interview_prep.length > 0 && (
                  <details className="group rounded-xl border border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.03)] p-5 transition-colors open:bg-[rgb(var(--fg-tint)/0.05)]">
                    <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg text-sm font-medium text-ink-100 marker:content-none">
                      <span className="flex items-center gap-2">
                        <MessageCircleQuestion className="h-4 w-4 text-accent-light" /> Interview prep
                      </span>
                      <ChevronDown className="h-4 w-4 flex-shrink-0 text-ink-500 transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <ul className="mt-3 space-y-1.5">
                      {path.interview_prep.map((q) => (
                        <li key={q} className="text-sm leading-relaxed text-ink-500">
                          {q}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                {path.learning_resources.length > 0 && (
                  <details className="group rounded-xl border border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.03)] p-5 transition-colors open:bg-[rgb(var(--fg-tint)/0.05)]">
                    <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg text-sm font-medium text-ink-100 marker:content-none">
                      <span className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-accent-light" /> Recommended learning resources
                      </span>
                      <ChevronDown className="h-4 w-4 flex-shrink-0 text-ink-500 transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <ul className="mt-3 space-y-2.5">
                      {path.learning_resources.map((r) => (
                        <li key={r.label} className="text-sm leading-relaxed text-ink-500">
                          <span className="font-medium text-ink-300">{r.label}:</span> {r.note}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          )}

          <SmartMentorRecommendation pathSlug={path.slug} pathName={path.name} />
        </div>
      )}
    </PublicShell>
  );
}
