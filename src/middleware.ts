import { NextResponse, type NextRequest } from "next/server";

/** El panel de indicadores se protege con usuario y contraseña (PANEL_USER / PANEL_PASSWORD). */
export function middleware(req: NextRequest) {
  const user = process.env.PANEL_USER, pass = process.env.PANEL_PASSWORD;
  if (!user || !pass) return new NextResponse("Panel no configurado", { status: 503 });
  const auth = req.headers.get("authorization") ?? "";
  const [scheme, encoded] = auth.split(" ");
  if (scheme === "Basic" && encoded) {
    const [u, ...rest] = atob(encoded).split(":");
    if (u === user && rest.join(":") === pass) {
      const res = NextResponse.next();
      res.headers.set("Cache-Control", "private, no-store");
      return res;
    }
  }
  return new NextResponse("Acceso restringido", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Panel", charset="UTF-8"' } });
}

export const config = { matcher: ["/panel/:path*"] };
