/**
 * Test Email Router
 * Provides endpoint to send test emails for verification
 */

import { router, protectedProcedure } from './_core/trpc';
import { sendEmail } from './email-service';

export const testEmailRouter = router({
  /**
   * Send a test email to the current user
   */
  sendTestEmail: protectedProcedure.mutation(async ({ ctx }) => {
    const user = ctx.user;
    
    if (!user.email) {
      throw new Error('User email not found');
    }

    const result = await sendEmail({
      to: user.email,
      subject: '✅ ShipTrack Email Test - Resend Deliverability Check',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #FF5722 0%, #FF7043 100%);
      color: white;
      padding: 30px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 8px 8px;
    }
    .success-badge {
      display: inline-block;
      background: #4CAF50;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      margin: 20px 0;
    }
    .info-box {
      background: white;
      border-left: 4px solid #FF5722;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .button {
      display: inline-block;
      background: #FF5722;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      color: #666;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">🎉 Email Test Successful!</h1>
  </div>
  
  <div class="content">
    <div class="success-badge">✅ Resend API Working</div>
    
    <h2>Hello ${user.name || 'there'}!</h2>
    
    <p>This is a test email from your <strong>ShipTrack</strong> application to verify that the Resend email delivery service is working correctly.</p>
    
    <div class="info-box">
      <strong>📊 Test Details:</strong>
      <ul>
        <li><strong>Recipient:</strong> ${user.email}</li>
        <li><strong>Service:</strong> Resend API</li>
        <li><strong>Timestamp:</strong> ${new Date().toLocaleString()}</li>
        <li><strong>Environment:</strong> Production</li>
      </ul>
    </div>
    
    <h3>✨ What's Working:</h3>
    <ul>
      <li>✅ Resend API integration</li>
      <li>✅ Email template rendering</li>
      <li>✅ Database connection</li>
      <li>✅ Environment configuration</li>
    </ul>
    
    <h3>📬 Notification Types Available:</h3>
    <ul>
      <li>Shipment status updates</li>
      <li>Delay notifications</li>
      <li>Arrival alerts</li>
      <li>Hourly/Daily/Weekly digest emails</li>
      <li>Webhook event notifications</li>
      <li>Missing document reminders</li>
    </ul>
    
    <p style="text-align: center;">
      <a href="${process.env.VITE_APP_URL || 'https://shiptrack.manus.space'}" class="button">
        Open ShipTrack Dashboard
      </a>
    </p>
    
    <p><em>If you received this email, your notification system is fully operational! 🚀</em></p>
  </div>
  
  <div class="footer">
    <p>© ${new Date().getFullYear()} ShipTrack. All rights reserved.</p>
    <p>This is an automated test email from your ShipTrack application.</p>
  </div>
</body>
</html>
      `,
    });

    return {
      success: result,
      email: user.email,
      message: result 
        ? 'Test email sent successfully! Please check your inbox.' 
        : 'Failed to send test email. Please check your Resend configuration.',
    };
  }),
});
