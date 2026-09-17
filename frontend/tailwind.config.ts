import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // base (backgrounds) and ink (text) resolve through CSS variables
        // defined in globals.css, which are redefined under the .dark
        // class. The token names and their brightness ordering stay the
        // same as before (base-950 is the page background, ink-100 is the
        // primary text color) in both themes; only the actual color values
        // swap, so existing className usage across the app needs no changes.
        base: {
          50: "rgb(var(--color-base-50) / <alpha-value>)",
          900: "rgb(var(--color-base-900) / <alpha-value>)",
          950: "rgb(var(--color-base-950) / <alpha-value>)",
        },
        ink: {
          100: "rgb(var(--color-ink-100) / <alpha-value>)",
          200: "rgb(var(--color-ink-200) / <alpha-value>)",
          300: "rgb(var(--color-ink-300) / <alpha-value>)",
          400: "rgb(var(--color-ink-400) / <alpha-value>)",
          500: "rgb(var(--color-ink-500) / <alpha-value>)",
          700: "rgb(var(--color-ink-700) / <alpha-value>)",
        },
        // Brand color: green, consistent in both light and dark mode.
        // accent-light is theme-aware (a CSS variable) since its whole job
        // is "the accent shade that pops against the current background",
        // which is a different literal color on a white vs. near-black page.
        accent: {
          DEFAULT: "#5D6F34",
          dark: "#475426",
          light: "rgb(var(--color-accent-light) / <alpha-value>)",
        },
        success: "#33C481",
        warning: "#E8A63C",
        danger: "#E15B5B",
        // Warm secondary brand color (clay/terracotta): reserved for
        // signature moments (the "Best Match" reveal, readiness-score
        // accents, hero waypoints) rather than general UI, so it stays a
        // deliberate accent instead of turning into a second competing
        // brand color everywhere.
        warm: {
          DEFAULT: "rgb(var(--color-warm) / <alpha-value>)",
          light: "rgb(var(--color-warm-light) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        // A small elevation scale, used consistently instead of one-off
        // shadow values, so raised elements read the same everywhere.
        xs: "0 1px 2px rgba(0,0,0,0.16)",
        card: "0 1px 2px rgba(0,0,0,0.24), 0 8px 24px -8px rgba(0,0,0,0.35)",
        raised: "0 2px 4px rgba(0,0,0,0.22), 0 16px 40px -12px rgba(0,0,0,0.45)",
        glow: "0 0 0 1px rgba(93,111,52,0.4), 0 0 24px rgba(93,111,52,0.18)",
      },
      letterSpacing: {
        tightest: "-0.035em",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "fade-in-up": { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "fill-bar": { from: { width: "0%" }, to: { width: "var(--fill-to)" } },
        "scale-in": { from: { opacity: "0", transform: "scale(0.96)" }, to: { opacity: "1", transform: "scale(1)" } },
        "pop-in": { "0%": { opacity: "0", transform: "scale(0.9)" }, "60%": { opacity: "1", transform: "scale(1.03)" }, "100%": { transform: "scale(1)" } },
        // A slow, subtle dash-offset crawl for the hero/roadmap path line,
        // suggesting motion along the route without being a distracting
        // loop. Disabled globally under prefers-reduced-motion (see the
        // media query at the bottom of globals.css).
        "path-flow": { to: { strokeDashoffset: "-24" } },
      },
      animation: {
        "fade-in": "fade-in 220ms ease-out",
        "fade-in-up": "fade-in-up 420ms cubic-bezier(0.16,1,0.3,1)",
        "fill-bar": "fill-bar 700ms cubic-bezier(0.16,1,0.3,1)",
        "scale-in": "scale-in 180ms ease-out",
        "pop-in": "pop-in 360ms cubic-bezier(0.16,1,0.3,1)",
        "path-flow": "path-flow 1.6s linear infinite",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16,1,0.3,1)",
      },
    },
  },
  plugins: [],
};

export default config;
