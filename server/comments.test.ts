import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { existsSync, unlinkSync, mkdirSync } from "fs";
import path from "path";
import {
  addComment,
  deleteComment,
  getCommentsByShipmentId,
  getCommentCounts,
} from "./comments";

const COMMENTS_FILE = path.join(process.cwd(), "data", "comments.json");
const DATA_DIR = path.dirname(COMMENTS_FILE);

describe("comments API", () => {
  // Ensure data directory exists
  beforeEach(() => {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
  });

  // Clean up test file after each test
  afterEach(() => {
    if (existsSync(COMMENTS_FILE)) {
      unlinkSync(COMMENTS_FILE);
    }
  });

  it("should add a comment to a shipment", async () => {
    const comment = await addComment("1", "Test User", "This is a test comment");
    
    expect(comment).toBeDefined();
    expect(comment.id).toBeDefined();
    expect(comment.shipmentId).toBe("1");
    expect(comment.author).toBe("Test User");
    expect(comment.text).toBe("This is a test comment");
    expect(comment.createdAt).toBeDefined();
  });

  it("should get comments by shipment ID", async () => {
    // Add some comments
    await addComment("1", "User A", "Comment 1");
    await addComment("1", "User B", "Comment 2");
    await addComment("2", "User C", "Comment for shipment 2");

    const commentsForShipment1 = await getCommentsByShipmentId("1");
    
    expect(commentsForShipment1).toHaveLength(2);
    expect(commentsForShipment1.every(c => c.shipmentId === "1")).toBe(true);
  });

  it("should get comment counts for all shipments", async () => {
    // Add comments to different shipments
    await addComment("1", "User A", "Comment 1");
    await addComment("1", "User B", "Comment 2");
    await addComment("2", "User C", "Comment for shipment 2");
    await addComment("3", "User D", "Comment for shipment 3");
    await addComment("3", "User E", "Another comment for shipment 3");
    await addComment("3", "User F", "Third comment for shipment 3");

    const counts = await getCommentCounts();
    
    expect(counts["1"]).toBe(2);
    expect(counts["2"]).toBe(1);
    expect(counts["3"]).toBe(3);
  });

  it("should delete a comment", async () => {
    const comment = await addComment("1", "Test User", "Comment to delete");
    
    const success = await deleteComment(comment.id);
    expect(success).toBe(true);

    const comments = await getCommentsByShipmentId("1");
    expect(comments).toHaveLength(0);
  });

  it("should return false when deleting non-existent comment", async () => {
    const success = await deleteComment("non-existent-id");
    expect(success).toBe(false);
  });

  it("should return comments sorted by date (newest first)", async () => {
    await addComment("1", "User A", "First comment");
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    await addComment("1", "User B", "Second comment");
    await new Promise(resolve => setTimeout(resolve, 10));
    await addComment("1", "User C", "Third comment");

    const comments = await getCommentsByShipmentId("1");
    
    expect(comments).toHaveLength(3);
    // Newest should be first
    expect(comments[0].text).toBe("Third comment");
    expect(comments[2].text).toBe("First comment");
  });
});
