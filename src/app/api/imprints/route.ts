import { NextRequest, NextResponse } from "next/server";
import { addImprint, countImprints, listImprints, isPersistent } from "@/lib/imprints/store";
import type { ImprintInput } from "@/lib/imprints/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}

export async function GET() {
  const [imprints, count] = await Promise.all([listImprints(), countImprints()]);
  return NextResponse.json(
    { imprints, count, persistent: isPersistent() },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function POST(req: NextRequest) {
  let body: ImprintInput;
  try {
    body = (await req.json()) as ImprintInput;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const result = await addImprint(body, clientIp(req));
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ imprint: result.imprint }, { status: 201 });
}
