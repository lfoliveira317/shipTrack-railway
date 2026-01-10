import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { z } from "zod";

const SHIPMENTS_FILE = path.join(process.cwd(), "data", "shipments.json");

export const shipmentSchema = z.object({
  id: z.string(),
  label: z.string(),
  supplier: z.string(),
  container: z.string(),
  carrier: z.string(),
  status: z.string(),
  pol: z.string(),
  pod: z.string(),
  eta: z.string(),
});

export type Shipment = z.infer<typeof shipmentSchema>;

// Initialize default shipments
const defaultShipments: Shipment[] = [
  { id: "PO-2889-BD", label: "Cotton", supplier: "Dhaka Trim Supplies", container: "MSCU8473920", carrier: "MSC", status: "Gated in full", pol: "Chittagong", pod: "Savannah", eta: "Thu, 30 Jan" },
  { id: "PO-2901-VN", label: "Polyester", supplier: "Hanoi Textiles", container: "HLBU5829461", carrier: "Hapag-Lloyd", status: "Loaded at Pol", pol: "Haiphong", pod: "Data", eta: "Tue, 21 Jan" },
  { id: "PO-2847-CN", label: "Zippers", supplier: "Hangzhou Fasteners", container: "OOLU6291847", carrier: "OOCL", status: "In transit", pol: "Yantian", pod: "Oakland", eta: "Mon, 06 Jan" },
  { id: "PO-2756-IN", label: "Jersey", supplier: "Mumbai Fabrics", container: "TEMU9384756", carrier: "Maersk", status: "Arrived", pol: "Nhava Sheva", pod: "Felixstowe", eta: "Sat, 16 Nov" },
  { id: "PO-2895-TW", label: "Thread", supplier: "Taipei Threads", container: "TCLU4829103", carrier: "Evergreen", status: "Customs Hold", pol: "Kaohsiung", pod: "Los Angeles", eta: "Wed, 20 Nov" },
  { id: "PO-2902-MY", label: "Organic", supplier: "Kuala Lumpur Knits", container: "CMACGM19283", carrier: "CMA CGM", status: "In transit", pol: "Port Klang", pod: "Seattle", eta: "Fri, 14 Feb" },
  { id: "PO-2910-VN", label: "Silk", supplier: "Vietnam Silk Co", container: "ONEU9182736", carrier: "ONE", status: "Vessel Departed", pol: "Ho Chi Minh", pod: "Vancouver", eta: "Mon, 24 Feb" },
  { id: "PO-2915-CN", label: "Buttons", supplier: "Shanghai Accessories", container: "COSU8172635", carrier: "COSCO", status: "Gated in full", pol: "Shanghai", pod: "Long Beach", eta: "Wed, 05 Mar" },
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
    return JSON.parse(data);
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
    const num = parseInt(s.id.split("-")[1] || "0");
    return num > max ? num : max;
  }, 0);
  
  const newShipment: Shipment = {
    ...shipment,
    id: `PO-${(maxId + 1).toString().padStart(4, "0")}-${shipment.supplier.substring(0, 2).toUpperCase()}`,
  };
  
  shipments.push(newShipment);
  await writeShipments(shipments);
  
  return newShipment;
}
