import { describe, it, expect } from 'vitest';
import { sendEmail } from './email-service';
import { generateMissingDocumentsEmail } from './email-templates';

describe('Missing Documents Email Test', () => {
  it('should send a test missing documents email', { timeout: 10000 }, async () => {
    // Sample data with missing documents
    const missingDocuments = [
      {
        containerNumber: 'CONT1111111',
        supplier: 'Global Supplies Inc.',
        cro: 'CRO-TEST-001',
        carrier: 'Maersk Line',
        status: 'In transit',
        eta: new Date('2026-01-25'),
        missingDocTypes: ['BOL', 'Purchase Invoice', 'Packing Slip']
      },
      {
        containerNumber: 'CONT2222222',
        supplier: 'Asia Manufacturing Co.',
        cro: 'CRO-TEST-002',
        carrier: 'MSC',
        status: 'In transit',
        eta: new Date('2026-01-28'),
        missingDocTypes: ['Commercial Invoice', 'Certificate of Origin']
      },
      {
        containerNumber: 'TEST1234567',
        supplier: 'European Exports Ltd.',
        cro: 'CRO-TEST-003',
        carrier: 'CMA CGM',
        status: 'At port',
        eta: new Date('2026-01-20'),
        missingDocTypes: ['BOL', 'Packing Slip', 'Bill of Lading']
      },
      {
        containerNumber: 'BULK1111111',
        supplier: 'Bulk Supplier Inc.',
        cro: null,
        carrier: 'Hapag-Lloyd',
        status: 'Delayed',
        eta: new Date('2026-02-01'),
        missingDocTypes: ['Purchase Invoice']
      },
      {
        containerNumber: 'CONT3333333',
        supplier: 'Test Supplier Co.',
        cro: 'CRO-TEST-004',
        carrier: 'COSCO',
        status: 'In transit',
        eta: new Date('2026-01-30'),
        missingDocTypes: ['Commercial Invoice', 'Packing Slip', 'Certificate of Origin']
      }
    ];

    // Generate the HTML email
    const htmlContent = generateMissingDocumentsEmail(
      missingDocuments,
      'Lucas' // Recipient name
    );

    // Send the email
    const result = await sendEmail({
      to: 'lfoliveira317@gmail.com',
      subject: '📋 Missing Documents Alert - 5 Containers Require Attention',
      html: htmlContent,
    });

    expect(result).toBe(true);
    console.log('\n✅ Missing documents test email sent! Check your inbox.\n');
    console.log('Email includes:');
    console.log('- 5 containers with missing documents');
    console.log('- Detailed table with container info');
    console.log('- Specific missing document types');
    console.log('- Action items and upload button\n');
  });
});
