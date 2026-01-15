import { sendEmailViaEmailJS, htmlToPlainText } from './services/emailjs-backend';

interface EmailNotificationParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email notification using EmailJS API
 */
export async function sendEmail(params: EmailNotificationParams): Promise<boolean> {
  try {
    // Convert HTML to plain text for EmailJS template
    const plainTextMessage = htmlToPlainText(params.html);
    
    const success = await sendEmailViaEmailJS({
      to_email: params.to,
      to_name: params.to.split('@')[0], // Use email username as name
      from_name: 'ShipTrack',
      subject: params.subject,
      message: plainTextMessage,
    });

    if (!success) {
      console.error('[Email] Failed to send email via EmailJS');
      return false;
    }

    console.log(`[Email] Email sent successfully to ${params.to} via EmailJS`);
    return true;
  } catch (error: any) {
    console.error('[Email] Error sending email:', error.message);
    return false;
  }
}

/**
 * Generate HTML template for status change notification
 */
export function generateStatusChangeEmail(
  shipmentIdentifier: string,
  newStatus: string,
  containerNumber: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shipment Status Update</title>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .content {
      background: #f8f9fa;
      padding: 30px 20px;
      border-radius: 0 0 8px 8px;
    }
    .status-badge {
      display: inline-block;
      background: #28a745;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      margin: 10px 0;
    }
    .details {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e9ecef;
    }
    .detail-label {
      font-weight: 600;
      color: #6c757d;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6c757d;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">🚢 Shipment Status Update</h1>
  </div>
  <div class="content">
    <p>Your shipment status has been updated:</p>
    <div class="status-badge">${newStatus}</div>
    <div class="details">
      <div class="detail-row">
        <span class="detail-label">Shipment ID:</span>
        <span>${shipmentIdentifier}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Container Number:</span>
        <span>${containerNumber}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status:</span>
        <span>${newStatus}</span>
      </div>
    </div>
    <p>This is an automated notification from your ShipTrack system.</p>
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} ShipTrack. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Generate HTML template for delay notification
 */
export function generateDelayEmail(
  shipmentIdentifier: string,
  containerNumber: string,
  oldEta: string,
  newEta: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shipment Delayed</title>
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
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 30px 20px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .content {
      background: #f8f9fa;
      padding: 30px 20px;
      border-radius: 0 0 8px 8px;
    }
    .alert-badge {
      display: inline-block;
      background: #ffc107;
      color: #333;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      margin: 10px 0;
    }
    .details {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e9ecef;
    }
    .detail-label {
      font-weight: 600;
      color: #6c757d;
    }
    .eta-change {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6c757d;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">⚠️ Shipment Delayed</h1>
  </div>
  <div class="content">
    <p>We detected a delay in your shipment:</p>
    <div class="alert-badge">DELAYED</div>
    <div class="details">
      <div class="detail-row">
        <span class="detail-label">Shipment ID:</span>
        <span>${shipmentIdentifier}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Container Number:</span>
        <span>${containerNumber}</span>
      </div>
    </div>
    <div class="eta-change">
      <strong>ETA Change:</strong><br>
      Previous ETA: ${oldEta}<br>
      New ETA: ${newEta}
    </div>
    <p>This is an automated notification from your ShipTrack system.</p>
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} ShipTrack. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Generate HTML template for arrival notification
 */
export function generateArrivalEmail(
  shipmentIdentifier: string,
  containerNumber: string,
  destination: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shipment Arrived</title>
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
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
      padding: 30px 20px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .content {
      background: #f8f9fa;
      padding: 30px 20px;
      border-radius: 0 0 8px 8px;
    }
    .success-badge {
      display: inline-block;
      background: #28a745;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      margin: 10px 0;
    }
    .details {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e9ecef;
    }
    .detail-label {
      font-weight: 600;
      color: #6c757d;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6c757d;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">✅ Shipment Arrived</h1>
  </div>
  <div class="content">
    <p>Great news! Your shipment has arrived at its destination:</p>
    <div class="success-badge">DELIVERED</div>
    <div class="details">
      <div class="detail-row">
        <span class="detail-label">Shipment ID:</span>
        <span>${shipmentIdentifier}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Container Number:</span>
        <span>${containerNumber}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Destination:</span>
        <span>${destination}</span>
      </div>
    </div>
    <p>This is an automated notification from your ShipTrack system.</p>
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} ShipTrack. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}
