import { describe, it, expect } from 'vitest';
import { sendEmail } from './email-service';

describe('HTML Email Rendering Test', () => {
  it('should send a fully styled HTML email to verify rendering', { timeout: 10000 }, async () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML Rendering Test</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 800px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .email-header {
      background: linear-gradient(135deg, #FF5722 0%, #E64A19 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .email-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .email-body {
      padding: 30px;
    }
    .section {
      margin: 30px 0;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
    }
    .section h2 {
      color: #FF5722;
      margin-top: 0;
    }
    .summary-box {
      background-color: #fff;
      border-left: 4px solid #FF5722;
      padding: 15px 20px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .status-badge {
      display: inline-block;
      background: #28a745;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      margin: 10px 5px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6c757d;
      font-size: 14px;
      background-color: #f8f9fa;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>🚢 ShipTrack HTML Rendering Test</h1>
    </div>
    <div class="email-body">
      <p><strong>Hello!</strong></p>
      <p>This is a test email to verify HTML rendering is working correctly.</p>
      
      <div class="section">
        <h2>✅ Features Being Tested</h2>
        <ul>
          <li>HTML structure and layout</li>
          <li>CSS styling and colors</li>
          <li>Gradient backgrounds</li>
          <li>Status badges</li>
          <li>Responsive design</li>
        </ul>
      </div>

      <div class="section">
        <h2>📦 Sample Status Badges</h2>
        <div>
          <span class="status-badge" style="background: #28a745;">Delivered</span>
          <span class="status-badge" style="background: #17a2b8;">In Transit</span>
          <span class="status-badge" style="background: #ffc107; color: #333;">Pending</span>
          <span class="status-badge" style="background: #dc3545;">Delayed</span>
        </div>
      </div>

      <div class="summary-box">
        <strong>Summary Box Example</strong>
        <p>This box has a left border and should stand out from the background.</p>
      </div>

      <p>If you can see this email with proper colors, gradients, and styling, then HTML rendering is working correctly! ✨</p>
    </div>
    <div class="footer">
      <p>© 2026 ShipTrack. All rights reserved.</p>
      <p style="font-size: 12px; color: #999;">This is an automated test email.</p>
    </div>
  </div>
</body>
</html>
    `;

    const result = await sendEmail({
      to: 'lfoliveira317@gmail.com',
      subject: 'ShipTrack HTML Rendering Test',
      html: htmlContent,
    });

    expect(result).toBe(true);
    console.log('\n✅ HTML test email sent! Check your inbox to verify rendering.\n');
  });
});
