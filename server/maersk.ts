import axios, { AxiosInstance } from 'axios';
import { ENV } from './_core/env';

interface MaerskTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface TrackingReference {
  referenceType: 'CONTAINER_NUMBER' | 'BILL_OF_LADING' | 'BOOKING_NUMBER';
  referenceValue: string;
}

interface ShipmentJourneyLeg {
  legSequenceNumber: number;
  transportMode: string;
  carrierSCAC: string;
  vesselName?: string;
  voyageNumber?: string;
  departurePort?: string;
  arrivalPort?: string;
  estimatedDepartureDateTime?: string;
  estimatedArrivalDateTime?: string;
  actualDepartureDateTime?: string;
  actualArrivalDateTime?: string;
}

interface MaerskTrackingResponse {
  shipmentJourneyIdentifier: string;
  references: TrackingReference[];
  parties?: Array<{
    partyRole: string;
    partyName: string;
    partyAddress: string;
  }>;
  shipmentJourneyLegs: ShipmentJourneyLeg[];
  equipmentReference?: {
    equipmentType: string;
    equipmentNumber: string;
    equipmentStatus: string;
  };
}

interface ContainerInfo {
  journeyId: string;
  containerNumber: string;
  containerType: string;
  status: string;
  references: Record<string, string>;
  parties: Record<string, { name: string; address: string }>;
  legs: Array<{
    sequence: number;
    mode: string;
    carrier: string;
    from: string;
    to: string;
    vesselName?: string;
    voyageNumber?: string;
    etd?: string;
    eta?: string;
    atd?: string;
    ata?: string;
  }>;
}

class MaerskAPIClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly environment: string;
  private readonly baseURL: string;
  private readonly tokenEndpoint: string;

  constructor() {
    this.clientId = ENV.maerskClientId;
    this.clientSecret = ENV.maerskClientSecret;
    this.environment = ENV.maerskEnvironment || 'sandbox';

    // Set base URL based on environment
    this.baseURL =
      this.environment === 'production'
        ? 'https://api.maersk.com'
        : 'https://api-sandbox.maersk.com';

    this.tokenEndpoint = `${this.baseURL}/oauth2/access_token`;

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
    });
  }

  /**
   * Get OAuth2 access token
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post<MaerskTokenResponse>(
        this.tokenEndpoint,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
        {
          headers: {
            'Consumer-Key': this.clientId,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

      return this.accessToken;
    } catch (error) {
      console.error('Failed to get Maersk access token:', error);
      throw new Error('Failed to authenticate with Maersk API');
    }
  }

  /**
   * Get request headers with authentication
   */
  private async getHeaders(): Promise<Record<string, string>> {
    const token = await this.getAccessToken();

    return {
      'Authorization': `Bearer ${token}`,
      'Consumer-Key': this.clientId,
      'Content-Type': 'application/json',
      'Api-Version': '1',
    };
  }

  /**
   * Track shipment by container number
   */
  async trackByContainerNumber(
    containerNumber: string,
    scac: string = 'MAEU'
  ): Promise<MaerskTrackingResponse> {
    const headers = await this.getHeaders();

    const payload = {
      clientKey: `TRACK_${containerNumber}_${Date.now()}`,
      sourceSystem: 'EXTERNAL_SYSTEM',
      dataObjectSource: 'MANUAL',
      references: [
        {
          referenceType: 'CONTAINER_NUMBER',
          referenceValue: containerNumber,
        },
      ],
      shipmentJourneyLegs: [
        {
          legSequenceNumber: 1,
          transportMode: 'OCEAN',
          carrierSCAC: scac,
        },
      ],
    };

    const response = await this.client.post<MaerskTrackingResponse>(
      '/tracking/shipment-journeys',
      payload,
      { headers }
    );

    return response.data;
  }

  /**
   * Track shipment by Bill of Lading number
   */
  async trackByBillOfLading(
    bolNumber: string,
    scac: string = 'MAEU'
  ): Promise<MaerskTrackingResponse> {
    const headers = await this.getHeaders();

    const payload = {
      clientKey: `TRACK_BOL_${bolNumber}_${Date.now()}`,
      sourceSystem: 'EXTERNAL_SYSTEM',
      dataObjectSource: 'MANUAL',
      references: [
        {
          referenceType: 'BILL_OF_LADING',
          referenceValue: bolNumber,
        },
      ],
      shipmentJourneyLegs: [
        {
          legSequenceNumber: 1,
          transportMode: 'OCEAN',
          carrierSCAC: scac,
        },
      ],
    };

    const response = await this.client.post<MaerskTrackingResponse>(
      '/tracking/shipment-journeys',
      payload,
      { headers }
    );

    return response.data;
  }

  /**
   * Track shipment by booking number
   */
  async trackByBookingNumber(
    bookingNumber: string,
    scac: string = 'MAEU'
  ): Promise<MaerskTrackingResponse> {
    const headers = await this.getHeaders();

    const payload = {
      clientKey: `TRACK_BK_${bookingNumber}_${Date.now()}`,
      sourceSystem: 'EXTERNAL_SYSTEM',
      dataObjectSource: 'MANUAL',
      references: [
        {
          referenceType: 'BOOKING_NUMBER',
          referenceValue: bookingNumber,
        },
      ],
      shipmentJourneyLegs: [
        {
          legSequenceNumber: 1,
          transportMode: 'OCEAN',
          carrierSCAC: scac,
        },
      ],
    };

    const response = await this.client.post<MaerskTrackingResponse>(
      '/tracking/shipment-journeys',
      payload,
      { headers }
    );

    return response.data;
  }

  /**
   * Extract simplified container information from tracking response
   */
  extractContainerInfo(response: MaerskTrackingResponse): ContainerInfo {
    const equipment = response.equipmentReference || {
      equipmentNumber: 'N/A',
      equipmentType: 'N/A',
      equipmentStatus: 'N/A'
    };

    const containerInfo: ContainerInfo = {
      journeyId: response.shipmentJourneyIdentifier || 'N/A',
      containerNumber: equipment.equipmentNumber || 'N/A',
      containerType: equipment.equipmentType || 'N/A',
      status: equipment.equipmentStatus || 'N/A',
      references: {},
      parties: {},
      legs: [],
    };

    // Extract all references
    for (const ref of response.references || []) {
      containerInfo.references[ref.referenceType] = ref.referenceValue;
    }

    // Extract party information
    for (const party of response.parties || []) {
      containerInfo.parties[party.partyRole] = {
        name: party.partyName,
        address: party.partyAddress,
      };
    }

    // Extract journey legs
    for (const leg of response.shipmentJourneyLegs || []) {
      containerInfo.legs.push({
        sequence: leg.legSequenceNumber,
        mode: leg.transportMode,
        carrier: leg.carrierSCAC,
        from: leg.departurePort || 'N/A',
        to: leg.arrivalPort || 'N/A',
        vesselName: leg.vesselName,
        voyageNumber: leg.voyageNumber,
        etd: leg.estimatedDepartureDateTime,
        eta: leg.estimatedArrivalDateTime,
        atd: leg.actualDepartureDateTime,
        ata: leg.actualArrivalDateTime,
      });
    }

    return containerInfo;
  }
}

// Export singleton instance
export const maerskClient = new MaerskAPIClient();
