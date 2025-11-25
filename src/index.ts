/**
 * VOLTNET SDK - Official JavaScript/TypeScript SDK
 * 
 * Voltage Settlement Network - P2P energy trading platform with real-time micropayments
 * 
 * @packageDocumentation
 */

// Main client
export { VoltnetClient } from './VoltnetClient';

// Modules
export { EnergyMeter } from './EnergyMeter';
export { PricingEngine } from './PricingEngine';
export { P2PMarket } from './P2PMarket';
export { TransactionManager } from './TransactionManager';

// Types
export {
  EnergySource,
  ParticipantType,
  TransactionStatus,
  PricingModel,
  EnergyMeasurement,
  Participant,
  PriceInfo,
  EnergyTransaction,
  Settlement,
  MarketOffer,
  VoltnetConfig,
  DeviceRegistration,
  Balance,
  Statistics,
  VoltnetEvents
} from './types';

// Utils
export * as utils from './utils';

/**
 * Create a new VOLTNET client instance
 * 
 * @example
 * ```typescript
 * import { createClient } from '@voltnet/sdk';
 * 
 * const voltnet = createClient({
 *   apiUrl: 'https://api.voltnet.xyz',
 *   apiKey: 'your-api-key',
 *   participantId: 'your-participant-id'
 * });
 * ```
 */
import { VoltnetClient } from './VoltnetClient';
import { EnergyMeter } from './EnergyMeter';
import { PricingEngine } from './PricingEngine';
import { P2PMarket } from './P2PMarket';
import { TransactionManager } from './TransactionManager';
import { VoltnetConfig } from './types';

export interface VoltnetSDK {
  client: VoltnetClient;
  meter: EnergyMeter;
  pricing: PricingEngine;
  market: P2PMarket;
  transactions: TransactionManager;
}

export function createClient(config: VoltnetConfig): VoltnetSDK {
  const client = new VoltnetClient(config);

  return {
    client,
    meter: new EnergyMeter(client),
    pricing: new PricingEngine(client),
    market: new P2PMarket(client),
    transactions: new TransactionManager(client)
  };
}

// Default export
export default { createClient, VoltnetClient };
