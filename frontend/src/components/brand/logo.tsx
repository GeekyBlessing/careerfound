import {
  BRAND_MARK_VIEWBOX,
  MARK_CONNECTOR,
  MARK_DIAMOND_FOUNDATION,
  MARK_DIAMOND_PROGRESS,
} from "@/lib/brand-mark";
import { cn } from "@/lib/utils";

type MarkTone =
  /** White-on-white-ish glyph for use on a solid accent tile (nav, app-shell, auth screens). */
  | "on-tile"
  /** Full two-tone green + warm, no tile - for standalone/marketing use on either theme background. */
  | "signature"
  /** Single flat color via currentColor - print, watermark, grayscale contexts. */
  | "mono";

/**
 * The bare symbol (no tile, no wordmark). Use <BrandTile> when you need the
 * familiar rounded-square lockup that used to hold a Compass icon.
 */
export function LogoMark({
  className,
  tone = "signature",
}: {
  className?: string;
  tone?: MarkTone;
}) {
  const foundationFill =
    tone === "on-tile" ? "white" : tone === "mono" ? "currentColor" : "currentColor";
  const progressFill =
    tone === "on-tile" ? "rgba(255,255,255,0.72)" : tone === "mono" ? "currentColor" : "rgb(var(--color-warm))";
  const progressOpacity = tone === "mono" ? 0.55 : undefined;
  const connectorColor =
    tone === "on-tile" ? "rgba(255,255,255,0.55)" : tone === "mono" ? "currentColor" : "rgb(var(--color-warm))";
  const connectorOpacity = tone === "on-tile" ? undefined : 0.45;

  return (
    <svg
      viewBox={BRAND_MARK_VIEWBOX}
      className={cn("h-full w-full", tone === "signature" && "text-accent", className)}
      role="img"
      aria-label="CareerFound"
    >
      <line
        x1={MARK_CONNECTOR.x1}
        y1={MARK_CONNECTOR.y1}
        x2={MARK_CONNECTOR.x2}
        y2={MARK_CONNECTOR.y2}
        stroke={connectorColor}
        strokeOpacity={connectorOpacity}
        strokeWidth={2.25}
        strokeLinecap="round"
      />
      <polygon points={MARK_DIAMOND_FOUNDATION} fill={foundationFill} />
      <polygon points={MARK_DIAMOND_PROGRESS} fill={progressFill} opacity={progressOpacity} />
    </svg>
  );
}

/**
 * The rounded-square accent tile that used to wrap a lucide Compass icon.
 * Same footprint everywhere it's used (nav, app-shell, auth screens, 404)
 * so swapping the glyph inside it was a one-line change per call site.
 */
export function BrandTile({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center justify-center rounded-lg bg-accent shadow-xs", className)}>
      <LogoMark tone="on-tile" className="h-[58%] w-[58%]" />
    </span>
  );
}

/** Full lockup: symbol tile + "CareerFound" wordmark, set in the display face. */
export function Logo({ className, wordmarkClassName }: { className?: string; wordmarkClassName?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <BrandTile className="h-7 w-7 flex-shrink-0" />
      <span className={cn("font-display font-semibold tracking-tight text-ink-100", wordmarkClassName)}>
        CareerFound
      </span>
    </span>
  );
}
