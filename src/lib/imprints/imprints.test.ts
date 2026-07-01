import { describe, it, expect } from "vitest";
import { validateImprint } from "./types";
import { placeArtifact, type Point } from "./placement";

describe("validateImprint", () => {
  const base = { artifact: 14, name: "Alex" };

  it("accepts a minimal valid imprint", () => {
    const r = validateImprint(base);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toMatchObject({ artifact: 14, name: "Alex" });
  });

  it("rejects a filled honeypot", () => {
    const r = validateImprint({ ...base, website: "http://spam" });
    expect(r.ok).toBe(false);
  });

  it("rejects an out-of-range artifact", () => {
    expect(validateImprint({ ...base, artifact: 0 }).ok).toBe(false);
    expect(validateImprint({ ...base, artifact: 51 }).ok).toBe(false);
    expect(validateImprint({ ...base, artifact: 2.5 }).ok).toBe(false);
  });

  it("requires a name and caps its length", () => {
    expect(validateImprint({ ...base, name: "" }).ok).toBe(false);
    expect(validateImprint({ ...base, name: "x".repeat(25) }).ok).toBe(false);
  });

  it("normalizes a bare link to https", () => {
    const r = validateImprint({ ...base, link: "linkedin.com/in/x" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.link).toBe("https://linkedin.com/in/x");
  });

  it("rejects an invalid link", () => {
    expect(validateImprint({ ...base, link: "not a url with spaces .." }).ok).toBe(false);
  });

  it("enforces the short-message word cap", () => {
    expect(validateImprint({ ...base, message: "one two three" }).ok).toBe(true);
    expect(validateImprint({ ...base, message: "one two three four five six seven" }).ok).toBe(
      false,
    );
  });

  it("blocks profanity in name and message", () => {
    expect(validateImprint({ ...base, name: "shit" }).ok).toBe(false);
    expect(validateImprint({ ...base, message: "keep shit going" }).ok).toBe(false);
  });
});

describe("placeArtifact", () => {
  it("returns a point inside the allowed band", () => {
    const p = placeArtifact([]);
    expect(p.x).toBeGreaterThanOrEqual(0);
    expect(p.x).toBeLessThanOrEqual(1);
    expect(p.y).toBeGreaterThanOrEqual(0);
    expect(p.y).toBeLessThanOrEqual(1);
  });

  it("does not sit on top of an existing artifact when space is available", () => {
    const existing: Point[] = [{ x: 0.5, y: 0.5 }];
    for (let i = 0; i < 50; i++) {
      const p = placeArtifact(existing);
      const d = Math.hypot(p.x - 0.5, p.y - 0.5);
      expect(d).toBeGreaterThan(0.02);
    }
  });

  it("keeps most placements clear of each other as the field grows", () => {
    const pts: Point[] = [];
    for (let i = 0; i < 30; i++) pts.push(placeArtifact(pts));
    let tooClose = 0;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        if (Math.hypot(pts[i]!.x - pts[j]!.x, pts[i]!.y - pts[j]!.y) < 0.05) tooClose++;
      }
    }
    // With 30 artifacts, overlaps should be rare (best-effort spacing).
    expect(tooClose).toBeLessThan(5);
  });
});
