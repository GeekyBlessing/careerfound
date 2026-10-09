"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { DifficultyMeter } from "@/components/ui/difficulty-meter";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { SkeletonCard } from "@/components/ui/skeleton";
import { SmartMentorRecommendation } from "@/components/mentors/smart-mentor-recommendation";
import { api, ApiError } from "@/lib/api";
import { careerBySlug } from "@/lib/career-categories";
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
        // An old URL for a renamed career (devops, soc-analysis,
        // ai-ml-engineering) resolves server-side; move the address bar to
        // the career's current URL so links and bookmarks self-correct.
        if (p.slug !== slug) router.replace(`/careers/${p.slug}`);
        setPath(p);
        setProjects(proj);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this career path."));
  }, [slug, router]);

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
            <p className="eyebrow">
              Career path
              {path.category_label && (
                <>
                  <span aria-hidden="true">/</span>
                  <Link href={`/careers?category=${path.category}`} className="focus-ring rounded hover:underline">
                    {path.category_label}
                  </Link>
                </>
              )}
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink-100 sm:text-3xl">{path.name}</h1>
            <h2 className="mt-5 text-xs font-medium uppercase tracking-wide text-ink-500">What this career involves</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-400">{path.summary}</p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">{path.beginner_summary}</p>
            {path.who_its_for && (
              <>
                <h2 className="mt-5 text-xs font-medium uppercase tracking-wide text-ink-500">Who may enjoy it</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-400">{path.who_its_for}</p>
              </>
            )}

            <h2 className="mt-5 text-xs font-medium uppercase tracking-wide text-ink-500">Entry-level roles</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {path.entry_roles.map((role) => (
                <Badge key={role} tone="accent">
                  {role}
                </Badge>
              ))}
            </div>

            <p className="mt-4 max-w-2xl rounded-lg border border-[rgb(var(--fg-tint)/0.1)] px-3 py-2 text-xs leading-relaxed text-ink-400">
              {path.depth === "full" ? (
                <>
                  <span className="font-medium text-ink-200">Full curriculum. </span>
                  Lessons, quizzes and graded projects{path.project_lab ? ", plus job-ready work in the Project Lab" : ""}.
                </>
              ) : (
                <>
                  <span className="font-medium text-ink-200">Guided path. </span>
                  A stage by stage roadmap, tools, interview questions and three graded projects. Full lessons for this
                  career are not written yet.
                </>
              )}
            </p>

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
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-ink-100">
                  <DifficultyMeter level={path.difficulty} /> {path.difficulty}/5
                </p>
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
                        <Link key={project.id} href={`/projects/${project.id}`} className="focus-ring block rounded-2xl">
                          <Card interactive className="p-4">
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
                        </Link>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {(path.portfolio_expectations.length > 0 || path.career_progression.length > 0) && (
            <div className="grid gap-4 lg:grid-cols-2">
              {path.portfolio_expectations.length > 0 && (
                <Card className="p-5">
                  <h2 className="text-lg font-semibold tracking-tight text-ink-100">What your portfolio should show</h2>
                  <p className="mt-1 text-sm text-ink-500">What hiring managers for this career expect to see.</p>
                  <ul className="mt-4 space-y-2.5">
                    {path.portfolio_expectations.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-relaxed text-ink-400">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
              {path.career_progression.length > 0 && (
                <Card className="p-5">
                  <h2 className="text-lg font-semibold tracking-tight text-ink-100">Where this career leads</h2>
                  <p className="mt-1 text-sm text-ink-500">A typical progression, from first role onward.</p>
                  <ol className="mt-4 space-y-3">
                    {path.career_progression.map((step, i) => (
                      <li key={step} className="flex items-start gap-3 text-sm leading-relaxed text-ink-300">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/12 font-mono text-[10px] text-accent-light">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </Card>
              )}
            </div>
          )}

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

          {path.related_slugs.length > 0 && (
            <div>
              <h2 className="mb-1 text-lg font-semibold tracking-tight text-ink-100">Related careers</h2>
              <p className="mb-5 text-sm text-ink-500">
                Specialisations and neighbouring paths. Many people move between these as their interests settle.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {path.related_slugs.map((related) => {
                  const entry = careerBySlug(related);
                  if (!entry) return null;
                  return (
                    <Link key={related} href={`/careers/${related}`} className="focus-ring block rounded-2xl">
                      <Card interactive className="flex items-center gap-3 p-4">
                        <entry.icon className="h-5 w-5 flex-shrink-0 text-accent-light" />
                        <span className="min-w-0 flex-1 text-sm font-medium text-ink-100">{entry.name}</span>
                        <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-ink-500" />
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-1 text-lg font-semibold tracking-tight text-ink-100">Put this career to work</h2>
            <p className="mb-5 text-sm text-ink-500">The rest of CareerFound, ready for when you pick {path.name}.</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { href: `/projects?career=${path.slug}`, title: path.project_lab ? "Project Lab" : "Build the projects", note: "Step-by-step projects for this career." },
                { href: "/portfolio", title: "Portfolio", note: "Turn finished projects into proof you can share." },
                { href: `/mentors?path=${path.slug}`, title: "Mentors", note: "People working in this career, for real guidance." },
                { href: "/job-matcher", title: "Check a job description", note: "See how a real posting matches your skills." },
              ].map((item) => (
                <Link key={item.title} href={item.href} className="focus-ring block rounded-2xl">
                  <Card interactive className="h-full p-4">
                    <p className="flex items-center justify-between text-sm font-semibold text-ink-100">
                      {item.title} <ArrowRight className="h-3.5 w-3.5 text-ink-500" />
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{item.note}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <SmartMentorRecommendation pathSlug={path.slug} pathName={path.name} />
        </div>
      )}
    </PublicShell>
  );
}
