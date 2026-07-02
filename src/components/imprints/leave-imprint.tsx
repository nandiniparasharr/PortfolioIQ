"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Dices, X, Sparkles, MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ARTIFACTS, getArtifact } from "@/lib/imprints/artifacts";
import { LIMITS, validateImprint } from "@/lib/imprints/types";
import { useImprints } from "./imprints-provider";

/**
 * The "Leave an Imprint" surface: a live counter, the primary action that opens
 * the submission modal, and — for returning visitors — a "Find my imprint"
 * shortcut. Placed below the contact cards in the Contact section.
 */
export function LeaveImprint() {
  const { count, myId, imprints, highlight } = useImprints();
  const [open, setOpen] = React.useState(false);

  // Only offer "Find my imprint" when this visitor's imprint actually exists
  // (they left one this session/before, and it hasn't since been removed).
  const hasMyImprint = myId !== null && imprints.some((i) => i.id === myId);

  return (
    <div className="mt-10 border-t border-border/60 pt-8">
      <div className="text-2xs font-semibold uppercase tracking-wider text-primary">
        Leave an imprint
      </div>
      <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
        A living collection of everyone who stopped by
      </h3>
      <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Leave a tiny artifact behind — it&apos;s placed permanently in the background of the site
        for future visitors to discover.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Button onClick={() => setOpen(true)}>
          <Sparkles className="h-4 w-4" />
          Leave an Imprint
        </Button>

        <span className="text-sm tabular text-muted-foreground">
          <span className="font-semibold text-foreground">{count.toLocaleString()}</span>{" "}
          {count === 1 ? "imprint" : "imprints"} left behind
        </span>

        {hasMyImprint && (
          <button
            type="button"
            onClick={() => highlight(myId!)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <MapPin className="h-3.5 w-3.5" />
            Find my imprint
          </button>
        )}
      </div>

      {open && <ImprintModal onClose={() => setOpen(false)} />}
    </div>
  );
}

function ImprintModal({ onClose }: { onClose: () => void }) {
  const { add, highlight } = useImprints();
  const [mounted, setMounted] = React.useState(false);
  const [name, setName] = React.useState("");
  const [link, setLink] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [website, setWebsite] = React.useState(""); // honeypot
  const [artifact, setArtifact] = React.useState<number | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [doneId, setDoneId] = React.useState<string | null>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const chooseRandom = () => {
    const id = 1 + Math.floor(Math.random() * ARTIFACTS.length);
    setArtifact(id);
    setError(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const input = { artifact: artifact ?? 0, name, link, message, website };
    const check = validateImprint(input);
    if (!check.ok) {
      setError(check.error);
      return;
    }
    setSubmitting(true);
    const result = await add(input);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDoneId(result.imprint.id);
  };

  const selected = artifact ? getArtifact(artifact) : undefined;

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="glass relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6 shadow-2xl">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {doneId ? (
          <DonePanel
            artifactId={artifact!}
            onClose={onClose}
            onFind={() => {
              onClose();
              setTimeout(() => highlight(doneId), 250);
            }}
          />
        ) : (
          <form onSubmit={onSubmit}>
            <div className="text-2xs font-semibold uppercase tracking-wider text-primary">
              Leave an imprint
            </div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
              Leave your mark
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A tiny artifact, placed permanently in the background of the site.
            </p>

            {/* Honeypot — visually hidden, off from tab order. */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
            />

            <div className="mt-5 space-y-4">
              <div>
                <Label htmlFor="im-name" className="mb-1.5 block">
                  Name or alias
                </Label>
                <Input
                  id="im-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={LIMITS.nameMax}
                  placeholder="e.g. Nandini"
                  autoFocus
                />
              </div>

              <div>
                <Label htmlFor="im-link" className="mb-1.5 block">
                  Link <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="im-link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  maxLength={LIMITS.linkMax}
                  placeholder="linkedin.com/in/… · github.com/… · your site"
                />
              </div>

              <div>
                <Label htmlFor="im-message" className="mb-1.5 block">
                  Short message <span className="text-muted-foreground">(optional, 3–5 words)</span>
                </Label>
                <Input
                  id="im-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={LIMITS.messageMaxChars}
                  placeholder="Keep building."
                />
              </div>

              {/* Artifact picker */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label className="mb-0">Choose an artifact</Label>
                  <button
                    type="button"
                    onClick={chooseRandom}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    <Dices className="h-3.5 w-3.5" />
                    Choose randomly
                  </button>
                </div>

                {selected && (
                  <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <selected.Icon className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">{selected.name}</span>
                    <span className="text-2xs uppercase tracking-wide">
                      #{String(selected.id).padStart(3, "0")}
                    </span>
                  </div>
                )}

                <div className="grid max-h-48 grid-cols-6 gap-1.5 overflow-y-auto rounded-lg border border-border bg-surface/50 p-2 sm:grid-cols-8">
                  {ARTIFACTS.map((a) => {
                    const Icon = a.Icon;
                    const isSel = artifact === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        title={a.name}
                        aria-label={a.name}
                        aria-pressed={isSel}
                        onClick={() => {
                          setArtifact(a.id);
                          setError(null);
                        }}
                        className={cn(
                          "flex aspect-square items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary",
                          isSel && "bg-primary/15 text-primary ring-1 ring-primary/60",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-negative">{error}</p>}

            <div className="mt-5 flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Placing…" : "Leave imprint"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
}

function DonePanel({
  artifactId,
  onClose,
  onFind,
}: {
  artifactId: number;
  onClose: () => void;
  onFind: () => void;
}) {
  const artifact = getArtifact(artifactId);
  const Icon = artifact?.Icon;
  return (
    <div className="py-4 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
        {Icon ? <Icon className="h-7 w-7" /> : <Check className="h-7 w-7" />}
      </div>
      <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
        Your imprint is placed
      </h2>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
        {artifact ? `Your ${artifact.name} is now` : "It's now"} part of the collection, scattered
        into the background of the site. Thanks for stopping by.
      </p>
      <div className="mt-5 flex items-center justify-center gap-3">
        <Button onClick={onFind}>
          <MapPin className="h-4 w-4" />
          Find my imprint
        </Button>
        <Button variant="outline" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}
