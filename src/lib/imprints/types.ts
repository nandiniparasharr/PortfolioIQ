import { ARTIFACT_COUNT } from "./artifacts";

/** A single imprint left by a visitor. */
export type Imprint = {
  id: string;
  artifact: number; // 1..ARTIFACT_COUNT
  name: string;
  link?: string;
  message?: string;
  createdAt: number; // epoch ms
  x: number; // normalized 0..1 (page width)
  y: number; // normalized 0..1 (page height)
};

/** What the client sends when leaving an imprint. */
export type ImprintInput = {
  artifact: number;
  name: string;
  link?: string;
  message?: string;
  /** Honeypot — must be empty. Bots tend to fill every field. */
  website?: string;
};

export const LIMITS = {
  nameMax: 24,
  messageMaxChars: 40,
  messageMaxWords: 6,
  linkMax: 200,
} as const;

const PROFANITY = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "cunt",
  "nigger",
  "faggot",
  "retard",
  "slut",
  "whore",
];

function hasProfanity(text: string): boolean {
  const t = text.toLowerCase();
  return PROFANITY.some((w) => t.includes(w));
}

export type ValidationResult =
  | { ok: true; value: { artifact: number; name: string; link?: string; message?: string } }
  | { ok: false; error: string };

/** Validate and normalize a submission. Shared by client and server. */
export function validateImprint(input: ImprintInput): ValidationResult {
  // Honeypot: silently reject bots.
  if (input.website && input.website.trim() !== "") {
    return { ok: false, error: "Rejected." };
  }

  const artifact = Number(input.artifact);
  if (!Number.isInteger(artifact) || artifact < 1 || artifact > ARTIFACT_COUNT) {
    return { ok: false, error: "Please choose an artifact." };
  }

  const name = (input.name ?? "").trim();
  if (name.length === 0) return { ok: false, error: "Please add a name or alias." };
  if (name.length > LIMITS.nameMax) {
    return { ok: false, error: `Name must be ${LIMITS.nameMax} characters or fewer.` };
  }
  if (hasProfanity(name)) return { ok: false, error: "Please choose a different name." };

  let link: string | undefined;
  const rawLink = (input.link ?? "").trim();
  if (rawLink.length > 0) {
    if (rawLink.length > LIMITS.linkMax) {
      return { ok: false, error: "That link is too long." };
    }
    const normalized = /^https?:\/\//i.test(rawLink) ? rawLink : `https://${rawLink}`;
    try {
      const url = new URL(normalized);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return { ok: false, error: "Link must be a valid web address." };
      }
      link = url.toString();
    } catch {
      return { ok: false, error: "Link must be a valid web address." };
    }
  }

  let message: string | undefined;
  const rawMsg = (input.message ?? "").trim().replace(/\s+/g, " ");
  if (rawMsg.length > 0) {
    if (rawMsg.length > LIMITS.messageMaxChars) {
      return { ok: false, error: `Message must be ${LIMITS.messageMaxChars} characters or fewer.` };
    }
    if (rawMsg.split(" ").length > LIMITS.messageMaxWords) {
      return { ok: false, error: `Keep it short — ${LIMITS.messageMaxWords} words or fewer.` };
    }
    if (hasProfanity(rawMsg)) return { ok: false, error: "Please reword your message." };
    message = rawMsg;
  }

  return { ok: true, value: { artifact, name, link, message } };
}

/** A friendly "Month YYYY" label for a tooltip. */
export function imprintDateLabel(createdAt: number): string {
  return new Date(createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
