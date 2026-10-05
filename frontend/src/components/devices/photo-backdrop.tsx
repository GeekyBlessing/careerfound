import { cn } from "@/lib/utils";
import { PHOTOS, type PhotoKey } from "@/lib/photos";

/**
 * A person photograph used as the backdrop of a device composition. When the
 * photo for the slot has not been supplied yet, it renders a quiet tonal
 * panel instead (same footprint, so the devices layered over it sit in the
 * same place either way) and the composition simply reads device-led.
 *
 * `fade` controls which edge dissolves into the page so the photo never ends
 * on a hard box edge: the devices overlap that edge.
 */
export function PhotoBackdrop({
  slot,
  className,
  fade = "bottom",
  bare = false,
  children,
}: {
  slot: PhotoKey;
  className?: string;
  fade?: "bottom" | "left" | "none";
  /** When the photo is not supplied yet, draw nothing (no tonal panel) so only the devices show. */
  bare?: boolean;
  children?: React.ReactNode;
}) {
  const photo = PHOTOS[slot];
  const mask =
    fade === "bottom"
      ? "linear-gradient(to bottom, #000 55%, transparent 100%)"
      : fade === "left"
        ? "linear-gradient(to right, transparent 0%, #000 40%)"
        : undefined;

  return (
    <div className={cn("relative isolate overflow-hidden rounded-3xl", className)} style={{ aspectRatio: photo.ratio }} data-photo={photo.available ? "present" : "pending"}>
      {photo.available ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.src}
            alt={photo.alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
            style={{ objectPosition: photo.focal, WebkitMaskImage: mask, maskImage: mask }}
          />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgb(var(--color-base-950)/0.55)] via-transparent to-transparent" />
        </>
      ) : bare ? null : (
        <>
          <div aria-hidden="true" className="absolute inset-0 -z-20 bg-[rgb(var(--color-accent-mist))]" />
          <div aria-hidden="true" className="bg-contour absolute inset-0 -z-10" />
        </>
      )}
      {children}
    </div>
  );
}
