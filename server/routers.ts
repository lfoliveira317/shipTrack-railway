import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
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

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
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
});

export type AppRouter = typeof appRouter;
