"use client";

import * as React from "react";
import { Trash2, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getArtifact } from "@/lib/imprints/artifacts";
import { imprintDateLabel, type Imprint } from "@/lib/imprints/types";

const TOKEN_KEY = "pilq_admin_token";

/**
 * Lightweight moderation console. Not linked from the site and not indexed;
 * every destructive action is gated by the IMPRINT_ADMIN_TOKEN secret, which is
 * sent per-request and never stored server-side.
 */
export default function ImprintAdminPage() {
  const [token, setToken] = React.useState("");
  const [imprints, setImprints] = React.useState<Imprint[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [note, setNote] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(TOKEN_KEY);
      if (saved) setToken(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const load = React.useCallback(async () => {
    setLoading(true);
    setNote(null);
    try {
      const res = await fetch("/api/imprints", { cache: "no-store" });
      const data = await res.json();
      setImprints((data.imprints ?? []).slice().reverse());
    } catch {
      setNote("Failed to load imprints.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const remove = async (id: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* ignore */
    }
    const res = await fetch(`/api/imprints/${id}`, {
      method: "DELETE",
      headers: { "x-admin-token": token },
    });
    if (res.ok) {
      setImprints((prev) => prev.filter((i) => i.id !== id));
      setNote(null);
    } else if (res.status === 401) {
      setNote("Invalid admin token.");
    } else if (res.status === 503) {
      setNote("Moderation is not configured (IMPRINT_ADMIN_TOKEN is unset).");
    } else {
      setNote("Could not delete that imprint.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center gap-2 text-primary">
        <ShieldCheck className="h-5 w-5" />
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Imprint moderation</h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Review and remove imprints. Deletion requires your admin token.
      </p>

      <div className="mt-6 flex items-end gap-3">
        <div className="flex-1">
          <Label htmlFor="tok" className="mb-1.5 block">
            Admin token
          </Label>
          <Input
            id="tok"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="IMPRINT_ADMIN_TOKEN"
          />
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {note && <p className="mt-3 text-sm text-negative">{note}</p>}

      <div className="mt-6 space-y-2">
        {imprints.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground">No imprints yet.</p>
        )}
        {imprints.map((im) => {
          const artifact = getArtifact(im.artifact);
          const Icon = artifact?.Icon;
          return (
            <div
              key={im.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface/60 p-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                {Icon ? <Icon className="h-5 w-5" /> : null}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-foreground">{im.name}</span>
                  <span className="text-2xs uppercase tracking-wide text-muted-foreground">
                    {artifact?.name} · #{String(im.artifact).padStart(3, "0")}
                  </span>
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {im.message ? `“${im.message}” · ` : ""}
                  {im.link ? `${im.link} · ` : ""}
                  {imprintDateLabel(im.createdAt)}
                </div>
              </div>
              <button
                type="button"
                aria-label={`Delete imprint by ${im.name}`}
                onClick={() => remove(im.id)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-negative/10 hover:text-negative"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
