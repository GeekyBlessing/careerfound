// Single source of truth for theme storage + the anti-flash init logic.
//
// The init logic has to run in two very different places: once as a raw
// <script> tag in layout.tsx, before React (or even the page's JS bundle)
// has loaded, so the correct class is on <html> for the very first paint;
// and once inside lib/theme.tsx's ThemeProvider, as normal React/TS code,
// so the toggle can react to state changes. Those two call sites can't
// literally share a function (the inline script can't import anything),
// so instead they share this one constant and this one generator, and
// both read the resolution order from here rather than re-typing it.

export const THEME_STORAGE_KEY = "careerfound-theme";

/**
 * Builds the plain-JS snippet injected into <head> by layout.tsx. Resolves
 * the same way ThemeProvider does on mount: stored preference first, then
 * system preference, defaulting to light. Keep this the only place that
 * logic is written for the pre-hydration path.
 */
export function buildThemeInitScript(): string {
  const key = JSON.stringify(THEME_STORAGE_KEY);
  return `(function(){try{var t=localStorage.getItem(${key});if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}if(t==="dark"){document.documentElement.classList.add("dark");}}catch(e){}})();`;
}
