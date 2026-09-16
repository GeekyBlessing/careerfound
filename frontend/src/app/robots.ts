import type { MetadataRoute } from "next";

const SITE_URL = "https://www.mycareerfound.com";

// Marketing/public pages are indexable. Everything behind the auth-gated
// AppShell (dashboard, roadmap, projects, portfolio, AI mentor chat,
// settings, admin, onboarding/assessment flow) is disallowed: it's
// per-user content with no SEO value, and keeping crawlers off it is a
// small, free reduction in attack surface (no reason to advertise those
// paths to bots).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/roadmap",
        "/projects",
        "/mentor",
        "/mentor-dashboard",
        "/portfolio",
        "/settings",
        "/admin",
        "/onboarding",
        "/assessment",
        "/reset-password",
        "/verify-email",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
