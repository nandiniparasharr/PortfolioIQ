import "server-only";
import { Redis } from "@upstash/redis";
import { Imprint, ImprintInput, validateImprint } from "./types";
import { placeArtifact, Point } from "./placement";

/*
 * Persistence for imprints.
 *
 * Prefers Upstash Redis (via the Vercel Marketplace integration, which injects
 * KV_REST_API_URL / KV_REST_API_TOKEN, or the native UPSTASH_REDIS_REST_* pair).
 * When no credentials are present (e.g. local dev / preview before the DB is
 * wired), it transparently falls back to a process-memory store so the UI keeps
 * working — those imprints simply don't persist across restarts/deploys.
 */

const HASH_KEY = "imprints:v1";
const RATE_PREFIX = "imprints:rl:";
const RATE_LIMIT = 3; // max new imprints ...
const RATE_WINDOW_SECONDS = 60 * 60; // ... per hour per IP

function readRedisEnv(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return { url, token };
  return null;
}

let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (redis) return redis;
  const env = readRedisEnv();
  if (!env) return null;
  redis = new Redis({ url: env.url, token: env.token });
  return redis;
}

export function isPersistent(): boolean {
  return readRedisEnv() !== null;
}

/* ------------------------------------------------------------------ *
 * In-memory fallback (module-scoped; survives within a warm instance)
 * ------------------------------------------------------------------ */
const mem = new Map<string, Imprint>();
const memRate = new Map<string, { count: number; resetAt: number }>();

function memRateHit(ip: string): boolean {
  const now = Date.now();
  const cur = memRate.get(ip);
  if (!cur || cur.resetAt < now) {
    memRate.set(ip, { count: 1, resetAt: now + RATE_WINDOW_SECONDS * 1000 });
    return true;
  }
  if (cur.count >= RATE_LIMIT) return false;
  cur.count += 1;
  return true;
}

/* ------------------------------------------------------------------ */

function newId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  ).toLowerCase();
}

export async function listImprints(): Promise<Imprint[]> {
  const r = getRedis();
  let items: Imprint[];
  if (r) {
    const map = await r.hgetall<Record<string, Imprint>>(HASH_KEY);
    items = map ? Object.values(map) : [];
  } else {
    items = Array.from(mem.values());
  }
  return items.sort((a, b) => a.createdAt - b.createdAt);
}

export async function countImprints(): Promise<number> {
  const r = getRedis();
  if (r) return (await r.hlen(HASH_KEY)) ?? 0;
  return mem.size;
}

export async function getImprint(id: string): Promise<Imprint | null> {
  const r = getRedis();
  if (r) return (await r.hget<Imprint>(HASH_KEY, id)) ?? null;
  return mem.get(id) ?? null;
}

async function checkRate(ip: string): Promise<boolean> {
  const r = getRedis();
  if (!r) return memRateHit(ip);
  const key = RATE_PREFIX + ip;
  const count = await r.incr(key);
  if (count === 1) await r.expire(key, RATE_WINDOW_SECONDS);
  return count <= RATE_LIMIT;
}

export type AddResult =
  | { ok: true; imprint: Imprint }
  | { ok: false; status: number; error: string };

export async function addImprint(input: ImprintInput, ip: string): Promise<AddResult> {
  const valid = validateImprint(input);
  if (!valid.ok) return { ok: false, status: 400, error: valid.error };

  const allowed = await checkRate(ip);
  if (!allowed) {
    return {
      ok: false,
      status: 429,
      error: "You've left a few imprints already — please come back a little later.",
    };
  }

  const existing = await listImprints();
  const points: Point[] = existing.map((i) => ({ x: i.x, y: i.y }));
  const pos = placeArtifact(points);

  const imprint: Imprint = {
    id: newId(),
    artifact: valid.value.artifact,
    name: valid.value.name,
    link: valid.value.link,
    message: valid.value.message,
    createdAt: Date.now(),
    x: pos.x,
    y: pos.y,
  };

  const r = getRedis();
  if (r) {
    await r.hset(HASH_KEY, { [imprint.id]: imprint });
  } else {
    mem.set(imprint.id, imprint);
  }
  return { ok: true, imprint };
}

/** Fields an admin may edit. */
export type ImprintPatch = Partial<{
  name: string;
  link: string;
  message: string;
  artifact: number;
  x: number;
  y: number;
}>;

export type UpdateResult =
  | { ok: true; imprint: Imprint }
  | { ok: false; status: number; error: string };

/** Moderation: edit an existing imprint's details and/or position. */
export async function updateImprint(id: string, patch: ImprintPatch): Promise<UpdateResult> {
  const existing = await getImprint(id);
  if (!existing) return { ok: false, status: 404, error: "Imprint not found." };

  // Re-validate the (merged) text fields and artifact via the shared validator.
  const merged = {
    artifact: patch.artifact ?? existing.artifact,
    name: patch.name ?? existing.name,
    link: patch.link ?? existing.link ?? "",
    message: patch.message ?? existing.message ?? "",
    website: "",
  };
  const valid = validateImprint(merged);
  if (!valid.ok) return { ok: false, status: 400, error: valid.error };

  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const updated: Imprint = {
    ...existing,
    artifact: valid.value.artifact,
    name: valid.value.name,
    link: valid.value.link,
    message: valid.value.message,
    x: typeof patch.x === "number" && Number.isFinite(patch.x) ? clamp(patch.x) : existing.x,
    y: typeof patch.y === "number" && Number.isFinite(patch.y) ? clamp(patch.y) : existing.y,
  };

  const r = getRedis();
  if (r) {
    await r.hset(HASH_KEY, { [id]: updated });
  } else {
    mem.set(id, updated);
  }
  return { ok: true, imprint: updated };
}

/** Moderation: remove an imprint. */
export async function deleteImprint(id: string): Promise<boolean> {
  const r = getRedis();
  if (r) {
    const removed = await r.hdel(HASH_KEY, id);
    return removed > 0;
  }
  return mem.delete(id);
}
