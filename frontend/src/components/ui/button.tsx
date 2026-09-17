import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  // The primary CTA is CareerFound's single most-repeated visual moment
  // (hero, every paywall, every card footer), so it carries the brand's
  // signature touch: a resting glow (shadow-glow, otherwise unused in the
  // codebase before this) instead of a flat shadow, and any trailing icon
  // (ArrowRight, mainly) nudges forward on hover/focus - a small, purposeful
  // "this leads somewhere" cue rather than a generic color-swap hover.
  primary:
    "bg-accent text-white shadow-glow hover:bg-accent-dark hover:shadow-card active:shadow-none active:translate-y-px [&>svg:last-child]:transition-transform [&>svg:last-child]:duration-200 hover:[&>svg:last-child]:translate-x-0.5",
  secondary:
    "bg-transparent text-ink-100 border border-[rgb(var(--fg-tint)/0.14)] hover:border-accent/40 hover:text-accent-light active:translate-y-px",
  ghost: "bg-transparent text-ink-300 hover:text-ink-100 hover:bg-[rgb(var(--fg-tint)/0.05)] active:translate-y-px",
  danger: "bg-danger/90 text-white shadow-xs hover:bg-danger hover:shadow-card active:translate-y-px",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 rounded-lg gap-1.5",
  md: "text-sm px-4 py-2.5 rounded-xl gap-2",
  lg: "text-base px-6 py-3.5 rounded-xl gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150 ease-smooth focus-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
