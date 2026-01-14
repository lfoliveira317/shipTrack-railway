import { getDb } from "./db";
import { documentTypes } from "../drizzle/schema";

/**
 * Seed default document types for new installations
 * Run with: node --import tsx server/seed-document-types.ts
 */

const defaultDocumentTypes = [
  "BOL",
  "Purchase Invoice",
  "Sold Invoice",
  "Packing Slip",
  "Arrival Notice",
];

async function seedDocumentTypes() {
  console.log("Starting document types seeding...");

  try {
    const db = await getDb();
    if (!db) {
      console.error("❌ Database not available");
      process.exit(1);
    }

    // Check if document types already exist
    const existing = await db.select().from(documentTypes);
    
    if (existing.length > 0) {
      console.log(`Found ${existing.length} existing document types. Skipping seed.`);
      return;
    }

    // Insert default document types
    for (const typeName of defaultDocumentTypes) {
      await db.insert(documentTypes).values({ name: typeName });
      console.log(`✓ Added document type: ${typeName}`);
    }

    console.log(`\n✅ Successfully seeded ${defaultDocumentTypes.length} document types`);
  } catch (error) {
    console.error("❌ Error seeding document types:", error);
    process.exit(1);
  }

  process.exit(0);
}

seedDocumentTypes();
