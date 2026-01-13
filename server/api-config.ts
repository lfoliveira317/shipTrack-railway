import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import fs from "fs/promises";
import path from "path";

const CONFIG_FILE = path.join(process.cwd(), "api-config.json");

// Schema for API configuration
const ApiConfigSchema = z.object({
  mode: z.enum(["single", "per-carrier"]),
  singleApi: z.object({
    url: z.string(),
    port: z.string().optional(),
    token: z.string().optional(),
    user: z.string().optional(),
    password: z.string().optional(),
  }).optional(),
  carrierApis: z.record(z.string(), z.object({
    url: z.string(),
    port: z.string().optional(),
    token: z.string().optional(),
    user: z.string().optional(),
    password: z.string().optional(),
  })).optional(),
});

type ApiConfig = z.infer<typeof ApiConfigSchema>;

// Default configuration
const DEFAULT_CONFIG: ApiConfig = {
  mode: "single",
  singleApi: {
    url: "",
    port: "",
    token: "",
    user: "",
    password: "",
  },
  carrierApis: {},
};

// Helper function to read config
async function readConfig(): Promise<ApiConfig> {
  try {
    const data = await fs.readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return default config
    return DEFAULT_CONFIG;
  }
}

// Helper function to write config
async function writeConfig(config: ApiConfig): Promise<void> {
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

export const apiConfigRouter = router({
  // Get current configuration
  getConfig: publicProcedure.query(async () => {
    return await readConfig();
  }),

  // Save configuration
  saveConfig: publicProcedure
    .input(ApiConfigSchema)
    .mutation(async ({ input }) => {
      await writeConfig(input);
      return { success: true, config: input };
    }),

  // Get available carriers
  getCarriers: publicProcedure.query(() => {
    return [
      { value: "MSC", label: "MSC (Mediterranean Shipping Company)" },
      { value: "MAERSK", label: "Maersk Line" },
      { value: "CMA_CGM", label: "CMA CGM" },
      { value: "COSCO", label: "COSCO Shipping" },
      { value: "HAPAG_LLOYD", label: "Hapag-Lloyd" },
      { value: "ONE", label: "Ocean Network Express (ONE)" },
      { value: "EVERGREEN", label: "Evergreen Line" },
      { value: "YANG_MING", label: "Yang Ming" },
      { value: "HMM", label: "HMM (Hyundai Merchant Marine)" },
      { value: "ZIM", label: "ZIM Integrated Shipping" },
    ];
  }),
});
