"use client";

import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LabProjectDetail } from "@/types/lab";
import { Checkbox } from "./common";

const GROUPS: { stage: "build" | "test" | "document"; title: string; blurb: string }[] = [
  { stage: "build", title: "Build", blurb: "Set up and write the project. Tick each milestone when the work exists, not when you have read about it." },
  { stage: "test", title: "Test", blurb: "Prove it works, including the cases that should fail." },
  { stage: "document", title: "Document", blurb: "Write down what you built so a stranger can understand and run it." },
];

export function MilestoneList({
  detail,
  busy,
  onToggle,
}: {
  detail: LabProjectDetail;
  busy: string | null;
  onToggle: (key: string, done: boolean) => void;
}) {
  let counter = 0;
  const numbered = detail.milestones.map((m) => ({ ...m, n: ++counter }));
  return (
    <div className="mt-6 space-y-8">
      {GROUPS.map((group) => {
        const items = numbered.filter((m) => m.stage === group.stage);
        if (items.length === 0) return null;
        const done = items.filter((m) => m.done).length;
        return (
          <div key={group.stage}>
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-sm font-semibold text-ink-100">{group.title}</h3>
              <span className="font-mono text-[11px] text-ink-500">
                {done} of {items.length}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-500">{group.blurb}</p>
            <ol className="mt-3 divide-y divide-[rgb(var(--fg-tint)/0.08)] border-y border-[rgb(var(--fg-tint)/0.08)]">
              {items.map((m) => (
                <li key={m.key} className="flex gap-3 py-3.5">
                  <Checkbox checked={m.done} disabled={busy === m.key} label={`Milestone ${m.n}: ${m.title}`} onChange={(next) => onToggle(m.key, next)} />
                  <div className="min-w-0">
                    <p className={cn("text-sm font-medium", m.done ? "text-ink-400 line-through decoration-[rgb(var(--fg-tint)/0.3)]" : "text-ink-100")}>
                      <span className="mr-2 font-mono text-xs text-ink-500">{String(m.n).padStart(2, "0")}</span>
                      {m.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-500">{m.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        );
      })}

      <div>
        <h3 className="text-sm font-semibold text-ink-100">Then publish and prove it</h3>
        <p className="mt-1 text-xs text-ink-500">These steps tick themselves when the evidence appears. You cannot tick them by hand.</p>
        <ol className="mt-3 divide-y divide-[rgb(var(--fg-tint)/0.08)] border-y border-[rgb(var(--fg-tint)/0.08)]">
          {detail.journey
            .filter((s) => !s.manual)
            .map((s) => (
              <li key={s.key} className="flex items-center gap-3 py-3">
                <span
                  className={cn(
                    "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border",
                    s.done ? "border-success bg-success text-white" : "border-[rgb(var(--fg-tint)/0.2)] text-ink-500"
                  )}
                  aria-hidden="true"
                >
                  {s.done ? "✓" : <Lock className="h-3 w-3" />}
                </span>
                <span className={cn("text-sm", s.done ? "text-ink-300" : "text-ink-400")}>{s.title}</span>
                <span className="sr-only">{s.done ? "done" : "not done yet"}</span>
              </li>
            ))}
        </ol>
      </div>
    </div>
  );
}
