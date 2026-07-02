"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { getArtifact } from "@/lib/imprints/artifacts";
import { imprintDateLabel, type Imprint } from "@/lib/imprints/types";
import { cn } from "@/lib/utils";
import { useImprints } from "./imprints-provider";

/**
 * The living collection: every imprint rendered as a subtle monochrome glyph,
 * placed only in the empty left/right margins (gutters) beside the centered
 * content — never on top of it. The gutter width is derived from the viewport
 * vs. the content column, so on narrow screens (no real margins) the field is
 * hidden rather than overlapping the text.
 */
const CONTENT_MAX = 1120; // px — protected central content band
const MIN_GUTTER = 76; // px — minimum side space before we place artifacts
const MARKER = 40; // px — marker hit box

export function ImprintField() {
  const { imprints, highlightId } = useImprints();
  const [gutter, setGutter] = React.useState(0);

  React.useEffect(() => {
    const calc = () => setGutter(Math.max(0, (window.innerWidth - CONTENT_MAX) / 2));
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  if (gutter < MIN_GUTTER) return null; // no room beside content — stay hidden

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {imprints.map((im) => (
        <Marker key={im.id} imprint={im} gutter={gutter} highlighted={highlightId === im.id} />
      ))}
    </div>
  );
}

function Marker({
  imprint,
  gutter,
  highlighted,
}: {
  imprint: Imprint;
  gutter: number;
  highlighted: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const artifact = getArtifact(imprint.artifact);
  if (!artifact) return null;
  const Icon = artifact.Icon;

  // Left half of x → left gutter, right half → right gutter. Distance into the
  // gutter is derived from x so admins can nudge artifacts in/out via position.
  const side: "left" | "right" = imprint.x < 0.5 ? "left" : "right";
  const t = side === "left" ? imprint.x / 0.5 : (1 - imprint.x) / 0.5; // 0 outer … 1 inner
  const usable = Math.max(0, gutter - MARKER - 12);
  const inset = 8 + t * usable;

  const positionStyle: React.CSSProperties =
    side === "left"
      ? { left: `${inset}px`, top: `${imprint.y * 100}%` }
      : { right: `${inset}px`, top: `${imprint.y * 100}%` };

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
      className="pointer-events-auto absolute -translate-y-1/2"
      style={positionStyle}
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
            highlighted ? "animate-ping bg-primary/20 ring-2 ring-primary/60" : "bg-transparent",
          )}
        />
        <Icon
          className={cn(
            "h-[22px] w-[22px] transition-transform duration-300 group-hover:scale-110",
            highlighted && "scale-110",
          )}
        />
      </button>

      {/* Tooltip opens toward the content (inward) so it never runs off-screen. */}
      <div
        role="tooltip"
        className={cn(
          "glass absolute top-1/2 z-10 w-52 -translate-y-1/2 rounded-xl p-3 text-left shadow-xl transition-all duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
          side === "left" ? "left-full ml-2" : "right-full mr-2",
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
          <div className="mt-1 text-xs italic text-foreground/80">
            &ldquo;{imprint.message}&rdquo;
          </div>
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
