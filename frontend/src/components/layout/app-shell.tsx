"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Flame, MailWarning, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api, ApiError } from "@/lib/api";
import { GlobalNav } from "@/components/layout/global-nav";
import { Footer } from "@/components/layout/footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Signed-out visitors who follow a link into the app are sent to sign in
  // and brought back to the page they asked for, not dropped on a dashboard.
  useEffect(() => {
    if (!loading && !user) {
      const next = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
    }
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-950">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  // Signed-in pages use the same global navigation as the public site (the
  // sidebar and bottom tab bar it replaced only existed here, so moving
  // between the app and the rest of CareerFound meant two different
  // menus). Account, Dashboard and Settings live in its Account menu.
  return (
    <div className="min-h-screen bg-base-950">
      <GlobalNav />
      <main className="container-page py-6 sm:py-8">
        {!user.email_verified && <VerificationNotice />}
        {children}
      </main>
      <Footer />
    </div>
  );
}

/**
 * A slim, dismissible notice rather than a page-dominating banner (see
 * section 17 of the redesign brief): one line, a real action that actually
 * calls the resend endpoint in place (the same POST /auth/resend-verification
 * the settings page uses), inline feedback, and a close control. Dismissing
 * it only affects this render — email_verified flipping true is what
 * actually makes it go away for good.
 */
function VerificationNotice() {
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (dismissed) return null;

  async function resend() {
    setSending(true);
    setMessage(null);
    try {
      const res = await api.post<{ message: string }>("/auth/resend-verification");
      setMessage(res.message);
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Couldn't resend the verification email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mb-6 flex animate-fade-in items-center gap-3 rounded-lg border border-warning/25 bg-warning/[0.06] px-3.5 py-2 text-xs text-ink-300">
      <MailWarning className="h-3.5 w-3.5 flex-shrink-0 text-warning" />
      <span className="flex-1">
        <span className="font-medium text-ink-100">Email not verified.</span>{" "}
        {message ?? "Verify to secure your account and unlock every feature."}
      </span>
      {!message && (
        <button
          onClick={resend}
          disabled={sending}
          className="focus-ring flex-shrink-0 rounded-md border border-warning/30 px-2.5 py-1 font-medium text-warning transition-colors hover:bg-warning/10 disabled:opacity-50"
        >
          {sending ? "Sending…" : "Resend verification"}
        </button>
      )}
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="focus-ring flex-shrink-0 rounded-md p-0.5 text-ink-500 hover:bg-[rgb(var(--fg-tint)/0.08)] hover:text-ink-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function StreakBadge({ days }: { days: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
      <Flame className="h-3.5 w-3.5" />
      {days} day{days === 1 ? "" : "s"} streak
    </div>
  );
}
