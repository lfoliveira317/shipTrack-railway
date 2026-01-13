import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { z } from "zod";

const SHIPMENTS_FILE = path.join(process.cwd(), "data", "shipments.json");

export const shipmentSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  label: z.string(),
  supplier: z.string(),
  cro: z.string().optional(),
  container: z.string(),
  mawbNumber: z.string().optional(),
  carrier: z.string(),
  status: z.string(),
  atd: z.string().optional(), // Actual Time of Departure
  eta: z.string(),
  ata: z.string().optional(), // Actual Time of Arrival
  pol: z.string(), // Port of Loading
  pod: z.string(), // Port of Discharge
  shipmentType: z.enum(["ocean", "air"]).default("ocean"),
  bolNumber: z.string().optional(), // Bill of Lading number
});

export type Shipment = z.infer<typeof shipmentSchema>;

// Initialize default shipments
const defaultShipments: Shipment[] = [
  { 
    id: "1", 
    orderNumber: "PO-2889-BD",
    label: "Cotton", 
    supplier: "Dhaka Trim Supplies", 
    cro: "CRO-001",
    container: "MSCU8473920", 
    mawbNumber: "",
    carrier: "MSC", 
    status: "Gated in full", 
    atd: "Mon, 20 Jan",
    pol: "Chittagong", 
    pod: "Savannah", 
    eta: "Thu, 30 Jan",
    ata: "",
    shipmentType: "ocean",
    bolNumber: "BOL123456"
  },
  { 
    id: "2",
    orderNumber: "PO-2901-VN",
    label: "Polyester", 
    supplier: "Hanoi Textiles", 
    cro: "CRO-002",
    container: "HLBU5829461", 
    mawbNumber: "",
    carrier: "Hapag-Lloyd", 
    status: "Loaded at Pol", 
    atd: "Wed, 15 Jan",
    pol: "Haiphong", 
    pod: "Los Angeles", 
    eta: "Tue, 21 Jan",
    ata: "",
    shipmentType: "ocean",
    bolNumber: "BOL789012"
  },
  { 
    id: "3",
    orderNumber: "PO-2847-CN",
    label: "Zippers", 
    supplier: "Hangzhou Fasteners", 
    cro: "CRO-003",
    container: "OOLU6291847", 
    mawbNumber: "",
    carrier: "OOCL", 
    status: "In transit", 
    atd: "Sat, 28 Dec",
    pol: "Yantian", 
    pod: "Oakland", 
    eta: "Mon, 06 Jan",
    ata: "",
    shipmentType: "ocean",
    bolNumber: "BOL345678"
  },
];

async function ensureDataDirectory() {
  const dataDir = path.dirname(SHIPMENTS_FILE);
  if (!existsSync(dataDir)) {
    await writeFile(path.join(dataDir, ".gitkeep"), "");
  }
}

async function readShipments(): Promise<Shipment[]> {
  try {
    await ensureDataDirectory();
    
    if (!existsSync(SHIPMENTS_FILE)) {
      await writeFile(SHIPMENTS_FILE, JSON.stringify(defaultShipments, null, 2));
      return defaultShipments;
    }
    
    const data = await readFile(SHIPMENTS_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultShipments;
  } catch (error) {
    console.error("Error reading shipments:", error);
    return defaultShipments;
  }
}

async function writeShipments(shipments: Shipment[]): Promise<void> {
  try {
    await ensureDataDirectory();
    await writeFile(SHIPMENTS_FILE, JSON.stringify(shipments, null, 2));
  } catch (error) {
    console.error("Error writing shipments:", error);
    throw error;
  }
}

export async function getAllShipments(): Promise<Shipment[]> {
  return await readShipments();
}

export async function addShipment(shipment: Omit<Shipment, "id">): Promise<Shipment> {
  const shipments = await readShipments();
  
  // Generate a new ID
  const maxId = shipments.reduce((max, s) => {
    const num = parseInt(s.id);
    return num > max ? num : max;
  }, 0);
  
  const newShipment: Shipment = {
    ...shipment,
    id: (maxId + 1).toString(),
  };
  
  shipments.push(newShipment);
  await writeShipments(shipments);
  
  return newShipment;
}

export async function addBulkShipments(shipments: Omit<Shipment, "id">[]): Promise<Shipment[]> {
  const existingShipments = await readShipments();
  
  let maxId = existingShipments.reduce((max, s) => {
    const num = parseInt(s.id);
    return num > max ? num : max;
  }, 0);
  
  const newShipments: Shipment[] = shipments.map((shipment) => ({
    ...shipment,
    id: (++maxId).toString(),
  }));
  
  existingShipments.push(...newShipments);
  await writeShipments(existingShipments);
  
  return newShipments;
}

export async function updateShipment(id: string, updates: Partial<Omit<Shipment, "id">>): Promise<Shipment | null> {
  const shipments = await readShipments();
  const index = shipments.findIndex((s) => s.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedShipment: Shipment = {
    ...shipments[index],
    ...updates,
    id, // Ensure ID doesn't change
  };
  
  shipments[index] = updatedShipment;
  await writeShipments(shipments);
  
  return updatedShipment;
}

export async function deleteShipment(id: string): Promise<boolean> {
  const shipments = await readShipments();
  const index = shipments.findIndex((s) => s.id === id);
  
  if (index === -1) {
    return false;
  }
  
  shipments.splice(index, 1);
  await writeShipments(shipments);
  
  return true;
}

export async function getShipmentById(id: string): Promise<Shipment | null> {
  const shipments = await readShipments();
  return shipments.find((s) => s.id === id) || null;
}
