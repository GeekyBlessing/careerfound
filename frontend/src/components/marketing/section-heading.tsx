import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  as: Heading = "h2",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  /** Heading level to render. Defaults to h2 (a section heading within a
   * page that already has its own h1). Pages whose SectionHeading IS the
   * page's main title should pass as="h1" so the document has exactly one
   * h1, which matters for both SEO and screen-reader navigation. */
  as?: "h1" | "h2";
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="eyebrow justify-center">{eyebrow}</p>
      <Heading className={cn("mt-3 font-display font-semibold text-ink-100", Heading === "h1" ? "text-h1 sm:text-display" : "text-h2 sm:text-h1")}>
        {title}
      </Heading>
      {description && <p className="mt-3 text-sm text-ink-500">{description}</p>}
    </div>
  );
}
