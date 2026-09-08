"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderGit2, Save, Download } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label, Textarea, Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { SkeletonCard } from "@/components/ui/skeleton";
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
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-light">Portfolio Builder</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink-100">Your projects, written up like proof</h1>
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
                className={`focus-ring w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                  activeId === item.id ? "border-accent bg-accent/10 text-ink-100" : "border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.02)] text-ink-400 hover:text-ink-100"
                }`}
              >
                <p className="font-medium">{item.title}</p>
                {item.is_published && <Badge tone="success" className="mt-1.5">Published</Badge>}
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
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-100">{item.title}</h2>
          <div className="flex flex-wrap gap-1.5">
            {item.skills_demonstrated.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="portfolio-description">Project description</Label>
          <Textarea id="portfolio-description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="portfolio-cv-bullet">CV bullet</Label>
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

        {saved && <Alert variant="info">Saved.</Alert>}

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
  );
}
