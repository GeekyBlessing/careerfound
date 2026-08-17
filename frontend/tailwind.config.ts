import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: {
          50: "#F7F8FA",
          900: "#0B0D12",
          950: "#07080B",
        },
        ink: {
          100: "#F4F5F7",
          300: "#C6C9D2",
          500: "#8A8F9C",
          700: "#4B4F5A",
        },
        accent: {
          DEFAULT: "#5B6CFF",
          light: "#8A93FF",
          dark: "#4450DB",
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
        glow: "0 0 0 1px rgba(91,108,255,0.4), 0 0 24px rgba(91,108,255,0.18)",
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
