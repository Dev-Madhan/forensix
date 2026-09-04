import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/cases", "/criminals", "/sketch", "/admin", "/profile", "/settings"];

// Routes only for unauthenticated users
const AUTH_ROUTES = ["/auth", "/signup"];

// Admin-only routes
const ADMIN_ROUTES = ["/admin"];

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const appUrl = request.nextUrl.origin;

  // Check if route is protected or auth-only
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isProtected && !isAuthRoute) {
    return NextResponse.next();
  }

  // Fetch session from Better Auth — single call, reuse result for all checks
  let session = null;
  let user = null;
  try {
    const sessionResponse = await auth.api.getSession({ headers: request.headers });
    session = sessionResponse?.session ?? null;
    user = sessionResponse?.user ?? null;
  } catch (error) {
    console.error("[Proxy] Session check error:", error);
  }

  // Unauthenticated user trying to access protected route
  if (isProtected && !session) {
    const loginUrl = new URL("/auth", appUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user trying to access auth routes
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/", appUrl));
  }

  // Admin-only route authorization check
  if (
    session &&
    user &&
    ADMIN_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    )
  ) {
    if (user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/cases", appUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|api/).*)",
  ],
};
