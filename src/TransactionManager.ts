import { VoltnetClient } from './VoltnetClient';
import {
  EnergyTransaction,
  Settlement,
  TransactionStatus
} from './types';

/**
 * Transaction Manager Module
 * Handles energy transactions and settlements
 */
export class TransactionManager {
  private client: VoltnetClient;

  constructor(client: VoltnetClient) {
    this.client = client;
  }

  /**
   * Get transaction by ID
   * @param transactionId Transaction ID
   * @returns Transaction details
   */
  async getTransaction(transactionId: string): Promise<EnergyTransaction> {
    const response = await this.client.getHttpClient().get(`/transactions/${transactionId}`);
    return response.data;
  }

  /**
   * Get all transactions for current participant
   * @param filters Optional filters
   * @returns Array of transactions
   */
  async getTransactions(filters?: {
    from?: string;
    to?: string;
    status?: TransactionStatus;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<EnergyTransaction[]> {
    const response = await this.client.getHttpClient().get('/transactions', {
      params: filters
    });
    return response.data;
  }

  /**
   * Get transactions as seller
   * @param from Optional start date
   * @param to Optional end date
   * @returns Array of transactions where you were the seller
   */
  async getSalesTransactions(from?: string, to?: string): Promise<EnergyTransaction[]> {
    const response = await this.client.getHttpClient().get('/transactions/sales', {
      params: { from, to }
    });
    return response.data;
  }

  /**
   * Get transactions as buyer
   * @param from Optional start date
   * @param to Optional end date
   * @returns Array of transactions where you were the buyer
   */
  async getPurchaseTransactions(from?: string, to?: string): Promise<EnergyTransaction[]> {
    const response = await this.client.getHttpClient().get('/transactions/purchases', {
      params: { from, to }
    });
    return response.data;
  }

  /**
   * Get pending transactions
   * @returns Array of pending transactions
   */
  async getPendingTransactions(): Promise<EnergyTransaction[]> {
    return this.getTransactions({ status: TransactionStatus.PENDING });
  }

  /**
   * Create a direct P2P transaction
   * @param transaction Transaction details
   * @returns Created transaction
   */
  async createTransaction(transaction: {
    buyerId: string;
    energy: number;
    pricePerKwh: number;
    source: string;
    metadata?: Record<string, any>;
  }): Promise<EnergyTransaction> {
    const response = await this.client.getHttpClient().post('/transactions', transaction);
    return response.data;
  }

  /**
   * Cancel a pending transaction
   * @param transactionId Transaction ID
   * @returns Updated transaction
   */
  async cancelTransaction(transactionId: string): Promise<EnergyTransaction> {
    const response = await this.client.getHttpClient().post(`/transactions/${transactionId}/cancel`);
    return response.data;
  }

  /**
   * Get settlement by ID
   * @param settlementId Settlement ID
   * @returns Settlement details
   */
  async getSettlement(settlementId: string): Promise<Settlement> {
    const response = await this.client.getHttpClient().get(`/settlements/${settlementId}`);
    return response.data;
  }

  /**
   * Get all settlements for current participant
   * @param from Optional start date
   * @param to Optional end date
   * @returns Array of settlements
   */
  async getSettlements(from?: string, to?: string): Promise<Settlement[]> {
    const response = await this.client.getHttpClient().get('/settlements', {
      params: { from, to }
    });
    return response.data;
  }

  /**
   * Get pending settlements
   * @returns Array of pending settlements
   */
  async getPendingSettlements(): Promise<Settlement[]> {
    const response = await this.client.getHttpClient().get('/settlements/pending');
    return response.data;
  }

  /**
   * Trigger settlement for pending transactions
   * @param transactionIds Optional array of specific transaction IDs to settle
   * @returns Created settlement
   */
  async triggerSettlement(transactionIds?: string[]): Promise<Settlement> {
    const response = await this.client.getHttpClient().post('/settlements/trigger', {
      transactionIds
    });
    return response.data;
  }

  /**
   * Get transaction receipt
   * @param transactionId Transaction ID
   * @returns Transaction receipt with detailed breakdown
   */
  async getReceipt(transactionId: string): Promise<{
    transaction: EnergyTransaction;
    breakdown: {
      energyCharge: number;
      networkFee: number;
      taxes: number;
      total: number;
    };
    participants: {
      seller: { id: string; name?: string; share: number };
      buyer: { id: string; name?: string };
      network: { share: number };
    };
  }> {
    const response = await this.client.getHttpClient().get(`/transactions/${transactionId}/receipt`);
    return response.data;
  }

  /**
   * Calculate transaction fees
   * @param energy Energy amount in kWh
   * @param pricePerKwh Price per kWh
   * @returns Fee breakdown
   */
  async calculateFees(
    energy: number,
    pricePerKwh: number
  ): Promise<{
    subtotal: number;
    networkFee: number;
    processingFee: number;
    total: number;
    currency: string;
  }> {
    const response = await this.client.getHttpClient().post('/transactions/calculate-fees', {
      energy,
      pricePerKwh
    });
    return response.data;
  }

  /**
   * Get transaction history with aggregated statistics
   * @param period Time period ('day' | 'week' | 'month' | 'year')
   * @returns Aggregated transaction statistics
   */
  async getTransactionSummary(period: 'day' | 'week' | 'month' | 'year'): Promise<{
    totalTransactions: number;
    totalEnergy: number;
    totalSpent: number;
    totalEarned: number;
    netBalance: number;
    averagePrice: number;
    currency: string;
    bySource: Record<string, {
      count: number;
      energy: number;
      amount: number;
    }>;
  }> {
    const response = await this.client.getHttpClient().get('/transactions/summary', {
      params: { period }
    });
    return response.data;
  }

  /**
   * Export transactions to CSV
   * @param from Start date
   * @param to End date
   * @returns CSV data as string
   */
  async exportTransactions(from: string, to: string): Promise<string> {
    const response = await this.client.getHttpClient().get('/transactions/export', {
      params: { from, to, format: 'csv' },
      responseType: 'text'
    });
    return response.data;
  }

  /**
   * Subscribe to transaction updates
   * @param callback Function to call on transaction events
   */
  subscribeToTransactions(callback: (transaction: EnergyTransaction) => void): void {
    this.client.on('transaction', callback);
  }

  /**
   * Unsubscribe from transaction updates
   * @param callback Previously registered callback
   */
  unsubscribeFromTransactions(callback: (transaction: EnergyTransaction) => void): void {
    this.client.off('transaction', callback);
  }

  /**
   * Subscribe to settlement updates
   * @param callback Function to call on settlement events
   */
  subscribeToSettlements(callback: (settlement: Settlement) => void): void {
    this.client.on('settlement', callback);
  }

  /**
   * Unsubscribe from settlement updates
   * @param callback Previously registered callback
   */
  unsubscribeFromSettlements(callback: (settlement: Settlement) => void): void {
    this.client.off('settlement', callback);
  }

  /**
   * Verify transaction integrity
   * @param transactionId Transaction ID
   * @returns Verification result
   */
  async verifyTransaction(transactionId: string): Promise<{
    valid: boolean;
    checks: {
      energyMeasured: boolean;
      priceValid: boolean;
      participantsVerified: boolean;
      signatureValid: boolean;
    };
    issues?: string[];
  }> {
    const response = await this.client.getHttpClient().get(`/transactions/${transactionId}/verify`);
    return response.data;
  }

  /**
   * Request refund for a transaction
   * @param transactionId Transaction ID
   * @param reason Refund reason
   * @returns Refund request details
   */
  async requestRefund(
    transactionId: string,
    reason: string
  ): Promise<{
    refundId: string;
    status: 'pending' | 'approved' | 'rejected';
    message: string;
  }> {
    const response = await this.client.getHttpClient().post(`/transactions/${transactionId}/refund`, {
      reason
    });
    return response.data;
  }
}
