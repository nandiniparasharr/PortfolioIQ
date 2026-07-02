import { NextRequest, NextResponse } from "next/server";

/**
 * Gate the moderation UI behind HTTP Basic Auth so strangers can't even load
 * the page. The password is the IMPRINT_ADMIN_TOKEN secret (username can be
 * anything). If the token is unset, the feature is treated as disabled and the
 * route 404s. Note: the public GET /api/imprints endpoint lives under /api and
 * is intentionally NOT matched here — the site needs it to render artifacts;
 * the mutating PATCH/DELETE handlers enforce the same token server-side.
 */
export const config = {
  matcher: ["/imprints/:path*"],
};

export function middleware(req: NextRequest) {
  const secret = process.env.IMPRINT_ADMIN_TOKEN;

  // Feature off / not configured → don't even reveal the route exists.
  if (!secret) {
    return new NextResponse("Not found", { status: 404 });
  }

  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6)); // "username:password"
      const password = decoded.slice(decoded.indexOf(":") + 1);
      if (password === secret) {
        return NextResponse.next();
      }
    } catch {
      /* fall through to challenge */
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="PortfolioIQ moderation", charset="UTF-8"',
    },
  });
}
