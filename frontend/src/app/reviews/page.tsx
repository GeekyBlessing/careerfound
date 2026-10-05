"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Check, ExternalLink, X } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonCard } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatRelativeTime } from "@/lib/utils";

interface QueueItem {
  id: string;
  project_title: string;
  level: string;
  kind: string;
  learner: string;
  repo_url: string;
  note: string;
  submitted_at: string | null;
  automated_checks: Record<string, boolean>;
  requirements: string[];
  criteria: string[];
}

const CHECK_LABELS: Record<string, string> = {
  public: "Public",
  readme: "README",
  commits: "3+ commits",
  no_env_committed: "No .env committed",
  gitignore: ".gitignore",
  tests: "Tests found",
  license: "Licence",
};

export default function ReviewsPage() {
  const { user } = useAuth();
  const allowed = user?.role === "mentor" || user?.role === "admin";
  const [items, setItems] = useState<QueueItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .get<QueueItem[]>("/review/queue")
      .then(setItems)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load the review queue."));
  }, []);
  useEffect(() => {
    if (allowed) load();
  }, [allowed, load]);

  return (
    <AppShell>
      <div className="space-y-10">
        <header className="max-w-3xl">
          <p className="eyebrow">Project reviews</p>
          <h1 className="mt-2 font-display text-h1 font-semibold tracking-tight text-ink-100">Review a learner&apos;s project</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-400">
            Your name goes on an approval. Open the repository, read the work against the requirements, then approve it or say what to fix. Approving tells employers a person looked at this project.
          </p>
        </header>

        {user && !allowed && <Alert>Only mentors and admins can review projects.</Alert>}
        {error && <Alert>{error}</Alert>}
        {allowed && !items && !error && <SkeletonCard />}
        {items && items.length === 0 && <EmptyState title="Nothing is waiting for review" description="When a learner submits a finished project, it appears here." />}

        <ul className="space-y-8">
          {items?.map((it) => (
            <Review key={it.id} item={it} onDone={load} />
          ))}
        </ul>
      </div>
    </AppShell>
  );
}

function Review({ item, onDone }: { item: QueueItem; onDone: () => void }) {
  const [note, setNote] = useState("");
  const [opened, setOpened] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function decide(e: FormEvent | null, decision: "approve" | "request_changes") {
    e?.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await api.post(`/review/${item.id}/decision`, { decision, note, opened_repository: opened });
      onDone();
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Could not save that decision.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-2xl border border-[rgb(var(--fg-tint)/0.12)] p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink-100">{item.project_title}</h2>
          <p className="text-xs text-ink-500">
            {item.learner}, submitted {item.submitted_at ? formatRelativeTime(item.submitted_at) : "recently"}
          </p>
        </div>
        <a href={item.repo_url} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex items-center gap-1.5 rounded text-sm font-medium text-accent-light hover:underline">
          Open the repository <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>

      {item.note && <p className="mt-4 max-w-2xl border-l-2 border-[rgb(var(--fg-tint)/0.2)] pl-4 text-sm leading-relaxed text-ink-300">{item.note}</p>}

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-ink-400">
        {Object.entries(item.automated_checks).map(([k, ok]) => (
          <li key={k} className="inline-flex items-center gap-1.5">
            {ok ? <Check className="h-3.5 w-3.5 text-success" aria-label="Found" /> : <X className="h-3.5 w-3.5 text-ink-500" aria-label="Not found" />}
            {CHECK_LABELS[k] ?? k}
          </li>
        ))}
      </ul>

      <details className="mt-5">
        <summary className="focus-ring cursor-pointer rounded text-sm font-medium text-ink-200">What the project had to meet</summary>
        <ol className="mt-3 list-inside list-decimal space-y-1.5 text-sm leading-relaxed text-ink-300">
          {item.requirements.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
      </details>

      <form className="mt-6 max-w-2xl space-y-3" onSubmit={(e) => decide(e, "approve")}>
        <label htmlFor={`note-${item.id}`} className="font-mono text-[10px] uppercase tracking-wide text-ink-500">
          Your review note, at least 20 characters. The learner sees it.
        </label>
        <textarea
          id={`note-${item.id}`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          maxLength={2000}
          className="focus-ring w-full rounded-xl border border-[rgb(var(--fg-tint)/0.16)] bg-transparent px-3 py-2 text-sm text-ink-100"
        />
        <label className="flex items-start gap-2 text-sm text-ink-300">
          <input type="checkbox" checked={opened} onChange={(e) => setOpened(e.target.checked)} className="mt-1" />I opened the repository and read the work.
        </label>
        {err && <p className="text-sm text-danger">{err}</p>}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" loading={busy} disabled={!opened || note.trim().length < 20}>
            Approve and verify
          </Button>
          <Button type="button" variant="secondary" disabled={busy || note.trim().length < 20} onClick={() => decide(null, "request_changes")}>
            Request changes
          </Button>
        </div>
      </form>
    </li>
  );
}
