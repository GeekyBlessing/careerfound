import type { MetadataRoute } from "next";

const SITE_URL = "https://www.mycareerfound.com";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Static marketing routes that always belong in the sitemap, independent
// of whether the backend is reachable at build/request time.
const STATIC_ROUTES = [
  "",
  "/about",
  "/contact",
  "/how-it-works",
  "/careers",
  "/pricing",
  "/faq",
  "/mentorship",
  "/consultation",
  "/mentors",
  "/privacy",
  "/terms",
  "/refund-policy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  // Best-effort: also list each individual career path page. If the API
  // isn't reachable (e.g. during a build with no backend configured yet),
  // fall back to just the static routes above rather than failing the
  // whole sitemap.
  try {
    const res = await fetch(`${API_BASE}/careers`, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const paths: { slug: string }[] = await res.json();
      for (const path of paths) {
        entries.push({ url: `${SITE_URL}/careers/${path.slug}`, lastModified: new Date() });
      }
    }
  } catch {
    // Backend unreachable, ship the static sitemap only.
  }

  return entries;
}
