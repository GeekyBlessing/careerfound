"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { LabInterviewQuestion, LabProjectDetail } from "@/types/lab";

export function InterviewPrep({ detail, saving, onSave }: { detail: LabProjectDetail; saving: boolean; onSave: (answers: Record<string, string>) => Promise<void> }) {
  const iv = detail.interview;
  const all = [...iv.technical, ...iv.universal];
  const [drafts, setDrafts] = useState<Record<string, string>>(() => Object.fromEntries(all.map((q) => [q.key, q.answer])));

  // Re-sync when the saved answers change on the server.
  useEffect(() => {
    setDrafts(Object.fromEntries([...detail.interview.technical, ...detail.interview.universal].map((q) => [q.key, q.answer])));
  }, [detail.interview]);

  const dirty = all.some((q) => (drafts[q.key] ?? "") !== q.answer);

  return (
    <div className="mt-6">
      <div className="grid gap-4 rounded-xl border border-[rgb(var(--fg-tint)/0.1)] p-4 sm:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wide text-ink-500">Technical questions for this project</p>
          <p className="mt-1 text-sm text-ink-100">
            {iv.technical_answered} of {iv.technical_total} answered
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wide text-ink-500">General project questions</p>
          <p className="mt-1 text-sm text-ink-100">
            {iv.universal_answered} answered, {iv.universal_required} needed
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-500">
        Interview ready means you wrote your own answer to every technical question and to at least {iv.universal_required} of the general ones. Nobody grades your answers. Writing them is the
        practice that makes you able to say them.
      </p>

      <h3 className="mt-6 text-sm font-semibold text-ink-100">Technical questions</h3>
      <ul className="mt-1 divide-y divide-[rgb(var(--fg-tint)/0.08)] border-y border-[rgb(var(--fg-tint)/0.08)]">
        {iv.technical.map((q, i) => (
          <Question key={q.key} q={q} n={i + 1} text={drafts[q.key] ?? ""} minChars={iv.min_chars} onChange={(v) => setDrafts((d) => ({ ...d, [q.key]: v }))} />
        ))}
      </ul>

      <h3 className="mt-8 text-sm font-semibold text-ink-100">Questions about any project you have built</h3>
      <ul className="mt-1 divide-y divide-[rgb(var(--fg-tint)/0.08)] border-y border-[rgb(var(--fg-tint)/0.08)]">
        {iv.universal.map((q, i) => (
          <Question key={q.key} q={q} n={i + 1} text={drafts[q.key] ?? ""} minChars={iv.min_chars} onChange={(v) => setDrafts((d) => ({ ...d, [q.key]: v }))} />
        ))}
      </ul>

      <div className="mt-5 flex items-center gap-3">
        <Button
          loading={saving}
          disabled={!dirty}
          onClick={() => onSave(Object.fromEntries(all.filter((q) => (drafts[q.key] ?? "") !== q.answer).map((q) => [q.key, drafts[q.key] ?? ""])))}
        >
          Save my answers
        </Button>
        {!dirty && iv.ready && <span className="text-xs text-success">Interview ready</span>}
        {dirty && <span className="text-xs text-ink-500">Unsaved changes</span>}
      </div>
    </div>
  );
}

function Question({ q, n, text, minChars, onChange }: { q: LabInterviewQuestion; n: number; text: string; minChars: number; onChange: (value: string) => void }) {
  const long = text.trim().length >= minChars;
  return (
    <li className="py-4">
      <p className="text-sm font-medium leading-snug text-ink-100">
        <span className="mr-2 font-mono text-xs text-ink-500">{String(n).padStart(2, "0")}</span>
        {q.q}
      </p>
      <details className="mt-1.5">
        <summary className="focus-ring cursor-pointer rounded text-xs text-accent-light">What a strong answer covers</summary>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{q.covers}</p>
      </details>
      <Textarea
        rows={3}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write the answer in your own words, as you would say it."
        aria-label={`Your answer: ${q.q}`}
        className="mt-2 text-sm"
        maxLength={2000}
      />
      <p className={cn("mt-1 font-mono text-[10px]", long ? "text-success" : "text-ink-500")}>
        {long ? "counts toward interview ready" : `${Math.max(0, minChars - text.trim().length)} more characters to count`}
      </p>
    </li>
  );
}
