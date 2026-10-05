"use client";

import { Check } from "lucide-react";
import { InViewFill } from "@/components/marketing/in-view-fill";
import { ROADMAP_PCT } from "@/components/screens/example";
import { cn } from "@/lib/utils";

/**
 * The Project Lab's progress, shown as the page's own animated component
 * rather than a picture: the career's overall progress fills when it scrolls
 * into view, then the three beginner projects, then the four pieces of
 * evidence that turn a finished project into something an employer can see.
 * Example learner, labelled as such.
 */
const PROJECTS = [
  { title: "Network Reconnaissance Tool", pct: 82 },
  { title: "Password Security Analyzer", pct: 34 },
  { title: "Security Log Analyzer", pct: 0 },
];
const EVIDENCE = ["GitHub", "Documentation", "Portfolio", "Interview ready"];

export function LabProgress({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-[rgb(var(--fg-tint)/0.14)] bg-base-950 p-6 shadow-card", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-mono text-[11px] uppercase tracking-wide text-ink-500">Cybersecurity</p>
        <p className="font-mono text-[11px] uppercase tracking-wide text-ink-500">Example learner</p>
      </div>
      <p className="mt-2 font-display text-5xl font-semibold leading-none tracking-tight text-ink-100">
        {ROADMAP_PCT}%<span className="ml-2 text-lg font-medium text-ink-400">complete</span>
      </p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgb(var(--fg-tint)/0.1)]"><InViewFill value={ROADMAP_PCT} /></div>

      <ul className="mt-6 space-y-4">
        {PROJECTS.map((p, i) => (
          <li key={p.title}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium text-ink-100">{p.title}</span>
              <span className="font-mono text-xs text-ink-400">{p.pct}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[rgb(var(--fg-tint)/0.1)]"><InViewFill value={p.pct} delayMs={250 + i * 180} className="bg-accent-light" /></div>
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t border-[rgb(var(--fg-tint)/0.12)] pt-5">
        <p className="font-mono text-[11px] uppercase tracking-wide text-ink-500">A finished project leaves you with</p>
        <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
          {EVIDENCE.map((e) => (
            <li key={e} className="flex items-center gap-2 text-ink-100">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white"><Check className="h-2.5 w-2.5" strokeWidth={3} /></span>
              {e}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
