import { VoltnetClient } from './VoltnetClient';
import {
  MarketOffer,
  EnergySource,
  EnergyTransaction
} from './types';

/**
 * P2P Market Module
 * Handles peer-to-peer energy trading
 */
export class P2PMarket {
  private client: VoltnetClient;

  constructor(client: VoltnetClient) {
    this.client = client;
  }

  /**
   * Create a new market offer
   * @param offer Offer details
   * @returns Created offer
   */
  async createOffer(offer: Omit<MarketOffer, 'id' | 'sellerId' | 'createdAt' | 'status'>): Promise<MarketOffer> {
    const response = await this.client.getHttpClient().post('/market/offers', offer);
    return response.data;
  }

  /**
   * Get all active offers
   * @param filters Optional filters
   * @returns Array of active offers
   */
  async getOffers(filters?: {
    source?: EnergySource;
    maxPrice?: number;
    minEnergy?: number;
    location?: { lat: number; lon: number; radius: number };
  }): Promise<MarketOffer[]> {
    const response = await this.client.getHttpClient().get('/market/offers', {
      params: filters
    });
    return response.data;
  }

  /**
   * Get a specific offer by ID
   * @param offerId Offer ID
   * @returns Offer details
   */
  async getOffer(offerId: string): Promise<MarketOffer> {
    const response = await this.client.getHttpClient().get(`/market/offers/${offerId}`);
    return response.data;
  }

  /**
   * Get offers created by current participant
   * @returns Array of own offers
   */
  async getMyOffers(): Promise<MarketOffer[]> {
    const response = await this.client.getHttpClient().get('/market/offers/my');
    return response.data;
  }

  /**
   * Accept an offer and create a transaction
   * @param offerId Offer ID
   * @param energyAmount Amount of energy to purchase in kWh
   * @returns Created transaction
   */
  async acceptOffer(offerId: string, energyAmount: number): Promise<EnergyTransaction> {
    const response = await this.client.getHttpClient().post(`/market/offers/${offerId}/accept`, {
      energyAmount
    });
    return response.data;
  }

  /**
   * Cancel an offer
   * @param offerId Offer ID
   * @returns Success confirmation
   */
  async cancelOffer(offerId: string): Promise<{ success: boolean }> {
    const response = await this.client.getHttpClient().delete(`/market/offers/${offerId}`);
    return response.data;
  }

  /**
   * Update an existing offer
   * @param offerId Offer ID
   * @param updates Partial offer data to update
   * @returns Updated offer
   */
  async updateOffer(
    offerId: string,
    updates: Partial<Pick<MarketOffer, 'pricePerKwh' | 'energyAvailable' | 'expiresAt'>>
  ): Promise<MarketOffer> {
    const response = await this.client.getHttpClient().patch(`/market/offers/${offerId}`, updates);
    return response.data;
  }

  /**
   * Search for offers near a location
   * @param latitude Latitude
   * @param longitude Longitude
   * @param radiusKm Search radius in kilometers
   * @returns Nearby offers
   */
  async findNearbyOffers(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<MarketOffer[]> {
    const response = await this.client.getHttpClient().get('/market/offers/nearby', {
      params: {
        lat: latitude,
        lon: longitude,
        radius: radiusKm
      }
    });
    return response.data;
  }

  /**
   * Get best available offer based on criteria
   * @param criteria Selection criteria
   * @returns Best matching offer
   */
  async getBestOffer(criteria: {
    energyNeeded: number;
    maxPrice?: number;
    preferredSource?: EnergySource;
    location?: { lat: number; lon: number };
  }): Promise<MarketOffer | null> {
    const response = await this.client.getHttpClient().post('/market/offers/best', criteria);
    return response.data;
  }

  /**
   * Get market statistics
   * @returns Current market statistics
   */
  async getMarketStats(): Promise<{
    totalOffers: number;
    totalEnergyAvailable: number;
    averagePrice: number;
    priceRange: { min: number; max: number };
    bySource: Record<EnergySource, { count: number; avgPrice: number }>;
  }> {
    const response = await this.client.getHttpClient().get('/market/stats');
    return response.data;
  }

  /**
   * Create a recurring offer (e.g., daily solar production)
   * @param offer Base offer details
   * @param schedule Recurrence schedule
   * @returns Created recurring offer configuration
   */
  async createRecurringOffer(
    offer: Omit<MarketOffer, 'id' | 'sellerId' | 'createdAt' | 'status' | 'expiresAt'>,
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly';
      startTime: string; // HH:MM format
      duration: number; // in hours
      daysOfWeek?: number[]; // 0-6, for weekly
    }
  ): Promise<{ scheduleId: string; nextOffer: MarketOffer }> {
    const response = await this.client.getHttpClient().post('/market/offers/recurring', {
      offer,
      schedule
    });
    return response.data;
  }

  /**
   * Get price suggestions based on market conditions
   * @param energyAmount Amount of energy to sell
   * @param source Energy source
   * @returns Suggested price range
   */
  async getSuggestedPrice(
    energyAmount: number,
    source: EnergySource
  ): Promise<{
    suggested: number;
    min: number;
    max: number;
    confidence: number; // 0-1
  }> {
    const response = await this.client.getHttpClient().get('/market/price-suggestion', {
      params: { energyAmount, source }
    });
    return response.data;
  }

  /**
   * Subscribe to new offer notifications
   * @param callback Function to call when new offer is created
   * @param filters Optional filters for notifications
   */
  subscribeToOffers(
    callback: (offer: MarketOffer) => void,
    filters?: {
      source?: EnergySource;
      maxPrice?: number;
    }
  ): void {
    // Store filters for filtering in the callback
    const wrappedCallback = (offer: MarketOffer) => {
      if (filters) {
        if (filters.source && offer.source !== filters.source) return;
        if (filters.maxPrice && offer.pricePerKwh > filters.maxPrice) return;
      }
      callback(offer);
    };

    this.client.on('offer', wrappedCallback);
  }

  /**
   * Unsubscribe from offer notifications
   * @param callback Previously registered callback
   */
  unsubscribeFromOffers(callback: (offer: MarketOffer) => void): void {
    this.client.off('offer', callback);
  }

  /**
   * Calculate potential earnings from selling energy
   * @param energyAmount Energy to sell in kWh
   * @param source Energy source
   * @returns Estimated earnings range
   */
  async calculatePotentialEarnings(
    energyAmount: number,
    source: EnergySource
  ): Promise<{
    optimistic: number;
    realistic: number;
    conservative: number;
    currency: string;
  }> {
    const stats = await this.getMarketStats();
    const sourceStats = stats.bySource[source];

    if (!sourceStats) {
      return {
        optimistic: 0,
        realistic: 0,
        conservative: 0,
        currency: 'USD'
      };
    }

    const avgPrice = sourceStats.avgPrice;

    return {
      optimistic: energyAmount * stats.priceRange.max,
      realistic: energyAmount * avgPrice,
      conservative: energyAmount * stats.priceRange.min,
      currency: 'USD'
    };
  }
}
