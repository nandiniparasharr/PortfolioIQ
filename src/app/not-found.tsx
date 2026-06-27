import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-32 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-muted">
        <Compass className="h-6 w-6 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight">Page not found</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        The page you are looking for does not exist or has moved.
      </p>
      <Button asChild className="mt-5">
        <Link href="/">Return home</Link>
      </Button>
    </div>
  );
}
