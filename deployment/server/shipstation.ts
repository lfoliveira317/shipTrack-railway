import axios from 'axios';

const SHIPSTATION_API_URL = 'https://ssapi.shipstation.com';

interface ShipStationCredentials {
  apiKey: string;
  apiSecret?: string;
}

interface TrackingInfo {
  trackingNumber: string;
  carrierCode: string;
  status: string;
  statusDescription: string;
  shipDate?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  events: Array<{
    occurred: string;
    description: string;
    location?: string;
  }>;
}

/**
 * Test ShipStation API credentials
 */
export async function testShipStationCredentials(): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = process.env.SHIPSTATION_API_KEY;
    
    if (!apiKey) {
      return { success: false, error: 'SHIPSTATION_API_KEY not configured' };
    }

    // Test API by calling a lightweight endpoint (list stores)
    const response = await axios.get(`${SHIPSTATION_API_URL}/stores`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    if (response.status === 200) {
      return { success: true };
    }

    return { success: false, error: `Unexpected status: ${response.status}` };
  } catch (error: any) {
    if (error.response) {
      return { 
        success: false, 
        error: `API error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}` 
      };
    }
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Track a shipment using ShipStation API
 */
export async function trackShipment(
  carrierCode: string,
  trackingNumber: string
): Promise<{ success: boolean; data?: TrackingInfo; error?: string }> {
  try {
    const apiKey = process.env.SHIPSTATION_API_KEY;
    
    if (!apiKey) {
      return { success: false, error: 'SHIPSTATION_API_KEY not configured' };
    }

    const response = await axios.get(
      `${SHIPSTATION_API_URL}/shipments`,
      {
        params: {
          trackingNumber,
          carrierCode: carrierCode.toLowerCase(),
        },
        headers: {
          'Authorization': `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    if (response.data && response.data.shipments && response.data.shipments.length > 0) {
      const shipment = response.data.shipments[0];
      
      const trackingInfo: TrackingInfo = {
        trackingNumber: shipment.trackingNumber || trackingNumber,
        carrierCode: shipment.carrierCode || carrierCode,
        status: mapShipStationStatus(shipment.shipmentStatus),
        statusDescription: shipment.shipmentStatus || 'Unknown',
        shipDate: shipment.shipDate,
        estimatedDeliveryDate: shipment.shipTo?.estimatedDeliveryDate,
        actualDeliveryDate: shipment.shipDate,
        events: [],
      };

      return { success: true, data: trackingInfo };
    }

    return { success: false, error: 'No tracking information found' };
  } catch (error: any) {
    if (error.response) {
      return { 
        success: false, 
        error: `API error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}` 
      };
    }
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Map ShipStation status to our internal status
 */
function mapShipStationStatus(shipStationStatus: string): string {
  const statusMap: Record<string, string> = {
    'awaiting_shipment': 'Pending',
    'pending_fulfillment': 'Pending',
    'shipped': 'In transit',
    'on_hold': 'On hold',
    'cancelled': 'Cancelled',
    'delivered': 'Delivered',
  };

  return statusMap[shipStationStatus?.toLowerCase()] || 'In transit';
}

/**
 * Bulk track multiple shipments
 */
export async function trackMultipleShipments(
  shipments: Array<{ carrierCode: string; trackingNumber: string; id: number }>
): Promise<Array<{ id: number; success: boolean; data?: TrackingInfo; error?: string }>> {
  const results = await Promise.all(
    shipments.map(async (shipment) => {
      const result = await trackShipment(shipment.carrierCode, shipment.trackingNumber);
      return {
        id: shipment.id,
        ...result,
      };
    })
  );

  return results;
}
