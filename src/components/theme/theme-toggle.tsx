"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/** Accessible dark/light switch with a crossfade between sun and moon. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-muted text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      {/* Render a stable icon until mounted to avoid hydration mismatch. */}
      {mounted ? (
        <>
          <Sun
            className={cn(
              "h-4 w-4 transition-all duration-300",
              isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
            )}
          />
          <Moon
            className={cn(
              "absolute h-4 w-4 transition-all duration-300",
              isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0",
            )}
          />
        </>
      ) : (
        <Sun className="h-4 w-4 opacity-0" />
      )}
    </button>
  );
}
