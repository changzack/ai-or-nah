import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SESSION } from "../constants";
import type { SessionPayload } from "../types";

/**
 * Session management using JWT stored in HTTP-only cookies
 */

const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || "default-secret-key-change-me"
);

/**
 * Create a session for a customer
 */
export async function createSession(
  email: string,
  customerId: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION.EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const payload: SessionPayload = {
    email,
    customerId,
    exp: Math.floor(expiresAt.getTime() / 1000),
  };

  // Sign JWT
  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(payload.exp)
    .sign(SECRET_KEY);

  // Set HTTP-only cookie
  (await cookies()).set(SESSION.COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

/**
 * Get the current session
 * Returns null if no session or session is invalid
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION.COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as SessionPayload;
  } catch (error) {
    console.error("[session] Invalid or expired session:", error);
    return null;
  }
}

/**
 * Clear the current session (logout)
 */
export async function clearSession(): Promise<void> {
  (await cookies()).delete(SESSION.COOKIE_NAME);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

/**
 * Get customer ID from session
 * Returns null if not authenticated
 */
export async function getCustomerId(): Promise<string | null> {
  const session = await getSession();
  return session?.customerId || null;
}

/**
 * Get email from session
 * Returns null if not authenticated
 */
export async function getEmail(): Promise<string | null> {
  const session = await getSession();
  return session?.email || null;
}
