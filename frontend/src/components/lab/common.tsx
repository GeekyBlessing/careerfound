"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LabStageKey } from "@/types/lab";

export function CopyButton({ text, label = "Copy", className }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard can be blocked; the text stays selectable on screen */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "focus-ring inline-flex items-center gap-1.5 rounded-md border border-[rgb(var(--fg-tint)/0.14)] px-2 py-1 text-[11px] font-medium text-ink-300 transition-colors hover:border-accent/40 hover:text-accent-light",
        className
      )}
    >
      {copied ? <Check className="h-3 w-3" aria-hidden="true" /> : <Copy className="h-3 w-3" aria-hidden="true" />}
      {copied ? "Copied" : label}
    </button>
  );
}

/** An editorial section opener: mono index, serif title, hairline rule. */
export function SectionHeading({ n, id, title, kicker }: { n: string; id: string; title: string; kicker?: string }) {
  return (
    <div id={id} className="scroll-mt-24 border-t border-[rgb(var(--fg-tint)/0.14)] pt-5">
      <p className="flex items-baseline gap-3">
        <span className="font-mono text-xs text-ink-500">{n}</span>
        <span className="font-display text-h2 font-semibold tracking-tight text-ink-100">{title}</span>
      </p>
      {kicker && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-400">{kicker}</p>}
    </div>
  );
}

export const STAGE_STYLE: Record<LabStageKey | "none", string> = {
  none: "border-[rgb(var(--fg-tint)/0.12)] text-ink-500",
  started: "border-[rgb(var(--fg-tint)/0.2)] text-ink-300",
  in_progress: "border-accent/40 bg-accent/10 text-accent-light",
  completed: "border-success/40 bg-success/10 text-success",
  published: "border-success/40 bg-success/10 text-success",
  portfolio_ready: "border-success/50 bg-success/15 text-success",
  interview_ready: "border-success/50 bg-success/15 text-success",
};

export function StageBadge({ stage, label }: { stage: LabStageKey | null; label: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-[0.25rem] border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide", STAGE_STYLE[stage ?? "none"])}>
      {label}
    </span>
  );
}

export function StageTracker({ stages }: { stages: { key: LabStageKey; label: string; description: string; reached: boolean }[] }) {
  return (
    <ol className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-6" aria-label="Project stages">
      {stages.map((s, i) => (
        <li key={s.key} className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border text-[10px] font-mono",
                s.reached ? "border-accent bg-accent text-white" : "border-[rgb(var(--fg-tint)/0.2)] text-ink-500"
              )}
              aria-hidden="true"
            >
              {s.reached ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <span className={cn("text-xs font-medium", s.reached ? "text-ink-100" : "text-ink-500")}>{s.label}</span>
            <span className="sr-only">{s.reached ? "reached" : "not reached yet"}</span>
          </div>
          <div className={cn("mt-2 h-px", s.reached ? "bg-accent" : "bg-[rgb(var(--fg-tint)/0.14)]")} />
          <p className="mt-1.5 text-[11px] leading-snug text-ink-500">{s.description}</p>
        </li>
      ))}
    </ol>
  );
}

export function Checkbox({
  checked,
  onChange,
  disabled,
  label,
  children,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "focus-ring mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-colors",
        checked ? "border-accent bg-accent text-white" : "border-[rgb(var(--fg-tint)/0.3)] hover:border-accent/60",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      {checked && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
      {children}
    </button>
  );
}
