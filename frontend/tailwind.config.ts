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
        // A very pale wash of the brand green (a supporting tone, not the
        // button-strength accent) used for backgrounds that should feel
        // "green as a material" rather than neutral gray with a green
        // button dropped on top - the hero rail, the best-match reveal
        // frame, a highlighted stat tile.
        mist: "rgb(var(--color-accent-mist) / <alpha-value>)",
        // A warm off-white (light) / warm near-black (dark) surface used to
        // alternate section rhythm against the cooler base background - see
        // the note on --color-paper in globals.css.
        paper: "rgb(var(--color-paper) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      // A named type scale so "which size is this" is a deliberate choice
      // tied to a role (hero/display/h1/h2/h3/label) instead of every
      // heading reaching for whichever text-2xl/3xl felt right in the
      // moment. Sizes are additive - existing text-sm/text-xs usage across
      // the app is untouched, this scale is for headings and metadata.
      //
      // Widened for the editorial redesign: "hero" is new (the one true
      // homepage-scale headline), and every other step got more room
      // between it and its neighbor so hierarchy reads at a glance instead
      // of every heading landing in the same narrow 1rem-1.4rem band. Sizes
      // use clamp() so the top of the range only shows up on wide viewports
      // rather than forcing a huge headline into a 375px phone.
      fontSize: {
        // "poster" is the one true above-the-fold moment: a headline meant
        // to occupy a real fraction of the screen, the way a magazine cover
        // or an institutional homepage's masthead line does, not a "big
        // heading" in the SaaS sense. Reserved for the hero and the closing
        // statement; everything else uses hero/display and below.
        poster: ["clamp(3.25rem, 2.1rem + 6vw, 7.5rem)", { lineHeight: "0.98", letterSpacing: "-0.03em" }],
        hero: ["clamp(2.75rem, 2rem + 3vw, 4.5rem)", { lineHeight: "1.04", letterSpacing: "-0.025em" }],
        display: ["clamp(2rem, 1.5rem + 2vw, 2.875rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        h1: ["2.125rem", { lineHeight: "1.15", letterSpacing: "-0.018em" }],
        h2: ["1.5rem", { lineHeight: "1.28", letterSpacing: "-0.01em" }],
        h3: ["1.125rem", { lineHeight: "1.4" }],
        // "deck" is an editorial lede: the one supporting line under a
        // poster/hero headline that needs to read as intentionally larger
        // than body copy, not just another paragraph.
        deck: ["clamp(1.125rem, 1rem + 0.4vw, 1.375rem)", { lineHeight: "1.45" }],
        label: ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.09em" }],
      },
      // A tighter, more restrained radius scale than the pill-happy default
      // (was 0.875/1.25/1.5rem). An institutional interface reads through
      // borders, spacing and type, not through how rounded every corner is,
      // so cards and panels get a modest radius rather than a soft "app"
      // curve, and pill shapes (Badge, previously) are reworked separately
      // to not lean on rounded-full at all.
      borderRadius: {
        xl: "0.625rem",
        "2xl": "0.75rem",
        "3xl": "1rem",
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
