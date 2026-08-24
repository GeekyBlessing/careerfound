"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** Compact icon toggle for use in nav bars / top bars. */
export function ThemeToggleButton({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-[rgb(var(--fg-tint)/0.06)] hover:text-ink-100",
        className
      )}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

/** Full light/dark segmented control for the settings page. */
export function ThemeToggleSegmented() {
  const { theme, setTheme } = useTheme();
  const options: { value: "light" | "dark"; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
  ];
  return (
    <div className="inline-flex rounded-xl border border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.03)] p-1">
      {options.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={cn(
              "focus-ring flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              active ? "bg-accent text-white" : "text-ink-300 hover:text-ink-100"
            )}
          >
            <opt.icon className="h-4 w-4" />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
