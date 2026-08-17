import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

const SIZE_CLASSES: Record<"sm" | "md" | "lg", string> = {
  sm: "h-11 w-11 text-sm",
  md: "h-16 w-16 text-lg",
  lg: "h-28 w-28 text-3xl",
};

/**
 * Real photo when a mentor has one (avatar_url), initials-circle fallback
 * otherwise — every demo mentor stays on initials, since no image pipeline
 * exists or is being built for the fictional roster.
 */
export function MentorAvatar({
  displayName,
  avatarUrl,
  size = "sm",
  className,
}: {
  displayName: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={displayName}
        className={cn("flex-shrink-0 rounded-full object-cover", SIZE_CLASSES[size], className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex flex-shrink-0 items-center justify-center rounded-full bg-accent/15 font-semibold text-accent-light",
        SIZE_CLASSES[size],
        className
      )}
    >
      {initials(displayName)}
    </div>
  );
}
