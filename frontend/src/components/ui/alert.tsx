import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function Alert({
  variant = "error",
  children,
  className,
}: {
  variant?: "error" | "info";
  children: React.ReactNode;
  className?: string;
}) {
  const Icon = variant === "error" ? AlertTriangle : Info;
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm",
        variant === "error" ? "border-danger/30 bg-danger/10 text-danger" : "border-accent/30 bg-accent/10 text-accent-light",
        className
      )}
      role={variant === "error" ? "alert" : undefined}
    >
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <span>{children}</span>
    </div>
  );
}
