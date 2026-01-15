import { getDb } from './db';
import { ports } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Ensure a port exists in the database, adding it if necessary
 * @param portName - The name of the port (e.g., "Shanghai")
 * @param portCode - Optional port code (e.g., "CNSHA")
 * @param type - Port type: 'loading' or 'discharge'
 * @returns The port ID
 */
export async function ensurePortExists(
  portName: string,
  portCode?: string,
  type: 'loading' | 'discharge' = 'loading'
): Promise<number | null> {
  if (!portName) return null;
  
  const db = await getDb();
  if (!db) return null;

  // Check if port already exists
  const existing = await db
    .select()
    .from(ports)
    .where(eq(ports.name, portName))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  // Insert new port
  try {
    const [newPort] = await db.insert(ports).values({
      name: portName,
      code: portCode || portName.substring(0, 5).toUpperCase(),
      type: type,
    });
    
    console.log(`[Port Auto-Add] Added new port: ${portName} (${portCode || 'no code'})`);
    return newPort.insertId;
  } catch (error) {
    console.error(`[Port Auto-Add] Failed to add port ${portName}:`, error);
    return null;
  }
}

/**
 * Ensure both POL and POD ports exist in the database
 * @param polName - Port of Loading name
 * @param polCode - Port of Loading code
 * @param podName - Port of Discharge name
 * @param podCode - Port of Discharge code
 */
export async function ensurePortsExist(
  polName?: string,
  polCode?: string,
  podName?: string,
  podCode?: string
): Promise<void> {
  const promises = [];
  
  if (polName) {
    promises.push(ensurePortExists(polName, polCode, 'loading'));
  }
  
  if (podName) {
    promises.push(ensurePortExists(podName, podCode, 'discharge'));
  }
  
  await Promise.all(promises);
}
