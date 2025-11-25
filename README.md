# VOLTNET SDK

<div align="center">

![VOLTNET Logo](https://via.placeholder.com/200x80/4CAF50/FFFFFF?text=VOLTNET)

**Official JavaScript/TypeScript SDK for VOLTNET - Voltage Settlement Network**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

P2P energy trading platform with real-time micropayments for IoT devices

[Documentation](#documentation) • [Quick Start](#quick-start) • [Examples](#examples) • [API Reference](#api-reference)

</div>

---

## 🌟 What is VOLTNET?

**VOLTNET (Voltage Settlement Network)** is a revolutionary platform that enables:

- ⚡ **Real-time energy trading** between consumers and producers
- 💰 **Micropayments** for actual energy consumption/production
- 🔌 **IoT device integration** with smart meters and charging stations
- 🌍 **P2P energy marketplace** for local energy trading
- 📊 **Dynamic pricing** based on supply and demand
- 🔋 **Battery storage optimization** for buying low and selling high

Think of it as **"Visa for electricity"** - a payment network layer for energy transactions.

---

## 📦 Installation

```bash
npm install @voltnet/sdk
```

or

```bash
yarn add @voltnet/sdk
```

---

## 🚀 Quick Start

### Basic Setup

```typescript
import { createClient } from '@voltnet/sdk';

// Initialize the client
const voltnet = createClient({
  apiUrl: 'https://api.voltnet.xyz',
  apiKey: 'your-api-key',
  participantId: 'your-participant-id',
  enableRealtime: true // Enable WebSocket for real-time updates
});

// Access different modules
const { client, meter, pricing, market, transactions } = voltnet;
```

### Submit Energy Measurement

```typescript
// Submit energy consumption data
const measurement = await meter.submitMeasurement({
  deviceId: 'meter-001',
  timestamp: new Date().toISOString(),
  energy: 2.5, // 2.5 kWh
  power: 5.0, // 5 kW
  voltage: 230,
  current: 21.7,
  source: 'solar'
});

console.log('Measurement submitted:', measurement);
```

### Get Current Energy Price

```typescript
// Get current price for solar energy
const price = await pricing.getCurrentPrice('solar');
console.log(`Current price: ${price.pricePerKwh} ${price.currency}/kWh`);

// Calculate cost
const cost = pricing.calculateCost(10.5, price); // 10.5 kWh
console.log(`Total cost: ${cost} ${price.currency}`);
```

### Browse P2P Market

```typescript
// Find best offer for your needs
const bestOffer = await market.getBestOffer({
  energyNeeded: 20, // 20 kWh
  maxPrice: 0.15, // max $0.15 per kWh
  preferredSource: 'solar'
});

if (bestOffer) {
  // Accept the offer
  const transaction = await market.acceptOffer(bestOffer.id, 20);
  console.log('Transaction created:', transaction.id);
}
```

### Create Your Own Offer

```typescript
// Sell your excess solar energy
const offer = await market.createOffer({
  energyAvailable: 50, // 50 kWh available
  pricePerKwh: 0.12,
  currency: 'USD',
  source: 'solar',
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
  location: {
    latitude: 37.7749,
    longitude: -122.4194,
    radius: 10 // 10 km
  }
});

console.log('Offer created:', offer.id);
```

---

## 📚 Documentation

### Core Concepts

#### Participants

Every user in VOLTNET is a **participant** with one of these roles:

- **Consumer** - Buys energy
- **Producer** - Generates and sells energy (solar panels, wind turbines)
- **Prosumer** - Both consumes and produces
- **Charging Station** - EV charging infrastructure
- **Battery Storage** - Stores energy to buy low, sell high
- **Grid Operator** - Traditional utility company

#### Energy Flow

```
Producer (Solar Panel) 
    ↓ [Energy Measurement]
    ↓ [Real-time Pricing]
    ↓ [Micropayment]
Consumer (EV Charger)
```

#### Settlement

Transactions are settled either:
- **Instantly** - Each micropayment processed immediately
- **Periodically** - Batched every hour/day for efficiency

---

## 💡 Examples

### Example 1: Smart Home with Solar Panels

```typescript
import { createClient, EnergySource } from '@voltnet/sdk';

const voltnet = createClient({
  apiUrl: 'https://api.voltnet.xyz',
  apiKey: process.env.VOLTNET_API_KEY,
  participantId: 'home-12345'
});

// Monitor solar production
setInterval(async () => {
  const currentPower = await voltnet.meter.getCurrentPower('solar-panel-01');
  console.log(`Current production: ${currentPower} kW`);
  
  if (currentPower > 3) {
    // Excess production - create sell offer
    const offer = await voltnet.market.createOffer({
      energyAvailable: currentPower * 0.5, // Sell half
      pricePerKwh: 0.10,
      currency: 'USD',
      source: EnergySource.SOLAR,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    });
    console.log(`Created sell offer: ${offer.id}`);
  }
}, 60000); // Check every minute
```

### Example 2: EV Charging Station

```typescript
// Register charging station
const charger = await voltnet.meter.registerDevice({
  deviceId: 'charger-station-01',
  type: 'charger',
  ownerId: 'company-xyz',
  capabilities: {
    canProduce: false,
    canConsume: true,
    maxPower: 150 // 150 kW DC fast charger
  },
  location: {
    latitude: 40.7128,
    longitude: -74.0060
  }
});

// Handle charging session
async function startCharging(vehicleId: string) {
  const price = await voltnet.pricing.getCurrentPrice();
  console.log(`Charging at ${price.pricePerKwh} ${price.currency}/kWh`);
  
  // Subscribe to real-time measurements
  voltnet.client.on('measurement', (measurement) => {
    if (measurement.deviceId === charger.deviceId) {
      const cost = voltnet.pricing.calculateCost(measurement.energy, price);
      console.log(`Charged ${measurement.energy} kWh, Cost: $${cost}`);
    }
  });
}
```

### Example 3: Battery Storage Arbitrage

```typescript
// Buy energy when cheap, sell when expensive
async function optimizeBattery() {
  const forecast = await voltnet.pricing.getPriceForecast(24);
  
  // Find cheapest hours
  const cheapestHours = forecast
    .sort((a, b) => a.pricePerKwh - b.pricePerKwh)
    .slice(0, 4);
  
  console.log('Best times to charge battery:', cheapestHours);
  
  // Find most expensive hours
  const expensiveHours = forecast
    .sort((a, b) => b.pricePerKwh - a.pricePerKwh)
    .slice(0, 4);
  
  console.log('Best times to sell:', expensiveHours);
}
```

### Example 4: Real-time Monitoring Dashboard

```typescript
import { createClient } from '@voltnet/sdk';

const voltnet = createClient({
  apiUrl: 'https://api.voltnet.xyz',
  apiKey: process.env.VOLTNET_API_KEY,
  participantId: 'user-001',
  enableRealtime: true
});

// Subscribe to all events
voltnet.client.on('transaction', (tx) => {
  console.log(`New transaction: ${tx.energy} kWh for $${tx.totalCost}`);
});

voltnet.client.on('settlement', (settlement) => {
  console.log(`Settlement completed: $${settlement.totalAmount}`);
});

voltnet.client.on('price-update', (price) => {
  console.log(`Price update: ${price.pricePerKwh} ${price.currency}/kWh`);
});

voltnet.client.on('balance-update', (balance) => {
  console.log(`Balance: $${balance.available}`);
});

// Get statistics
const stats = await voltnet.client.getStatistics(
  '2024-01-01T00:00:00Z',
  '2024-01-31T23:59:59Z'
);

console.log(`Energy consumed: ${stats.totalConsumed} kWh`);
console.log(`Energy produced: ${stats.totalProduced} kWh`);
console.log(`Total spent: $${stats.totalSpent}`);
console.log(`Total earned: $${stats.totalEarned}`);
```

---

## 🔌 API Reference

### VoltnetClient

Main client for interacting with VOLTNET.

```typescript
const client = new VoltnetClient(config);

// Methods
await client.getProfile();
await client.updateProfile(updates);
await client.getBalance();
await client.getStatistics(from, to);
await client.getParticipant(participantId);
await client.searchParticipants(query);
client.disconnect();

// Events
client.on('measurement', (data) => {});
client.on('transaction', (data) => {});
client.on('settlement', (data) => {});
client.on('offer', (data) => {});
client.on('price-update', (data) => {});
client.on('balance-update', (data) => {});
client.on('error', (error) => {});
```

### EnergyMeter

Handle energy measurements and device management.

```typescript
// Submit measurements
await meter.submitMeasurement(measurement);
await meter.submitBatch(measurements);

// Query measurements
await meter.getMeasurements(deviceId, from, to);
await meter.getLatestMeasurement(deviceId);

// Device management
await meter.registerDevice(device);
await meter.getDevice(deviceId);
await meter.getDevices();
await meter.updateDevice(deviceId, updates);
await meter.deleteDevice(deviceId);

// Calculations
await meter.calculateEnergyTotal(deviceId, from, to);
await meter.getCurrentPower(deviceId);
```

### PricingEngine

Dynamic pricing and cost calculations.

```typescript
// Get prices
await pricing.getCurrentPrice(source, location);
await pricing.getPriceHistory(from, to, source);
await pricing.getPriceForecast(hours, source);

// Calculations
pricing.calculateCost(energy, price);
pricing.calculateDynamicPrice(demand, supply, basePrice);

// Optimal timing
await pricing.getOptimalChargingTime(hours, startFrom);

// Custom pricing
await pricing.setCustomPrice(priceInfo);

// Subscribe to updates
pricing.subscribeToPriceUpdates(callback);
pricing.unsubscribeFromPriceUpdates(callback);
```

### P2PMarket

Peer-to-peer energy trading marketplace.

```typescript
// Offers
await market.createOffer(offer);
await market.getOffers(filters);
await market.getOffer(offerId);
await market.getMyOffers();
await market.acceptOffer(offerId, energyAmount);
await market.cancelOffer(offerId);
await market.updateOffer(offerId, updates);

// Search
await market.findNearbyOffers(lat, lon, radiusKm);
await market.getBestOffer(criteria);

// Analytics
await market.getMarketStats();
await market.getSuggestedPrice(energyAmount, source);
await market.calculatePotentialEarnings(energyAmount, source);

// Subscriptions
market.subscribeToOffers(callback, filters);
market.unsubscribeFromOffers(callback);
```

### TransactionManager

Manage energy transactions and settlements.

```typescript
// Transactions
await transactions.getTransaction(transactionId);
await transactions.getTransactions(filters);
await transactions.getSalesTransactions(from, to);
await transactions.getPurchaseTransactions(from, to);
await transactions.getPendingTransactions();
await transactions.createTransaction(transaction);
await transactions.cancelTransaction(transactionId);

// Settlements
await transactions.getSettlement(settlementId);
await transactions.getSettlements(from, to);
await transactions.getPendingSettlements();
await transactions.triggerSettlement(transactionIds);

// Analytics
await transactions.getReceipt(transactionId);
await transactions.calculateFees(energy, pricePerKwh);
await transactions.getTransactionSummary(period);
await transactions.exportTransactions(from, to);

// Verification
await transactions.verifyTransaction(transactionId);
await transactions.requestRefund(transactionId, reason);

// Subscriptions
transactions.subscribeToTransactions(callback);
transactions.subscribeToSettlements(callback);
```

---

## 🛠️ Utilities

```typescript
import { utils } from '@voltnet/sdk';

// Unit conversions
utils.wattsToKw(1000); // 1
utils.kwToWatts(5); // 5000
utils.calculateEnergy(10, 2); // 20 kWh (10 kW for 2 hours)

// Formatting
utils.formatEnergy(1.5); // "1.50 kWh"
utils.formatPower(0.5); // "500 W"
utils.formatCurrency(123.45, 'USD'); // "$123.45"

// Geolocation
utils.calculateDistance(lat1, lon1, lat2, lon2); // distance in km
utils.isWithinRadius(point, center, radiusKm);

// Time
utils.getCurrentTimestamp();
utils.getHoursDifference(start, end);
utils.isValidTimestamp(timestamp);

// Validation
utils.validateMeasurement(measurement);
utils.parseEnergy("10.5 kWh"); // 10.5

// Environmental
utils.calculateCO2(energyKwh, source); // kg CO2
utils.calculateGreenSavings(energyKwh); // kg CO2 saved

// Async utilities
await utils.retryWithBackoff(fn, maxRetries, initialDelay);
utils.debounce(fn, delay);
utils.throttle(fn, limit);
```

---

## 🔐 Authentication

Get your API credentials:

1. Register at [voltnet.xyz](https://voltnet.xyz)
2. Create a participant profile
3. Generate an API key in the dashboard
4. Use the API key in your configuration

```typescript
const voltnet = createClient({
  apiUrl: 'https://api.voltnet.xyz',
  apiKey: process.env.VOLTNET_API_KEY, // Store securely
  participantId: 'your-participant-id'
});
```

---

## 📊 TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import {
  EnergyMeasurement,
  EnergySource,
  PriceInfo,
  MarketOffer,
  EnergyTransaction,
  ParticipantType
} from '@voltnet/sdk';

const measurement: EnergyMeasurement = {
  deviceId: 'meter-001',
  timestamp: new Date().toISOString(),
  energy: 5.0,
  source: EnergySource.SOLAR
};
```

---

## 🧪 Testing

```bash
npm test
```

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🗺️ Roadmap

- [ ] Blockchain integration for settlements
- [ ] Mobile SDK (React Native)
- [ ] Python SDK
- [ ] GraphQL API support
- [ ] Advanced analytics dashboard
- [ ] Machine learning for price predictions

---

<div align="center">

**Built with ⚡ by the VOLTNET Team**

[Website](https://voltnet.xyz) • [Documentation](https://docs.voltnet.xyz) • [GitHub](https://github.com/voltnet)

</div>
