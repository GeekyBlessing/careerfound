"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Star, Briefcase, Globe, Video, Clock, Users, MessageCircle, Calendar, Sparkles, Compass } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { SkeletonCard } from "@/components/ui/skeleton";
import { MentorAvatar } from "@/components/mentors/mentor-avatar";
import { MentorBadge } from "@/components/mentors/mentor-badge";
import { BookingFlow } from "@/components/mentors/booking-flow";
import { api, ApiError } from "@/lib/api";
import { formatCents } from "@/lib/utils";
import type { Mentor, MentorSession } from "@/types";

interface ReviewOut {
  id: string;
  rating: number;
  comment: string;
  is_demo: boolean;
  created_at: string;
}

export default function MentorProfilePage() {
  const params = useParams<{ id: string }>();
  const mentorId = params.id;

  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [reviews, setReviews] = useState<ReviewOut[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"session" | "question" | null>(null);
  const [confirmedSession, setConfirmedSession] = useState<MentorSession | null>(null);
  const [bookingContext, setBookingContext] = useState<{ message: string; durationMinutes?: number } | null>(null);

  function openSessionBooking(context?: { message: string; durationMinutes?: number }) {
    setBookingContext(context ?? null);
    setMode("session");
  }

  useEffect(() => {
    if (!mentorId) return;
    setMentor(null);
    setError(null);
    Promise.all([api.get<Mentor>(`/mentors/${mentorId}`), api.get<ReviewOut[]>(`/mentors/${mentorId}/reviews`)])
      .then(([m, r]) => {
        setMentor(m);
        setReviews(r);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this mentor's profile."));
  }, [mentorId]);

  return (
    <AppShell>
      {error && <Alert className="mb-4">{error}</Alert>}

      {!mentor && !error && (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {mentor && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <MentorAvatar displayName={mentor.display_name} avatarUrl={mentor.avatar_url} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-semibold text-ink-100">{mentor.display_name}</h1>
                    <MentorBadge mentor={mentor} />
                  </div>
                  <p className="mt-1 text-sm text-ink-300">{mentor.headline}</p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-ink-500">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    {mentor.rating_count > 0 ? (
                      <span>
                        {mentor.rating_avg.toFixed(1)} ({mentor.rating_count} review{mentor.rating_count === 1 ? "" : "s"})
                      </span>
                    ) : (
                      <span>No ratings yet</span>
                    )}
                    <span className="mx-1">·</span>
                    <Users className="h-3.5 w-3.5" />
                    <span>{mentor.mentee_count} mentee{mentor.mentee_count === 1 ? "" : "s"}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {mentor.paths.map((p) => (
                      <Badge key={p} tone="accent" className="capitalize">
                        {p.replace(/-/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-ink-400">{mentor.bio}</p>

              <div className="mt-6 grid gap-3 text-xs text-ink-400 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5 text-ink-500" />
                  {mentor.years_experience ? `${mentor.years_experience} years of experience` : "Experience: not yet listed"}
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-ink-500" />
                  {mentor.languages.join(", ")}
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-3.5 w-3.5 text-ink-500" />
                  {mentor.mentorship_formats.map((f) => f.replace(/_/g, " ")).join(", ")}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-ink-500" />
                  {mentor.session_durations_minutes.join(" / ")} min sessions
                </div>
              </div>

              <p className="mt-5 rounded-xl bg-[rgb(var(--fg-tint)/0.03)] px-4 py-3 text-xs text-ink-500">{mentor.availability_note}</p>
            </Card>

            <Card className="p-6">
              <p className="mb-4 text-sm font-semibold text-ink-100">Reviews</p>
              {reviews.length === 0 && <p className="text-xs text-ink-500">No reviews yet.</p>}
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-xl border border-[rgb(var(--fg-tint)/0.06)] bg-[rgb(var(--fg-tint)/0.02)] p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-warning">
                        <Star className="h-3 w-3 fill-warning" /> {r.rating}/5
                      </div>
                      {r.is_demo && (
                        <Badge tone="neutral" title="Seeded for development/testing, not a real review.">
                          DEMO REVIEW
                        </Badge>
                      )}
                    </div>
                    {r.comment && <p className="mt-2 text-xs leading-relaxed text-ink-400">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
            {mentor.is_founding_mentor && (mentor.mentorship_price_label || mentor.consultation_price_label) ? (
              <>
                {mentor.mentorship_price_label && (
                  <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-transparent p-5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent-light">
                      <Sparkles className="h-3.5 w-3.5" /> One-on-one mentorship
                    </div>
                    <p className="mt-2 text-xl font-semibold text-ink-100">{mentor.mentorship_price_label}</p>
                    <p className="text-xs text-ink-500">{mentor.mentorship_duration_label}, long-term mentorship</p>
                    <p className="mt-3 text-xs leading-relaxed text-ink-400">
                      A premium, structured mentorship program: consistent guidance over {mentor.mentorship_duration_label.toLowerCase()} to help you go from confused beginner to job-ready with a clear plan.
                    </p>
                    <Button
                      className="mt-4 w-full gap-1.5"
                      onClick={() =>
                        openSessionBooking({
                          message: `I'd like to book the One-on-One Mentorship (${mentor.mentorship_duration_label}, ${mentor.mentorship_price_label}). `,
                          durationMinutes: mentor.session_durations_minutes[mentor.session_durations_minutes.length - 1],
                        })
                      }
                    >
                      <Calendar className="h-3.5 w-3.5" /> Book mentorship
                    </Button>
                  </Card>
                )}

                {mentor.consultation_price_label && (
                  <Card className="p-5">
                    <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-500">
                      <Compass className="h-3.5 w-3.5" /> Personal career consultation
                    </div>
                    <p className="mt-2 text-lg font-semibold text-ink-100">{mentor.consultation_price_label}</p>
                    <p className="text-xs text-ink-500">{mentor.consultation_duration_label}, one-time consultation</p>
                    <p className="mt-3 text-xs leading-relaxed text-ink-400">
                      A focused, one-on-one consultation with {mentor.display_name.split(" ")[0]} to get personal career advice, no long-term commitment required.
                    </p>
                    <Button
                      variant="secondary"
                      className="mt-4 w-full gap-1.5"
                      onClick={() =>
                        openSessionBooking({
                          message: `I'd like to book the Personal Career Consultation (${mentor.consultation_duration_label}, ${mentor.consultation_price_label}). `,
                          durationMinutes: mentor.session_durations_minutes[0],
                        })
                      }
                    >
                      <Calendar className="h-3.5 w-3.5" /> Book consultation
                    </Button>
                  </Card>
                )}

                <Button variant="ghost" className="w-full gap-1.5" onClick={() => openSessionBooking()}>
                  <MessageCircle className="h-3.5 w-3.5" /> Ask a question first
                </Button>
              </>
            ) : (
              <Card className="p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Session price</p>
                <p className="mt-1 text-lg font-semibold text-ink-100">
                  {mentor.hourly_rate_cents > 0 ? `${formatCents(mentor.hourly_rate_cents, mentor.currency)}/hr` : "Free"}
                </p>
                <div className="mt-4 space-y-2">
                  <Button className="w-full gap-1.5" onClick={() => openSessionBooking()}>
                    <Calendar className="h-3.5 w-3.5" /> Book a Session
                  </Button>
                  <Button variant="secondary" className="w-full gap-1.5" onClick={() => setMode("question")}>
                    <MessageCircle className="h-3.5 w-3.5" /> Ask a Question
                  </Button>
                </div>
              </Card>
            )}

            {mode && !confirmedSession && (
              <BookingFlow
                mentor={mentor}
                mode={mode}
                initialMessage={bookingContext?.message}
                initialDurationMinutes={bookingContext?.durationMinutes}
                onClose={() => {
                  setMode(null);
                  setBookingContext(null);
                }}
                onBooked={(session) => {
                  setConfirmedSession(session);
                  setMode(null);
                  setBookingContext(null);
                }}
              />
            )}

            {confirmedSession && (
              <Card className="p-5">
                <p className="text-sm font-semibold text-ink-100">
                  {confirmedSession.duration_minutes === 0 ? "Question sent" : "Session requested"}
                </p>
                <p className="mt-1 text-xs text-ink-500">Here&apos;s what we&apos;ll share with your mentor:</p>
                <p className="mt-3 rounded-xl bg-[rgb(var(--fg-tint)/0.03)] px-4 py-3 text-xs leading-relaxed text-ink-400">
                  {confirmedSession.mentee_summary}
                </p>
                <Button variant="ghost" size="sm" className="mt-3" onClick={() => setConfirmedSession(null)}>
                  Done
                </Button>
              </Card>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
