"use client";

import * as React from "react";
import { formatTimeIST } from "@/lib/format";

/** Live clock showing the platform's default timezone (IST). */
export function ISTClock() {
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="hidden items-center gap-1.5 text-2xs text-muted-foreground sm:flex"
      title="Platform time (Indian Standard Time)"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-positive" />
      <span className="tabular">{now ? formatTimeIST(now) : "—— IST"}</span>
    </div>
  );
}
