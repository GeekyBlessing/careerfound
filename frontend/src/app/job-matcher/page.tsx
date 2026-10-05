"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { api, ApiError } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { JobAnalysis, JobAnalysisSummary } from "@/types/career";

const MIN = 80;

export default function JobMatcherPage() {
  const [saved, setSaved] = useState<JobAnalysisSummary[]>([]);
  const [current, setCurrent] = useState<JobAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadList = useCallback(() => {
    api
      .get<JobAnalysisSummary[]>("/career/job-analyses")
      .then(setSaved)
      .catch(() => setSaved([]));
  }, []);
  useEffect(loadList, [loadList]);

  async function open(id: string) {
    setError(null);
    try {
      setCurrent(await api.get<JobAnalysis>(`/career/job-analyses/${id}`));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not open that analysis.");
    }
  }
  async function recheck(id: string) {
    setError(null);
    try {
      setCurrent(await api.post<JobAnalysis>(`/career/job-analyses/${id}/refresh`));
      loadList();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not re-check that job.");
    }
  }
  async function remove(id: string) {
    await api.del(`/career/job-analyses/${id}`).catch(() => undefined);
    if (current?.id === id) setCurrent(null);
    loadList();
  }

  return (
    <AppShell>
      <div className="space-y-12">
        <header className="max-w-3xl">
          <p className="eyebrow">Job description analyzer</p>
          <h1 className="mt-2 font-display text-h1 font-semibold tracking-tight text-ink-100">Check a job before you apply</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-400">
            Paste a posting you found. We read the skills it asks for and compare each one with work you have actually finished here, then tell you whether to apply now or what to build first.
          </p>
        </header>

        {error && <Alert>{error}</Alert>}

        <Form
          onDone={(a) => {
            setCurrent(a);
            loadList();
          }}
        />

        {current && <Result a={current} onRecheck={() => recheck(current.id)} />}

        {saved.length > 0 && (
          <section aria-labelledby="saved">
            <h2 id="saved" className="font-display text-h2 font-semibold tracking-tight text-ink-100">
              Jobs you have checked
            </h2>
            <ul className="mt-5 divide-y divide-[rgb(var(--fg-tint)/0.1)] border-y border-[rgb(var(--fg-tint)/0.1)]">
              {saved.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-4">
                  <button type="button" onClick={() => open(s.id)} className="focus-ring min-w-0 flex-1 rounded text-left">
                    <p className="truncate font-display text-base font-semibold text-ink-100">{s.title || "Untitled role"}</p>
                    <p className="text-xs text-ink-500">
                      {s.company || "Company not set"}, checked {s.analysed_at ? formatRelativeTime(s.analysed_at) : "earlier"}
                    </p>
                  </button>
                  <span className="font-mono text-xs text-ink-300">{s.match_pct === null ? "No match score" : `${s.match_pct}% backed`}</span>
                  <VerdictTag verdict={s.verdict} label={s.verdict_label} />
                  <button type="button" onClick={() => remove(s.id)} aria-label={`Delete ${s.title || "analysis"}`} className="focus-ring rounded p-1.5 text-ink-500 hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function VerdictTag({ verdict, label }: { verdict: string; label: string }) {
  return (
    <span
      className={cn(
        "rounded-[0.25rem] border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide",
        verdict === "ready" ? "border-success/40 bg-success/10 text-success" : verdict === "strengthen" ? "border-warning/40 bg-warning/10 text-warning" : "border-[rgb(var(--fg-tint)/0.18)] text-ink-400"
      )}
    >
      {label}
    </span>
  );
}

function Form({ onDone }: { onDone: (a: JobAnalysis) => void }) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const a = await api.post<JobAnalysis>("/career/job-analyses", { title, company, source_url: url, description: text });
      onDone(a);
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Could not analyse that posting.");
    } finally {
      setBusy(false);
    }
  }

  const field = "focus-ring w-full rounded-xl border border-[rgb(var(--fg-tint)/0.16)] bg-transparent px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500";
  return (
    <form onSubmit={submit} className="max-w-3xl space-y-4 rounded-2xl border border-[rgb(var(--fg-tint)/0.12)] p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="jd-title" className="font-mono text-[10px] uppercase tracking-wide text-ink-500">
            Job title
          </label>
          <input id="jd-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} placeholder="Junior Security Analyst" className={cn(field, "mt-1.5")} />
        </div>
        <div>
          <label htmlFor="jd-company" className="font-mono text-[10px] uppercase tracking-wide text-ink-500">
            Company
          </label>
          <input id="jd-company" value={company} onChange={(e) => setCompany(e.target.value)} maxLength={160} placeholder="Optional" className={cn(field, "mt-1.5")} />
        </div>
      </div>
      <div>
        <label htmlFor="jd-url" className="font-mono text-[10px] uppercase tracking-wide text-ink-500">
          Link to the posting
        </label>
        <input id="jd-url" value={url} onChange={(e) => setUrl(e.target.value)} maxLength={400} placeholder="Optional. Saved with the analysis, never opened." className={cn(field, "mt-1.5")} />
      </div>
      <div>
        <label htmlFor="jd-text" className="font-mono text-[10px] uppercase tracking-wide text-ink-500">
          Job description
        </label>
        <textarea
          id="jd-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          maxLength={12000}
          placeholder="Paste the responsibilities and requirements here."
          className={cn(field, "mt-1.5 resize-y leading-relaxed")}
        />
        <p className="mt-1.5 text-xs text-ink-500">
          {text.trim().length < MIN ? `${MIN - text.trim().length} more characters needed.` : `${text.length.toLocaleString()} of 12,000 characters.`} You paste it, we never fetch or scrape listings.
        </p>
      </div>
      {err && <p className="text-sm text-danger">{err}</p>}
      <Button type="submit" disabled={busy || text.trim().length < MIN} className="gap-1.5">
        {busy ? "Analysing" : "Analyze this job"} <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </form>
  );
}

function Result({ a, onRecheck }: { a: JobAnalysis; onRecheck: () => void }) {
  const r = a.result;
  return (
    <section aria-labelledby="result" className="space-y-10 border-t border-[rgb(var(--fg-tint)/0.14)] pt-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wide text-ink-500">
            {a.title || "Untitled role"}
            {a.company ? `, ${a.company}` : ""}
          </p>
          <h2 id="result" className={cn("mt-2 font-display text-h1 font-semibold uppercase tracking-tight", r.verdict === "ready" ? "text-success" : r.verdict === "strengthen" ? "text-warning" : "text-ink-200")}>
            {r.verdict_label}
          </h2>
          <ul className="mt-4 max-w-2xl space-y-2 text-sm leading-relaxed text-ink-300">
            {r.reasons.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          {r.flags.map((f) => (
            <p key={f.key} className="mt-3 max-w-2xl rounded-xl border border-warning/30 bg-warning/[0.06] p-3 text-sm leading-relaxed text-ink-200">
              {f.text}
            </p>
          ))}
        </div>
        <div className="rounded-2xl border border-[rgb(var(--fg-tint)/0.12)] p-5">
          <p className="font-mono text-[10px] uppercase tracking-wide text-ink-500">Job match</p>
          {r.match_pct === null ? (
            <p className="mt-2 text-sm text-ink-400">No score. Nothing we recognise was found in the text.</p>
          ) : (
            <>
              <p className="mt-1 font-display text-5xl font-semibold text-ink-100">
                {r.match_pct}
                <span className="text-xl text-ink-500">%</span>
              </p>
              <ProgressBar value={r.match_pct} tone={r.match_pct >= 60 ? "success" : "warning"} className="mt-3" />
              <p className="mt-3 text-xs leading-relaxed text-ink-500">Share of the {r.recognised} skills in this posting that are backed by finished work here. Required skills count double.</p>
            </>
          )}
          <button type="button" onClick={onRecheck} className="focus-ring mt-4 inline-flex items-center gap-1.5 rounded text-xs font-medium text-accent-light hover:underline">
            <RefreshCw className="h-3 w-3" aria-hidden="true" /> Check again against my latest work
          </button>
        </div>
      </div>

      {r.before_applying.length > 0 && (
        <div>
          <h3 className="font-display text-xl font-semibold text-ink-100">Before applying, consider completing</h3>
          <ol className="mt-4 divide-y divide-[rgb(var(--fg-tint)/0.1)] border-y border-[rgb(var(--fg-tint)/0.1)]">
            {r.before_applying.map((b, i) => (
              <li key={b.href + i} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4">
                <span className="font-mono text-xs text-ink-500">0{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink-100">{b.title}</p>
                  <p className="text-sm text-ink-400">{b.why}</p>
                </div>
                <Link href={b.href} className="focus-ring rounded-xl">
                  <Button size="sm" variant="secondary" className="gap-1.5" tabIndex={-1}>
                    Go <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-2">
        <Group title="Strong matches" empty="Nothing in this posting is backed by finished work yet.">
          {r.strong_matches.map((s) => (
            <Row key={s.skill} skill={s.skill} level={s.requirement}>
              <ul className="mt-1 space-y-0.5 text-xs text-ink-400">
                {s.evidence.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </Row>
          ))}
        </Group>
        <Group title="Skill gaps" empty="No gaps. Every skill in the posting is at least in progress.">
          {[...r.in_progress.map((g) => ({ ...g, state: "progress" as const })), ...r.gaps.map((g) => ({ ...g, state: "gap" as const }))].map((g) => (
            <Row key={g.skill + g.state} skill={g.skill} level={g.requirement}>
              <p className="mt-1 text-xs text-ink-400">
                {g.state === "progress" ? "In progress. " : ""}
                {"listed_by_you" in g && g.listed_by_you ? "Listed by you, but nothing here proves it. " : ""}
                {"evidence" in g && g.evidence?.length ? g.evidence[0] : ""}
              </p>
              {g.close_with ? (
                <Link href={g.close_with.href} className="focus-ring mt-1 inline-block rounded text-xs font-medium text-accent-light hover:underline">
                  {g.close_with.title}
                </Link>
              ) : (
                <p className="mt-1 text-xs text-ink-500">Not taught on your roadmap yet.</p>
              )}
            </Row>
          ))}
        </Group>
      </div>

      <p className="max-w-3xl text-xs leading-relaxed text-ink-500">{r.method}</p>
    </section>
  );
}

function Group({ title, empty, children }: { title: string; empty: string; children: React.ReactNode[] }) {
  return (
    <div>
      <h3 className="font-display text-xl font-semibold text-ink-100">{title}</h3>
      {children.length === 0 ? <p className="mt-3 text-sm text-ink-500">{empty}</p> : <ul className="mt-3 divide-y divide-[rgb(var(--fg-tint)/0.1)] border-y border-[rgb(var(--fg-tint)/0.1)]">{children}</ul>}
    </div>
  );
}

function Row({ skill, level, children }: { skill: string; level: "required" | "preferred"; children: React.ReactNode }) {
  return (
    <li className="py-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-medium text-ink-100">{skill}</p>
        <span className="font-mono text-[10px] uppercase tracking-wide text-ink-500">{level}</span>
      </div>
      {children}
    </li>
  );
}
