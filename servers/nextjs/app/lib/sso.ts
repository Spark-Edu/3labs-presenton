import crypto from "crypto";

export interface SsoClaims {
  sub: string; // 3labs user._id
  orgId: string;
  role: string;
  email: string;
  exp: number; // unix seconds
}

function base64UrlDecode(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64");
}

/**
 * Verifies a standard HS256 JWT (header.payload.signature) issued by
 * 3labs-api's GET /api/presenton/sso-token endpoint.
 *
 * No JWT library is used on purpose — servers/nextjs has no jsonwebtoken/jose
 * dependency today, and this check is small enough not to justify adding one.
 * The signature is always recomputed with HMAC-SHA256 regardless of what the
 * token's own header claims, so there is no algorithm-confusion surface.
 */
export function verifySsoToken(
  token: string,
  secret: string
): SsoClaims | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, signatureB64] = parts;

  let expectedSignature: Buffer;
  let actualSignature: Buffer;
  try {
    expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest();
    actualSignature = base64UrlDecode(signatureB64);
  } catch {
    return null;
  }

  if (
    expectedSignature.length !== actualSignature.length ||
    !crypto.timingSafeEqual(expectedSignature, actualSignature)
  ) {
    return null;
  }

  let payload: SsoClaims;
  try {
    payload = JSON.parse(base64UrlDecode(payloadB64).toString("utf8"));
  } catch {
    return null;
  }

  if (!payload || typeof payload.sub !== "string" || !payload.sub) return null;
  if (typeof payload.exp !== "number") return null;
  if (Date.now() / 1000 > payload.exp) return null; // expired

  return payload;
}
