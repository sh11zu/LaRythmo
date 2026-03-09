// proxy.js
// Middleware pour gérer les redirections basées sur la présence du cookie d'authentification

import { NextResponse } from "next/server";

export function proxy(request) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("auth_token")?.value;

  // Routes publiques (laisse passer)
  const isPublic =
    path === "/login" ||
    path === "/";

  // Si pas token et route non publique -> login
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Si token et login -> dashboard
  if (token && path === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Vérifier le rôle pour les routes /admin
  if (token && path.startsWith("/admin")) {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
      if (payload.role !== 'ADMIN' && payload.role !== 'SYS_ADMIN') {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match TOUT sauf /api, les fichiers Next, favicon, etc.
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
