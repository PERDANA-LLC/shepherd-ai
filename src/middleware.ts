import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/app(.*)",
  "/api/assess(.*)",
  "/api/journal(.*)",
  "/api/history(.*)",
  "/api/curriculum(.*)",
  "/api/profile(.*)",
]);

// Routes that are always accessible even without MFA verification
const isMfaExempt = createRouteMatcher([
  "/app/security(.*)", // MFA setup/verify page itself
  "/api/mfa/(.*)",     // MFA API routes
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // ── MFA check ──────────────────────────────────────────────
    // If user has MFA enabled but hasn't verified this session,
    // redirect to the security page
    if (!isMfaExempt(req)) {
      const mfaEnabled = req.cookies.get("mfa_enabled")?.value === "true";
      const mfaVerified = req.cookies.get("mfa_verified")?.value === "true";

      if (mfaEnabled && !mfaVerified) {
        const securityUrl = new URL("/app/security", req.url);
        securityUrl.searchParams.set("mfa_required", "true");
        return NextResponse.redirect(securityUrl);
      }
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
