import { NextRequest, NextResponse } from "next/server";
import { verifySsoToken } from "@/app/lib/sso";

// Never strand the user on slides.3labs.ca with no way back — any failure
// here sends them to the login page on the main app, not an error screen
// on this subdomain.
const APP_LOGIN_URL = "https://app.3labs.ca/login";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
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
