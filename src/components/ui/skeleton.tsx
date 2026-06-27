import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-surface-muted",
        "after:absolute after:inset-0 after:-translate-x-full after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent after:animate-[shimmer_1.6s_infinite]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
