import { NextRequest, NextResponse } from "next/server";
import { verifySsoToken } from "@/app/lib/sso";

// Never strand the user on slides.3labs.ca with no way back — any failure
// here sends them to the login page on the main app, not an error screen
// on this subdomain.
const APP_LOGIN_URL = "https://app.3labs.ca/login";

// `new URL(request.url).origin` reflects the Host header Next.js's own HTTP
// server sees, which behind Railway's proxy is the container's internal
// bind address (localhost:3000), not the public host — confirmed 2026-08-12,
// this shipped a redirect straight to https://localhost:3000/. Railway (like
// any standard reverse proxy) sets X-Forwarded-Host/-Proto correctly, so
// prefer those when present.
function getPublicOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return new URL(request.url).origin;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = getPublicOrigin(request);
  const token = searchParams.get("token");
  const returnUrl = searchParams.get("return");

  const secret = process.env.SSO_SIGNING_SECRET;
  if (!secret) {
    console.error("[sso] SSO_SIGNING_SECRET is not configured");
    return NextResponse.redirect(APP_LOGIN_URL);
  }

  if (!token) {
    return NextResponse.redirect(APP_LOGIN_URL);
  }

  const claims = verifySsoToken(token, secret);
  if (!claims) {
    // Invalid signature or expired token
    return NextResponse.redirect(APP_LOGIN_URL);
  }

  // Hand off into the existing ConfigurationInitializer.tsx `?userId=` capture
  // (the same mechanism the lesson-creation iframe flow already relies on) —
  // deliberately not introducing a parallel session/cookie mechanism here.
  // The difference from the iframe flow's URL param is that this value has
  // just passed signature + expiry verification, not that the destination
  // page treats it any differently once it arrives.
  const destination = new URL("/", origin);
  destination.searchParams.set("userId", claims.sub);
  if (returnUrl) {
    destination.searchParams.set("return", returnUrl);
  }

  return NextResponse.redirect(destination);
}
