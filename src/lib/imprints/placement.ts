/**
 * Deterministic-ish scatter placement for artifacts.
 *
 * Positions are stored in normalized [0,1] page coordinates so they stay put
 * across deploys and scale responsively. New placements avoid existing ones by
 * sampling candidates and keeping the one that sits farthest from its nearest
 * neighbour (with a minimum-distance target), so the field never overlaps and
 * fills in organically rather than on a grid.
 */

export type Point = { x: number; y: number };

// Keep artifacts inside a comfortable band and away from the extreme edges.
const X_MIN = 0.04;
const X_MAX = 0.96;
const Y_MIN = 0.04;
const Y_MAX = 0.98;

// Target minimum normalized distance between two artifacts.
const MIN_DIST = 0.11;

function dist2(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function nearest(p: Point, existing: Point[]): number {
  let best = Infinity;
  for (const e of existing) {
    const d = dist2(p, e);
    if (d < best) best = d;
  }
  return best;
}

/**
 * Pick a scatter position that does not overlap `existing`.
 * @param rand injectable RNG (defaults to Math.random) for testability.
 */
export function placeArtifact(existing: Point[], rand: () => number = Math.random): Point {
  const minDist2 = MIN_DIST * MIN_DIST;
  let best: Point | null = null;
  let bestScore = -1;

  // Bias sampling toward the horizontal margins, where site content is sparse,
  // so artifacts feel like background objects rather than covering the text.
  const sample = (): Point => {
    const edgeBias = rand();
    let x: number;
    if (edgeBias < 0.6) {
      // left or right margin
      const left = rand() < 0.5;
      x = left ? X_MIN + rand() * 0.16 : X_MAX - rand() * 0.16;
    } else {
      x = X_MIN + rand() * (X_MAX - X_MIN);
    }
    const y = Y_MIN + rand() * (Y_MAX - Y_MIN);
    return { x, y };
  };

  for (let i = 0; i < 40; i++) {
    const p = sample();
    if (existing.length === 0) return p;
    const near = nearest(p, existing);
    if (near >= minDist2) return p; // comfortably clear — take it
    if (near > bestScore) {
      bestScore = near;
      best = p;
    }
  }

  // Field is dense: return the least-crowded candidate we found.
  return best ?? sample();
}
