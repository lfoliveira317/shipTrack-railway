/**
 * Send Test Email Script
 * Sends a test email to verify Resend deliverability
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { users } from './drizzle/schema.js';
import { eq } from 'drizzle-orm';

// Email sending function using Resend
async function sendEmail({ to, subject, html }) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const EMAIL_FROM = process.env.EMAIL_FROM || 'ShipTrack <noreply@manus.im>';

  if (!RESEND_API_KEY) {
    console.error('[Email] RESEND_API_KEY not configured');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [to],
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Email] Failed to send:', data);
      return false;
    }

    console.log('[Email] Successfully sent to:', to);
    console.log('[Email] Message ID:', data.id);
    return true;
  } catch (error) {
    console.error('[Email] Error sending email:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting test email delivery...\n');

  // Connect to database
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  // Get owner user (admin)
  const ownerOpenId = process.env.OWNER_OPEN_ID;
  if (!ownerOpenId) {
    console.error('❌ OWNER_OPEN_ID not found in environment');
    process.exit(1);
  }

  const [user] = await db.select()
    .from(users)
    .where(eq(users.openId, ownerOpenId))
    .limit(1);

  if (!user || !user.email) {
    console.error('❌ User email not found in database');
    process.exit(1);
  }

  console.log(`📧 Sending test email to: ${user.email}\n`);

  // Send test email
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

  if (result) {
    console.log('✅ Test email sent successfully!');
    console.log('📬 Please check your inbox:', user.email);
    console.log('\n💡 Note: If you don\'t see the email, check your spam folder.');
  } else {
    console.log('❌ Failed to send test email');
    console.log('Please check your Resend API key and configuration');
  }

  await connection.end();
  process.exit(result ? 0 : 1);
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
