import type { MetadataRoute } from "next";

// Lets a phone's "Add to Home Screen" use the real CareerFound mark
// instead of falling back to a screenshot of the page. Points at the
// existing icon/apple-icon routes so there's a single source of truth for
// the glyph rather than a separate set of static PNGs to keep in sync.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CareerFound",
    short_name: "CareerFound",
    description: "Discover your tech career, follow a roadmap, and build the proof you did the work.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8FAF9",
    theme_color: "#5D6F34",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
