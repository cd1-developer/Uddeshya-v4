import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* -----------------------------------------
 🧭 ROUTE CONFIGURATION
----------------------------------------- */
const PUBLIC_FRONTEND_ROUTES = ["/"];

const PRIVATE_BACKEND_ROUTES = [
  "/api/balance",
  // "/api/Employee",
  "/api/holiday",
  "/api/leave",
  "/api/reportManager",
];

/* -----------------------------------------
 🔐 HELPERS
----------------------------------------- */

// check exact frontend public paths
function isPublicFrontendRoute(pathname: string): boolean {
  return PUBLIC_FRONTEND_ROUTES.includes(pathname);
}

// wildcard-like match for backend API routes
function isPrivateBackendRoute(pathname: string): boolean {
  return PRIVATE_BACKEND_ROUTES.some((route) => pathname.startsWith(route));
}

function getSessionToken(req: NextRequest): string | undefined {
  return (
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value
  );
}

/* -----------------------------------------
 ⚙️ MIDDLEWARE
----------------------------------------- */

export async function proxy(req: NextRequest) {
  const session = getSessionToken(req);
  const currentPath = req.nextUrl.pathname;

  // Logged-in user visiting public routes → redirect to dashboard
  if (session && isPublicFrontendRoute(currentPath)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Not logged in → block dashboard access
  if (!session && currentPath.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Not logged in → block protected backend API routes
  if (!session && isPrivateBackendRoute(currentPath)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}
