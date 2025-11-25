# VOLTNET SDK Examples

This directory contains example implementations demonstrating various use cases of the VOLTNET SDK.

## Prerequisites

Before running the examples, make sure you have:

1. Node.js >= 16.x installed
2. VOLTNET account with API credentials
3. Environment variables set up

## Setup

Create a `.env` file in the root directory:

```env
VOLTNET_API_KEY=your-api-key
VOLTNET_PARTICIPANT_ID=your-participant-id
VOLTNET_API_URL=https://api.voltnet.xyz
```

Install dependencies:

```bash
npm install
```

Build the project:

```bash
npm run build
```

## Available Examples

### 1. Basic Usage (`basic-usage.ts`)

Demonstrates fundamental SDK operations:
- Initializing the client
- Getting participant profile
- Checking balance
- Submitting measurements
- Querying prices
- Browsing market offers
- Real-time event subscriptions

**Run:**
```bash
npm run build && node dist/examples/basic-usage.js
```

**Or with ts-node:**
```bash
npx ts-node examples/basic-usage.ts
```

### 2. Solar Energy Trading (`solar-trading.ts`)

Shows how to:
- Register a solar panel device
- Monitor energy production
- Automatically create market offers for excess energy
- Track earnings from energy sales
- Calculate environmental impact

**Run:**
```bash
npx ts-node examples/solar-trading.ts
```

**Use case:** Home with rooftop solar panels selling excess energy to neighbors

### 3. EV Charging (`ev-charging.ts`)

Demonstrates smart EV charging:
- Finding optimal charging times based on price forecasts
- Comparing immediate vs. delayed charging costs
- Searching for green energy offers
- Monitoring charging sessions
- Calculating range added

**Run:**
```bash
npx ts-node examples/ev-charging.ts
```

**Use case:** Electric vehicle owner optimizing charging costs

## Creating Your Own Examples

You can create custom examples by importing the SDK:

```typescript
import { createClient, EnergySource } from '@voltnet/sdk';

const voltnet = createClient({
  apiUrl: process.env.VOLTNET_API_URL!,
  apiKey: process.env.VOLTNET_API_KEY!,
  participantId: process.env.VOLTNET_PARTICIPANT_ID!
});

// Your code here
```

## Tips

1. **Start Simple**: Begin with `basic-usage.ts` to understand the fundamentals
2. **Use Real-time Events**: Enable WebSocket for live updates
3. **Error Handling**: Always wrap SDK calls in try-catch blocks
4. **Environment Variables**: Never commit API keys to version control
5. **Testing**: Use the sandbox environment for testing

## Common Issues

### Connection Errors

If you get connection errors, check:
- API URL is correct
- API key is valid
- Network allows outbound HTTPS connections

### Authentication Errors

Verify:
- API key format is correct
- Participant ID matches your account
- API key hasn't expired

## Additional Resources

- [API Reference](../README.md#api-reference)

## Need Help?

- Check the [main README](../README.md)
- Open an issue on GitHub
- Email: support@voltnet.xyz

---

Happy coding! ⚡
