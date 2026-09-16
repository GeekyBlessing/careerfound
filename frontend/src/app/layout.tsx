import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { buildThemeInitScript } from "@/lib/theme-constants";
import "@/styles/globals.css";

const SITE_URL = "https://www.mycareerfound.com";
const SITE_NAME = "CareerFound";
const DEFAULT_DESCRIPTION =
  "Discover the right tech career, get a personalized roadmap, build real projects, and become job-ready, one step at a time.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CareerFound: Find your tech career, step by step",
    template: "%s | CareerFound",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "CareerFound: Find your tech career, step by step",
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary",
    title: "CareerFound: Find your tech career, step by step",
    description: DEFAULT_DESCRIPTION,
  },
};

// Runs before React hydrates so the correct theme class is on <html> from
// the very first paint (no light-then-dark flash). Generated from the same
// source as lib/theme.tsx's resolution logic, see lib/theme-constants.ts.
const themeInitScript = buildThemeInitScript();

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
