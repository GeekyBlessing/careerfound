import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layout/public-shell";
import { PublicPortfolioView } from "@/components/career/public-portfolio";
import type { PublicPortfolio } from "@/types/career";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function load(username: string): Promise<PublicPortfolio | null> {
  const res = await fetch(`${API_BASE}/public/profiles/${encodeURIComponent(username)}`, { cache: "no-store" });
  if (res.status === 404 || res.status === 429) return null;
  if (!res.ok) throw new Error(`Profile request failed (${res.status})`);
  return (await res.json()) as PublicPortfolio;
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const data = await load(username).catch(() => null);
  if (!data) return { title: "Profile not found", robots: { index: false } };
  const verified = data.projects.filter((p) => p.badge?.tier === "verified").length;
  const description =
    data.headline || `${data.name}'s portfolio on CareerFound: ${data.projects.length} published project${data.projects.length === 1 ? "" : "s"}${verified ? `, ${verified} reviewed` : ""}.`;
  return { title: `${data.name} | CareerFound portfolio`, description, openGraph: { title: `${data.name} | CareerFound portfolio`, description, type: "profile" } };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const data = await load(username);
  if (!data) notFound();
  return (
    <PublicShell>
      <PublicPortfolioView data={data} />
    </PublicShell>
  );
}
