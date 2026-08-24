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
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.24), 0 8px 24px -8px rgba(0,0,0,0.35)",
        glow: "0 0 0 1px rgba(93,111,52,0.4), 0 0 24px rgba(93,111,52,0.18)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "fill-bar": { from: { width: "0%" }, to: { width: "var(--fill-to)" } },
      },
      animation: {
        "fade-in": "fade-in 220ms ease-out",
        "fill-bar": "fill-bar 600ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
