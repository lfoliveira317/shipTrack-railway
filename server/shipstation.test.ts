import { describe, it, expect } from "vitest";
import { testShipStationCredentials } from "./shipstation";

describe("ShipStation API", () => {
  it("should have valid ShipStation API credentials", async () => {
    const result = await testShipStationCredentials();
    
    if (!result.success) {
      console.error("ShipStation API error:", result.error);
    }
    
    expect(result.success).toBe(true);
  }, 15000); // 15 second timeout for API call
});
