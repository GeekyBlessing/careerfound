"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { LabCheckItem, LabProjectDetail } from "@/types/lab";
import { Checkbox, CopyButton } from "./common";

export function GithubWorkflow({
  detail,
  busy,
  onChecklist,
  onSaveRepo,
  onCheckRepo,
}: {
  detail: LabProjectDetail;
  busy: string | null;
  onChecklist: (key: string, value: boolean) => void;
  onSaveRepo: (url: string) => Promise<void>;
  onCheckRepo: () => Promise<void>;
}) {
  const gh = detail.github;
  const [url, setUrl] = useState(gh.repo_url);
  const check = gh.repo_check;
  const checked = Boolean(check.checked_at);
  const isCode = detail.kind === "code";

  return (
    <div className="mt-6 space-y-10">
      <div>
        <h3 className="text-sm font-semibold text-ink-100">{isCode ? "From your folder to GitHub, one step at a time" : "Publish your case study"}</h3>
        <ol className="mt-3 divide-y divide-[rgb(var(--fg-tint)/0.08)] border-y border-[rgb(var(--fg-tint)/0.08)]">
          {gh.steps.map((step, i) => (
            <li key={step.key}>
              <details className="group py-3">
                <summary className="focus-ring flex cursor-pointer list-none items-baseline gap-3 rounded text-sm font-medium text-ink-100">
                  <span className="font-mono text-xs text-ink-500">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1">{step.title}</span>
                  <span className="text-xs text-ink-500 group-open:hidden">Show</span>
                  <span className="hidden text-xs text-ink-500 group-open:inline">Hide</span>
                </summary>
                <div className="mt-3 pl-8">
                  <p className="text-sm leading-relaxed text-ink-400">{step.why}</p>
                  {step.commands.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {step.commands.map((c) => (
                        <div key={c.cmd}>
                          <div className="flex items-center justify-between gap-3 rounded-lg border border-[rgb(var(--fg-tint)/0.12)] bg-base-950/70 px-3 py-2">
                            <code className="overflow-x-auto whitespace-nowrap font-mono text-xs text-ink-100">{c.cmd}</code>
                            <CopyButton text={c.cmd} />
                          </div>
                          <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{c.explain}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {step.note && <p className="mt-3 border-l-2 border-accent/50 pl-3 text-xs leading-relaxed text-ink-400">{step.note}</p>}
                </div>
              </details>
            </li>
          ))}
        </ol>
      </div>

      <div id="repo-link" className="scroll-mt-24">
        <h3 className="text-sm font-semibold text-ink-100">Link your repository</h3>
        <p className="mt-1 text-xs leading-relaxed text-ink-500">
          Paste the address of your public repository. CareerFound reads what GitHub shows publicly: whether it is public, has a README, a .gitignore and at least three
          commits, and that no .env file was committed. It does not download, run or grade your code.
        </p>
        <form
          className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end"
          onSubmit={async (e) => {
            e.preventDefault();
            await onSaveRepo(url);
          }}
        >
          <div className="flex-1">
            <Label htmlFor="repo-url" className="sr-only">
              Repository URL
            </Label>
            <Input id="repo-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://github.com/your-name/your-project" inputMode="url" autoComplete="off" />
          </div>
          <Button type="submit" variant="secondary" loading={busy === "repo"}>
            Save link
          </Button>
          <Button type="button" onClick={onCheckRepo} loading={busy === "check"} disabled={!gh.repo_url || url.trim() !== gh.repo_url}>
            Check repository
          </Button>
        </form>

        {checked && (
          <div className={cn("mt-4 rounded-xl border p-4", check.passed ? "border-success/40 bg-success/5" : "border-warning/40 bg-warning/5")} role="status">
            <p className="flex items-center gap-2 text-sm font-medium text-ink-100">
              {check.passed ? <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" /> : <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />}
              {check.passed ? "Repository passed the evidence check" : "Repository did not pass yet"}
            </p>
            {check.error && <p className="mt-2 text-xs text-ink-400">{check.error}</p>}
            {check.checks && (
              <ul className="mt-3 grid gap-1.5 text-xs sm:grid-cols-2">
                <CheckRow ok={check.checks.public} label="Public repository" />
                <CheckRow ok={check.checks.readme} label="README exists" />
                <CheckRow ok={check.checks.commits} label={`At least 3 commits (found ${check.commit_count ?? 0})`} />
                <CheckRow ok={check.checks.gitignore} label=".gitignore exists" soft />
                <CheckRow ok={check.checks.no_env_committed} label="No .env file committed" />
              </ul>
            )}
            <p className="mt-3 font-mono text-[10px] text-ink-500">Checked {new Date(check.checked_at!).toLocaleString()}</p>
          </div>
        )}
      </div>

      {isCode && (
        <div className="grid gap-10 lg:grid-cols-2">
          <ChecklistBlock title="GitHub ready" items={gh.checklist} busy={busy} onChange={onChecklist} />
          <div>
            <ChecklistBlock title="Secrets and security" items={gh.security_checklist} busy={busy} onChange={onChecklist} />
            <div className="mt-4 flex gap-2 rounded-lg border border-[rgb(var(--fg-tint)/0.1)] p-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-light" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-ink-400">{gh.security_guidance}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckRow({ ok, label, soft }: { ok: boolean; label: string; soft?: boolean }) {
  return (
    <li className="flex items-center gap-2 text-ink-300">
      {ok ? <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden="true" /> : <XCircle className={cn("h-3.5 w-3.5", soft ? "text-ink-500" : "text-danger")} aria-hidden="true" />}
      {label}
      <span className="sr-only">{ok ? "passed" : "not passed"}</span>
    </li>
  );
}

function ChecklistBlock({ title, items, busy, onChange }: { title: string; items: LabCheckItem[]; busy: string | null; onChange: (key: string, value: boolean) => void }) {
  const done = items.filter((i) => i.checked).length;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h3 className="font-mono text-xs uppercase tracking-wide text-ink-300">{title}</h3>
        <span className="font-mono text-[11px] text-ink-500">
          {done} of {items.length}
        </span>
      </div>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={item.key} className="flex items-start gap-3">
            <Checkbox checked={item.checked} disabled={busy === item.key} label={item.label} onChange={(next) => onChange(item.key, next)} />
            <span className="text-sm leading-snug text-ink-300">
              {item.label}
              {item.verified === true && <span className="ml-2 font-mono text-[10px] uppercase text-success">seen on GitHub</span>}
              {item.verified === false && <span className="ml-2 font-mono text-[10px] uppercase text-warning">not seen on GitHub</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
