/**
 * Test EmailJS Private Key Configuration
 * Validates that the EMAILJS_PRIVATE_KEY is properly set and working
 */

import { describe, it, expect } from 'vitest';
import { sendEmailViaEmailJS } from './services/emailjs-backend';

describe('EmailJS Private Key Validation', () => {
  it('should have EMAILJS_PRIVATE_KEY environment variable set', () => {
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;
    expect(privateKey).toBeDefined();
    expect(privateKey).not.toBe('');
    expect(privateKey!.length).toBeGreaterThan(10);
  });

  it('should successfully send a test email via EmailJS', async () => {
    // Send a test email to validate the private key works
    const result = await sendEmailViaEmailJS({
      to_email: 'lfoliveira317@gmail.com',
      to_name: 'Test User',
      from_name: 'ShipTrack Test',
      subject: 'EmailJS Private Key Validation Test',
      message: 'This is a test email to validate the EmailJS private key is working correctly.',
    });

    // The result should be true if the key is valid
    expect(result).toBe(true);
  }, 30000); // 30 second timeout for API call
});
