import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { apiConfigRouter } from "./api-config";
import fs from "fs/promises";
import path from "path";

const CONFIG_FILE = path.join(process.cwd(), "api-config.json");

// Helper to create a caller for testing
const createCaller = () => apiConfigRouter.createCaller({} as any);

describe("API Configuration", () => {
  // Clean up config file before and after tests
  beforeEach(async () => {
    try {
      await fs.unlink(CONFIG_FILE);
    } catch (error) {
      // File might not exist, that's okay
    }
  });

  afterEach(async () => {
    try {
      await fs.unlink(CONFIG_FILE);
    } catch (error) {
      // File might not exist, that's okay
    }
  });

  it("should return default config when no config file exists", async () => {
    const caller = createCaller();
    const config = await caller.getConfig();

    expect(config.mode).toBe("single");
    expect(config.singleApi).toBeDefined();
    expect(config.singleApi?.url).toBe("");
  });

  it("should save and retrieve single API configuration", async () => {
    const caller = createCaller();
    
    const configToSave = {
      mode: "single" as const,
      singleApi: {
        url: "https://api.example.com",
        port: "8080",
        token: "test-token",
        user: "testuser",
        password: "testpass",
      },
    };

    await caller.saveConfig(configToSave);
    const retrievedConfig = await caller.getConfig();

    expect(retrievedConfig.mode).toBe("single");
    expect(retrievedConfig.singleApi?.url).toBe("https://api.example.com");
    expect(retrievedConfig.singleApi?.port).toBe("8080");
    expect(retrievedConfig.singleApi?.token).toBe("test-token");
  });

  it("should save and retrieve per-carrier API configuration", async () => {
    const caller = createCaller();
    
    const configToSave = {
      mode: "per-carrier" as const,
      carrierApis: {
        MSC: {
          url: "https://api.msc.com",
          port: "443",
          token: "msc-token",
          user: "mscuser",
          password: "mscpass",
        },
        MAERSK: {
          url: "https://api.maersk.com",
          port: "443",
          token: "maersk-token",
          user: "maerskuser",
          password: "maerskpass",
        },
      },
    };

    await caller.saveConfig(configToSave);
    const retrievedConfig = await caller.getConfig();

    expect(retrievedConfig.mode).toBe("per-carrier");
    expect(retrievedConfig.carrierApis?.MSC?.url).toBe("https://api.msc.com");
    expect(retrievedConfig.carrierApis?.MAERSK?.url).toBe("https://api.maersk.com");
  });

  it("should return list of available carriers", async () => {
    const caller = createCaller();
    const carriers = await caller.getCarriers();

    expect(carriers).toBeInstanceOf(Array);
    expect(carriers.length).toBeGreaterThan(0);
    expect(carriers[0]).toHaveProperty("value");
    expect(carriers[0]).toHaveProperty("label");
    
    // Check for specific carriers
    const msc = carriers.find(c => c.value === "MSC");
    expect(msc).toBeDefined();
    expect(msc?.label).toContain("MSC");
  });

  it("should overwrite existing configuration", async () => {
    const caller = createCaller();
    
    // Save first config
    await caller.saveConfig({
      mode: "single" as const,
      singleApi: {
        url: "https://api.old.com",
        port: "8080",
        token: "old-token",
        user: "olduser",
        password: "oldpass",
      },
    });

    // Save new config
    await caller.saveConfig({
      mode: "per-carrier" as const,
      carrierApis: {
        MSC: {
          url: "https://api.msc.com",
          port: "443",
          token: "msc-token",
          user: "mscuser",
          password: "mscpass",
        },
      },
    });

    const retrievedConfig = await caller.getConfig();
    expect(retrievedConfig.mode).toBe("per-carrier");
    expect(retrievedConfig.carrierApis?.MSC).toBeDefined();
  });

  it("should handle empty optional fields", async () => {
    const caller = createCaller();
    
    const configToSave = {
      mode: "single" as const,
      singleApi: {
        url: "https://api.example.com",
        port: "",
        token: "",
        user: "",
        password: "",
      },
    };

    await caller.saveConfig(configToSave);
    const retrievedConfig = await caller.getConfig();

    expect(retrievedConfig.singleApi?.url).toBe("https://api.example.com");
    expect(retrievedConfig.singleApi?.port).toBe("");
  });
});
