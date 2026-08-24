import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-[rgb(var(--fg-tint)/0.06)]", className)} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[rgb(var(--fg-tint)/0.08)] bg-[rgb(var(--fg-tint)/0.03)] p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}
