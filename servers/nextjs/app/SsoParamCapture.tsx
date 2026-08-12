'use client';

import { useEffect } from 'react';
import { captureSsoParams } from '@/utils/ssoParams';

/**
 * Runs the SSO param capture from the ROOT layout so it happens regardless of
 * which page the handoff lands on.
 *
 * Mounted at the root rather than in (presentation-generator)/layout.tsx because
 * /sso redirects to "/", which that group's layout does not cover — previously
 * leaving both localStorage keys unset for every SSO handoff. Renders nothing;
 * it exists purely to give the server-rendered root layout a client-side effect.
 */
export function SsoParamCapture() {
  useEffect(() => {
    captureSsoParams();
  }, []);

  return null;
}
