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
    container: string;
    carrier?: string;
    status?: string;
    location?: string;
    eta?: string;
    events?: Array<{
      date: string;
      location: string;
      description: string;
      status: string;
    }>;
    vessel?: {
      name?: string;
      voyage?: string;
    };
    route?: {
      pol?: string;
      pod?: string;
      atd?: string;
      ata?: string;
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
    const response = await axios.get(`${config.baseUrl}/track`, {
      params: {
        container: containerNumber,
        company: company,
      },
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    console.log('[TimeToGo] Tracking response received:', response.data);

    // Parse and normalize the response
    const trackingData = response.data;

    return {
      success: true,
      data: {
        container: containerNumber,
        carrier: trackingData.carrier || trackingData.company || company,
        status: trackingData.status || trackingData.containerStatus,
        location: trackingData.location || trackingData.currentLocation,
        eta: trackingData.eta || trackingData.estimatedArrival,
        events: trackingData.events || trackingData.history || [],
        vessel: {
          name: trackingData.vessel?.name || trackingData.vesselName,
          voyage: trackingData.vessel?.voyage || trackingData.voyageNumber,
        },
        route: {
          pol: trackingData.pol || trackingData.portOfLoading,
          pod: trackingData.pod || trackingData.portOfDischarge,
          atd: trackingData.atd || trackingData.actualDeparture,
          ata: trackingData.ata || trackingData.actualArrival,
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
