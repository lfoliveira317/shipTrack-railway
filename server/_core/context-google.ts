import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getSession, getUserFromSession } from "./google-auth";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

/**
 * Create tRPC context with Google OAuth authentication
 * 
 * This replaces the Manus OAuth authentication with Google OAuth.
 * The user is fetched from the session and synced with the database.
 */
export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // Check if Google OAuth is configured
  const isGoogleAuthConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  if (!isGoogleAuthConfigured) {
    // Google OAuth not configured - return null user (app works without auth)
    return {
      req: opts.req,
      res: opts.res,
      user: null,
    };
  }

  try {
    // Get session from Auth.js
    const session = await getSession(opts.req);
    const sessionUser = getUserFromSession(session);

    if (sessionUser) {
      // Get database instance
      const db = await getDb();
      if (!db) {
        console.warn("[Context] Database not available");
        return { req: opts.req, res: opts.res, user: null };
      }

      // Check if user exists in database
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.openId, sessionUser.openId))
        .limit(1);

      if (existingUser) {
        // Update last signed in
        await db
          .update(users)
          .set({ lastSignedIn: new Date() })
          .where(eq(users.id, existingUser.id));

        user = existingUser;
      } else {
        // Create new user
        const [newUser] = await db
          .insert(users)
          .values({
            openId: sessionUser.openId,
            email: sessionUser.email,
            name: sessionUser.name,
            loginMethod: sessionUser.loginMethod,
            role: "user", // Default role
            lastSignedIn: new Date(),
          })
          .$returningId();

        // Fetch the created user
        const [createdUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, newUser.id))
          .limit(1);

        user = createdUser;
      }
    }
  } catch (error) {
    console.error("[Context] Error authenticating user:", error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
