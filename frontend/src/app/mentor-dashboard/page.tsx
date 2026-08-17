"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  DollarSign,
  GraduationCap,
  Lock,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Input, Textarea, Label } from "@/components/ui/input";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/lib/auth";
import { api, ApiError } from "@/lib/api";
import { formatCents } from "@/lib/utils";
import type {
  Mentor,
  MentorEarningsSummary,
  MentorNote,
  MentorSessionDetail,
  RecommendationItem,
} from "@/types";

export default function MentorDashboardPage() {
  const { user, refreshUser } = useAuth();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [summary, setSummary] = useState<MentorEarningsSummary | null>(null);
  const [sessions, setSessions] = useState<MentorSessionDetail[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [tab, setTab] = useState<"sessions" | "profile">("sessions");

  async function load() {
    setError(null);
    try {
      const [m, s, sess] = await Promise.all([
        api.get<Mentor>("/mentors/me/profile"),
        api.get<MentorEarningsSummary>("/mentors/me/summary"),
        api.get<MentorSessionDetail[]>("/mentors/me/sessions"),
      ]);
      setMentor(m);
      setSummary(s);
      setSessions(sess);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load your mentor dashboard.");
    }
  }

  useEffect(() => {
    if (user?.role === "mentor") load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  async function claim() {
    setClaiming(true);
    setClaimError(null);
    try {
      await api.post("/mentors/claim", {});
      await refreshUser();
    } catch (err) {
      setClaimError(
        err instanceof ApiError
          ? err.message
          : "Couldn't claim a mentor profile for this account."
      );
    } finally {
      setClaiming(false);
    }
  }

  if (!user) return null;

  if (user.role !== "mentor") {
    return (
      <AppShell>
        <EmptyState
          icon={Lock}
          title="No mentor profile linked to this account"
          description="If your mentor profile (or an approved mentor application) uses this account's email, you can claim it below. Otherwise, apply to become a mentor first."
          action={
            <div className="flex flex-col items-center gap-3">
              <Button onClick={claim} loading={claiming}>
                Claim my mentor profile
              </Button>
              {claimError && <Alert>{claimError}</Alert>}
            </div>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-light">Mentor Dashboard</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink-100">{mentor ? mentor.display_name : "Loading..."}</h1>
      </div>

      {error && <Alert className="mb-4">{error}</Alert>}

      {!mentor && !error && (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {mentor && summary && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard icon={Users} label="Total sessions" value={String(summary.total_sessions)} />
            <StatCard icon={Clock} label="Pending requests" value={String(summary.pending_requests)} />
            <StatCard icon={CheckCircle2} label="Completed" value={String(summary.completed_sessions)} />
            <StatCard icon={DollarSign} label="Earned" value={formatCents(summary.total_earned_cents, summary.currency)} />
          </div>
          <p className="text-xs text-ink-500">{summary.note}</p>

          <div className="flex gap-2 border-b border-white/[0.06]">
            <TabButton active={tab === "sessions"} onClick={() => setTab("sessions")}>
              Sessions
            </TabButton>
            <TabButton active={tab === "profile"} onClick={() => setTab("profile")}>
              Profile &amp; availability
            </TabButton>
          </div>

          {tab === "sessions" && (
            <div className="space-y-3">
              {sessions && sessions.length === 0 && (
                <EmptyState icon={Calendar} title="No sessions yet" description="Booked sessions and questions will show up here." />
              )}
              {sessions?.map((session) => (
                <SessionCard key={session.id} session={session} onChanged={load} />
              ))}
            </div>
          )}

          {tab === "profile" && <ProfileEditor mentor={mentor} onSaved={setMentor} />}
        </div>
      )}
    </AppShell>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-ink-300">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink-100">{value}</p>
    </Card>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
        active ? "border-accent text-accent-light" : "border-transparent text-ink-500 hover:text-ink-300"
      }`}
    >
      {children}
    </button>
  );
}

const STATUS_TONE: Record<string, "warning" | "accent" | "success" | "danger"> = {
  requested: "warning",
  confirmed: "accent",
  completed: "success",
  cancelled: "danger",
};

function SessionCard({ session, onChanged }: { session: MentorSessionDetail; onChanged: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const isQuestion = session.duration_minutes === 0;

  async function setStatus(status: string) {
    setUpdating(true);
    setActionError(null);
    try {
      await api.patch(`/mentors/me/sessions/${session.id}/status`, { status });
      onChanged();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't update this session.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Card>
      <button onClick={() => setExpanded((e) => !e)} className="flex w-full items-center justify-between gap-4 p-5 text-left focus-ring rounded-2xl">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-ink-100">{session.mentee_name}</p>
            <Badge tone={STATUS_TONE[session.status] || "accent"}>{session.status}</Badge>
            {isQuestion && <Badge>Question</Badge>}
          </div>
          <p className="mt-1 truncate text-xs text-ink-500">
            {isQuestion ? "Async question" : new Date(session.scheduled_at).toLocaleString()}
            {!isQuestion && ` · ${session.duration_minutes} min`}
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-ink-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <CardContent className="space-y-4 border-t border-white/[0.06] pt-4">
          <div>
            <p className="mb-1.5 text-xs font-medium text-ink-300">Mentee summary (auto-generated)</p>
            <p className="rounded-xl bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-ink-400">
              {session.mentee_summary || "No summary available."}
            </p>
          </div>

          {actionError && <Alert>{actionError}</Alert>}

          {!isQuestion && (
            <div className="flex flex-wrap gap-2">
              {session.status === "requested" && (
                <Button size="sm" onClick={() => setStatus("confirmed")} loading={updating}>
                  Confirm
                </Button>
              )}
              {(session.status === "requested" || session.status === "confirmed") && (
                <Button size="sm" variant="secondary" onClick={() => setStatus("completed")} loading={updating}>
                  Mark completed
                </Button>
              )}
              {session.status !== "cancelled" && session.status !== "completed" && (
                <Button size="sm" variant="ghost" onClick={() => setStatus("cancelled")} loading={updating}>
                  Cancel
                </Button>
              )}
            </div>
          )}

          <PrivateNotesEditor sessionId={session.id} />
          <RecommendationsComposer sessionId={session.id} />
        </CardContent>
      )}
    </Card>
  );
}

function PrivateNotesEditor({ sessionId }: { sessionId: string }) {
  const [note, setNote] = useState<MentorNote>({
    what_to_work_on: "",
    recommended_resources: [],
    recommended_projects: [],
    next_steps: "",
    follow_up_date: null,
  });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get<MentorNote>(`/mentors/me/sessions/${sessionId}/notes`)
      .then(setNote)
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [sessionId]);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await api.post(`/mentors/me/sessions/${sessionId}/notes`, note);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return null;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-ink-300">
        <Lock className="h-3 w-3" /> Private notes — only you can see this
      </div>
      <Textarea
        value={note.what_to_work_on}
        onChange={(e) => setNote({ ...note, what_to_work_on: e.target.value })}
        placeholder="What does this mentee need to work on?"
        rows={2}
        className="text-xs"
      />
      <Textarea
        value={note.next_steps}
        onChange={(e) => setNote({ ...note, next_steps: e.target.value })}
        placeholder="Next steps / follow-up plan"
        rows={2}
        className="mt-2 text-xs"
      />
      <div className="mt-2 flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={save} loading={saving}>
          Save note
        </Button>
        {saved && <span className="text-xs text-success">Saved</span>}
      </div>
    </div>
  );
}

function RecommendationsComposer({ sessionId }: { sessionId: string }) {
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [itemType, setItemType] = useState<RecommendationItem["item_type"]>("skill");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function addItem() {
    if (!title.trim()) return;
    setItems((prev) => [...prev, { title, description, item_type: itemType }]);
    setTitle("");
    setDescription("");
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function submit() {
    if (items.length === 0) return;
    setSending(true);
    try {
      await api.post(`/mentors/me/sessions/${sessionId}/recommendations`, { items });
      setSent(true);
      setItems([]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-xl border border-accent/20 bg-accent/[0.04] p-4">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-ink-300">
        <GraduationCap className="h-3 w-3" /> Recommendations — visible to the mentee, can be added to their roadmap
      </div>

      {items.length > 0 && (
        <div className="mb-3 space-y-1.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs">
              <span className="text-ink-200">
                {item.title} <span className="text-ink-500">({item.item_type})</span>
              </span>
              <button onClick={() => removeItem(i)} className="text-ink-500 hover:text-danger">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Learn Linux fundamentals" className="text-xs" />
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" className="text-xs" />
        <select
          value={itemType}
          onChange={(e) => setItemType(e.target.value as RecommendationItem["item_type"])}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs text-ink-100 focus-ring"
        >
          <option value="skill">Skill</option>
          <option value="project">Project</option>
          <option value="follow_up">Follow-up</option>
        </select>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={addItem} className="gap-1">
          <Plus className="h-3 w-3" /> Add item
        </Button>
        <Button size="sm" onClick={submit} disabled={items.length === 0} loading={sending}>
          Send to mentee
        </Button>
        {sent && <span className="text-xs text-success">Sent</span>}
      </div>
    </div>
  );
}

function ProfileEditor({ mentor, onSaved }: { mentor: Mentor; onSaved: (m: Mentor) => void }) {
  const [headline, setHeadline] = useState(mentor.headline);
  const [bio, setBio] = useState(mentor.bio);
  const [valueProposition, setValueProposition] = useState(mentor.value_proposition);
  const [yearsExperience, setYearsExperience] = useState(mentor.years_experience?.toString() || "");
  const [availabilityNote, setAvailabilityNote] = useState(mentor.availability_note);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const updated = await api.patch<Mentor>("/mentors/me/profile", {
        headline,
        bio,
        value_proposition: valueProposition,
        years_experience: yearsExperience ? Number(yearsExperience) : null,
        availability_note: availabilityNote,
      });
      onSaved(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="max-w-2xl p-6">
      <div className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <div>
          <Label>Headline</Label>
          <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
        </div>
        <div>
          <Label>Bio</Label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
        </div>
        <div>
          <Label>Value proposition (used in mentor recommendations)</Label>
          <Textarea value={valueProposition} onChange={(e) => setValueProposition(e.target.value)} rows={2} />
        </div>
        <div>
          <Label>Years of experience</Label>
          <Input
            type="number"
            min={0}
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
            className="max-w-[160px]"
            placeholder="Not yet listed"
          />
        </div>
        <div>
          <Label>Availability note</Label>
          <Textarea value={availabilityNote} onChange={(e) => setAvailabilityNote(e.target.value)} rows={2} />
          <p className="mt-1 text-xs text-ink-500">
            Free text — there&apos;s no live calendar/scheduling system yet, so this is what mentees see.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={save} loading={saving}>
            Save profile
          </Button>
          {saved && <span className="text-xs text-success">Saved</span>}
        </div>
      </div>
    </Card>
  );
}
