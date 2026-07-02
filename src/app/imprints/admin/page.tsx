"use client";

import * as React from "react";
import { Trash2, RefreshCw, ShieldCheck, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ARTIFACTS, getArtifact } from "@/lib/imprints/artifacts";
import { imprintDateLabel, LIMITS, type Imprint } from "@/lib/imprints/types";

const TOKEN_KEY = "pilq_admin_token";

/**
 * Moderation console. Not linked from the site. View is public; editing,
 * repositioning and deleting are gated by the IMPRINT_ADMIN_TOKEN secret, which
 * is sent per-request and never stored server-side.
 */
export default function ImprintAdminPage() {
  const [token, setToken] = React.useState("");
  const [imprints, setImprints] = React.useState<Imprint[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
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

  const rememberToken = () => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* ignore */
    }
  };

  const handleErr = (status: number) => {
    if (status === 401) setNote("Invalid admin token.");
    else if (status === 503) setNote("Moderation is not configured (IMPRINT_ADMIN_TOKEN is unset).");
    else setNote("Request failed.");
  };

  const remove = async (id: string) => {
    rememberToken();
    const res = await fetch(`/api/imprints/${id}`, {
      method: "DELETE",
      headers: { "x-admin-token": token },
    });
    if (res.ok) {
      setImprints((prev) => prev.filter((i) => i.id !== id));
      setNote(null);
    } else {
      handleErr(res.status);
    }
  };

  const save = async (id: string, patch: Partial<Imprint>) => {
    rememberToken();
    const res = await fetch(`/api/imprints/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-admin-token": token },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (res.ok) {
      setImprints((prev) => prev.map((i) => (i.id === id ? (data.imprint as Imprint) : i)));
      setEditingId(null);
      setNote(null);
      return true;
    }
    setNote(data?.error ?? "Could not save changes.");
    handleErr(res.status);
    return false;
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center gap-2 text-primary">
        <ShieldCheck className="h-5 w-5" />
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Imprint moderation</h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        View, edit, reposition, or remove imprints. Every change requires your admin token.
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
        {imprints.map((im) =>
          editingId === im.id ? (
            <EditRow
              key={im.id}
              imprint={im}
              onCancel={() => {
                setEditingId(null);
                setNote(null);
              }}
              onSave={(patch) => save(im.id, patch)}
            />
          ) : (
            <ViewRow
              key={im.id}
              imprint={im}
              onEdit={() => {
                setEditingId(im.id);
                setNote(null);
              }}
              onDelete={() => remove(im.id)}
            />
          ),
        )}
      </div>
    </div>
  );
}

function ViewRow({
  imprint: im,
  onEdit,
  onDelete,
}: {
  imprint: Imprint;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const artifact = getArtifact(im.artifact);
  const Icon = artifact?.Icon;
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface/60 p-3">
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
          {`(${Math.round(im.x * 100)}%, ${Math.round(im.y * 100)}%) · `}
          {imprintDateLabel(im.createdAt)}
        </div>
      </div>
      <button
        type="button"
        aria-label={`Edit imprint by ${im.name}`}
        onClick={onEdit}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label={`Delete imprint by ${im.name}`}
        onClick={onDelete}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-negative/10 hover:text-negative"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function EditRow({
  imprint,
  onCancel,
  onSave,
}: {
  imprint: Imprint;
  onCancel: () => void;
  onSave: (patch: Partial<Imprint>) => Promise<boolean>;
}) {
  const [name, setName] = React.useState(imprint.name);
  const [link, setLink] = React.useState(imprint.link ?? "");
  const [message, setMessage] = React.useState(imprint.message ?? "");
  const [artifact, setArtifact] = React.useState(imprint.artifact);
  const [pos, setPos] = React.useState({ x: imprint.x, y: imprint.y });
  const [saving, setSaving] = React.useState(false);

  const submit = async () => {
    setSaving(true);
    await onSave({ name, link, message, artifact, x: pos.x, y: pos.y });
    setSaving(false);
  };

  return (
    <div className="rounded-lg border border-primary/40 bg-surface/70 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <div>
            <Label htmlFor={`n-${imprint.id}`} className="mb-1.5 block">
              Name
            </Label>
            <Input
              id={`n-${imprint.id}`}
              value={name}
              maxLength={LIMITS.nameMax}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`l-${imprint.id}`} className="mb-1.5 block">
              Link
            </Label>
            <Input
              id={`l-${imprint.id}`}
              value={link}
              maxLength={LIMITS.linkMax}
              onChange={(e) => setLink(e.target.value)}
              placeholder="(leave empty to remove)"
            />
          </div>
          <div>
            <Label htmlFor={`m-${imprint.id}`} className="mb-1.5 block">
              Message
            </Label>
            <Input
              id={`m-${imprint.id}`}
              value={message}
              maxLength={LIMITS.messageMaxChars}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="(leave empty to remove)"
            />
          </div>
          <div>
            <Label htmlFor={`a-${imprint.id}`} className="mb-1.5 block">
              Artifact
            </Label>
            <select
              id={`a-${imprint.id}`}
              value={artifact}
              onChange={(e) => setArtifact(Number(e.target.value))}
              className="flex h-9 w-full rounded-md border border-input bg-surface-muted px-3 text-sm text-foreground"
            >
              {ARTIFACTS.map((a) => (
                <option key={a.id} value={a.id}>
                  #{String(a.id).padStart(3, "0")} — {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label className="mb-1.5 block">Position (drag or click)</Label>
          <PositionPad value={pos} onChange={setPos} artifactId={artifact} />
          <div className="mt-2 text-2xs uppercase tracking-wide text-muted-foreground">
            {Math.round(pos.x * 100)}% × {Math.round(pos.y * 100)}%
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button size="sm" onClick={submit} disabled={saving}>
          <Check className="h-4 w-4" />
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

/** A click/drag pad that maps a point to normalized page coordinates. */
function PositionPad({
  value,
  onChange,
  artifactId,
}: {
  value: { x: number; y: number };
  onChange: (p: { x: number; y: number }) => void;
  artifactId: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);
  const Icon = getArtifact(artifactId)?.Icon;

  const update = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (clientY - r.top) / r.height));
    onChange({ x, y });
  };

  return (
    <div
      ref={ref}
      className="relative aspect-[3/4] w-full cursor-crosshair overflow-hidden rounded-lg border border-border bg-surface-muted"
      style={{
        backgroundImage:
          "linear-gradient(to right, hsl(var(--border)/0.5) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)/0.5) 1px, transparent 1px)",
        backgroundSize: "12.5% 12.5%",
      }}
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (dragging.current) update(e.clientX, e.clientY);
      }}
      onPointerUp={(e) => {
        dragging.current = false;
        e.currentTarget.releasePointerCapture(e.pointerId);
      }}
    >
      <span
        className="pointer-events-none absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary/20 text-primary ring-2 ring-primary"
        style={{ left: `${value.x * 100}%`, top: `${value.y * 100}%` }}
      >
        {Icon ? <Icon className="h-4 w-4" /> : null}
      </span>
    </div>
  );
}
