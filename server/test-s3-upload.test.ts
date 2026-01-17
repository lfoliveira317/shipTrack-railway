import { describe, it, expect } from 'vitest';
import { storagePut, storageGet, storageGetPublicUrl, randomSuffix } from './storage-s3';

describe('AWS S3 Storage Integration', () => {
  // Skip these tests if AWS credentials are not configured
  const isConfigured = process.env.AWS_ACCESS_KEY_ID && 
                       process.env.AWS_SECRET_ACCESS_KEY && 
                       process.env.AWS_S3_BUCKET;

  if (!isConfigured) {
    console.log('\n⚠️  Skipping S3 tests: AWS credentials not configured');
    console.log('Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET to run these tests\n');
  }

  it.skipIf(!isConfigured)('should upload a text file to S3', async () => {
    const testContent = 'Hello from ShipTrack! This is a test upload.';
    const testKey = `test-uploads/test-${Date.now()}-${randomSuffix()}.txt`;
    
    const result = await storagePut(
      testKey,
      Buffer.from(testContent),
      'text/plain'
    );
    
    expect(result.key).toBe(testKey);
    expect(result.url).toContain('.s3.');
    expect(result.url).toContain(testKey);
    
    console.log('\n✅ Test file uploaded successfully!');
    console.log('   Key:', result.key);
    console.log('   URL:', result.url);
  }, 10000);

  it.skipIf(!isConfigured)('should upload a JSON file to S3', async () => {
    const testData = {
      shipment: 'TEST123',
      status: 'In transit',
      timestamp: new Date().toISOString()
    };
    const testKey = `test-uploads/data-${Date.now()}-${randomSuffix()}.json`;
    
    const result = await storagePut(
      testKey,
      JSON.stringify(testData, null, 2),
      'application/json'
    );
    
    expect(result.key).toBe(testKey);
    expect(result.url).toContain('.s3.');
    
    console.log('\n✅ JSON file uploaded successfully!');
    console.log('   Key:', result.key);
    console.log('   URL:', result.url);
  }, 10000);

  it.skipIf(!isConfigured)('should generate a signed URL for private access', async () => {
    const testKey = `private-docs/confidential-${Date.now()}.txt`;
    
    // First upload a file
    await storagePut(
      testKey,
      'This is a private document',
      'text/plain'
    );
    
    // Generate signed URL
    const result = await storageGet(testKey, 3600); // 1 hour expiration
    
    expect(result.key).toBe(testKey);
    expect(result.url).toContain('X-Amz-Signature');
    expect(result.url).toContain('X-Amz-Expires');
    
    console.log('\n✅ Signed URL generated successfully!');
    console.log('   Key:', result.key);
    console.log('   URL (expires in 1 hour):', result.url.substring(0, 100) + '...');
  }, 10000);

  it.skipIf(!isConfigured)('should get public URL without signing', () => {
    const testKey = 'public-images/logo.png';
    
    const result = storageGetPublicUrl(testKey);
    
    expect(result.key).toBe(testKey);
    expect(result.url).toContain('.s3.');
    expect(result.url).not.toContain('X-Amz-Signature');
    
    console.log('\n✅ Public URL generated successfully!');
    console.log('   Key:', result.key);
    console.log('   URL:', result.url);
  });

  it('should normalize keys by removing leading slashes', () => {
    const result = storageGetPublicUrl('/documents/invoice.pdf');
    expect(result.key).toBe('documents/invoice.pdf');
    expect(result.url).not.toContain('//documents');
  });

  it('should generate random suffixes', () => {
    const suffix1 = randomSuffix();
    const suffix2 = randomSuffix();
    
    expect(suffix1).toHaveLength(8);
    expect(suffix2).toHaveLength(8);
    expect(suffix1).not.toBe(suffix2);
  });
});
