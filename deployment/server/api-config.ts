import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { apiConfigs, type ApiConfig, type InsertApiConfig } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const apiConfigRouter = router({
  // Get API configuration
  get: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { mode: "single", configs: {} };
    
    const configs = await db.select().from(apiConfigs);
    if (configs.length === 0) {
      return { mode: "single", configs: {} };
    }
    
    const mode = configs[0].mode;
    const configMap: Record<string, any> = {};
    
    configs.forEach(config => {
      const key = config.carrier || "default";
      configMap[key] = {
        url: config.url,
        port: config.port || "",
        token: config.token || "",
        username: config.username || "",
        password: config.password || "",
      };
    });
    
    return { mode, configs: configMap };
  }),
  
  // Save API configuration
  save: protectedProcedure
    .input(z.object({
      mode: z.enum(["single", "per-carrier"]),
      configs: z.record(z.string(), z.object({
        url: z.string(),
        port: z.string().optional(),
        token: z.string().optional(),
        username: z.string().optional(),
        password: z.string().optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Delete all existing configs
      await db.delete(apiConfigs);
      
      // Insert new configs
      const configsToInsert: InsertApiConfig[] = [];
      for (const [carrier, config] of Object.entries(input.configs)) {
        configsToInsert.push({
          mode: input.mode,
          carrier: carrier === "default" ? null : carrier,
          url: config.url,
          port: config.port || null,
          token: config.token || null,
          username: config.username || null,
          password: config.password || null,
        });
      }
      
      if (configsToInsert.length > 0) {
        await db.insert(apiConfigs).values(configsToInsert);
      }
      
      return { success: true };
    }),
});
