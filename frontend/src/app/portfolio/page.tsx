"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderGit2, Save, Download, Copy, Check } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label, Textarea, Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { SkeletonCard } from "@/components/ui/skeleton";
import { IconTile } from "@/components/ui/icon-tile";
import { cn } from "@/lib/utils";
import { api, ApiError } from "@/lib/api";
import type { PortfolioItem } from "@/types";

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<PortfolioItem[]>("/portfolio")
      .then((res) => {
        setItems(res);
        if (res[0]) setActiveId(res[0].id);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load your portfolio."))
      .finally(() => setLoading(false));
  }, []);

  const active = items.find((i) => i.id === activeId) || null;

  return (
    <AppShell>
      <div className="mb-6">
        <p className="eyebrow">Portfolio Builder</p>
        <h1 className="mt-1 font-display text-h1 font-semibold tracking-tight text-ink-100">Your projects, written up like proof</h1>
      </div>

      {loading && <SkeletonCard />}
      {error && <Alert>{error}</Alert>}

      {!loading && items.length === 0 && (
        <EmptyState
          icon={FolderGit2}
          title="No portfolio items yet"
          description="Complete a project in your roadmap, then generate a portfolio write-up in one click."
          action={
            <Link href="/roadmap">
              <Button>Go to your roadmap</Button>
            </Link>
          }
        />
      )}

      {items.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="space-y-2">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveId(item.id)}
                aria-pressed={activeId === item.id}
                className={cn(
                  "focus-ring flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-150 ease-smooth active:translate-y-px",
                  activeId === item.id
                    ? "border-accent bg-accent/10 text-ink-100 shadow-xs"
                    : "border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.02)] text-ink-400 hover:bg-[rgb(var(--fg-tint)/0.04)] hover:text-ink-100"
                )}
              >
                <span
                  className={cn(
                    "path-node h-2 w-2 flex-shrink-0 border-0",
                    activeId === item.id ? "bg-accent" : "bg-[rgb(var(--fg-tint)/0.18)]"
                  )}
                  aria-hidden="true"
                />
                <span className="flex-1">
                  <p className="font-display font-medium">{item.title}</p>
                  {item.is_published && <Badge tone="success" className="mt-1.5">Published</Badge>}
                </span>
              </button>
            ))}
          </div>

          {active && <PortfolioEditor key={active.id} item={active} onSaved={(updated) => setItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))} />}
        </div>
      )}
    </AppShell>
  );
}

function PortfolioEditor({ item, onSaved }: { item: PortfolioItem; onSaved: (item: PortfolioItem) => void }) {
  const [description, setDescription] = useState(item.project_description);
  const [readme, setReadme] = useState(item.readme_draft);
  const [cvBullet, setCvBullet] = useState(item.cv_bullet);
  const [linkedin, setLinkedin] = useState(item.linkedin_blurb);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyCvBullet() {
    try {
      await navigator.clipboard.writeText(cvBullet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access can be denied by the browser; the text is still
      // right there in the field to select and copy manually.
    }
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const updated = await api.patch<PortfolioItem>(`/portfolio/${item.id}`, {
        project_description: description,
        readme_draft: readme,
        cv_bullet: cvBullet,
        linkedin_blurb: linkedin,
      });
      onSaved(updated);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* A read-only preview of how this project reads as proof of work,
          separate from the editable fields below it, so the page feels
          like a real portfolio product (something with a front-of-house
          presentation) rather than just a form bound to four textareas. */}
      <Card className="bg-mist/50">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <IconTile icon={FolderGit2} />
              <div>
                <p className="font-display text-h3 font-semibold tracking-tight text-ink-100">{item.title}</p>
                {item.is_published ? (
                  <Badge tone="success" className="mt-1">Published</Badge>
                ) : (
                  <Badge tone="neutral" className="mt-1">Draft, not published</Badge>
                )}
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink-300">{description}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {item.skills_demonstrated.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <Label htmlFor="portfolio-description">Project description</Label>
            <Textarea id="portfolio-description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="portfolio-cv-bullet">CV bullet</Label>
              <button
                type="button"
                onClick={copyCvBullet}
                className="focus-ring flex items-center gap-1 rounded text-[11px] text-ink-500 hover:text-ink-300"
              >
                {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <Input id="portfolio-cv-bullet" value={cvBullet} onChange={(e) => setCvBullet(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="portfolio-linkedin">LinkedIn post</Label>
            <Textarea id="portfolio-linkedin" rows={3} value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="portfolio-readme">README draft</Label>
            <Textarea
              id="portfolio-readme"
              rows={8}
              value={readme}
              onChange={(e) => setReadme(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          {saved && <Alert variant="info" className="animate-fade-in-up">Saved.</Alert>}

          <div className="flex items-center gap-3">
            <Button onClick={save} loading={saving} className="gap-1.5">
              <Save className="h-3.5 w-3.5" /> Save changes
            </Button>
            <a
              href={`data:text/markdown;charset=utf-8,${encodeURIComponent(readme)}`}
              download={`${item.title.replace(/\s+/g, "-").toLowerCase()}-README.md`}
              className="focus-ring inline-flex items-center gap-1.5 rounded text-xs text-ink-500 hover:text-ink-300"
            >
              <Download className="h-3.5 w-3.5" /> Download README.md
            </a>
          </div>
        </CardContent>
      </Card>

      {item.case_study_md && (
        <Card>
          <CardContent className="p-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Case study</p>
            <pre className="whitespace-pre-wrap text-xs leading-relaxed text-ink-400">{item.case_study_md}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
