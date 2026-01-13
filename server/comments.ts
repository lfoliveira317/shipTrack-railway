import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { z } from "zod";

const COMMENTS_FILE = path.join(process.cwd(), "data", "comments.json");

export const commentSchema = z.object({
  id: z.string(),
  shipmentId: z.string(),
  author: z.string(),
  text: z.string(),
  createdAt: z.string(),
});

export type Comment = z.infer<typeof commentSchema>;

interface CommentsData {
  comments: Comment[];
}

async function ensureDataDirectory() {
  const dataDir = path.dirname(COMMENTS_FILE);
  if (!existsSync(dataDir)) {
    const { mkdir } = await import("fs/promises");
    await mkdir(dataDir, { recursive: true });
  }
}

async function readComments(): Promise<Comment[]> {
  try {
    await ensureDataDirectory();
    
    if (!existsSync(COMMENTS_FILE)) {
      const initialData: CommentsData = { comments: [] };
      await writeFile(COMMENTS_FILE, JSON.stringify(initialData, null, 2));
      return [];
    }
    
    const data = await readFile(COMMENTS_FILE, "utf-8");
    const parsed: CommentsData = JSON.parse(data);
    return Array.isArray(parsed.comments) ? parsed.comments : [];
  } catch (error) {
    console.error("Error reading comments:", error);
    return [];
  }
}

async function writeComments(comments: Comment[]): Promise<void> {
  try {
    await ensureDataDirectory();
    const data: CommentsData = { comments };
    await writeFile(COMMENTS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing comments:", error);
    throw error;
  }
}

export async function getCommentsByShipmentId(shipmentId: string): Promise<Comment[]> {
  const comments = await readComments();
  return comments
    .filter((c) => c.shipmentId === shipmentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getCommentCounts(): Promise<Record<string, number>> {
  const comments = await readComments();
  const counts: Record<string, number> = {};
  
  for (const comment of comments) {
    counts[comment.shipmentId] = (counts[comment.shipmentId] || 0) + 1;
  }
  
  return counts;
}

export async function addComment(
  shipmentId: string,
  author: string,
  text: string
): Promise<Comment> {
  const comments = await readComments();
  
  // Generate a new ID
  const maxId = comments.reduce((max, c) => {
    const num = parseInt(c.id);
    return num > max ? num : max;
  }, 0);
  
  const newComment: Comment = {
    id: (maxId + 1).toString(),
    shipmentId,
    author,
    text,
    createdAt: new Date().toISOString(),
  };
  
  comments.push(newComment);
  await writeComments(comments);
  
  return newComment;
}

export async function deleteComment(commentId: string): Promise<boolean> {
  const comments = await readComments();
  const index = comments.findIndex((c) => c.id === commentId);
  
  if (index === -1) {
    return false;
  }
  
  comments.splice(index, 1);
  await writeComments(comments);
  
  return true;
}
