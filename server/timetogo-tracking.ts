import axios from 'axios';
import { getDb } from './db';
import { apiConfigs } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * TimeToGo Tracking API Service
 * Documentation: https://tracking.timetocargo.com/v1
 */

export interface TimeToGoTrackingResponse {
  success: boolean;
  data?: {
    containerNumber: string;
    containerType?: string;
    carrier?: string;
    carrierScac?: string;
    status?: string;
    portOfLoading?: string;
    portOfLoadingCode?: string;
    portOfDischarge?: string;
    portOfDischargeCode?: string;
    atd?: string; // Actual Time of Departure
    eta?: string; // Estimated Time of Arrival
    ata?: string; // Actual Time of Arrival
    vesselName?: string;
    voyageNumber?: string;
    events?: Array<{
      date: string;
      location: string;
      locationCode?: string;
      terminal?: string;
      status: string;
      statusCode?: string;
      actual: boolean;
      vessel?: string;
      voyage?: string;
    }>;
    // For suggested updates
    suggestedUpdates?: {
      carrier?: string;
      status?: string;
      portOfLoading?: string;
      portOfDischarge?: string;
      atd?: string;
      eta?: string;
      ata?: string;
      vesselName?: string;
      voyageNumber?: string;
    };
  };
  error?: string;
  message?: string;
}

/**
 * Get TimeToGo API configuration from database
 */
async function getTimeToGoConfig() {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    // Get the single mode API config (TimeToGo)
    const configs = await db
      .select()
      .from(apiConfigs)
      .where(eq(apiConfigs.mode, 'single'))
      .limit(1);

    if (!configs || configs.length === 0) {
      throw new Error('TimeToGo API configuration not found');
    }

    const config = configs[0];

    if (!config.url || !config.token) {
      throw new Error('TimeToGo API URL or token not configured');
    }

    return {
      baseUrl: config.url,
      token: config.token,
    };
  } catch (error: any) {
    console.error('Error getting TimeToGo config:', error);
    throw error;
  }
}

/**
 * Track container using TimeToGo API
 */
export async function trackContainerTimeToGo(
  containerNumber: string,
  company: string = 'AUTO'
): Promise<TimeToGoTrackingResponse> {
  try {
    const config = await getTimeToGoConfig();

    console.log(`[TimeToGo] Tracking container: ${containerNumber} with company: ${company}`);

    // Make request to TimeToGo API
    // Endpoint: GET /v1/container?api_key=<TOKEN>&company=<COMPANY>&container_number=<CONTAINER>
    const response = await axios.get(`${config.baseUrl}/container`, {
      params: {
        api_key: config.token,
        company: company,
        container_number: containerNumber,
      },
      headers: {
        'Accept': 'application/json',
      },
      timeout: 30000,
    });

    console.log('[TimeToGo] Tracking response received:', response.data);

    // Parse and normalize the response
    // TimeToGo API response structure: { data: { summary: {...}, container: {...}, locations: [...], terminals: [...] } }
    const apiData = response.data?.data;
    const summary = apiData?.summary || {};
    const container = apiData?.container || {};
    const events = container?.events || [];
    const locations = apiData?.locations || [];
    const terminals = apiData?.terminals || [];
    const shipmentStatus = apiData?.shipment_status;

    // Helper function to get location name by ID
    const getLocationName = (locationId: number) => {
      const loc = locations.find((l: any) => l.id === locationId);
      return loc ? loc.name : undefined;
    };

    // Helper function to get location code by ID
    const getLocationCode = (locationId: number) => {
      const loc = locations.find((l: any) => l.id === locationId);
      return loc ? loc.locode : undefined;
    };

    // Helper function to get terminal name by ID
    const getTerminalName = (terminalId: number) => {
      const term = terminals.find((t: any) => t.id === terminalId);
      return term ? term.name : undefined;
    };

    // Get POL and POD information
    const polLocation = getLocationName(summary.pol?.location);
    const polLocationCode = getLocationCode(summary.pol?.location);
    const podLocation = getLocationName(summary.pod?.location);
    const podLocationCode = getLocationCode(summary.pod?.location);

    // Get ATD (from POL date)
    const atd = summary.pol?.date;

    // Get ETA (from POD date)
    const eta = summary.pod?.date;

    // Get ATA (find actual arrival event at POD)
    let ata: string | undefined;
    const podEvents = events.filter((e: any) => 
      e.location === summary.pod?.location && e.actual === true
    );
    if (podEvents.length > 0) {
      ata = podEvents[podEvents.length - 1].date; // Get latest actual event at POD
    }

    // Get vessel info from most recent actual event
    const actualEvents = events.filter((e: any) => e.actual === true);
    const latestActualEvent = actualEvents.length > 0 ? actualEvents[0] : events[0];
    const vesselName = latestActualEvent?.vessel;
    const voyageNumber = latestActualEvent?.voyage;

    // Map shipment status to our status values
    let status = 'in_transit';
    if (shipmentStatus === 'DELIVERED') {
      status = 'delivered';
    } else if (shipmentStatus === 'PENDING') {
      status = 'pending';
    }

    return {
      success: true,
      data: {
        containerNumber: container.number || containerNumber,
        containerType: container.type,
        carrier: summary?.company?.full_name,
        carrierScac: summary?.company?.scacs?.[0],
        status: shipmentStatus,
        portOfLoading: polLocation,
        portOfLoadingCode: polLocationCode,
        portOfDischarge: podLocation,
        portOfDischargeCode: podLocationCode,
        atd,
        eta,
        ata,
        vesselName,
        voyageNumber,
        events: events.map((event: any) => ({
          date: event.date,
          location: getLocationName(event.location) || '',
          locationCode: getLocationCode(event.location),
          terminal: event.terminal !== null ? getTerminalName(event.terminal) : undefined,
          status: event.status,
          statusCode: event.status_code,
          actual: event.actual,
          vessel: event.vessel,
          voyage: event.voyage,
        })),
        suggestedUpdates: {
          carrier: summary?.company?.full_name,
          status,
          portOfLoading: polLocation,
          portOfDischarge: podLocation,
          atd,
          eta,
          ata,
          vesselName,
          voyageNumber,
        },
      },
    };
  } catch (error: any) {
    console.error('[TimeToGo] Tracking error:', error);

    if (error.response) {
      // API returned an error response
      return {
        success: false,
        error: error.response.data?.error || 'Tracking failed',
        message: error.response.data?.message || `HTTP ${error.response.status}: ${error.response.statusText}`,
      };
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      // Network error
      return {
        success: false,
        error: 'Network error',
        message: 'Unable to connect to TimeToGo API. Please check your internet connection.',
      };
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      // Timeout error
      return {
        success: false,
        error: 'Timeout',
        message: 'TimeToGo API request timed out. Please try again.',
      };
    } else {
      // Other errors
      return {
        success: false,
        error: 'Unknown error',
        message: error.message || 'An unexpected error occurred while tracking the container.',
      };
    }
  }
}

/**
 * Track multiple containers in batch
 */
export async function trackContainersBatchTimeToGo(
  containerNumbers: string[],
  company: string = 'AUTO'
): Promise<TimeToGoTrackingResponse[]> {
  const results: TimeToGoTrackingResponse[] = [];

  for (const containerNumber of containerNumbers) {
    try {
      const result = await trackContainerTimeToGo(containerNumber, company);
      results.push(result);
    } catch (error: any) {
      results.push({
        success: false,
        error: 'Tracking failed',
        message: error.message,
      });
    }
  }

  return results;
}
