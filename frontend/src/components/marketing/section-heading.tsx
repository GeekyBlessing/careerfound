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
      <p className="eyebrow justify-center">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink-100 sm:text-3xl">{title}</h2>
      {description && <p className="mt-3 text-sm text-ink-500">{description}</p>}
    </div>
  );
}
