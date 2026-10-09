import { ExternalLink, Github } from "lucide-react";
import { VerifiedBadge } from "@/components/career/verified-badge";
import { ReadinessRing } from "@/components/career/readiness-ring";
import type { PublicPortfolio } from "@/types/career";

const CASE_SECTIONS: { key: "overview" | "problem" | "solution" | "architecture" | "challenges" | "results"; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "problem", label: "The problem" },
  { key: "solution", label: "The solution" },
  { key: "architecture", label: "Architecture" },
  { key: "challenges", label: "Challenges" },
  { key: "results", label: "Results" },
];

/**
 * A learner's public page. Rendered on the server, so it can be shared and
 * indexed. Each claim is labelled with how it is known: finished work,
 * a reviewer's approval, or the learner's own say so.
 */
export function PublicPortfolioView({ data }: { data: PublicPortfolio }) {
  const verifiedCount = data.projects.filter((p) => p.badge?.tier === "verified").length;
  return (
    <div className="space-y-14">
      <header className="grid gap-8 border-b border-[rgb(var(--fg-tint)/0.12)] pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          {data.career && <p className="eyebrow">Working towards {data.career.name}</p>}
          <h1 className="mt-2 font-display text-display font-semibold tracking-tight text-ink-100">{data.name}</h1>
          {data.headline && <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-200">{data.headline}</p>}
          {data.location && <p className="mt-2 text-sm text-ink-500">{data.location}</p>}
          {data.bio && <p className="mt-5 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-ink-300">{data.bio}</p>}
          {data.links.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {data.links.map((l) => (
                <li key={l.url}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer me" className="focus-ring inline-flex items-center gap-1.5 rounded font-medium text-accent-light hover:underline">
                    {l.label} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        {data.readiness && (
          <div className="flex items-center gap-5">
            <ReadinessRing score={data.readiness.score} active size={120} />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wide text-ink-500">Career readiness</p>
              <p className="font-display text-lg font-semibold text-ink-100">{data.readiness.band}</p>
              <p className="mt-1 max-w-[12rem] text-xs leading-relaxed text-ink-500">Counted from finished lessons and projects, not self-reported.</p>
            </div>
          </div>
        )}
      </header>

      {data.achievements.length > 0 && (
        <dl className="flex flex-wrap gap-x-12 gap-y-4">
          {data.achievements.map((a) => (
            <div key={a.label}>
              <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-500">{a.label}</dt>
              <dd className="mt-1 font-display text-3xl font-semibold text-ink-100">{a.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <section aria-labelledby="projects">
        <h2 id="projects" className="font-display text-h2 font-semibold tracking-tight text-ink-100">
          Projects
        </h2>
        {data.projects.length === 0 ? (
          <p className="mt-4 text-sm text-ink-500">No projects published yet.</p>
        ) : (
          <ul className="mt-6 space-y-10">
            {data.projects.map((p) => (
              <li key={p.id} className="border-t border-[rgb(var(--fg-tint)/0.14)] pt-6">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <h3 className="font-display text-xl font-semibold text-ink-100">{p.title}</h3>
                  <VerifiedBadge badge={p.badge} reviewer={p.verified_by} date={p.verified_on} size="sm" />
                </div>
                {p.badge?.tier === "verified" && p.verified_by && (
                  <p className="mt-1 text-xs text-ink-500">
                    Read and approved by {p.verified_by}
                    {p.verified_on ? `, ${new Date(p.verified_on).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}` : ""}.
                  </p>
                )}
                {p.summary && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-300">{p.summary}</p>}
                {p.skills.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {p.skills.map((s) => (
                      <li key={s} className="rounded-[0.25rem] border border-[rgb(var(--fg-tint)/0.12)] px-1.5 py-0.5 text-[11px] text-ink-400">
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                  {p.github && (
                    <a href={p.github} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex items-center gap-1.5 rounded font-medium text-accent-light hover:underline">
                      <Github className="h-3.5 w-3.5" aria-hidden="true" /> Repository
                    </a>
                  )}
                  {p.live_demo && (
                    <a href={p.live_demo} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex items-center gap-1.5 rounded font-medium text-accent-light hover:underline">
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> Live demo
                    </a>
                  )}
                </div>
                {p.case_study && (
                  <details className="mt-5 rounded-2xl border border-[rgb(var(--fg-tint)/0.12)] p-5">
                    <summary className="focus-ring cursor-pointer rounded text-sm font-medium text-ink-100">Read the case study</summary>
                    <div className="mt-5 space-y-5">
                      {CASE_SECTIONS.filter((s) => p.case_study![s.key]).map((s) => (
                        <div key={s.key}>
                          <h4 className="font-mono text-[10px] uppercase tracking-wide text-ink-500">{s.label}</h4>
                          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink-300">{p.case_study![s.key]}</p>
                        </div>
                      ))}
                      {p.case_study.technologies.length > 0 && (
                        <div>
                          <h4 className="font-mono text-[10px] uppercase tracking-wide text-ink-500">Technologies</h4>
                          <p className="mt-1.5 text-sm text-ink-300">{p.case_study.technologies.join(", ")}</p>
                        </div>
                      )}
                      {p.case_study.screenshots.length > 0 && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {p.case_study.screenshots.map((src) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={src} src={src} alt={`Screenshot of ${p.title}`} loading="lazy" className="w-full rounded-xl border border-[rgb(var(--fg-tint)/0.12)]" />
                          ))}
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {data.skills && (data.skills.with_evidence.length > 0 || data.skills.self_reported.length > 0) && (
        <section aria-labelledby="skills" className="grid gap-10 md:grid-cols-2">
          {data.skills.with_evidence.length > 0 && (
            <div>
              <h2 id="skills" className="font-display text-xl font-semibold text-ink-100">
                Skills shown by finished work
              </h2>
              <p className="mt-1 text-xs text-ink-500">From lessons and projects completed on CareerFound.</p>
              <ul className="mt-3 divide-y divide-[rgb(var(--fg-tint)/0.1)] border-y border-[rgb(var(--fg-tint)/0.1)] text-sm">
                {data.skills.with_evidence.map((s) => (
                  <li key={s.label} className="flex justify-between py-2 text-ink-200">
                    {s.label}
                    <span className="font-mono text-[10px] uppercase tracking-wide text-ink-500">{s.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.skills.self_reported.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-ink-100">Skills listed by {data.name.split(" ")[0]}</h2>
              <p className="mt-1 text-xs text-ink-500">Self-reported. CareerFound has not checked these.</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {data.skills.self_reported.map((s) => (
                  <li key={s} className="rounded-[0.25rem] border border-[rgb(var(--fg-tint)/0.14)] px-2 py-0.5 text-xs text-ink-300">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <section aria-labelledby="certs">
          <h2 id="certs" className="font-display text-xl font-semibold text-ink-100">
            Certifications
          </h2>
          <p className="mt-1 text-xs text-ink-500">Self-reported. Check the credential link with the issuer.</p>
          <ul className="mt-3 space-y-1.5 text-sm text-ink-200">
            {data.certifications.map((c) => (
              <li key={c.name + c.year}>
                {c.name}
                {c.issuer ? `, ${c.issuer}` : ""}
                {c.status === "in_progress" ? " (in progress)" : c.year ? `, ${c.year}` : ""}
                {c.credential_url && (
                  <>
                    {" "}
                    <a href={c.credential_url} target="_blank" rel="noopener noreferrer" className="text-accent-light hover:underline">
                      credential
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="max-w-3xl border-t border-[rgb(var(--fg-tint)/0.12)] pt-6 text-xs leading-relaxed text-ink-500">
        <p>{data.labels.note}</p>
        {verifiedCount > 0 && <p className="mt-2">{verifiedCount} of {data.projects.length} projects here carry a reviewer&apos;s approval.</p>}
      </footer>
    </div>
  );
}
