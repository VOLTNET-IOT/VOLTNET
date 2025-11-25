/**
 * VOLTNET SDK Types
 * Core type definitions for the Voltage Settlement Network
 */

/**
 * Energy source types
 */
export enum EnergySource {
  SOLAR = 'solar',
  WIND = 'wind',
  GRID = 'grid',
  HYDRO = 'hydro',
  BATTERY = 'battery',
  OTHER = 'other'
}

/**
 * Participant types in the network
 */
export enum ParticipantType {
  CONSUMER = 'consumer',
  PRODUCER = 'producer',
  PROSUMER = 'prosumer', // Both consumer and producer
  CHARGING_STATION = 'charging_station',
  BATTERY_STORAGE = 'battery_storage',
  GRID_OPERATOR = 'grid_operator'
}

/**
 * Transaction status
 */
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Pricing model types
 */
export enum PricingModel {
  FIXED = 'fixed',
  DYNAMIC = 'dynamic',
  TIME_OF_USE = 'time_of_use',
  REAL_TIME = 'real_time'
}

/**
 * Energy measurement data
 */
export interface EnergyMeasurement {
  /** Device/meter ID */
  deviceId: string;
  /** Timestamp of measurement (ISO 8601) */
  timestamp: string;
  /** Energy in kWh */
  energy: number;
  /** Power in kW (instantaneous) */
  power?: number;
  /** Voltage in V */
  voltage?: number;
  /** Current in A */
  current?: number;
  /** Energy source type */
  source: EnergySource;
  /** Digital signature of the measurement */
  signature?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Participant profile
 */
export interface Participant {
  /** Unique participant ID */
  id: string;
  /** Participant type */
  type: ParticipantType;
  /** Display name */
  name?: string;
  /** Geographic location */
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  /** Wallet address for settlements */
  walletAddress: string;
  /** Active devices */
  devices?: string[];
  /** Metadata */
  metadata?: Record<string, any>;
}

/**
 * Price information
 */
export interface PriceInfo {
  /** Price per kWh in local currency */
  pricePerKwh: number;
  /** Currency code (USD, EUR, RUB, etc.) */
  currency: string;
  /** Pricing model used */
  model: PricingModel;
  /** Valid from timestamp */
  validFrom: string;
  /** Valid until timestamp */
  validUntil?: string;
  /** Energy source this price applies to */
  source?: EnergySource;
  /** Additional pricing factors */
  factors?: {
    timeOfDay?: number; // multiplier
    demandLoad?: number; // multiplier
    greenEnergy?: number; // multiplier
  };
}

/**
 * Energy transaction
 */
export interface EnergyTransaction {
  /** Transaction ID */
  id: string;
  /** Seller participant ID */
  sellerId: string;
  /** Buyer participant ID */
  buyerId: string;
  /** Energy amount in kWh */
  energy: number;
  /** Price per kWh */
  pricePerKwh: number;
  /** Total cost */
  totalCost: number;
  /** Currency */
  currency: string;
  /** Transaction timestamp */
  timestamp: string;
  /** Energy source */
  source: EnergySource;
  /** Transaction status */
  status: TransactionStatus;
  /** Settlement details */
  settlement?: {
    settlementId: string;
    settlementTime?: string;
    txHash?: string; // blockchain transaction hash if applicable
  };
  /** Metadata */
  metadata?: Record<string, any>;
}

/**
 * Settlement record
 */
export interface Settlement {
  /** Settlement ID */
  id: string;
  /** Participants involved */
  participants: string[];
  /** List of transaction IDs included */
  transactions: string[];
  /** Total amount */
  totalAmount: number;
  /** Currency */
  currency: string;
  /** Settlement timestamp */
  timestamp: string;
  /** Blockchain transaction hash (if on-chain) */
  txHash?: string;
  /** Settlement status */
  status: 'pending' | 'completed' | 'failed';
}

/**
 * P2P Market offer
 */
export interface MarketOffer {
  /** Offer ID */
  id: string;
  /** Seller participant ID */
  sellerId: string;
  /** Energy amount available in kWh */
  energyAvailable: number;
  /** Price per kWh */
  pricePerKwh: number;
  /** Currency */
  currency: string;
  /** Energy source */
  source: EnergySource;
  /** Offer creation time */
  createdAt: string;
  /** Offer expiration time */
  expiresAt: string;
  /** Location (for local trading) */
  location?: {
    latitude: number;
    longitude: number;
    radius?: number; // in km
  };
  /** Offer status */
  status: 'active' | 'fulfilled' | 'expired' | 'cancelled';
  /** Metadata */
  metadata?: Record<string, any>;
}

/**
 * Configuration for VoltnetClient
 */
export interface VoltnetConfig {
  /** API endpoint URL */
  apiUrl: string;
  /** API key for authentication */
  apiKey: string;
  /** Participant ID */
  participantId: string;
  /** Network configuration */
  network?: {
    /** Timeout for requests in ms */
    timeout?: number;
    /** Retry attempts */
    retries?: number;
  };
  /** Enable real-time updates via WebSocket */
  enableRealtime?: boolean;
}

/**
 * Device registration data
 */
export interface DeviceRegistration {
  /** Device ID */
  deviceId: string;
  /** Device type */
  type: 'meter' | 'charger' | 'solar_panel' | 'battery' | 'other';
  /** Owner participant ID */
  ownerId: string;
  /** Device capabilities */
  capabilities: {
    canProduce: boolean;
    canConsume: boolean;
    maxPower?: number; // in kW
    maxEnergy?: number; // in kWh (for batteries)
  };
  /** Location */
  location?: {
    latitude: number;
    longitude: number;
  };
  /** Public key for signature verification */
  publicKey?: string;
  /** Metadata */
  metadata?: Record<string, any>;
}

/**
 * Balance information
 */
export interface Balance {
  /** Participant ID */
  participantId: string;
  /** Available balance */
  available: number;
  /** Pending settlements */
  pending: number;
  /** Currency */
  currency: string;
  /** Energy credit in kWh */
  energyCredit?: number;
  /** Last updated timestamp */
  lastUpdated: string;
}

/**
 * Statistics data
 */
export interface Statistics {
  /** Participant ID */
  participantId: string;
  /** Time period */
  period: {
    from: string;
    to: string;
  };
  /** Total energy consumed in kWh */
  totalConsumed: number;
  /** Total energy produced in kWh */
  totalProduced: number;
  /** Total spent */
  totalSpent: number;
  /** Total earned */
  totalEarned: number;
  /** Currency */
  currency: string;
  /** Average price paid per kWh */
  avgPricePaid?: number;
  /** Average price received per kWh */
  avgPriceReceived?: number;
  /** Breakdown by energy source */
  sourceBreakdown?: Record<EnergySource, number>;
}

/**
 * Event types for real-time updates
 */
export interface VoltnetEvents {
  'measurement': (data: EnergyMeasurement) => void;
  'transaction': (data: EnergyTransaction) => void;
  'settlement': (data: Settlement) => void;
  'offer': (data: MarketOffer) => void;
  'price-update': (data: PriceInfo) => void;
  'balance-update': (data: Balance) => void;
  'error': (error: Error) => void;
}
