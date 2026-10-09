/** @type {import('next').NextConfig} */
// Careers that were renamed keep their old URLs. Kept in step with
// LEGACY_SLUG_REDIRECTS in backend/app/services/career_taxonomy.py and
// LEGACY_CAREER_SLUGS in src/lib/career-categories.ts.
const LEGACY_CAREER_SLUGS = {
  "ai-ml-engineering": "ai-engineering",
  "no-code-automation": "workflow-automation",
  "soc-analysis": "security-operations",
  devops: "devops-engineering",
};

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: false,
  },
  async redirects() {
    return Object.entries(LEGACY_CAREER_SLUGS).map(([oldSlug, newSlug]) => ({
      source: `/careers/${oldSlug}`,
      destination: `/careers/${newSlug}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
