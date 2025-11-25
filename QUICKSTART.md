# Quick Start Guide

Get started with VOLTNET SDK in 5 minutes!

## 1. Install

```bash
npm install @voltnet/sdk
```

## 2. Get API Credentials

1. Sign up at [voltnet.xyz](https://voltnet.xyz)
2. Create a participant profile
3. Generate API key from dashboard

## 3. Basic Example

Create `index.js`:

```javascript
const { createClient } = require('@voltnet/sdk');

const voltnet = createClient({
  apiUrl: 'https://api.voltnet.xyz',
  apiKey: 'your-api-key',
  participantId: 'your-participant-id'
});

async function main() {
  // Get your profile
  const profile = await voltnet.client.getProfile();
  console.log('Profile:', profile);

  // Check balance
  const balance = await voltnet.client.getBalance();
  console.log('Balance:', balance.available, balance.currency);

  // Get current energy price
  const price = await voltnet.pricing.getCurrentPrice();
  console.log('Price:', price.pricePerKwh, price.currency, '/kWh');
}

main().catch(console.error);
```

## 4. Run

```bash
node index.js
```

## Next Steps

- 📚 Read the [full documentation](README.md)
- 💡 Check out [examples](examples/)
- 🔧 Explore the [API reference](README.md#api-reference)

## Common Use Cases

### Submit Energy Measurement

```javascript
await voltnet.meter.submitMeasurement({
  deviceId: 'meter-001',
  timestamp: new Date().toISOString(),
  energy: 2.5,
  power: 5.0,
  source: 'solar'
});
```

### Find Best Energy Offer

```javascript
const offer = await voltnet.market.getBestOffer({
  energyNeeded: 20,
  maxPrice: 0.15,
  preferredSource: 'solar'
});
```

### Create Energy Offer

```javascript
const offer = await voltnet.market.createOffer({
  energyAvailable: 50,
  pricePerKwh: 0.12,
  currency: 'USD',
  source: 'solar',
  expiresAt: new Date(Date.now() + 86400000).toISOString()
});
```

### Real-time Updates

```javascript
voltnet.client.on('price-update', (price) => {
  console.log('New price:', price.pricePerKwh);
});

voltnet.client.on('transaction', (tx) => {
  console.log('New transaction:', tx.id);
});
```

## TypeScript

For TypeScript projects:

```typescript
import { createClient, EnergySource } from '@voltnet/sdk';

const voltnet = createClient({
  apiUrl: 'https://api.voltnet.xyz',
  apiKey: process.env.VOLTNET_API_KEY!,
  participantId: process.env.VOLTNET_PARTICIPANT_ID!,
  enableRealtime: true
});
```

## Need Help?

- 📧 dev@voltnet.xyz
- 📖 [Full Documentation](README.md)

Happy coding! ⚡
