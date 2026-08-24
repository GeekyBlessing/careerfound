"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Compass,
  LayoutDashboard,
  Map,
  MessageCircle,
  FolderGit2,
  Briefcase,
  Users,
  LogOut,
  Flame,
  GraduationCap,
  LayoutGrid,
  Settings,
  MailWarning,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { initials } from "@/lib/utils";
import { ThemeToggleButton } from "@/components/ui/theme-toggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/projects", label: "Projects", icon: LayoutGrid },
  { href: "/mentor", label: "AI Mentor", icon: MessageCircle },
  { href: "/portfolio", label: "Portfolio", icon: FolderGit2 },
  { href: "/mentors", label: "Mentorship", icon: Briefcase },
  { href: "/community", label: "Community", icon: Users },
];

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
        <div className="flex h-16 items-center gap-2 px-6 font-semibold text-ink-100">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
            <Compass className="h-4 w-4 text-white" />
          </span>
          CareerFound
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-accent/15 text-accent-light" : "text-ink-300 hover:bg-[rgb(var(--fg-tint)/0.05)] hover:text-ink-100"
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
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                pathname?.startsWith("/mentor-dashboard") ? "bg-accent/15 text-accent-light" : "text-ink-300 hover:bg-[rgb(var(--fg-tint)/0.05)] hover:text-ink-100"
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
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                pathname?.startsWith("/admin") ? "bg-accent/15 text-accent-light" : "text-ink-300 hover:bg-[rgb(var(--fg-tint)/0.05)] hover:text-ink-100"
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
              className="flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-ring"
              title="Settings and profile"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent-light">
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
        <main className="container-page py-8">
          {!user.email_verified && <VerificationBanner />}
          {children}
        </main>
      </div>
    </div>
  );
}

function VerificationBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
      <MailWarning className="h-4 w-4 flex-shrink-0" />
      <p className="flex-1">
        Please verify your email address.{" "}
        <Link href="/settings" className="font-medium underline">
          Resend the verification email
        </Link>
        .
      </p>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="flex-shrink-0 rounded-md p-0.5 hover:bg-warning/15"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function MobileTopBar() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <div className="flex h-14 items-center justify-between border-b border-[rgb(var(--fg-tint)/0.06)] px-4 lg:hidden">
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-ink-100">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent">
          <Compass className="h-3.5 w-3.5 text-white" />
        </span>
        CareerFound
      </Link>
      <div className="flex items-center gap-1">
        <ThemeToggleButton />
        <Link href="/settings" aria-label="Settings" title="Settings" className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:text-ink-100">
          <Settings className="h-4 w-4" />
        </Link>
        <button onClick={logout} aria-label="Log out" className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-ink-400">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
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
