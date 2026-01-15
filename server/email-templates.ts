/**
 * Email Templates for Container Notifications
 * Professional HTML email templates for various notification types
 */

interface ContainerUpdate {
  containerNumber: string;
  supplier: string;
  cro: string;
  carrier: string;
  status: string;
  pol: string;
  pod: string;
  atd: string | null;
  eta: string | null;
  ata: string | null;
  vesselName: string;
  voyageNumber: string;
  changes: string[];
}

interface DateChange {
  containerNumber: string;
  supplier: string;
  cro: string;
  carrier: string;
  pod: string;
  previousEta: string | null;
  newEta: string | null;
  previousAta: string | null;
  newAta: string | null;
  delayDays: number;
}

interface MissingDocument {
  containerNumber: string;
  supplier: string;
  cro: string;
  carrier: string;
  status: string;
  eta: string | null;
  missingDocTypes: string[];
}

/**
 * Base email template with consistent styling
 */
function getEmailBase(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
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
    .summary-box {
      background-color: #f8f9fa;
      border-left: 4px solid #FF5722;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .container-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background-color: white;
    }
    .container-table th {
      background-color: #FF5722;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
    }
    .container-table td {
      padding: 12px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 14px;
    }
    .container-table tr:last-child td {
      border-bottom: none;
    }
    .container-table tr:hover {
      background-color: #f8f9fa;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-warning {
      background-color: #fff3cd;
      color: #856404;
    }
    .badge-danger {
      background-color: #f8d7da;
      color: #721c24;
    }
    .badge-success {
      background-color: #d4edda;
      color: #155724;
    }
    .badge-info {
      background-color: #d1ecf1;
      color: #0c5460;
    }
    .change-item {
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .change-item:last-child {
      border-bottom: none;
    }
    .email-footer {
      background-color: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #6c757d;
      border-top: 1px solid #e0e0e0;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #FF5722;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      margin: 10px 0;
    }
    .button:hover {
      background-color: #E64A19;
    }
    .delay-indicator {
      color: #dc3545;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>${title}</h1>
    </div>
    <div class="email-body">
      ${content}
    </div>
    <div class="email-footer">
      <p><strong>ShipTrack</strong> - Container Tracking & Management System</p>
      <p>This is an automated notification. Please do not reply to this email.</p>
      <p style="margin-top: 10px; font-size: 11px;">
        &copy; ${new Date().getFullYear()} ShipTrack. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Template 1: Container Tracking Updates
 * Shows list of containers with their updated information
 */
export function generateContainerUpdatesEmail(
  containers: ContainerUpdate[],
  recipientName: string = 'Team'
): string {
  const totalContainers = containers.length;
  
  const containersHtml = containers.map(container => `
    <tr>
      <td><strong>${container.containerNumber}</strong></td>
      <td>${container.supplier || '-'}</td>
      <td>${container.cro || '-'}</td>
      <td><span class="badge badge-info">${container.status}</span></td>
      <td>${container.carrier || '-'}</td>
      <td>${container.pol || '-'}</td>
      <td>${container.pod || '-'}</td>
      <td>${container.eta ? new Date(container.eta).toLocaleDateString() : '-'}</td>
    </tr>
    ${container.changes.length > 0 ? `
    <tr>
      <td colspan="8" style="background-color: #f8f9fa; padding: 10px;">
        <strong>Changes:</strong>
        ${container.changes.map(change => `<div class="change-item">• ${change}</div>`).join('')}
      </td>
    </tr>
    ` : ''}
  `).join('');

  const content = `
    <p>Hello ${recipientName},</p>
    <p>The following containers have been updated with the latest tracking information:</p>
    
    <div class="summary-box">
      <strong>Summary:</strong> ${totalContainers} container${totalContainers !== 1 ? 's' : ''} updated
    </div>

    <table class="container-table">
      <thead>
        <tr>
          <th>Container #</th>
          <th>Supplier</th>
          <th>CRO</th>
          <th>Status</th>
          <th>Carrier</th>
          <th>POL</th>
          <th>POD</th>
          <th>ETA</th>
        </tr>
      </thead>
      <tbody>
        ${containersHtml}
      </tbody>
    </table>

    <p>Please review these updates and take any necessary action.</p>
    <p style="margin-top: 30px;">
      <a href="${process.env.VITE_APP_URL || 'https://shiptrack.example.com'}" class="button">
        View in ShipTrack
      </a>
    </p>
  `;

  return getEmailBase('Container Tracking Updates', content);
}

/**
 * Template 2: Discharge Date Changes Alert
 * Shows containers with changed discharge dates (ETA/ATA)
 */
export function generateDateChangesEmail(
  changes: DateChange[],
  recipientName: string = 'Team'
): string {
  const totalChanges = changes.length;
  const delayedCount = changes.filter(c => c.delayDays > 0).length;
  
  const changesHtml = changes.map(change => {
    const isDelayed = change.delayDays > 0;
    const statusBadge = isDelayed ? 'badge-danger' : 'badge-success';
    const statusText = isDelayed ? `Delayed ${change.delayDays} day${change.delayDays !== 1 ? 's' : ''}` : 'On Time';
    
    return `
    <tr>
      <td><strong>${change.containerNumber}</strong></td>
      <td>${change.supplier || '-'}</td>
      <td>${change.cro || '-'}</td>
      <td>${change.carrier || '-'}</td>
      <td>${change.pod || '-'}</td>
      <td>${change.previousEta ? new Date(change.previousEta).toLocaleDateString() : '-'}</td>
      <td ${isDelayed ? 'class="delay-indicator"' : ''}>
        ${change.newEta ? new Date(change.newEta).toLocaleDateString() : '-'}
      </td>
      <td><span class="badge ${statusBadge}">${statusText}</span></td>
    </tr>
    `;
  }).join('');

  const content = `
    <p>Hello ${recipientName},</p>
    <p><strong>Important:</strong> The following containers have experienced changes to their port of discharge dates:</p>
    
    <div class="summary-box">
      <strong>Summary:</strong> ${totalChanges} container${totalChanges !== 1 ? 's' : ''} with date changes
      ${delayedCount > 0 ? `<br><span class="delay-indicator">⚠ ${delayedCount} container${delayedCount !== 1 ? 's' : ''} delayed</span>` : ''}
    </div>

    <table class="container-table">
      <thead>
        <tr>
          <th>Container #</th>
          <th>Supplier</th>
          <th>CRO</th>
          <th>Carrier</th>
          <th>POD</th>
          <th>Previous ETA</th>
          <th>New ETA</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${changesHtml}
      </tbody>
    </table>

    <p>Please review these date changes and update your planning accordingly. ${delayedCount > 0 ? 'Immediate attention may be required for delayed containers.' : ''}</p>
    <p style="margin-top: 30px;">
      <a href="${process.env.VITE_APP_URL || 'https://shiptrack.example.com'}" class="button">
        View in ShipTrack
      </a>
    </p>
  `;

  return getEmailBase('⚠ Discharge Date Changes Alert', content);
}

/**
 * Template 3: Missing Documents Alert
 * Shows containers with missing required documents
 */
export function generateMissingDocumentsEmail(
  containers: MissingDocument[],
  recipientName: string = 'Team'
): string {
  const totalContainers = containers.length;
  const totalMissingDocs = containers.reduce((sum, c) => sum + c.missingDocTypes.length, 0);
  
  const containersHtml = containers.map(container => `
    <tr>
      <td><strong>${container.containerNumber}</strong></td>
      <td>${container.supplier || '-'}</td>
      <td>${container.cro || '-'}</td>
      <td>${container.carrier || '-'}</td>
      <td><span class="badge badge-warning">${container.status}</span></td>
      <td>${container.eta ? new Date(container.eta).toLocaleDateString() : '-'}</td>
      <td>
        ${container.missingDocTypes.map(docType => 
          `<span class="badge badge-danger" style="margin: 2px;">${docType}</span>`
        ).join(' ')}
      </td>
    </tr>
  `).join('');

  const content = `
    <p>Hello ${recipientName},</p>
    <p><strong>Action Required:</strong> The following containers have missing required documents:</p>
    
    <div class="summary-box">
      <strong>Summary:</strong> ${totalContainers} container${totalContainers !== 1 ? 's' : ''} with ${totalMissingDocs} missing document${totalMissingDocs !== 1 ? 's' : ''}
      <br><span class="delay-indicator">⚠ Please upload missing documents to avoid delays</span>
    </div>

    <table class="container-table">
      <thead>
        <tr>
          <th>Container #</th>
          <th>Supplier</th>
          <th>CRO</th>
          <th>Carrier</th>
          <th>Status</th>
          <th>ETA</th>
          <th>Missing Documents</th>
        </tr>
      </thead>
      <tbody>
        ${containersHtml}
      </tbody>
    </table>

    <p><strong>Required Actions:</strong></p>
    <ul>
      <li>Upload the missing documents for each container as soon as possible</li>
      <li>Verify document accuracy and completeness</li>
      <li>Contact suppliers if documents are unavailable</li>
    </ul>

    <p style="margin-top: 30px;">
      <a href="${process.env.VITE_APP_URL || 'https://shiptrack.example.com'}" class="button">
        Upload Documents Now
      </a>
    </p>
  `;

  return getEmailBase('📋 Missing Documents Alert', content);
}
