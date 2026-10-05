"use client";

import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { buildReadme, readmeCompleteness } from "@/lib/readme";
import type { LabProjectDetail } from "@/types/lab";
import { CopyButton } from "./common";

const storageKey = (id: string) => `cf-lab-readme:${id}`;

export function ReadmeBuilder({ detail }: { detail: LabProjectDetail }) {
  const sections = detail.readme.sections;
  const defaults = useMemo(() => Object.fromEntries(sections.map((s) => [s.key, s.prefill])), [sections]);
  const [values, setValues] = useState<Record<string, string>>(defaults);
  const [title, setTitle] = useState(detail.title);
  const [open, setOpen] = useState<string>(sections[0]?.key ?? "");

  // Drafts live only in this browser. They are a convenience, never evidence.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(detail.id));
      if (raw) {
        const saved = JSON.parse(raw) as { title?: string; values?: Record<string, string> };
        if (saved.title) setTitle(saved.title);
        if (saved.values) setValues({ ...defaults, ...saved.values });
      }
    } catch {
      /* storage unavailable: start from the prefilled draft */
    }
  }, [detail.id, defaults]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey(detail.id), JSON.stringify({ title, values }));
    } catch {
      /* ignore */
    }
  }, [detail.id, title, values]);

  const markdown = useMemo(() => buildReadme(title, sections, values), [title, sections, values]);
  const status = useMemo(() => readmeCompleteness(sections, values), [sections, values]);

  function download() {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-2">
      <div>
        <label htmlFor="readme-title" className="text-xs font-medium text-ink-300">
          Project title
        </label>
        <input
          id="readme-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="focus-ring mt-1.5 w-full rounded-xl border border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.04)] px-4 py-2.5 text-sm text-ink-100"
        />
        <p className="mt-3 text-xs leading-relaxed text-ink-500">
          Each section starts with a draft from this project. Rewrite it in your own words and make it true for your own build. Delete anything you did not do.
        </p>
        <div className="mt-4 divide-y divide-[rgb(var(--fg-tint)/0.08)] border-y border-[rgb(var(--fg-tint)/0.08)]">
          {sections.map((s) => {
            const filled = Boolean((values[s.key] ?? "").trim());
            return (
              <div key={s.key} className="py-2.5">
                <button
                  type="button"
                  aria-expanded={open === s.key}
                  onClick={() => setOpen(open === s.key ? "" : s.key)}
                  className="focus-ring flex w-full items-center justify-between gap-3 rounded text-left"
                >
                  <span className="text-sm font-medium text-ink-100">{s.title}</span>
                  <span className={filled ? "font-mono text-[10px] uppercase text-success" : "font-mono text-[10px] uppercase text-ink-500"}>{filled ? "written" : "empty"}</span>
                </button>
                {open === s.key && (
                  <div className="mt-2">
                    <p className="mb-2 text-xs leading-relaxed text-ink-500">{s.guidance}</p>
                    <Textarea
                      rows={s.key === "installation" || s.key === "usage" ? 6 : 4}
                      value={values[s.key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
                      aria-label={`${s.title} section`}
                      className={s.key === "installation" || s.key === "usage" ? "font-mono text-xs" : "text-sm"}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-mono text-xs uppercase tracking-wide text-ink-300">README.md preview</h3>
          <div className="flex gap-2">
            <CopyButton text={markdown} label="Copy README" />
            <Button type="button" variant="secondary" size="sm" className="gap-1.5 !px-2 !py-1 text-[11px]" onClick={download}>
              <Download className="h-3 w-3" aria-hidden="true" /> Download
            </Button>
          </div>
        </div>
        <pre className="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-xl border border-[rgb(var(--fg-tint)/0.12)] bg-base-950/70 p-4 font-mono text-[11px] leading-relaxed text-ink-300">
          {markdown}
        </pre>
        <p className="mt-3 text-xs text-ink-500" aria-live="polite">
          {status.filled} of {status.total} sections written.
          {status.missing.length > 0 && ` Still empty: ${status.missing.slice(0, 5).join(", ")}${status.missing.length > 5 ? ", and more" : ""}.`}
        </p>
        {status.placeholdersLeft && (
          <p className="mt-1 text-xs text-warning">A placeholder such as YOUR_REPOSITORY_URL is still in the text. Replace it before you commit the README.</p>
        )}
      </div>
    </div>
  );
}
