export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-accent-light">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold text-ink-100 sm:text-3xl">{title}</h2>
      {description && <p className="mt-3 text-sm text-ink-500">{description}</p>}
    </div>
  );
}
