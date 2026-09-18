import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  as: Heading = "h2",
  align = "center",
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  /** Heading level to render. Defaults to h2 (a section heading within a
   * page that already has its own h1). Pages whose SectionHeading IS the
   * page's main title should pass as="h1" so the document has exactly one
   * h1, which matters for both SEO and screen-reader navigation. */
  as?: "h1" | "h2";
  /**
   * "center" is the original centered, narrow-column treatment (still the
   * right call for short, declarative section intros like Pricing or FAQ).
   * "left" is the editorial masthead treatment: a hairline rule above a
   * large left-aligned headline, with the supporting description set as a
   * separate column beside it on wide screens rather than centered prose
   * underneath, closer to how a section is introduced on a publication or
   * institutional page than a SaaS landing page.
   */
  align?: "center" | "left";
  className?: string;
}) {
  if (align === "left") {
    return (
      <div className={cn("border-t border-[rgb(var(--fg-tint)/0.12)] pt-5", className)}>
        <p className="eyebrow justify-start">{eyebrow}</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <Heading
            className={cn(
              "max-w-2xl font-display font-semibold text-ink-100",
              Heading === "h1" ? "text-display" : "text-h1"
            )}
          >
            {title}
          </Heading>
          {description && (
            <p className="max-w-sm text-sm leading-relaxed text-ink-500 lg:pb-1 lg:text-right">{description}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      <p className="eyebrow justify-center">{eyebrow}</p>
      <Heading className={cn("mt-3 font-display font-semibold text-ink-100", Heading === "h1" ? "text-h1 sm:text-display" : "text-h2 sm:text-h1")}>
        {title}
      </Heading>
      {description && <p className="mt-3 text-sm text-ink-500">{description}</p>}
    </div>
  );
}
