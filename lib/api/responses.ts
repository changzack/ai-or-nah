import { NextResponse } from "next/server";

/**
 * Standard API error response format
 */
export interface ErrorResponse {
  status: "error";
  error: string;
  message: string;
}

/**
 * Standard API success response format
 */
export interface SuccessResponse<T = any> {
  status: "success";
  data: T;
}

/**
 * Creates a standardized error response
 * @param code - Error code (e.g., "invalid_username", "rate_limit_exceeded")
 * @param message - User-friendly error message
 * @param statusCode - HTTP status code (default: 400)
 */
export function errorResponse(
  code: string,
  message: string,
  statusCode: number = 400
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      status: "error",
      error: code,
      message,
    },
    { status: statusCode }
  );
}

/**
 * Creates a standardized success response
 * @param data - Response data
 * @param statusCode - HTTP status code (default: 200)
 */
export function successResponse<T>(
  data: T,
  statusCode: number = 200
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json(
    {
      status: "success",
      data,
    },
    { status: statusCode }
  );
}

/**
 * Common error responses for quick access
 */
export const CommonErrors = {
  // 400 Bad Request
  invalidRequest: (message: string = "Invalid request") =>
    errorResponse("invalid_request", message, 400),

  invalidUsername: (message: string = "Invalid Instagram username") =>
    errorResponse("invalid_username", message, 400),

  invalidEmail: (message: string = "Invalid email address") =>
    errorResponse("invalid_email", message, 400),

  invalidCode: (message: string = "Invalid verification code") =>
    errorResponse("invalid_code", message, 400),

  missingParameter: (param: string) =>
    errorResponse("missing_parameter", `Missing required parameter: ${param}`, 400),

  // 401 Unauthorized
  unauthorized: (message: string = "Unauthorized") =>
    errorResponse("unauthorized", message, 401),

  authRequired: (message: string = "Authentication required") =>
    errorResponse("auth_required", message, 401),

  // 403 Forbidden
  forbidden: (message: string = "Forbidden") =>
    errorResponse("forbidden", message, 403),

  csrfError: (message: string = "Invalid request origin") =>
    errorResponse("csrf_error", message, 403),

  insufficientCredits: (message: string = "Insufficient credits") =>
    errorResponse("insufficient_credits", message, 403),

  // 404 Not Found
  notFound: (message: string = "Resource not found") =>
    errorResponse("not_found", message, 404),

  usernameNotFound: (message: string = "Instagram username not found") =>
    errorResponse("username_not_found", message, 404),

  // 429 Too Many Requests
  rateLimitExceeded: (message: string = "Rate limit exceeded") =>
    errorResponse("rate_limit_exceeded", message, 429),

  // 500 Internal Server Error
  internalError: (message: string = "Internal server error") =>
    errorResponse("internal_error", message, 500),

  databaseError: (message: string = "Database error") =>
    errorResponse("database_error", message, 500),

  externalApiError: (message: string = "External API error") =>
    errorResponse("external_api_error", message, 500),
} as const;
