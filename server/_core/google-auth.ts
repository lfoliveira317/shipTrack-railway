import { ExpressAuth } from "@auth/express";
import Google from "@auth/express/providers/google";
import type { Session } from "@auth/express";

/**
 * Google OAuth Configuration for Auth.js
 * 
 * Environment variables required:
 * - GOOGLE_CLIENT_ID: OAuth 2.0 Client ID from Google Cloud Console
 * - GOOGLE_CLIENT_SECRET: OAuth 2.0 Client Secret
 * - AUTH_SECRET: Random string for session encryption (generate with: openssl rand -base64 32)
 * - AUTH_URL: Full URL of your app (e.g., https://your-app.railway.app)
 */

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.JWT_SECRET || "dev-secret-change-in-production"; // Fallback
const AUTH_URL = process.env.AUTH_URL || "http://localhost:3000";

const isGoogleAuthConfigured = !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);

if (!isGoogleAuthConfigured) {
  console.warn(
    "[Google Auth] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set. Google OAuth is disabled. App will work without authentication."
  );
} else {
  console.log("[Google Auth] Initialized with client ID:", GOOGLE_CLIENT_ID);
  console.log("[Google Auth] AUTH_URL:", AUTH_URL);
}

/**
 * Auth.js configuration
 */
export const authConfig = {
  secret: AUTH_SECRET,
  trustHost: true, // Required for Railway/Render deployment
  basePath: "/api/auth", // Explicitly set base path
  providers: isGoogleAuthConfigured ? [
    Google({
      clientId: GOOGLE_CLIENT_ID!,
      clientSecret: GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ] : [],
  callbacks: {
    async jwt({ token, account, profile }: any) {
      // Add Google user info to JWT token
      if (account && profile) {
        token.sub = profile.sub; // Google user ID
        token.email = profile.email;
        token.name = profile.name;
        token.picture = profile.picture;
      }
      return token;
    },
    async session({ session, token }: any) {
      // Add user info to session
      if (token && session.user) {
        session.user.id = token.sub;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.picture;
      }
      return session;
    },
  },
  pages: {
    signIn: "/", // Redirect to home page for sign-in
    error: "/auth/error", // Error page
  },
  debug: process.env.NODE_ENV === "development", // Enable debug logs in development
};

/**
 * Express Auth middleware
 * Mount at /api/auth in your Express app
 */
export const authHandler = isGoogleAuthConfigured 
  ? ExpressAuth(authConfig)
  : (req: any, res: any, next: any) => {
      console.log("[Google Auth] OAuth not configured, skipping auth handler");
      res.status(503).json({ error: "Google OAuth is not configured" });
    };

/**
 * Helper to get session from request
 */
export async function getSession(req: any): Promise<Session | null> {
  try {
    // Auth.js stores session in req.auth after middleware runs
    return req.auth || null;
  } catch (error) {
    console.error("[Google Auth] Error getting session:", error);
    return null;
  }
}

/**
 * Helper to extract user from session
 */
export function getUserFromSession(session: Session | null) {
  if (!session || !session.user) {
    return null;
  }

  return {
    id: session.user.id || session.user.email || "unknown",
    openId: session.user.id || session.user.email || "unknown", // Use Google ID as openId
    email: session.user.email || null,
    name: session.user.name || null,
    loginMethod: "google",
  };
}
