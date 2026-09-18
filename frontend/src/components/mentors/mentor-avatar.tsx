"use client";

import { useState } from "react";
import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

// Squarish, gently-rounded frames (not circular chat-bubble avatars) - a
// deliberate break from the generic-SaaS "round avatar" pattern, so a real
// mentor photo reads as a professional headshot rather than a profile icon.
// "panel" is the odd one out: it fills its parent edge-to-edge (a card's
// photo header), so it has no fixed size or radius of its own - the parent
// (an overflow-hidden Card) supplies the rounding.
const SIZE_CLASSES: Record<"sm" | "md" | "lg" | "panel", string> = {
  sm: "h-11 w-11 rounded-lg text-sm",
  md: "h-16 w-16 rounded-lg text-lg",
  lg: "h-36 w-32 sm:h-44 sm:w-40 rounded-xl text-4xl",
  panel: "aspect-[3/4] w-full text-5xl",
};

/**
 * Real photo when a mentor has one (avatar_url), initials tile fallback
 * otherwise - demo mentors stay on initials, since no image pipeline exists
 * or is being built for the fictional roster; a real mentor's photo is what
 * should visually set them apart from that fictional roster, not a nicer
 * placeholder.
 */
export function MentorAvatar({
  displayName,
  avatarUrl,
  size = "sm",
  className,
}: {
  displayName: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "panel";
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  // Falls back to the initials tile below if the photo 404s or otherwise
  // fails to load, instead of leaving a broken-image icon in a production
  // profile card.
  if (avatarUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={`${displayName}, mentor photo`}
        onError={() => setFailed(true)}
        className={cn("flex-shrink-0 object-cover object-top", SIZE_CLASSES[size], className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex flex-shrink-0 items-center justify-center bg-accent/12 font-display font-semibold text-accent-light",
        SIZE_CLASSES[size],
        className
      )}
      aria-hidden={size === "panel" ? undefined : true}
      role={size === "panel" ? "img" : undefined}
      aria-label={size === "panel" ? `${displayName}, no photo yet` : undefined}
    >
      {initials(displayName)}
    </div>
  );
}
