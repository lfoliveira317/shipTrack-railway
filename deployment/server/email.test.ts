import { describe, it, expect } from "vitest";
import { testEmailService } from "./email";

describe("email service", () => {
  it("should have valid Resend API credentials", async () => {
    // Test with the account owner's email (required for Resend test mode)
    const result = await testEmailService("lfoliveira317@gmail.com");
    
    // The test passes if we don't get an authentication error
    // Note: The email might not actually send to test@example.com, but if credentials are valid,
    // Resend will accept the request
    if (!result.success) {
      console.error("Email service error:", result.error);
    }
    expect(result.success).toBe(true);
  }, 10000); // 10 second timeout for API call
});
