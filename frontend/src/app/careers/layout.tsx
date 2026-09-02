import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Paths | CareerFound",
  description: "Browse tech career paths, entry roles, key skills, and the real projects you'll build for each.",
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
