/**
 * CSRF protection utilities
 * Validates Origin header to prevent cross-site requests
 */

/**
 * Validate that the request origin matches allowed origins
 */
export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");

  // Build allowed origins list
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const allowedOrigins = [
    siteUrl,
    siteUrl?.replace(/\/$/, ""), // Remove trailing slash if present
    "http://localhost:3000",
    "http://localhost:3001",
  ].filter(Boolean) as string[];

  // Also allow www variant if site URL is set
  if (siteUrl) {
    const url = new URL(siteUrl);
    if (!url.hostname.startsWith("www.")) {
      allowedOrigins.push(`${url.protocol}//www.${url.hostname}`);
    } else {
      allowedOrigins.push(`${url.protocol}//${url.hostname.replace("www.", "")}`);
    }
  }

  if (!origin) {
    // Allow requests without origin (same-origin)
    return true;
  }

  const isValid = allowedOrigins.includes(origin);

  if (!isValid) {
    console.error("[csrf] Origin validation failed");
  }

  return isValid;
}

/**
 * Create a 403 response for CSRF violations
 */
export function createCsrfError(): Response {
  return new Response(
    JSON.stringify({
      status: "error",
      error: "csrf_violation",
      message: "Invalid request origin",
    }),
    {
      status: 403,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * Validate request origin and return error response if invalid
 * Returns null if validation passes
 *
 * @example
 * const csrfError = checkCsrf(request);
 * if (csrfError) return csrfError;
 */
export function checkCsrf(request: Request): Response | null {
  if (!validateOrigin(request)) {
    return createCsrfError();
  }
  return null;
}
