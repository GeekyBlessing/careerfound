import { cn } from "@/lib/utils";

/**
 * A lightweight "this is a real screen from the product" frame: a thin
 * chrome bar (three dots, a label) above whatever content is passed in.
 * Used anywhere the homepage shows an actual piece of CareerFound's UI
 * (the roadmap phase list, a portfolio preview, an AI Mentor exchange)
 * so it visually reads as a product screenshot/interface moment rather
 * than a plain bordered card repeating the same "container" language as
 * every other section. Deliberately not a real screenshot image (there is
 * no photography pipeline for this build), but a faithful, live-rendered
 * excerpt of the same components and data the real product uses.
 */
export function InterfaceFrame({
  label,
  tone = "default",
  className,
  children,
}: {
  label: string;
  tone?: "default" | "ink";
  className?: string;
  children: React.ReactNode;
}) {
  const isInk = tone === "ink";
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border",
        isInk ? "surface-ink-line border" : "border-[rgb(var(--fg-tint)/0.12)]",
        isInk ? "bg-black/20" : "bg-base-950",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 border-b px-4 py-2.5",
          isInk ? "surface-ink-line border-b" : "border-[rgb(var(--fg-tint)/0.1)]"
        )}
      >
        <span className="flex gap-1.5" aria-hidden="true">
          <span className={cn("h-2 w-2 rounded-full", isInk ? "bg-white/20" : "bg-[rgb(var(--fg-tint)/0.16)]")} />
          <span className={cn("h-2 w-2 rounded-full", isInk ? "bg-white/20" : "bg-[rgb(var(--fg-tint)/0.16)]")} />
          <span className={cn("h-2 w-2 rounded-full", isInk ? "bg-white/20" : "bg-[rgb(var(--fg-tint)/0.16)]")} />
        </span>
        <span
          className={cn(
            "font-mono text-[10px] uppercase tracking-wide",
            isInk ? "surface-ink-muted" : "text-ink-500"
          )}
        >
          {label}
        </span>
      </div>
      <div className={isInk ? "text-[#f4f5f0]" : ""}>{children}</div>
    </div>
  );
}
