"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Root error boundary. Keeps a failed render contained and recoverable. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-32 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-negative/10">
        <AlertTriangle className="h-6 w-6 text-negative" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight">Something went wrong</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        An unexpected error occurred. You can retry the operation below.
      </p>
      <Button onClick={reset} variant="outline" className="mt-5">
        Try again
      </Button>
    </div>
  );
}
