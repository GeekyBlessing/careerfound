import { cn } from "@/lib/utils";

/**
 * A thin, labeled hairline between major homepage bands (Discover / Choose /
 * Build / Show your work / Get guidance / Job ready). Gives the page a
 * visible rhythm as you scroll, the way a printed editorial page uses a
 * running head between sections, instead of every section just butting up
 * against the next with a color change as the only signal something new
 * started.
 */
export function SectionDivider({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn("container-page", className)}>
      <div className="flex items-center gap-4 py-2">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-ink-500">{label}</span>
        <span className="h-px flex-1 bg-[rgb(var(--fg-tint)/0.1)]" />
      </div>
    </div>
  );
}
