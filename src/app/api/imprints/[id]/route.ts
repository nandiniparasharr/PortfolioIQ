import { NextRequest, NextResponse } from "next/server";
import { deleteImprint } from "@/lib/imprints/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Moderation endpoint. Requires the IMPRINT_ADMIN_TOKEN secret, supplied either
 * as an `x-admin-token` header or a `?token=` query param. If the env var is
 * unset, deletion is disabled entirely.
 */
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const secret = process.env.IMPRINT_ADMIN_TOKEN;
  if (!secret) {
    return NextResponse.json({ error: "Moderation is not configured." }, { status: 503 });
  }

  const provided =
    req.headers.get("x-admin-token") ?? new URL(req.url).searchParams.get("token");
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const removed = await deleteImprint(id);
  return NextResponse.json({ removed }, { status: removed ? 200 : 404 });
}
