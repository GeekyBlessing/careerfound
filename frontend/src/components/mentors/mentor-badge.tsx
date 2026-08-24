import { Badge } from "@/components/ui/badge";
import type { Mentor } from "@/types";

/**
 * Real vs. demo data is a hard product requirement here: fictional seeded
 * mentors must never read as real professionals, and the "FOUNDING MENTOR"
 * label must never be mistaken for a verification claim (that's a separate,
 * manually-set is_verified flag — see the tooltip copy below).
 */
export function MentorBadge({ mentor, className }: { mentor: Mentor; className?: string }) {
  if (mentor.is_founding_mentor) {
    return (
      <Badge tone="accent" className={className} title="One of the platform's first real mentors, not a verification claim.">
        FOUNDING MENTOR
      </Badge>
    );
  }
  if (mentor.is_demo) {
    return (
      <Badge tone="neutral" className={className} title="A sample profile used for testing, not a real person.">
        DEMO MENTOR
      </Badge>
    );
  }
  return null;
}
