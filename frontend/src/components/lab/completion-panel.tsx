"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LabProjectDetail } from "@/types/lab";
import { Checkbox, CopyButton } from "./common";

export function CompletionPanel({
  detail,
  busy,
  error,
  onCriterion,
  onComplete,
  onPortfolio,
}: {
  detail: LabProjectDetail;
  busy: string | null;
  error: string | null;
  onCriterion: (key: string, value: boolean) => void;
  onComplete: () => Promise<void>;
  onPortfolio: () => Promise<void>;
}) {
  const f = detail.flags;
  const isCode = detail.kind === "code";
  const nextSteps = [
    { label: "Document", detail: "README written and published with your code", done: f.published },
    { label: "Publish", detail: "Public repository with real commits", done: f.published },
    { label: "Add to Portfolio", detail: "Listed on your CareerFound portfolio", done: f.portfolio_ready },
    { label: "Add to CV", detail: "Use the CV line below", done: false, manualNote: true },
    { label: "Prepare to discuss in an interview", detail: "Your own written answers", done: f.interview_ready },
  ];
  const portfolioBlocked = !f.completed ? "Complete the project first." : isCode && !f.published ? "Link your repository and run the check first." : null;

  return (
    <div className="mt-6 space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-ink-100">Final checklist</h3>
        <p className="mt-1 text-xs text-ink-500">Confirm each statement only when it is true. These are your own claims, and an interviewer may ask you to show them.</p>
        <ul className="mt-3 space-y-3">
          {detail.criteria.map((c) => (
            <li key={c.key} className="flex items-start gap-3">
              <Checkbox checked={c.checked} disabled={busy === c.key} label={c.text} onChange={(next) => onCriterion(c.key, next)} />
              <span className="text-sm leading-snug text-ink-300">{c.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {error && <Alert>{error}</Alert>}

      {!f.completed ? (
        <div className="rounded-xl border border-[rgb(var(--fg-tint)/0.12)] p-5">
          <p className="text-sm font-medium text-ink-100">Complete project</p>
          {detail.completion.missing.length > 0 ? (
            <ul className="mt-2 space-y-1 text-xs text-ink-500">
              {detail.completion.missing.map((m) => (
                <li key={m}>Still needed: {m}.</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-ink-500">Every milestone is ticked and every statement confirmed.</p>
          )}
          <Button className="mt-4" onClick={onComplete} loading={busy === "complete"} disabled={!detail.completion.can_complete || !detail.started}>
            Complete project
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-success/40 bg-success/5 p-5">
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-success">
            <Check className="h-4 w-4" aria-hidden="true" /> Project complete
          </p>
          {detail.credited_by_history && (
            <p className="mt-2 text-xs text-ink-400">You marked this project complete before the Project Lab. Tick the milestones and confirm the checklist to back it with evidence.</p>
          )}
          <ol className="mt-4 space-y-3">
            {nextSteps.map((s, i) => (
              <li key={s.label} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border text-[10px] font-mono",
                    s.done ? "border-success bg-success text-white" : "border-[rgb(var(--fg-tint)/0.25)] text-ink-500"
                  )}
                  aria-hidden="true"
                >
                  {s.done ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-ink-100">{s.label}</p>
                  <p className="text-xs text-ink-500">{s.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="rounded-xl border border-[rgb(var(--fg-tint)/0.12)] p-5">
        <p className="text-sm font-medium text-ink-100">Portfolio and CV</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-500">
          Adding this project lists it on your CareerFound portfolio with its skills, a CV line and a link to your repository. Only a project you completed
          {isCode ? " and published" : ""} can be added.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {f.portfolio_ready ? (
            <Link href="/portfolio" className="focus-ring inline-flex items-center gap-1.5 rounded text-sm font-medium text-accent-light hover:underline">
              View in your portfolio <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          ) : (
            <Button onClick={onPortfolio} loading={busy === "portfolio"} disabled={Boolean(portfolioBlocked)} className="gap-1.5">
              Add to Portfolio <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
          {portfolioBlocked && !f.portfolio_ready && <span className="text-xs text-ink-500">{portfolioBlocked}</span>}
        </div>
        {detail.cv_bullet && (
          <div className="mt-5 border-t border-[rgb(var(--fg-tint)/0.1)] pt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-wide text-ink-500">CV line, edit it to match what you did</p>
              <CopyButton text={detail.cv_bullet} label="Copy line" />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-300">{detail.cv_bullet}</p>
          </div>
        )}
      </div>
    </div>
  );
}
