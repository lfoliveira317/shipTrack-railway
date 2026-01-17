// AWS S3 Storage Service for ShipTrack
// Use this file when deploying to Railway or other platforms with custom S3

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configuration from environment variables
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_S3_REGION = process.env.AWS_S3_REGION || 'us-east-1';
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;

// Validate configuration
if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET) {
  console.warn(
    '[Storage] AWS S3 credentials not configured. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET environment variables.'
  );
}

// Initialize S3 client
const s3Client = new S3Client({
  region: AWS_S3_REGION,
  credentials: AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      }
    : undefined,
});

/**
 * Upload a file to S3
 * @param relKey - Relative key/path for the file (e.g., "documents/invoice-123.pdf")
 * @param data - File content as Buffer, Uint8Array, or string
 * @param contentType - MIME type of the file
 * @returns Object with key and public URL
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = 'application/octet-stream'
): Promise<{ key: string; url: string }> {
  if (!AWS_S3_BUCKET) {
    throw new Error('AWS_S3_BUCKET environment variable is not set');
  }

  const key = normalizeKey(relKey);

  // Convert string to Buffer if needed
  const body = typeof data === 'string' ? Buffer.from(data) : data;

  const command = new PutObjectCommand({
    Bucket: AWS_S3_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    // ACL: 'public-read', // Uncomment if using ACLs instead of bucket policy
  });

  try {
    await s3Client.send(command);

    // Construct public URL
    const url = `https://${AWS_S3_BUCKET}.s3.${AWS_S3_REGION}.amazonaws.com/${key}`;

    console.log(`[Storage] File uploaded successfully: ${key}`);
    return { key, url };
  } catch (error: any) {
    console.error('[Storage] Upload failed:', error.message);
    throw new Error(`S3 upload failed: ${error.message}`);
  }
}

/**
 * Get a signed URL for accessing a private file
 * @param relKey - Relative key/path for the file
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Object with key and signed URL
 */
export async function storageGet(
  relKey: string,
  expiresIn = 3600
): Promise<{ key: string; url: string }> {
  if (!AWS_S3_BUCKET) {
    throw new Error('AWS_S3_BUCKET environment variable is not set');
  }

  const key = normalizeKey(relKey);

  const command = new GetObjectCommand({
    Bucket: AWS_S3_BUCKET,
    Key: key,
  });

  try {
    // Generate presigned URL for private files
    const url = await getSignedUrl(s3Client, command, { expiresIn });

    return { key, url };
  } catch (error: any) {
    console.error('[Storage] Failed to generate signed URL:', error.message);
    throw new Error(`S3 signed URL generation failed: ${error.message}`);
  }
}

/**
 * Get public URL for a file (assumes bucket has public read policy)
 * @param relKey - Relative key/path for the file
 * @returns Object with key and public URL
 */
export function storageGetPublicUrl(relKey: string): { key: string; url: string } {
  if (!AWS_S3_BUCKET) {
    throw new Error('AWS_S3_BUCKET environment variable is not set');
  }

  const key = normalizeKey(relKey);
  const url = `https://${AWS_S3_BUCKET}.s3.${AWS_S3_REGION}.amazonaws.com/${key}`;

  return { key, url };
}

/**
 * Normalize S3 key by removing leading slashes
 */
function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, '');
}

/**
 * Generate a random suffix for file keys to prevent enumeration
 */
export function randomSuffix(): string {
  return Math.random().toString(36).substring(2, 10);
}
