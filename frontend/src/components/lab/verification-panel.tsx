"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/career/verified-badge";
import { cn } from "@/lib/utils";
import type { LabProjectDetail } from "@/types/lab";

const CHECKS: { key: keyof LabProjectDetail["verification"]["automated_checks"]; label: string; extra?: boolean }[] = [
  { key: "public", label: "The repository is public" },
  { key: "readme", label: "It has a README" },
  { key: "commits", label: "It has a real commit history, at least three commits" },
  { key: "no_env_committed", label: "No .env file was committed" },
  { key: "gitignore", label: "It has a .gitignore", extra: true },
  { key: "tests", label: "A tests folder or test files were found", extra: true },
  { key: "license", label: "It has a licence", extra: true },
];

export function VerificationPanel({ detail, busy, onSubmit }: { detail: LabProjectDetail; busy: boolean; onSubmit: (note: string) => Promise<void> }) {
  const v = detail.verification;
  const [note, setNote] = useState("");
  const checked = v.tier !== "none";

  return (
    <div className="mt-6 space-y-8">
      <ol className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Project status">
        {detail.lifecycle.map((s) => (
          <li key={s.key} className={cn("flex items-center gap-1.5 text-xs", s.reached ? "text-ink-100" : "text-ink-500")}>
            <span
              aria-hidden="true"
              className={cn("inline-flex h-4 w-4 items-center justify-center rounded-full border", s.reached ? "border-success bg-success text-[rgb(var(--color-bg))]" : "border-[rgb(var(--fg-tint)/0.3)]")}
            >
              {s.reached && <Check className="h-2.5 w-2.5" />}
            </span>
            {s.label}
            <span className="sr-only">{s.reached ? ", reached" : ", not reached"}</span>
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-[rgb(var(--fg-tint)/0.12)] p-5">
        <div className="flex flex-wrap items-center gap-3">
          {v.badge ? (
            <VerifiedBadge badge={v.badge} reviewer={v.reviewer_name} date={v.reviewed_at} />
          ) : (
            <span className="rounded-[0.25rem] border border-[rgb(var(--fg-tint)/0.14)] px-2.5 py-1 text-xs text-ink-400">
              {v.tier === "in_review" ? "Waiting for a reviewer" : v.tier === "changes_requested" ? "Changes requested" : "Not verified"}
            </span>
          )}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-300">{v.copy}</p>
        {v.stale && <p className="mt-2 text-sm text-warning">The repository link changed, so the earlier review no longer applies.</p>}

        {v.reviewer_name && v.review_note && (
          <blockquote className="mt-4 border-l-2 border-accent/50 pl-4 text-sm leading-relaxed text-ink-200">
            {v.review_note}
            <footer className="mt-1 font-mono text-[11px] text-ink-500">
              {v.reviewer_name}
              {v.reviewed_at ? `, ${new Date(v.reviewed_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}` : ""}
            </footer>
          </blockquote>
        )}
      </div>

      {checked && (
        <div>
          <h3 className="text-sm font-semibold text-ink-100">What the automated check found</h3>
          <p className="mt-1 text-xs text-ink-500">Facts read from your public GitHub repository. This is not a review of your code.</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {CHECKS.map((c) => {
              const ok = v.automated_checks[c.key];
              return (
                <li key={c.key} className="flex items-start gap-2 text-sm text-ink-300">
                  {ok ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-label="Found" /> : <X className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" aria-label="Not found" />}
                  <span>
                    {c.label}
                    {c.extra && <span className="ml-1.5 font-mono text-[10px] uppercase text-ink-500">extra</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-ink-100">Get a person to review it</h3>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-400">
          A CareerFound reviewer reads your project, opens your repository and either approves it or tells you what to fix. Only an approval earns the Verified badge, and it applies to this repository only. If you change the link, the badge goes away.
        </p>
        {v.can_submit ? (
          <form
            className="mt-4 max-w-2xl space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              await onSubmit(note);
              setNote("");
            }}
          >
            <label htmlFor="review-note" className="font-mono text-[10px] uppercase tracking-wide text-ink-500">
              Note for the reviewer, optional
            </label>
            <textarea
              id="review-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="What should the reviewer look at first?"
              className="focus-ring w-full rounded-xl border border-[rgb(var(--fg-tint)/0.16)] bg-transparent px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500"
            />
            <Button type="submit" loading={busy}>
              {v.tier === "changes_requested" ? "Submit again for review" : "Submit for review"}
            </Button>
          </form>
        ) : v.tier === "none" ? (
          <ul className="mt-3 space-y-1 text-sm text-ink-400">
            {v.submit_blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
