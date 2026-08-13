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

// `dest` (e.g. "/dashboard") is where inside Presenton to land after the
// handoff, as opposed to `return`, which is where the in-app "back to
// 3Labs" button sends the user. It crosses a network hop from 3labs-api
// (which applies the same check before setting it), so re-validate here
// too: only a same-app relative path is acceptable. Anything else —
// missing, absolute, protocol-relative ("//evil.com"), containing "://", or
// containing a backslash a browser could normalize into a slash — falls
// back to "/" rather than being handed to `new URL()`, where an
// unvalidated value could otherwise produce a redirect off this domain.
function safeDest(dest: string | null): string {
  if (!dest) return "/";
  if (!dest.startsWith("/")) return "/";
  if (dest.startsWith("//")) return "/";
  if (dest.includes("://") || dest.includes("\\")) return "/";
  return dest;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = getPublicOrigin(request);
  const token = searchParams.get("token");
  const returnUrl = searchParams.get("return");
  const dest = safeDest(searchParams.get("dest"));

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

  // Hand off into the `?userId=` capture in utils/ssoParams.ts, run from the
  // root layout via app/SsoParamCapture.tsx (the same mechanism the
  // lesson-creation iframe flow already relies on, which additionally runs it
  // from ConfigurationInitializer.tsx) — deliberately not introducing a
  // parallel session/cookie mechanism here. Note the capture must be reachable
  // from the ROOT layout: a bare "/" redirect (the default when `dest` is
  // absent) is served by app/page.tsx under the ROOT layout, which the
  // (presentation-generator) group's layout does not cover; a `dest` target
  // like "/dashboard" lives inside that group and is covered instead.
  // The difference from the iframe flow's URL param is that this value has
  // just passed signature + expiry verification, not that the destination
  // page treats it any differently once it arrives. AuthGuard (app/AuthGuard.tsx)
  // reads `userId` directly off the URL, so landing straight on `dest` with
  // that param attached authorizes immediately, same as landing on "/".
  const destination = new URL(dest, origin);
  destination.searchParams.set("userId", claims.sub);
  if (returnUrl) {
    destination.searchParams.set("return", returnUrl);
  }

  return NextResponse.redirect(destination);
}
