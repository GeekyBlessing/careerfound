import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "CareerFound — Find your tech career, step by step",
  description:
    "Discover the right tech career, get a personalized roadmap, build real projects, and become job-ready — one step at a time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
