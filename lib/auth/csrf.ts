/**
 * CSRF protection utilities
 * Validates Origin header to prevent cross-site requests
 */

/**
 * Validate that the request origin matches allowed origins
 */
export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL,
    "http://localhost:3000",
    "http://localhost:3001",
  ].filter(Boolean) as string[];

  if (!origin) {
    // Allow requests without origin (same-origin)
    return true;
  }

  return allowedOrigins.includes(origin);
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
