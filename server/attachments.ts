import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { z } from "zod";

const ATTACHMENTS_FILE = path.join(process.cwd(), "data", "attachments.json");

export const attachmentSchema = z.object({
  id: z.string(),
  shipmentId: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  fileType: z.string(),
  uploadedBy: z.string(),
  uploadedAt: z.string(),
  // In a real app, this would be a URL to cloud storage
  // For mockup, we just store metadata
  fileUrl: z.string().optional(),
});

export type Attachment = z.infer<typeof attachmentSchema>;

interface AttachmentsData {
  attachments: Attachment[];
}

async function ensureDataDirectory() {
  const dataDir = path.dirname(ATTACHMENTS_FILE);
  if (!existsSync(dataDir)) {
    const { mkdir } = await import("fs/promises");
    await mkdir(dataDir, { recursive: true });
  }
}

async function readAttachments(): Promise<Attachment[]> {
  try {
    await ensureDataDirectory();
    
    if (!existsSync(ATTACHMENTS_FILE)) {
      const initialData: AttachmentsData = { attachments: [] };
      await writeFile(ATTACHMENTS_FILE, JSON.stringify(initialData, null, 2));
      return [];
    }
    
    const data = await readFile(ATTACHMENTS_FILE, "utf-8");
    const parsed: AttachmentsData = JSON.parse(data);
    return Array.isArray(parsed.attachments) ? parsed.attachments : [];
  } catch (error) {
    console.error("Error reading attachments:", error);
    return [];
  }
}

async function writeAttachments(attachments: Attachment[]): Promise<void> {
  try {
    await ensureDataDirectory();
    const data: AttachmentsData = { attachments };
    await writeFile(ATTACHMENTS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing attachments:", error);
    throw error;
  }
}

export async function getAttachmentsByShipmentId(shipmentId: string): Promise<Attachment[]> {
  const attachments = await readAttachments();
  return attachments
    .filter((a) => a.shipmentId === shipmentId)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

export async function getAttachmentCounts(): Promise<Record<string, number>> {
  const attachments = await readAttachments();
  const counts: Record<string, number> = {};
  
  for (const attachment of attachments) {
    counts[attachment.shipmentId] = (counts[attachment.shipmentId] || 0) + 1;
  }
  
  return counts;
}

export async function addAttachment(
  shipmentId: string,
  fileName: string,
  fileSize: number,
  fileType: string,
  uploadedBy: string
): Promise<Attachment> {
  const attachments = await readAttachments();
  
  // Generate a new ID
  const maxId = attachments.reduce((max, a) => {
    const num = parseInt(a.id);
    return num > max ? num : max;
  }, 0);
  
  const newAttachment: Attachment = {
    id: (maxId + 1).toString(),
    shipmentId,
    fileName,
    fileSize,
    fileType,
    uploadedBy,
    uploadedAt: new Date().toISOString(),
    fileUrl: `/uploads/${fileName}`, // Simulated URL
  };
  
  attachments.push(newAttachment);
  await writeAttachments(attachments);
  
  return newAttachment;
}

export async function deleteAttachment(attachmentId: string): Promise<boolean> {
  const attachments = await readAttachments();
  const index = attachments.findIndex((a) => a.id === attachmentId);
  
  if (index === -1) {
    return false;
  }
  
  attachments.splice(index, 1);
  await writeAttachments(attachments);
  
  return true;
}

// Helper to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
