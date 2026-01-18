
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { shipmentsRouter } from "./shipments";
import { commentsRouter } from "./comments";
import { attachmentsRouter } from "./attachments";
import { apiConfigRouter } from "./api-config";
import { usersRouter } from "./users";
import { notificationsRouter } from "./notifications";
import { dropdownsRouter } from "./dropdowns";
import { maerskTrackingRouter } from "./maersk-tracking";
import { userPreferencesRouter } from "./user-preferences";
import { referenceDataRouter } from "./reference-data";
import { webhooksRouter } from "./routers/webhooks";
import { testEmailRouter } from "./test-email-router";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      // Google OAuth logout is handled by redirecting to /api/auth/signout
      // This endpoint is kept for compatibility with frontend
      return {
        success: true,
        redirectUrl: "/api/auth/signout",
      } as const;
    }),
  }),

  shipments: shipmentsRouter,

  comments: commentsRouter,

  apiConfig: apiConfigRouter,

  attachments: attachmentsRouter,

  users: usersRouter,

  notifications: notificationsRouter,

  dropdowns: dropdownsRouter,

  maerskTracking: maerskTrackingRouter,

  userPreferences: userPreferencesRouter,

  referenceData: referenceDataRouter,

  webhooks: webhooksRouter,

  testEmail: testEmailRouter,
});

export type AppRouter = typeof appRouter;
