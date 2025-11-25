/**
 * Basic Usage Example
 * 
 * This example demonstrates the basic functionality of VOLTNET SDK
 */

import { createClient, EnergySource } from '../src';

async function main() {
  // Initialize client
  const voltnet = createClient({
    apiUrl: 'https://api.voltnet.xyz',
    apiKey: process.env.VOLTNET_API_KEY || 'your-api-key',
    participantId: process.env.VOLTNET_PARTICIPANT_ID || 'participant-001',
    enableRealtime: true
  });

  console.log('🔌 VOLTNET SDK - Basic Usage Example\n');

  try {
    // 1. Get participant profile
    console.log('📋 Getting profile...');
    const profile = await voltnet.client.getProfile();
    console.log(`   Name: ${profile.name}`);
    console.log(`   Type: ${profile.type}`);
    console.log(`   Wallet: ${profile.walletAddress}\n`);

    // 2. Check balance
    console.log('💰 Checking balance...');
    const balance = await voltnet.client.getBalance();
    console.log(`   Available: ${balance.available} ${balance.currency}`);
    console.log(`   Pending: ${balance.pending} ${balance.currency}\n`);

    // 3. Submit energy measurement
    console.log('⚡ Submitting energy measurement...');
    const measurement = await voltnet.meter.submitMeasurement({
      deviceId: 'meter-001',
      timestamp: new Date().toISOString(),
      energy: 2.5,
      power: 5.0,
      voltage: 230,
      current: 21.7,
      source: EnergySource.SOLAR
    });
    console.log(`   Submitted: ${measurement.energy} kWh from ${measurement.source}\n`);

    // 4. Get current price
    console.log('💵 Getting current price...');
    const price = await voltnet.pricing.getCurrentPrice(EnergySource.SOLAR);
    console.log(`   Price: ${price.pricePerKwh} ${price.currency}/kWh`);
    console.log(`   Model: ${price.model}\n`);

    // 5. Browse market offers
    console.log('🛒 Browsing market offers...');
    const offers = await voltnet.market.getOffers({
      source: EnergySource.SOLAR,
      maxPrice: 0.15
    });
    console.log(`   Found ${offers.length} offers`);
    if (offers.length > 0) {
      console.log(`   Best offer: ${offers[0].pricePerKwh} ${offers[0].currency}/kWh\n`);
    }

    // 6. Get statistics
    console.log('📊 Getting statistics...');
    const stats = await voltnet.client.getStatistics(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
      new Date().toISOString()
    );
    console.log(`   Energy consumed: ${stats.totalConsumed} kWh`);
    console.log(`   Energy produced: ${stats.totalProduced} kWh`);
    console.log(`   Total spent: ${stats.totalSpent} ${stats.currency}`);
    console.log(`   Total earned: ${stats.totalEarned} ${stats.currency}\n`);

    // 7. Subscribe to real-time updates
    console.log('🔔 Subscribing to real-time updates...');
    voltnet.client.on('price-update', (priceUpdate) => {
      console.log(`   💵 Price update: ${priceUpdate.pricePerKwh} ${priceUpdate.currency}/kWh`);
    });

    voltnet.client.on('transaction', (transaction) => {
      console.log(`   💳 New transaction: ${transaction.energy} kWh for ${transaction.totalCost} ${transaction.currency}`);
    });

    console.log('   Listening for events... (press Ctrl+C to exit)\n');

    // Keep the process running to receive events
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    voltnet.client.disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export default main;
