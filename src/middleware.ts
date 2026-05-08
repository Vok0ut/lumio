import { auth } from "@/src/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isAuthRoute =
    pathname.startsWith("/api/auth") || pathname === "/login";
  const isApiRoute = pathname.startsWith("/api");
  const isPublicRoute = pathname === "/";

  if (isAuthRoute || isPublicRoute) {
    return NextResponse.next();
  }

  if (!req.auth && isApiRoute) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
