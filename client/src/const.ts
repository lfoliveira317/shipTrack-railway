export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Google OAuth Login URL
 * Redirects user to Google's OAuth consent screen
 */
export const getLoginUrl = () => {
  return "/api/auth/signin/google";
};

/**
 * Logout URL
 * Signs out the user and clears the session
 */
export const getLogoutUrl = () => {
  return "/api/auth/signout";
};
