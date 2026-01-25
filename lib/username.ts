/**
 * Username parsing and validation per PRD input flexibility requirements
 */

/**
 * Parse Instagram username from various input formats:
 * - @username
 * - username
 * - https://instagram.com/username
 * - instagram.com/username?hl=en
 */
export function parseInstagramUsername(input: string): string | null {
  if (!input || typeof input !== "string") {
    return null;
  }

  // Trim whitespace
  let cleaned = input.trim();

  // Remove @ prefix if present
  if (cleaned.startsWith("@")) {
    cleaned = cleaned.slice(1);
  }

  // Check if it's a URL
  if (cleaned.includes("instagram.com/") || cleaned.includes("www.instagram.com/")) {
    try {
      // Handle both with and without protocol
      const urlString = cleaned.startsWith("http") ? cleaned : `https://${cleaned}`;
      const url = new URL(urlString);
      
      // Extract username from pathname (e.g., /username/ or /username)
      const pathParts = url.pathname.split("/").filter(Boolean);
      if (pathParts.length > 0) {
        cleaned = pathParts[0];
      } else {
        return null;
      }
    } catch {
      // If URL parsing fails, return null
      return null;
    }
  }

  // Validate username format (Instagram rules: alphanumeric, dots, underscores)
  const usernameRegex = /^[a-zA-Z0-9._]+$/;
  if (!usernameRegex.test(cleaned)) {
    return null;
  }

  // Instagram usernames must be 1-30 characters
  if (cleaned.length < 1 || cleaned.length > 30) {
    return null;
  }

  return cleaned.toLowerCase();
}

/**
 * Validate if a string is a valid Instagram username format
 */
export function isValidUsername(username: string | null): boolean {
  return username !== null && username.length > 0;
}
