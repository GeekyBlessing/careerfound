"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Compass, Plus, X } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonCard } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ListedSkill, SkillGap, SkillGapSkill, SkillStatus } from "@/types/career";

const STATUS_STYLE: Record<SkillStatus, string> = {
  strong: "border-success/40 bg-success/10 text-success",
  developing: "border-accent/40 bg-accent/10 text-accent-light",
  missing: "border-[rgb(var(--fg-tint)/0.18)] text-ink-400",
};
const GROUPS: { key: string; label: string; blurb: string }[] = [
  { key: "foundation", label: "Foundations", blurb: "What everything else stands on." },
  { key: "core", label: "Core skills", blurb: "What the job asks you to do every week." },
  { key: "advanced", label: "Advanced", blurb: "What separates a junior from someone hired for depth." },
];

export default function SkillGapPage() {
  const [data, setData] = useState<SkillGap | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .get<SkillGap>("/career/skill-gap")
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load your skill gap."));
  }, []);
  useEffect(load, [load]);

  return (
    <AppShell>
      <div className="space-y-12">
        <header className="max-w-3xl">
          <p className="eyebrow">Skill gap</p>
          <h1 className="mt-2 font-display text-h1 font-semibold tracking-tight text-ink-100">
            {data?.career ? `What stands between you and a ${data.career.name} job` : "What stands between you and the job"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-400">
            Every skill on your path, measured by the lessons and projects you have finished. Each gap links to the exact next step that closes it.
          </p>
        </header>

        {error && <Alert>{error}</Alert>}
        {!data && !error && <SkeletonCard />}

        {data && !data.has_path && (
          <EmptyState
            icon={Compass}
            title="Choose a career to see your gaps"
            description="A skill gap only makes sense against a target. Take the career assessment and your roadmap sets the skills to measure."
            action={
              <Link href="/onboarding" className="focus-ring rounded-xl">
                <Button className="gap-1.5" tabIndex={-1}>
                  Find my career path <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            }
          />
        )}

        {data && data.has_path && <Body data={data} reload={load} />}
      </div>
    </AppShell>
  );
}

function Body({ data, reload }: { data: SkillGap; reload: () => void }) {
  const skills = data.skills ?? [];
  const counts = data.counts ?? { strong: 0, developing: 0, missing: 0 };
  const total = data.total || 1;
  const focusKeys = new Set((data.focus ?? []).map((f) => f.key));

  return (
    <>
      <section className="border-y border-[rgb(var(--fg-tint)/0.12)] py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {(["strong", "developing", "missing"] as SkillStatus[]).map((s) => (
            <div key={s}>
              <p className="font-mono text-[10px] uppercase tracking-wide text-ink-500">{s === "strong" ? "Strong" : s === "developing" ? "Developing" : "Missing"}</p>
              <p className="mt-1 font-display text-4xl font-semibold text-ink-100">
                {counts[s]}
                <span className="ml-2 text-base font-normal text-ink-500">of {data.total}</span>
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex h-2 w-full overflow-hidden rounded-full bg-[rgb(var(--fg-tint)/0.08)]" role="img" aria-label={`${counts.strong} strong, ${counts.developing} developing, ${counts.missing} missing`}>
          <div className="bg-success" style={{ width: `${(counts.strong / total) * 100}%` }} />
          <div className="bg-accent" style={{ width: `${(counts.developing / total) * 100}%` }} />
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-400">{data.how_it_works}</p>
      </section>

      {(data.focus ?? []).length > 0 && (
        <section aria-labelledby="start-here">
          <h2 id="start-here" className="font-display text-h2 font-semibold tracking-tight text-ink-100">
            Start with these
          </h2>
          <p className="mt-2 text-sm text-ink-400">The three gaps to close first. Foundations come before specialisms.</p>
          <ol className="mt-5 grid gap-4 md:grid-cols-3">
            {data.focus!.map((f, i) => (
              <li key={f.key} className="rounded-2xl border border-[rgb(var(--fg-tint)/0.12)] p-5">
                <p className="font-mono text-xs text-ink-500">0{i + 1}</p>
                <p className="mt-1 font-display text-lg font-semibold text-ink-100">{f.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-400">{f.next_step.title}</p>
                <Link href={f.next_step.href} className="focus-ring mt-4 inline-flex rounded-xl">
                  <Button size="sm" className="gap-1.5" tabIndex={-1}>
                    {f.next_step.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {GROUPS.map((g) => {
        const group = skills.filter((s) => s.category === g.key);
        if (!group.length) return null;
        return (
          <section key={g.key} aria-labelledby={`g-${g.key}`}>
            <h2 id={`g-${g.key}`} className="font-display text-h2 font-semibold tracking-tight text-ink-100">
              {g.label}
            </h2>
            <p className="mt-1 text-sm text-ink-400">{g.blurb}</p>
            <ul className="mt-5 divide-y divide-[rgb(var(--fg-tint)/0.1)] border-y border-[rgb(var(--fg-tint)/0.1)]">
              {group.map((s) => (
                <SkillRow key={s.key} skill={s} open={focusKeys.has(s.key)} />
              ))}
            </ul>
          </section>
        );
      })}

      {(data.uncovered_expectations ?? []).length > 0 && (
        <section className="max-w-3xl rounded-2xl border border-dashed border-[rgb(var(--fg-tint)/0.16)] p-6">
          <h2 className="font-display text-xl font-semibold text-ink-100">Employers also ask for</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-400">
            We could not tie these to a specific skill, lesson or project on your roadmap, so they are not counted as covered. Some may sit inside the skills above. Use the resources below to go further.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-ink-200">
            {data.uncovered_expectations!.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-10">
          {(data.resources ?? []).length > 0 && (
            <section>
              <h2 className="font-display text-xl font-semibold text-ink-100">Where to learn more</h2>
              <ul className="mt-3 space-y-3 text-sm">
                {data.resources!.map((r) => (
                  <li key={r.label}>
                    <p className="font-medium text-ink-100">{r.label}</p>
                    <p className="text-ink-400">{r.note}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {(data.certifications ?? []).length > 0 && (
            <section>
              <h2 className="font-display text-xl font-semibold text-ink-100">Certifications employers recognise</h2>
              <p className="mt-2 text-sm text-ink-400">Optional. They do not count towards your readiness score, because the work in your portfolio is stronger proof.</p>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-ink-200">
                {data.certifications!.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </section>
          )}
          {(data.other_interview_questions ?? []).length > 0 && (
            <section>
              <h2 className="font-display text-xl font-semibold text-ink-100">Interview questions for this career</h2>
              <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-ink-200">
                {data.other_interview_questions!.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <ListedSkills skills={data.listed_skills ?? []} reload={reload} />
      </div>
    </>
  );
}

function SkillRow({ skill, open }: { skill: SkillGapSkill; open: boolean }) {
  return (
    <li>
      <details open={open} className="group py-5">
        <summary className="focus-ring flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-2 rounded">
          <span className={cn("rounded-[0.25rem] border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide", STATUS_STYLE[skill.status])}>{skill.status_label}</span>
          <span className="font-display text-lg font-semibold text-ink-100">{skill.label}</span>
          {skill.listed_by_you && <span className="font-mono text-[10px] uppercase tracking-wide text-ink-500">listed by you, not counted</span>}
          <span className="ml-auto font-mono text-xs text-ink-500">
            {skill.done} of {skill.total} done
          </span>
        </summary>

        <div className="mt-5 grid gap-8 md:grid-cols-2">
          <div className="space-y-5">
            {skill.lessons.length > 0 && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wide text-ink-500">Lessons</p>
                <ul className="mt-2 space-y-1.5">
                  {skill.lessons.map((l) => (
                    <li key={l.id} className="flex items-start gap-2 text-sm">
                      <Mark done={l.done} />
                      <Link href={l.href} className="focus-ring rounded text-ink-200 hover:text-accent-light">
                        {l.title}
                      </Link>
                      <span className="ml-auto shrink-0 font-mono text-[11px] text-ink-500">{l.minutes} min</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {skill.projects.length > 0 && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wide text-ink-500">Projects</p>
                <ul className="mt-2 space-y-2">
                  {skill.projects.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-center gap-2 text-sm">
                      <Mark done={p.state === "completed"} />
                      <span className="text-ink-200">{p.title}</span>
                      <Link href={p.href} className="focus-ring ml-auto rounded-md border border-[rgb(var(--fg-tint)/0.16)] px-2.5 py-1 text-xs font-medium text-accent-light hover:border-accent/40">
                        {p.state === "completed" ? "Open project" : p.state === "started" ? "Continue project" : "Start project"}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="space-y-5 text-sm">
            {skill.employer_expects.length > 0 && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wide text-ink-500">What employers ask for</p>
                <ul className="mt-2 space-y-1 text-ink-300">
                  {skill.employer_expects.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
            {skill.interview_questions.length > 0 && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wide text-ink-500">Interview questions on this</p>
                <ul className="mt-2 space-y-1 text-ink-300">
                  {skill.interview_questions.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
            {skill.next_step && (
              <Link href={skill.next_step.href} className="focus-ring inline-flex rounded-xl">
                <Button size="sm" className="gap-1.5" tabIndex={-1}>
                  {skill.next_step.title} <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </details>
    </li>
  );
}

function Mark({ done }: { done: boolean }) {
  return (
    <span
      aria-label={done ? "Done" : "Not done"}
      className={cn("mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", done ? "border-success bg-success text-[rgb(var(--color-bg))]" : "border-[rgb(var(--fg-tint)/0.3)]")}
    >
      {done && <Check className="h-2.5 w-2.5" aria-hidden="true" />}
    </span>
  );
}

function ListedSkills({ skills, reload }: { skills: ListedSkill[]; reload: () => void }) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState<ListedSkill["level"]>("learning");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function add(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await api.post("/career/skills", { name, level });
      setName("");
      reload();
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Could not add that skill.");
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: string) {
    await api.del(`/career/skills/${id}`).catch(() => undefined);
    reload();
  }

  return (
    <section>
      <h2 className="font-display text-xl font-semibold text-ink-100">Skills you list yourself</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-400">
        These appear on your public profile, marked self-reported. They never change a status or your readiness score, because nothing checks them. Finish the lessons and projects to turn a claim into proof.
      </p>
      <form onSubmit={add} className="mt-4 flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="skill-name">
          Skill
        </label>
        <input
          id="skill-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="For example, Python"
          maxLength={80}
          className="focus-ring min-w-0 flex-1 rounded-xl border border-[rgb(var(--fg-tint)/0.16)] bg-transparent px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500"
        />
        <label className="sr-only" htmlFor="skill-level">
          Level
        </label>
        <select
          id="skill-level"
          value={level}
          onChange={(e) => setLevel(e.target.value as ListedSkill["level"])}
          className="focus-ring rounded-xl border border-[rgb(var(--fg-tint)/0.16)] bg-transparent px-3 py-2 text-sm text-ink-100"
        >
          <option value="learning">Learning</option>
          <option value="comfortable">Comfortable</option>
          <option value="strong">Strong</option>
        </select>
        <Button type="submit" size="sm" disabled={busy || name.trim().length < 2} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </form>
      {err && <p className="mt-2 text-sm text-danger">{err}</p>}
      {skills.length === 0 ? (
        <p className="mt-4 text-sm text-ink-500">Nothing listed yet.</p>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-2">
          {skills.map((s) => (
            <li key={s.id} className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--fg-tint)/0.16)] py-1 pl-3 pr-1.5 text-sm text-ink-200">
              {s.name}
              <span className="font-mono text-[10px] uppercase text-ink-500">{s.level}</span>
              <button type="button" onClick={() => remove(s.id)} aria-label={`Remove ${s.name}`} className="focus-ring rounded-full p-1 text-ink-500 hover:text-danger">
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
