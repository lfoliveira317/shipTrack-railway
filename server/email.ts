import { sendEmailViaEmailJS } from './services/emailjs-backend';

export interface EmailNotification {
  to: string;
  subject: string;
  shipmentInfo: {
    container: string;
    sellerCloudNumber?: string;
    oldStatus: string;
    newStatus: string;
    carrier: string;
    eta?: string;
  };
}

/**
 * Send a shipment status change notification email
 */
export async function sendStatusChangeEmail(notification: EmailNotification): Promise<{ success: boolean; error?: string }> {
  try {
    const { to, subject, shipmentInfo } = notification;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
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
      background-color: #FF5722;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background-color: #f9f9f9;
      padding: 30px;
      border: 1px solid #e0e0e0;
      border-top: none;
      border-radius: 0 0 8px 8px;
    }
    .status-change {
      background-color: white;
      padding: 20px;
      margin: 20px 0;
      border-left: 4px solid #FF5722;
      border-radius: 4px;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 14px;
    }
    .status-old {
      background-color: #e0e0e0;
      color: #666;
    }
    .status-new {
      background-color: #FF5722;
      color: white;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .info-label {
      font-weight: 600;
      color: #666;
    }
    .info-value {
      color: #333;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #999;
      font-size: 12px;
    }
    .arrow {
      display: inline-block;
      margin: 0 10px;
      color: #FF5722;
      font-size: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">🚢 ShipTrack Shipment Update</h1>
  </div>
  <div class="content">
    <h2>Shipment Status Changed</h2>
    <p>Your shipment status has been updated. Track it in real-time on ShipTrack:</p>
    
    <div class="status-change">
      <div style="text-align: center; margin: 20px 0;">
        <span class="status-badge status-old">${shipmentInfo.oldStatus}</span>
        <span class="arrow">→</span>
        <span class="status-badge status-new">${shipmentInfo.newStatus}</span>
      </div>
      
      <div style="margin-top: 20px;">
        <div class="info-row">
          <span class="info-label">Container:</span>
          <span class="info-value">${shipmentInfo.container}</span>
        </div>
        ${shipmentInfo.sellerCloudNumber ? `
        <div class="info-row">
          <span class="info-label">Order Number:</span>
          <span class="info-value">${shipmentInfo.sellerCloudNumber}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">Carrier:</span>
          <span class="info-value">${shipmentInfo.carrier}</span>
        </div>
        ${shipmentInfo.eta ? `
        <div class="info-row">
          <span class="info-label">ETA:</span>
          <span class="info-value">${shipmentInfo.eta}</span>
        </div>
        ` : ''}
      </div>
    </div>
    
    <p>Log in to your ShipTrack dashboard to view more details and track your shipment.</p>
  </div>
  <div class="footer">
    <p>This is an automated notification from ShipTrack Supply Chain Management.</p>
    <p>© ${new Date().getFullYear()} ShipTrack. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    const textContent = `
ShipTrack Shipment Update

Your shipment status has been updated:

Status Change: ${shipmentInfo.oldStatus} → ${shipmentInfo.newStatus}

Shipment Details:
- Container: ${shipmentInfo.container}
${shipmentInfo.sellerCloudNumber ? `- Order Number: ${shipmentInfo.sellerCloudNumber}\n` : ''}
- Carrier: ${shipmentInfo.carrier}
${shipmentInfo.eta ? `- ETA: ${shipmentInfo.eta}\n` : ''}

Log in to your ShipTrack dashboard to view more details and track your shipment.

---
This is an automated notification from ShipTrack Supply Chain Management.
© ${new Date().getFullYear()} ShipTrack. All rights reserved.
    `;

    const success = await sendEmailViaEmailJS({
      to_email: to,
      to_name: to.split('@')[0], // Use email username as name
      from_name: 'ShipTrack',
      subject,
      message: textContent, // EmailJS uses plain text in template
    });

    return { success };
  } catch (error: any) {
    console.error('Email send exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test email service connection
 */
export async function testEmailService(testEmail: string): Promise<{ success: boolean; error?: string }> {
  try {
    const success = await sendEmailViaEmailJS({
      to_email: testEmail,
      to_name: testEmail.split('@')[0],
      from_name: 'ShipTrack',
      subject: 'ShipTrack Email Service Test',
      message: 'This is a test email from ShipTrack. Your email service is configured correctly!',
    });

    return { success };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
