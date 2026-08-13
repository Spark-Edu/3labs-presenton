'use client';

import { useEffect, useState } from 'react';

/**
 * slides.3labs.ca has no server-side session of its own — the entire identity
 * model is a `presenton_user_id` value in localStorage, written by
 * captureSsoParams() (see utils/ssoParams.ts) from a `?userId=` query param
 * handed over by either the SSO handoff (app/sso/route.ts) or the older
 * iframe flow. Until this guard, anyone who landed here directly — with that
 * value missing or cleared — could still browse/create/delete decks with no
 * identity check at all. This blocks rendering of the whole app for that case
 * and bounces to app.3labs.ca instead, mirroring the redirect target
 * app/sso/route.ts already uses on token-verification failure.
 */
const APP_URL = 'https://app.3labs.ca';

type Status = 'checking' | 'authorized' | 'unauthorized';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    // Read the URL directly rather than relying only on localStorage, so a
    // fresh SSO landing on "/" with ?userId=... authorizes immediately
    // instead of racing SsoParamCapture's effect to persist it first.
    const hasFreshParam = !!new URLSearchParams(window.location.search).get('userId');
    const hasStoredIdentity = !!localStorage.getItem('presenton_user_id');

    if (hasFreshParam || hasStoredIdentity) {
      setStatus('authorized');
    } else {
      setStatus('unauthorized');
      window.location.href = APP_URL;
    }
  }, []);

  // Render nothing for both "checking" and "unauthorized" — an unauthenticated
  // visitor should never see so much as a flash of dashboard/editor content
  // before the redirect above takes effect.
  if (status !== 'authorized') {
    return null;
  }

  return children;
}
