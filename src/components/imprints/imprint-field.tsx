"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { getArtifact } from "@/lib/imprints/artifacts";
import { imprintDateLabel, type Imprint } from "@/lib/imprints/types";
import { cn } from "@/lib/utils";
import { useImprints } from "./imprints-provider";

/**
 * The living collection: every imprint rendered as a subtle monochrome glyph
 * scattered across the page. Sits above content in a pointer-events-none layer
 * so the markers stay hoverable while clicks fall through to the site; markers
 * themselves re-enable pointer events. Kept low-opacity so content leads.
 */
export function ImprintField() {
  const { imprints, highlightId } = useImprints();

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden={false}>
      {imprints.map((im) => (
        <Marker key={im.id} imprint={im} highlighted={highlightId === im.id} />
      ))}
    </div>
  );
}

function Marker({ imprint, highlighted }: { imprint: Imprint; highlighted: boolean }) {
  const [open, setOpen] = React.useState(false);
  const artifact = getArtifact(imprint.artifact);
  if (!artifact) return null;
  const Icon = artifact.Icon;

  // Flip the tooltip toward the center so it never runs off the page edges.
  const alignRight = imprint.x > 0.5;
  const below = imprint.y < 0.22;

  let host = "";
  if (imprint.link) {
    try {
      host = new URL(imprint.link).hostname.replace(/^www\./, "");
    } catch {
      host = imprint.link;
    }
  }

  return (
    <div
      id={`imprint-${imprint.id}`}
      className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${imprint.x * 100}%`, top: `${imprint.y * 100}%` }}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={`Artifact: ${artifact.name}, left by ${imprint.name}`}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "group relative flex h-9 w-9 items-center justify-center rounded-full text-foreground/25 transition-all duration-300 hover:text-primary focus:outline-none focus-visible:text-primary",
          highlighted && "text-primary",
        )}
      >
        <span
          className={cn(
            "absolute inset-0 rounded-full transition-all duration-500",
            highlighted
              ? "animate-ping bg-primary/20 ring-2 ring-primary/60"
              : "bg-transparent",
          )}
        />
        <Icon
          className={cn(
            "h-[22px] w-[22px] transition-transform duration-300 group-hover:scale-110",
            highlighted && "scale-110",
          )}
        />
      </button>

      {/* Tooltip / artifact card */}
      <div
        role="tooltip"
        className={cn(
          "glass absolute z-10 w-52 rounded-xl p-3 text-left shadow-xl transition-all duration-200",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-1 opacity-0",
          below ? "top-11" : "bottom-11",
          alignRight ? "right-1/2 translate-x-1/2 sm:right-4 sm:translate-x-0" : "left-1/2 -translate-x-1/2 sm:left-4 sm:translate-x-0",
        )}
      >
        <div className="text-2xs font-semibold uppercase tracking-wider text-primary">
          Artifact #{String(imprint.artifact).padStart(3, "0")}
        </div>
        <div className="mt-0.5 text-sm font-semibold tracking-tight text-foreground">
          {artifact.name}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">Left by {imprint.name}</div>
        {imprint.message && (
          <div className="mt-1 text-xs italic text-foreground/80">&ldquo;{imprint.message}&rdquo;</div>
        )}
        <div className="mt-1 text-2xs uppercase tracking-wide text-muted-foreground/70">
          {imprintDateLabel(imprint.createdAt)}
        </div>
        {imprint.link && (
          <a
            href={imprint.link}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            {host}
          </a>
        )}
      </div>
    </div>
  );
}
