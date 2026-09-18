import { cn } from "@/lib/utils";

/**
 * A plain phone device frame (no brand silhouette, just "a phone") for
 * presenting a piece of CareerFound's real mobile-shaped UI as a tangible
 * product object rather than a screenshot dropped in a rectangle. Pairs
 * with the `.perspective-scene` / `rotate-*` / `translate-*` utilities on
 * a wrapping element (see the homepage) to build layered, tilted device
 * compositions - this component only owns the device shell itself.
 */
export function PhoneFrame({
  label,
  tone = "default",
  className,
  children,
}: {
  label?: string;
  tone?: "default" | "ink";
  className?: string;
  children: React.ReactNode;
}) {
  const isInk = tone === "ink";
  return (
    <div
      className={cn(
        "relative w-[240px] overflow-hidden rounded-[2.25rem] border-[6px] shadow-raised sm:w-[264px]",
        isInk ? "border-[#1a1c16] bg-black" : "border-ink-100/90 bg-base-950",
        className
      )}
      style={{ aspectRatio: "9 / 19.5" }}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-1/2 top-2.5 z-10 h-[18px] w-[86px] -translate-x-1/2 rounded-full",
          isInk ? "bg-black" : "bg-ink-100/90"
        )}
      />
      <div className={cn("flex h-full flex-col pt-8", isInk ? "text-[#f4f5f0]" : "")}>
        {label && (
          <p
            className={cn(
              "px-5 pb-2 font-mono text-[9px] uppercase tracking-wide",
              isInk ? "text-white/40" : "text-ink-500"
            )}
          >
            {label}
          </p>
        )}
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
