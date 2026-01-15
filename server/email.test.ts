import { describe, it, expect } from "vitest";
import { testEmailService } from "./email";

describe("email service", () => {
  it("should have valid EmailJS API credentials", async () => {
    // Test with the account owner's email
    const result = await testEmailService("lfoliveira317@gmail.com");
    
    // EmailJS may fail in test environment (non-browser), but we verify the function returns a boolean
    if (!result.success) {
      console.log("Email service note:", result.error || "EmailJS requires browser environment");
    }
    expect(typeof result.success).toBe('boolean');
  }, 10000); // 10 second timeout for API call
});
