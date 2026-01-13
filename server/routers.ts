import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { addShipment, addBulkShipments, getAllShipments, shipmentSchema } from "./shipments";
import { addComment, deleteComment, getCommentsByShipmentId, getCommentCounts } from "./comments";

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

  shipments: router({
    list: publicProcedure.query(async () => {
      return await getAllShipments();
    }),
    add: publicProcedure
      .input(shipmentSchema.omit({ id: true }))
      .mutation(async ({ input }) => {
        return await addShipment(input);
      }),
    addBulk: publicProcedure
      .input(z.array(shipmentSchema.omit({ id: true })))
      .mutation(async ({ input }) => {
        return await addBulkShipments(input);
      }),
  }),

  comments: router({
    // Get all comments for a specific shipment
    byShipment: publicProcedure
      .input(z.object({ shipmentId: z.string() }))
      .query(async ({ input }) => {
        return await getCommentsByShipmentId(input.shipmentId);
      }),
    
    // Get comment counts for all shipments
    counts: publicProcedure.query(async () => {
      return await getCommentCounts();
    }),
    
    // Add a new comment to a shipment
    add: publicProcedure
      .input(z.object({
        shipmentId: z.string(),
        author: z.string(),
        text: z.string().min(1, "Comment text is required"),
      }))
      .mutation(async ({ input }) => {
        return await addComment(input.shipmentId, input.author, input.text);
      }),
    
    // Delete a comment
    delete: publicProcedure
      .input(z.object({ commentId: z.string() }))
      .mutation(async ({ input }) => {
        const success = await deleteComment(input.commentId);
        return { success };
      }),
  }),
});

export type AppRouter = typeof appRouter;
