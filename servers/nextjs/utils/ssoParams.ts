/**
 * Captures the identity/return params handed over by 3labs-api's SSO redirect
 * (app/sso/route.ts) and by the older iframe flow (SlideCreatorPage.tsx, which
 * passes ?userId= straight onto /upload).
 *
 * Kept as a standalone helper rather than living inside ConfigurationInitializer
 * because the two entry points land on different routes: the iframe flow lands
 * inside the (presentation-generator) group, where ConfigurationInitializer is
 * mounted, but the SSO flow lands on "/", which is served by app/page.tsx under
 * the ROOT layout and never mounted it. Sharing one helper lets the root layout
 * run the capture for every destination without also duplicating
 * ConfigurationInitializer's config-fetch/redirect logic.
 *
 * Idempotent by design: it only writes when a param is present, and writing the
 * same value twice is a no-op, so it is safe for this to run once at the root
 * layout and again inside the group on the same navigation.
 */
export function captureSsoParams(): void {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);

  const userId = params.get('userId');
  if (userId) {
    localStorage.setItem('presenton_user_id', userId);
  }

  // Only the SSO entry point sends `orgId` (app/sso/route.ts, forwarding the
  // signed token's claims.orgId) — the older iframe flow never captures one,
  // same as `return` below. Read back by header.ts's getOrgId() to send
  // X-Org-Id on every API call, mirroring 3labs-api's
  // PresentonService.presentonHeaders() for the same account.
  const orgId = params.get('orgId');
  if (orgId) {
    localStorage.setItem('presenton_org_id', orgId);
  }

  // Only the SSO entry point sends `return`; the iframe flow never does, so this
  // stays a no-op for that path. Read back by PresentationHeader's
  // "Back to 3Labs" button.
  const returnUrl = params.get('return');
  if (returnUrl) {
    localStorage.setItem('presenton_return_url', returnUrl);
  }
}
