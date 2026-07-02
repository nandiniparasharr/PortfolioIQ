import { NextRequest, NextResponse } from "next/server";
import { deleteImprint, updateImprint, type ImprintPatch } from "@/lib/imprints/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Verify the moderation secret. Accepts the IMPRINT_ADMIN_TOKEN via an
 * `x-admin-token` header or a `?token=` query param. Returns an error response
 * to send back, or null when authorized.
 */
function authorize(req: NextRequest): NextResponse | null {
  const secret = process.env.IMPRINT_ADMIN_TOKEN;
  if (!secret) {
    return NextResponse.json({ error: "Moderation is not configured." }, { status: 503 });
  }
  const provided =
    req.headers.get("x-admin-token") ?? new URL(req.url).searchParams.get("token");
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return null;
}

/** Moderation: edit an imprint's fields and/or position. */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = authorize(req);
  if (denied) return denied;

  let patch: ImprintPatch;
  try {
    patch = (await req.json()) as ImprintPatch;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { id } = await ctx.params;
  const result = await updateImprint(id, patch);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ imprint: result.imprint }, { status: 200 });
}

/** Moderation: remove an imprint. */
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = authorize(req);
  if (denied) return denied;

  const { id } = await ctx.params;
  const removed = await deleteImprint(id);
  return NextResponse.json({ removed }, { status: removed ? 200 : 404 });
}
