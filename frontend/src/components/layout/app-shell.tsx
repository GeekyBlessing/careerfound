"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Flame, MailWarning, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { maskEmail } from "@/lib/verification";
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
 * section 17 of the redesign brief). It does not try to send anything
 * itself: it names the address (masked) and leads to the verification page,
 * which has the resend control, the cooldown, honest failure messages and
 * the way to fix a mistyped address. Dismissing it only affects this render;
 * email_verified flipping true is what makes it go away for good.
 */
function VerificationNotice() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !user) return null;

  return (
    <div className="mb-6 flex animate-fade-in items-center gap-3 rounded-lg border border-warning/25 bg-warning/[0.06] px-3.5 py-2 text-xs text-ink-300">
      <MailWarning className="h-3.5 w-3.5 flex-shrink-0 text-warning" />
      <span className="flex-1">
        <span className="font-medium text-ink-100">Email not verified.</span>{" "}
        Confirm {maskEmail(user.email)} to secure your account.
      </span>
      <Link
        href="/verify-pending"
        className="focus-ring flex-shrink-0 rounded-md border border-warning/30 px-2.5 py-1 font-medium text-warning transition-colors hover:bg-warning/10"
      >
        Verify email
      </Link>
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
