"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";
import { HELP_TOPIC_OPTIONS } from "@/types";
import type { HelpTopic, Mentor, MentorSession } from "@/types";

function defaultScheduledAtLocal(): string {
  const d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

/**
 * The "Book a Session" / "Ask a Question" intake: what do you need help
 * with, and a free-text description. The backend turns this into a
 * deterministic mentee_summary the mentor sees before the session — this
 * component just collects the raw inputs and shows that summary back once
 * booked, for transparency about what gets shared.
 */
export function BookingFlow({
  mentor,
  mode,
  onClose,
  onBooked,
}: {
  mentor: Mentor;
  mode: "session" | "question";
  onClose: () => void;
  onBooked: (session: MentorSession) => void;
}) {
  const [helpTopic, setHelpTopic] = useState<HelpTopic>(HELP_TOPIC_OPTIONS[0]?.value ?? "other");
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState(mentor.session_durations_minutes[0] ?? 30);
  const [scheduledAt, setScheduledAt] = useState(defaultScheduledAtLocal());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      if (mode === "question") {
        const session = await api.post<MentorSession>(`/mentors/${mentor.id}/questions`, { message });
        onBooked(session);
        return;
      }
      const session = await api.post<MentorSession>(`/mentors/${mentor.id}/sessions`, {
        scheduled_at: new Date(scheduledAt).toISOString(),
        duration_minutes: duration,
        help_topic: helpTopic,
        message,
      });
      onBooked(session);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't complete that request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-ink-100">
        {mode === "question" ? "Ask a question" : "What do you need help with?"}
      </p>

      {mode === "session" && (
        <div className="mt-3 space-y-1.5">
          {HELP_TOPIC_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs text-ink-300 hover:bg-white/[0.04]"
            >
              <input
                type="radio"
                name="help_topic"
                value={opt.value}
                checked={helpTopic === opt.value}
                onChange={() => setHelpTopic(opt.value)}
                className="accent-accent"
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs font-medium text-ink-300">
        {mode === "question" ? "Your question" : "Tell your mentor a bit more"}
      </p>
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder={
          mode === "question"
            ? "What would you like to ask?"
            : "e.g. I keep bouncing between tutorials and don't know what order to learn things in."
        }
        className="mt-1.5 text-xs"
      />

      {mode === "session" && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium text-ink-300">Duration</p>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-base-950/60 px-3 py-2 text-xs text-ink-100 focus-ring"
            >
              {mentor.session_durations_minutes.map((d) => (
                <option key={d} value={d}>
                  {d} min
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs font-medium text-ink-300">When</p>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-base-950/60 px-3 py-2 text-xs text-ink-100 focus-ring"
            />
          </div>
        </div>
      )}

      {error && <Alert className="mt-3">{error}</Alert>}

      <div className="mt-4 flex gap-2">
        <Button size="sm" className="flex-1" onClick={submit} loading={submitting} disabled={!message.trim()}>
          {mode === "question" ? "Send question" : "Request session"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}
