"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { api, ApiError } from "@/lib/api";
import type { Certification, MyProfile } from "@/types/career";

/**
 * Settings for the public portfolio at /u/<username>: private until switched
 * on, with each section opt-in, plus the self-reported certifications that
 * appear on it and a plain text CV export.
 */
export function ProfilePanel() {
  const [p, setP] = useState<MyProfile | null>(null);
  const [form, setForm] = useState({ username: "", headline: "", bio: "", location: "", github_url: "", linkedin_url: "", website_url: "" });
  const [flags, setFlags] = useState({ is_public: false, show_readiness: true, show_skills: true, show_certifications: true });
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const apply = useCallback((v: MyProfile) => {
    setP(v);
    setForm({
      username: v.username ?? v.suggested_username ?? "",
      headline: v.headline ?? "",
      bio: v.bio ?? "",
      location: v.location ?? "",
      github_url: v.github_url ?? "",
      linkedin_url: v.linkedin_url ?? "",
      website_url: v.website_url ?? "",
    });
    setFlags({ is_public: !!v.is_public, show_readiness: v.show_readiness ?? true, show_skills: v.show_skills ?? true, show_certifications: v.show_certifications ?? true });
  }, []);

  useEffect(() => {
    api
      .get<MyProfile>("/career/profile")
      .then((v) => {
        apply(v);
        setOpen(!v.exists);
      })
      .catch(() => setP(null));
  }, [apply]);

  async function save(e?: FormEvent, override?: Partial<typeof flags>) {
    e?.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const v = await api.put<MyProfile>("/career/profile", { ...form, ...flags, ...override });
      apply({ ...v, published_projects: p?.published_projects ?? 0 });
      setMsg({ tone: "ok", text: "Saved." });
    } catch (err) {
      setMsg({ tone: "err", text: err instanceof ApiError ? err.message : "Could not save your profile." });
    } finally {
      setBusy(false);
    }
  }

  if (!p) return null;
  const live = p.exists && p.is_public;
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <Card className="mb-6">
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Public portfolio</p>
            <p className="mt-1 text-sm text-ink-300">
              {live ? (
                <>
                  Live at{" "}
                  <Link href={p.path!} className="font-medium text-accent-light hover:underline">
                    /u/{p.username}
                  </Link>
                  . {p.published_projects} published project{p.published_projects === 1 ? "" : "s"} shown.
                </>
              ) : p.exists ? (
                "Private. Only you can see it until you switch it on."
              ) : (
                "Not set up yet. Choose a username to preview your page. It stays private until you switch it on."
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {p.exists && (
              <label className="flex items-center gap-2 text-sm text-ink-300">
                <Switch checked={flags.is_public} label="Make my portfolio public" onChange={(v) => { setFlags({ ...flags, is_public: v }); void save(undefined, { is_public: v }); }} />
                {flags.is_public ? "Public" : "Private"}
              </label>
            )}
            <Button variant="secondary" size="sm" onClick={() => setOpen(!open)}>
              {open ? "Close" : "Edit"}
            </Button>
          </div>
        </div>

        {open && (
          <form onSubmit={(e) => save(e)} className="space-y-4 border-t border-[rgb(var(--fg-tint)/0.1)] pt-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="pp-username">Username</Label>
                <Input id="pp-username" value={form.username} onChange={set("username")} maxLength={30} />
                <p className="mt-1 text-[11px] text-ink-500">Your page will be at /u/{form.username || "username"}</p>
              </div>
              <div>
                <Label htmlFor="pp-location">Location</Label>
                <Input id="pp-location" value={form.location} onChange={set("location")} maxLength={80} placeholder="Optional" />
              </div>
            </div>
            <div>
              <Label htmlFor="pp-headline">Headline</Label>
              <Input id="pp-headline" value={form.headline} onChange={set("headline")} maxLength={140} placeholder="For example, Aspiring SOC analyst building detection projects" />
            </div>
            <div>
              <Label htmlFor="pp-bio">About you</Label>
              <Textarea id="pp-bio" rows={4} value={form.bio} onChange={set("bio")} maxLength={1200} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="pp-gh">GitHub</Label>
                <Input id="pp-gh" value={form.github_url} onChange={set("github_url")} placeholder="https://github.com/you" />
              </div>
              <div>
                <Label htmlFor="pp-li">LinkedIn</Label>
                <Input id="pp-li" value={form.linkedin_url} onChange={set("linkedin_url")} placeholder="https://linkedin.com/in/you" />
              </div>
              <div>
                <Label htmlFor="pp-web">Website</Label>
                <Input id="pp-web" value={form.website_url} onChange={set("website_url")} placeholder="https://" />
              </div>
            </div>
            <fieldset className="space-y-2.5">
              <legend className="text-sm font-medium text-ink-100">Show on my page</legend>
              {(
                [
                  ["show_readiness", "Career readiness score, only once it has real activity behind it"],
                  ["show_skills", "Skills, split into those shown by finished work and those you listed yourself"],
                  ["show_certifications", "Certifications, marked self-reported"],
                ] as const
              ).map(([k, label]) => (
                <label key={k} className="flex items-center gap-3 text-sm text-ink-300">
                  <Switch checked={flags[k]} onChange={(v) => setFlags({ ...flags, [k]: v })} label={label} />
                  {label}
                </label>
              ))}
            </fieldset>
            {msg && <Alert variant={msg.tone === "ok" ? "info" : undefined}>{msg.text}</Alert>}
            <Button type="submit" loading={busy}>
              Save profile
            </Button>
          </form>
        )}

        {p.exists && open && <Certifications />}
        <CvExport />
        {p.exists && (
          <p className="text-xs leading-relaxed text-ink-500">
            Your email and account details are never shown. Projects appear only when published. Preview your page any time at{" "}
            <Link href={p.path!} className="inline-flex items-center gap-1 text-accent-light hover:underline">
              /u/{p.username} <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </Link>
            , it shows a not found page to everyone else while it is private.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Certifications() {
  const [list, setList] = useState<Certification[]>([]);
  const [f, setF] = useState({ name: "", issuer: "", status: "earned", year: "", credential_url: "" });
  const [err, setErr] = useState<string | null>(null);
  const load = useCallback(() => {
    api.get<Certification[]>("/career/certifications").then(setList).catch(() => setList([]));
  }, []);
  useEffect(load, [load]);

  async function add(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await api.post("/career/certifications", { ...f, year: f.year ? Number(f.year) : null });
      setF({ name: "", issuer: "", status: "earned", year: "", credential_url: "" });
      load();
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Could not add that certification.");
    }
  }

  return (
    <div className="border-t border-[rgb(var(--fg-tint)/0.1)] pt-5">
      <p className="text-sm font-medium text-ink-100">Certifications</p>
      <p className="mt-1 text-xs text-ink-500">Shown as self-reported. They do not change your readiness score.</p>
      <ul className="mt-3 space-y-1.5 text-sm text-ink-200">
        {list.map((c) => (
          <li key={c.id} className="flex items-center gap-2">
            <span>
              {c.name}
              {c.issuer ? `, ${c.issuer}` : ""}
              {c.status === "in_progress" ? " (in progress)" : c.year ? `, ${c.year}` : ""}
            </span>
            <button type="button" aria-label={`Remove ${c.name}`} onClick={() => api.del(`/career/certifications/${c.id}`).then(load)} className="focus-ring rounded p-1 text-ink-500 hover:text-danger">
              <X className="h-3 w-3" />
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="mt-3 grid gap-2 sm:grid-cols-[1.4fr_1fr_8rem_6rem_auto]">
        <Input aria-label="Certification name" placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <Input aria-label="Issuer" placeholder="Issuer" value={f.issuer} onChange={(e) => setF({ ...f, issuer: e.target.value })} />
        <select aria-label="Status" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} className="focus-ring rounded-xl border border-[rgb(var(--fg-tint)/0.16)] bg-transparent px-2 text-sm text-ink-100">
          <option value="earned">Earned</option>
          <option value="in_progress">In progress</option>
        </select>
        <Input aria-label="Year" placeholder="Year" inputMode="numeric" value={f.year} onChange={(e) => setF({ ...f, year: e.target.value })} />
        <Button type="submit" size="sm" disabled={f.name.trim().length < 2} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </form>
      {err && <p className="mt-2 text-sm text-danger">{err}</p>}
    </div>
  );
}

function CvExport() {
  const [md, setMd] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  async function build() {
    const r = await api.get<{ markdown: string }>("/career/cv");
    setMd(r.markdown);
  }
  async function copy() {
    if (!md) return;
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* the text stays selectable below */
    }
  }
  return (
    <div className="border-t border-[rgb(var(--fg-tint)/0.1)] pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-100">CV projects section</p>
          <p className="mt-1 text-xs text-ink-500">Your published projects as plain text. The verified marker appears only on projects a reviewer approved.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={build}>
          {md ? "Refresh" : "Build my CV section"}
        </Button>
      </div>
      {md && (
        <div className="mt-3">
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-[rgb(var(--fg-tint)/0.12)] p-4 text-xs leading-relaxed text-ink-300">{md}</pre>
          <button type="button" onClick={copy} className="focus-ring mt-2 inline-flex items-center gap-1.5 rounded text-xs text-ink-400 hover:text-ink-100">
            {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />} {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}
