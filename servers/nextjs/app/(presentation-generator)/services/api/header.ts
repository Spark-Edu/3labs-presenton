export const getUserId = (): string => {
  if (typeof window === 'undefined') return 'local';
  return localStorage.getItem('presenton_user_id') ?? 'local';
};

// Only set when the SSO handoff (app/sso/route.ts) forwarded an orgId claim —
// the older iframe flow never captures one. Mirrors 3labs-api's
// PresentonService.presentonHeaders(), which sends X-Org-Id whenever the
// signed-in user has an org, so a theme/font created via either entry point
// resolves to the same owner key on the FastAPI backend
// (owner_id = x_org_id or x_user_id in theme.py) instead of two disjoint rows.
export const getOrgId = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem('presenton_org_id') ?? undefined;
};

export const getHeader = () => {
  const orgId = getOrgId();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "X-User-Id": getUserId(),
    ...(orgId ? { "X-Org-Id": orgId } : {}),
  };
};

export const getHeaderForFormData = () => {
  const orgId = getOrgId();
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "X-User-Id": getUserId(),
    ...(orgId ? { "X-Org-Id": orgId } : {}),
  };
};
