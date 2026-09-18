"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  LayoutDashboard,
  Map,
  MessageCircle,
  FolderGit2,
  Briefcase,
  Compass,
  Users,
  UserCircle,
  LogOut,
  Flame,
  GraduationCap,
  MailWarning,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { initials } from "@/lib/utils";
import { api, ApiError } from "@/lib/api";
import { ThemeToggleButton } from "@/components/ui/theme-toggle";
import { BrandTile } from "@/components/brand/logo";

// The primary set the brief calls for: always the same six destinations,
// in the same order, on desktop and in spirit on mobile (the bottom bar
// below drops "Home" since the header's own home control already covers
// it on a small screen, and folds the rest to fit five touch targets).
const PRIMARY_NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/roadmap", label: "Career Roadmap", icon: Map },
  { href: "/mentors", label: "Mentors", icon: Briefcase },
  { href: "/careers", label: "Explore", icon: Compass },
  { href: "/settings", label: "Profile", icon: UserCircle },
] as const;

// Everything else real and reachable, one tier down: still one click away
// on desktop, reached contextually from within dashboard content on
// mobile (Today's Mission links to a project, the AI Mentor card links to
// /mentor, etc) rather than crowding the bottom bar.
const WORKSPACE_NAV = [
  { href: "/mentor", label: "AI Mentor", icon: MessageCircle },
  { href: "/projects", label: "Projects", icon: FolderGit2 },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/community", label: "Community", icon: Users },
] as const;

// The five destinations that earn a permanent thumb-reach slot on a phone.
// "Home" is deliberately left out here — the header's explicit home control
// (see MobileTopBar) already covers it without spending one of five slots.
const MOBILE_TAB_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/careers", label: "Explore", icon: Compass },
  { href: "/mentors", label: "Mentors", icon: Briefcase },
  { href: "/settings", label: "Profile", icon: UserCircle },
] as const;

function isActive(pathname: string | null, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname?.startsWith(href) ?? false;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-950">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[rgb(var(--fg-tint)/0.06)] bg-base-900/60 lg:flex">
        <Link
          href="/"
          className="focus-ring flex h-16 items-center gap-2 px-6 font-display font-semibold text-ink-100"
          aria-label="CareerFound home"
        >
          <BrandTile className="h-7 w-7" />
          CareerFound
        </Link>
        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Primary">
          {PRIMARY_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ease-smooth",
                  active ? "bg-accent/15 text-accent-light shadow-xs" : "text-ink-300 hover:bg-[rgb(var(--fg-tint)/0.05)] hover:text-ink-100"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          <p className="px-3 pt-5 pb-1 font-mono text-[10px] uppercase tracking-wide text-ink-500">Workspace</p>
          {WORKSPACE_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ease-smooth",
                  active ? "bg-accent/15 text-accent-light shadow-xs" : "text-ink-300 hover:bg-[rgb(var(--fg-tint)/0.05)] hover:text-ink-100"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          {user.role === "mentor" && (
            <Link
              href="/mentor-dashboard"
              className={cn(
                "focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ease-smooth",
                pathname?.startsWith("/mentor-dashboard") ? "bg-accent/15 text-accent-light shadow-xs" : "text-ink-300 hover:bg-[rgb(var(--fg-tint)/0.05)] hover:text-ink-100"
              )}
            >
              <GraduationCap className="h-4 w-4" />
              Mentor Dashboard
            </Link>
          )}
          {user.role === "admin" && (
            <Link
              href="/admin"
              className={cn(
                "focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ease-smooth",
                pathname?.startsWith("/admin") ? "bg-accent/15 text-accent-light shadow-xs" : "text-ink-300 hover:bg-[rgb(var(--fg-tint)/0.05)] hover:text-ink-100"
              )}
            >
              <GraduationCap className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>
        <div className="border-t border-[rgb(var(--fg-tint)/0.06)] p-4">
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="focus-ring flex min-w-0 flex-1 items-center gap-3 rounded-lg"
              title="Profile and account settings"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent-light shadow-xs">
                {initials(user.full_name)}
              </span>
              <span className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-100">{user.full_name}</p>
                <p className="truncate text-xs text-ink-500">{user.plan === "pro" ? "Pro plan" : "Free plan"}</p>
              </span>
            </Link>
            <ThemeToggleButton />
            <button onClick={logout} aria-label="Log out" title="Log out" className="text-ink-500 hover:text-ink-100 focus-ring rounded-lg p-1.5">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <MobileTopBar />
        <main className="container-page py-6 pb-24 sm:py-8 lg:pb-8">
          {!user.email_verified && <VerificationNotice />}
          {children}
        </main>
        <MobileTabBar pathname={pathname} />
      </div>
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

/** Mobile's compact header: brand (tap to go home) plus an EXPLICIT home
 * control that always calls router.push("/") — never router.back() — so
 * it behaves identically no matter what page the user arrived from. */
function MobileTopBar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  if (!user) return null;
  return (
    <div className="flex h-14 items-center justify-between border-b border-[rgb(var(--fg-tint)/0.06)] px-3 lg:hidden">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="Go home"
          title="Go home"
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 hover:bg-[rgb(var(--fg-tint)/0.06)] hover:text-ink-100"
        >
          <Home className="h-4 w-4" />
        </button>
        <Link href="/dashboard" className="focus-ring flex items-center gap-2 rounded-lg px-1 font-display font-semibold text-ink-100">
          <BrandTile className="h-6 w-6 rounded-md" />
          CareerFound
        </Link>
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggleButton />
        <button
          onClick={logout}
          aria-label="Log out"
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 hover:bg-[rgb(var(--fg-tint)/0.06)] hover:text-ink-100"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/** Mobile's persistent bottom navigation. Fixed, safe-area aware, five real
 * routes, 44px+ touch targets, and an explicit active state so "where am I"
 * is never ambiguous. */
function MobileTabBar({ pathname }: { pathname: string | null }) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-[rgb(var(--fg-tint)/0.08)] bg-base-950/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {MOBILE_TAB_NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "focus-ring flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 py-1.5 text-[10px] font-medium transition-colors",
              active ? "text-accent-light" : "text-ink-500 hover:text-ink-200"
            )}
          >
            <item.icon className={cn("h-5 w-5", active && "scale-[1.05]")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
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
