/**
 * Google OAuth Authentication Helpers
 * 
 * Use these functions to handle Google OAuth sign-in/sign-out in the frontend.
 */

/**
 * Get the Google OAuth sign-in URL
 * Redirects user to Google's OAuth consent screen
 */
export function getGoogleLoginUrl(): string {
  return "/api/auth/signin/google";
}

/**
 * Get the sign-out URL
 * Signs out the user and clears the session
 */
export function getLogoutUrl(): string {
  return "/api/auth/signout";
}

/**
 * Redirect to Google sign-in
 */
export function redirectToGoogleLogin(): void {
  window.location.href = getGoogleLoginUrl();
}

/**
 * Redirect to sign-out
 */
export function redirectToLogout(): void {
  window.location.href = getLogoutUrl();
}

/**
 * Check if Google OAuth is configured
 * Returns true if GOOGLE_CLIENT_ID is set (frontend can't check this directly,
 * but the backend will return an error if not configured)
 */
export function isGoogleAuthAvailable(): boolean {
  // This is a placeholder - in production, you might want to check via an API call
  return true;
}
