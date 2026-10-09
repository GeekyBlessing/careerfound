"use client";

import { useCallback, useEffect, useState } from "react";
import { Save, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Input, Label, Textarea } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";
import type { CaseStudyFields, CaseStudyView } from "@/types/career";

const SECTIONS: { key: keyof Pick<CaseStudyFields, "overview" | "problem" | "solution" | "architecture" | "challenges" | "results">; label: string; hint: string }[] = [
  { key: "overview", label: "Overview", hint: "What it is, in two or three sentences, in your own words." },
  { key: "problem", label: "Problem", hint: "The real situation that makes it useful." },
  { key: "solution", label: "Solution", hint: "What you built and why you chose that approach." },
  { key: "architecture", label: "Architecture", hint: "How the parts fit together." },
  { key: "challenges", label: "Challenges", hint: "The hardest thing you hit and how you got past it." },
  { key: "results", label: "Results", hint: "What it did, with real numbers if you have them. Left empty until you write it." },
];

const SOURCE_NOTE: Record<string, string> = {
  template: "Starter text from the project. Rewrite it to describe what you actually built.",
  your_interview_answer: "From your own interview answer.",
  your_portfolio_description: "From your portfolio description.",
};

/**
 * Edits the structured case study for a portfolio piece. Generating a draft
 * fills what the project already tells us and leaves results and screenshots
 * for the person, because only they know them.
 */
export function CaseStudyEditor({ itemId, repoUrl }: { itemId: string; repoUrl?: string }) {
  const [view, setView] = useState<CaseStudyView | null>(null);
  const [form, setForm] = useState<CaseStudyFields | null>(null);
  const [live, setLive] = useState("");
  const [shots, setShots] = useState("");
  const [tech, setTech] = useState("");
  const [busy, setBusy] = useState<"load" | "gen" | "save" | null>("load");
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const apply = useCallback((v: CaseStudyView) => {
    setView(v);
    setForm(v.case_study);
    setLive(v.live_demo);
    setShots(v.case_study.screenshots.join("\n"));
    setTech(v.case_study.technologies.join(", "));
  }, []);

  useEffect(() => {
    setBusy("load");
    api
      .get<CaseStudyView>(`/portfolio/${itemId}/case-study`)
      .then(apply)
      .catch((e) => setMsg({ tone: "err", text: e instanceof ApiError ? e.message : "Could not load the case study." }))
      .finally(() => setBusy(null));
  }, [itemId, apply]);

  async function generate(overwrite: boolean) {
    setBusy("gen");
    setMsg(null);
    try {
      apply(await api.post<CaseStudyView>(`/portfolio/${itemId}/case-study/generate?overwrite=${overwrite}`));
      setMsg({ tone: "ok", text: overwrite ? "Draft rebuilt from your project." : "Draft ready. Rewrite it in your own words." });
    } catch (e) {
      setMsg({ tone: "err", text: e instanceof ApiError ? e.message : "Could not build the draft." });
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    if (!form) return;
    setBusy("save");
    setMsg(null);
    try {
      const v = await api.put<CaseStudyView>(`/portfolio/${itemId}/case-study`, {
        ...form,
        technologies: tech.split(",").map((t) => t.trim()).filter(Boolean),
        screenshots: shots.split("\n").map((s) => s.trim()).filter(Boolean),
        live_demo: live.trim(),
      });
      apply(v);
      setMsg({ tone: "ok", text: "Case study saved." });
    } catch (e) {
      setMsg({ tone: "err", text: e instanceof ApiError ? e.message : "Could not save the case study." });
    } finally {
      setBusy(null);
    }
  }

  if (!view || !form) return busy === "load" ? <Card><CardContent className="p-6 text-sm text-ink-500">Loading case study</CardContent></Card> : msg ? <Alert>{msg.text}</Alert> : null;
  const empty = view.status === "none";

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Case study</p>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink-400">
              This is what employers read on your public page. We start it from your project. Anything we cannot know, like results and screenshots, stays empty until you add it.
            </p>
          </div>
          <Button variant="secondary" size="sm" loading={busy === "gen"} onClick={() => generate(false)} className="gap-1.5">
            <Wand2 className="h-3.5 w-3.5" /> {empty ? "Draft from my project" : "Fill empty sections"}
          </Button>
        </div>

        {!empty && view.needs_input.length > 0 && (
          <p className="rounded-xl border border-warning/30 bg-warning/[0.06] p-3 text-sm text-ink-200">Still needs you: {view.needs_input.join(", ")}.</p>
        )}

        {!empty && (
          <>
            {SECTIONS.map((s) => (
              <div key={s.key}>
                <Label htmlFor={`cs-${s.key}`}>{s.label}</Label>
                <Textarea id={`cs-${s.key}`} rows={s.key === "results" || s.key === "challenges" ? 4 : 3} value={form[s.key]} onChange={(e) => setForm({ ...form, [s.key]: e.target.value })} placeholder={s.hint} />
                {view.sources?.[s.key] && form[s.key] && SOURCE_NOTE[view.sources[s.key]!] && <p className="mt-1 text-[11px] text-ink-500">{SOURCE_NOTE[view.sources[s.key]!]}</p>}
              </div>
            ))}
            <div>
              <Label htmlFor="cs-tech">Technologies, separated by commas</Label>
              <Input id="cs-tech" value={tech} onChange={(e) => setTech(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cs-github">GitHub repository</Label>
                <Input id="cs-github" value={repoUrl || "Add it from the project page"} readOnly />
              </div>
              <div>
                <Label htmlFor="cs-live">Live demo link</Label>
                <Input id="cs-live" value={live} onChange={(e) => setLive(e.target.value)} placeholder="https://" />
              </div>
            </div>
            <div>
              <Label htmlFor="cs-shots">Screenshot links, one per line, up to 6</Label>
              <Textarea id="cs-shots" rows={3} value={shots} onChange={(e) => setShots(e.target.value)} placeholder="https://" className="font-mono text-xs" />
              <p className="mt-1 text-[11px] text-ink-500">Link to images you host yourself, for example in your repository. We do not host images.</p>
            </div>
          </>
        )}

        {msg && <Alert variant={msg.tone === "ok" ? "info" : undefined}>{msg.text}</Alert>}
        {!empty && (
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={save} loading={busy === "save"} className="gap-1.5">
              <Save className="h-3.5 w-3.5" /> Save case study
            </Button>
            <button type="button" onClick={() => generate(true)} className="focus-ring rounded text-xs text-ink-500 hover:text-ink-300">
              Start over from the project
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
