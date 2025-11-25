import axios, { AxiosInstance } from 'axios';
import EventEmitter from 'eventemitter3';
import {
  VoltnetConfig,
  Participant,
  Balance,
  Statistics,
  VoltnetEvents
} from './types';

/**
 * Main VOLTNET SDK Client
 * Provides access to all VOLTNET network features
 */
export class VoltnetClient extends EventEmitter<VoltnetEvents> {
  private config: VoltnetConfig;
  private httpClient: AxiosInstance;
  private wsConnection?: WebSocket;

  constructor(config: VoltnetConfig) {
    super();
    this.config = config;

    // Initialize HTTP client
    this.httpClient = axios.create({
      baseURL: config.apiUrl,
      timeout: config.network?.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'X-Participant-Id': config.participantId
      }
    });

    // Setup retry logic
    this.setupRetryLogic();

    // Initialize WebSocket if enabled
    if (config.enableRealtime) {
      this.initializeWebSocket();
    }
  }

  /**
   * Get current participant profile
   */
  async getProfile(): Promise<Participant> {
    const response = await this.httpClient.get(`/participants/${this.config.participantId}`);
    return response.data;
  }

  /**
   * Update participant profile
   */
  async updateProfile(updates: Partial<Participant>): Promise<Participant> {
    const response = await this.httpClient.patch(
      `/participants/${this.config.participantId}`,
      updates
    );
    return response.data;
  }

  /**
   * Get current balance
   */
  async getBalance(): Promise<Balance> {
    const response = await this.httpClient.get(`/participants/${this.config.participantId}/balance`);
    return response.data;
  }

  /**
   * Get statistics for a time period
   */
  async getStatistics(from: string, to: string): Promise<Statistics> {
    const response = await this.httpClient.get(`/participants/${this.config.participantId}/statistics`, {
      params: { from, to }
    });
    return response.data;
  }

  /**
   * Get participant by ID
   */
  async getParticipant(participantId: string): Promise<Participant> {
    const response = await this.httpClient.get(`/participants/${participantId}`);
    return response.data;
  }

  /**
   * Search for participants
   */
  async searchParticipants(query: {
    type?: string;
    location?: { lat: number; lon: number; radius: number };
    limit?: number;
  }): Promise<Participant[]> {
    const response = await this.httpClient.get('/participants/search', {
      params: query
    });
    return response.data;
  }

  /**
   * Setup retry logic for failed requests
   */
  private setupRetryLogic(): void {
    const retries = this.config.network?.retries || 3;

    this.httpClient.interceptors.response.use(
      response => response,
      async error => {
        const config = error.config;
        
        if (!config || !config._retry) {
          config._retry = 0;
        }

        if (config._retry < retries && this.shouldRetry(error)) {
          config._retry += 1;
          
          // Exponential backoff
          const delay = Math.pow(2, config._retry) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return this.httpClient(config);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(error: any): boolean {
    if (!error.response) return true; // Network error
    const status = error.response.status;
    return status >= 500 || status === 429; // Server errors or rate limit
  }

  /**
   * Initialize WebSocket connection for real-time updates
   */
  private initializeWebSocket(): void {
    const wsUrl = this.config.apiUrl.replace('http', 'ws') + '/ws';
    
    try {
      this.wsConnection = new WebSocket(`${wsUrl}?apiKey=${this.config.apiKey}&participantId=${this.config.participantId}`);

      this.wsConnection.onopen = () => {
        console.log('[VOLTNET] WebSocket connected');
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('[VOLTNET] Failed to parse WebSocket message:', error);
        }
      };

      this.wsConnection.onerror = (error) => {
        console.error('[VOLTNET] WebSocket error:', error);
        this.emit('error', new Error('WebSocket connection error'));
      };

      this.wsConnection.onclose = () => {
        console.log('[VOLTNET] WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.initializeWebSocket(), 5000);
      };
    } catch (error) {
      console.error('[VOLTNET] Failed to initialize WebSocket:', error);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(data: any): void {
    const { type, payload } = data;

    switch (type) {
      case 'measurement':
        this.emit('measurement', payload);
        break;
      case 'transaction':
        this.emit('transaction', payload);
        break;
      case 'settlement':
        this.emit('settlement', payload);
        break;
      case 'offer':
        this.emit('offer', payload);
        break;
      case 'price-update':
        this.emit('price-update', payload);
        break;
      case 'balance-update':
        this.emit('balance-update', payload);
        break;
      default:
        console.warn('[VOLTNET] Unknown message type:', type);
    }
  }

  /**
   * Close all connections
   */
  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = undefined;
    }
    this.removeAllListeners();
  }

  /**
   * Get HTTP client for custom requests
   */
  getHttpClient(): AxiosInstance {
    return this.httpClient;
  }
}
