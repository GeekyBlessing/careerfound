import { BrandTile } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { Bot, Briefcase, Compass, FolderGit2, LayoutDashboard, Map, Users } from "lucide-react";
import { EXAMPLE_TAG } from "./example";

/**
 * The CareerFound application chrome, drawn at the laptop's design size
 * (1040 x 650): the same navigation labels the real product uses, then the
 * page content. Every device screen on the homepage wraps its content in this
 * so the pictures read as one product, not a set of unrelated panels.
 */
export type ShellItem = "dashboard" | "discovery" | "roadmap" | "lab" | "portfolio" | "mentor" | "mentorship";

const NAV: { key: ShellItem; label: string; icon: typeof Map }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "discovery", label: "Career Discovery", icon: Compass },
  { key: "roadmap", label: "Roadmap", icon: Map },
  { key: "lab", label: "Project Lab", icon: FolderGit2 },
  { key: "portfolio", label: "Portfolio", icon: Briefcase },
  { key: "mentor", label: "AI Mentor", icon: Bot },
  { key: "mentorship", label: "Mentorship", icon: Users },
];

export function AppShell({ active, crumb, children }: { active: ShellItem; crumb: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full bg-base-950 text-ink-100">
      <aside className="flex w-[184px] flex-shrink-0 flex-col border-r border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.025)] px-3.5 py-4">
        <div className="flex items-center gap-2.5 px-1.5">
          <BrandTile className="h-7 w-7" />
          <span className="font-display text-[17px] font-semibold tracking-tight">CareerFound</span>
        </div>
        <nav className="mt-6 space-y-0.5">
          {NAV.map((n) => (
            <div
              key={n.key}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium",
                n.key === active ? "bg-accent/15 text-accent-light" : "text-ink-400"
              )}
            >
              <n.icon className="h-4 w-4 flex-shrink-0" />
              {n.label}
            </div>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-11 flex-shrink-0 items-center justify-between border-b border-[rgb(var(--fg-tint)/0.1)] px-6">
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-500">{crumb}</p>
          <p className="rounded-[0.25rem] border border-[rgb(var(--fg-tint)/0.14)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-500">
            {EXAMPLE_TAG}
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/** A thin determinate bar, static (screens are pictures; motion belongs to the page's own bars). */
export function Bar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-[rgb(var(--fg-tint)/0.1)]", className)}>
      <div className="h-full rounded-full bg-accent-light" style={{ width: `${value}%` }} />
    </div>
  );
}

export function Pill({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: "neutral" | "accent" | "success" | "warm"; className?: string }) {
  const t = {
    neutral: "border-[rgb(var(--fg-tint)/0.14)] text-ink-300",
    accent: "border-accent/40 bg-accent/10 text-accent-light",
    success: "border-success/40 bg-success/10 text-success",
    warm: "border-warm/40 bg-warm/10 text-warm",
  }[tone];
  return <span className={cn("inline-flex items-center rounded-[0.25rem] border px-2 py-0.5 text-[11px] font-medium", t, className)}>{children}</span>;
}
