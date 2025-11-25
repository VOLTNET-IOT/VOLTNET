import { VoltnetClient } from './VoltnetClient';
import {
  PriceInfo,
  PricingModel,
  EnergySource
} from './types';

/**
 * Pricing Engine Module
 * Handles dynamic pricing calculations and price queries
 */
export class PricingEngine {
  private client: VoltnetClient;

  constructor(client: VoltnetClient) {
    this.client = client;
  }

  /**
   * Get current price for energy
   * @param source Energy source type
   * @param location Optional location for localized pricing
   * @returns Current price information
   */
  async getCurrentPrice(
    source?: EnergySource,
    location?: { latitude: number; longitude: number }
  ): Promise<PriceInfo> {
    const response = await this.client.getHttpClient().get('/pricing/current', {
      params: {
        source,
        lat: location?.latitude,
        lon: location?.longitude
      }
    });
    return response.data;
  }

  /**
   * Get price history for a time range
   * @param from Start timestamp
   * @param to End timestamp
   * @param source Optional energy source filter
   * @returns Array of historical prices
   */
  async getPriceHistory(
    from: string,
    to: string,
    source?: EnergySource
  ): Promise<PriceInfo[]> {
    const response = await this.client.getHttpClient().get('/pricing/history', {
      params: { from, to, source }
    });
    return response.data;
  }

  /**
   * Get predicted future prices
   * @param hours Number of hours to predict
   * @param source Optional energy source
   * @returns Array of predicted prices
   */
  async getPriceForecast(
    hours: number = 24,
    source?: EnergySource
  ): Promise<PriceInfo[]> {
    const response = await this.client.getHttpClient().get('/pricing/forecast', {
      params: { hours, source }
    });
    return response.data;
  }

  /**
   * Calculate cost for energy consumption
   * @param energy Energy in kWh
   * @param price Price per kWh
   * @returns Total cost
   */
  calculateCost(energy: number, price: PriceInfo): number {
    let basePrice = price.pricePerKwh * energy;

    // Apply factors if present
    if (price.factors) {
      if (price.factors.timeOfDay) {
        basePrice *= price.factors.timeOfDay;
      }
      if (price.factors.demandLoad) {
        basePrice *= price.factors.demandLoad;
      }
      if (price.factors.greenEnergy) {
        basePrice *= price.factors.greenEnergy;
      }
    }

    return parseFloat(basePrice.toFixed(4));
  }

  /**
   * Get optimal charging time (when prices are lowest)
   * @param hours Number of hours needed for charging
   * @param startFrom Start timestamp
   * @returns Optimal start time and expected cost
   */
  async getOptimalChargingTime(
    hours: number,
    startFrom?: string
  ): Promise<{
    optimalStart: string;
    estimatedCost: number;
    pricePerKwh: number;
  }> {
    const response = await this.client.getHttpClient().get('/pricing/optimal', {
      params: {
        hours,
        startFrom: startFrom || new Date().toISOString()
      }
    });
    return response.data;
  }

  /**
   * Set custom pricing for your energy production
   * @param priceInfo Custom price information
   * @returns Confirmation
   */
  async setCustomPrice(priceInfo: Omit<PriceInfo, 'validFrom'>): Promise<PriceInfo> {
    const response = await this.client.getHttpClient().post('/pricing/custom', {
      ...priceInfo,
      validFrom: new Date().toISOString()
    });
    return response.data;
  }

  /**
   * Get pricing model for a participant
   * @param participantId Participant ID
   * @returns Pricing model configuration
   */
  async getPricingModel(participantId: string): Promise<{
    model: PricingModel;
    basePrice: number;
    currency: string;
    factors?: any;
  }> {
    const response = await this.client.getHttpClient().get(`/pricing/model/${participantId}`);
    return response.data;
  }

  /**
   * Compare prices across different sources
   * @param sources Array of energy sources to compare
   * @returns Price comparison data
   */
  async comparePrices(sources: EnergySource[]): Promise<{
    comparison: Array<{
      source: EnergySource;
      price: PriceInfo;
      savings?: number;
    }>;
    cheapest: EnergySource;
  }> {
    const response = await this.client.getHttpClient().post('/pricing/compare', {
      sources
    });
    return response.data;
  }

  /**
   * Calculate dynamic price based on demand and supply
   * @param demand Current demand in kW
   * @param supply Current supply in kW
   * @param basePrice Base price per kWh
   * @returns Adjusted price
   */
  calculateDynamicPrice(demand: number, supply: number, basePrice: number): number {
    const ratio = demand / supply;
    
    // Simple dynamic pricing algorithm
    let multiplier = 1.0;
    
    if (ratio > 1.2) {
      // High demand - increase price
      multiplier = 1 + (ratio - 1) * 0.5;
    } else if (ratio < 0.8) {
      // Low demand - decrease price
      multiplier = 0.7 + ratio * 0.25;
    }

    return parseFloat((basePrice * multiplier).toFixed(4));
  }

  /**
   * Get time-of-use pricing schedule
   * @returns Daily pricing schedule
   */
  async getTimeOfUseSchedule(): Promise<Array<{
    startHour: number;
    endHour: number;
    pricePerKwh: number;
    period: 'peak' | 'off-peak' | 'mid-peak';
  }>> {
    const response = await this.client.getHttpClient().get('/pricing/time-of-use');
    return response.data;
  }

  /**
   * Subscribe to real-time price updates
   * @param callback Function to call when price updates
   */
  subscribeToPriceUpdates(callback: (price: PriceInfo) => void): void {
    this.client.on('price-update', callback);
  }

  /**
   * Unsubscribe from price updates
   * @param callback Previously registered callback
   */
  unsubscribeFromPriceUpdates(callback: (price: PriceInfo) => void): void {
    this.client.off('price-update', callback);
  }
}
