import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "jt_session";

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export async function signSession() {
  const key = secretKey();
  if (!key) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new SignJWT({ role: "owner" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("owner")
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);
}

export async function verifySession(token: string) {
  const key = secretKey();
  if (!key) return false;
  try {
    const { payload } = await jwtVerify(token, key);
    return payload.sub === "owner";
  } catch {
    return false;
  }
}
