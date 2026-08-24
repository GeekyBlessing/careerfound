import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "CareerFound: Find your tech career, step by step",
  description:
    "Discover the right tech career, get a personalized roadmap, build real projects, and become job-ready, one step at a time.",
};

// Runs before React hydrates so the correct theme class is on <html> from
// the very first paint (no light-then-dark flash). Mirrors the logic in
// lib/theme.tsx's applyTheme/initial-theme resolution; keep both in sync.
const themeInitScript = `(function(){try{var t=localStorage.getItem("careerfound-theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}if(t==="dark"){document.documentElement.classList.add("dark");}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
