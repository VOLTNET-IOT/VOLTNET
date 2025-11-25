/**
 * Solar Energy Trading Example
 * 
 * This example shows how to sell excess solar energy on the P2P market
 */

import { createClient, EnergySource } from '../src';

async function main() {
  const voltnet = createClient({
    apiUrl: 'https://api.voltnet.xyz',
    apiKey: process.env.VOLTNET_API_KEY || 'your-api-key',
    participantId: process.env.VOLTNET_PARTICIPANT_ID || 'solar-producer-001',
    enableRealtime: true
  });

  console.log('☀️ VOLTNET - Solar Energy Trading\n');

  try {
    // Register solar panel device
    console.log('🔧 Registering solar panel...');
    const device = await voltnet.meter.registerDevice({
      deviceId: 'solar-panel-roof-01',
      type: 'solar_panel',
      ownerId: voltnet.client['config'].participantId,
      capabilities: {
        canProduce: true,
        canConsume: false,
        maxPower: 10 // 10 kW system
      },
      location: {
        latitude: 37.7749,
        longitude: -122.4194
      },
      metadata: {
        manufacturer: 'SolarTech',
        model: 'ST-10000',
        installDate: '2024-01-01'
      }
    });
    console.log(`   ✅ Registered: ${device.deviceId}\n`);

    // Monitor production and create offers
    console.log('📊 Starting production monitoring...\n');

    // Simulate monitoring loop
    let iteration = 0;
    const monitoringInterval = setInterval(async () => {
      iteration++;

      // Simulate current production (varies by time of day)
      const hour = new Date().getHours();
      let currentProduction = 0;

      if (hour >= 8 && hour <= 18) {
        // Daytime production (peak at noon)
        const hoursSinceSunrise = hour - 8;
        const hoursUntilSunset = 18 - hour;
        const peakFactor = Math.min(hoursSinceSunrise, hoursUntilSunset) / 5;
        currentProduction = 8 * peakFactor; // Up to 8 kW
      }

      console.log(`⚡ Current production: ${currentProduction.toFixed(2)} kW`);

      // Submit measurement
      const measurement = await voltnet.meter.submitMeasurement({
        deviceId: device.deviceId,
        timestamp: new Date().toISOString(),
        energy: currentProduction / 12, // Convert to kWh (5-minute interval)
        power: currentProduction,
        source: EnergySource.SOLAR
      });

      // If producing excess energy, create sell offer
      if (currentProduction > 2) {
        const excessEnergy = currentProduction - 2; // Keep 2 kW for home use
        
        // Get market price suggestion
        const suggestion = await voltnet.market.getSuggestedPrice(
          excessEnergy,
          EnergySource.SOLAR
        );

        console.log(`💡 Excess energy available: ${excessEnergy.toFixed(2)} kW`);
        console.log(`💵 Suggested price: ${suggestion.suggested} ${voltnet.client['config'].participantId.includes('RUB') ? 'RUB' : 'USD'}/kWh`);

        // Create offer
        const offer = await voltnet.market.createOffer({
          energyAvailable: excessEnergy * 0.5, // Offer for 30 minutes
          pricePerKwh: suggestion.suggested * 0.95, // Slightly below market
          currency: 'USD',
          source: EnergySource.SOLAR,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          location: {
            latitude: device.location!.latitude,
            longitude: device.location!.longitude,
            radius: 5 // 5 km radius
          },
          metadata: {
            greenEnergy: true,
            certified: true
          }
        });

        console.log(`📢 Created offer: ${offer.id}`);
        console.log(`   Available: ${offer.energyAvailable} kWh`);
        console.log(`   Price: ${offer.pricePerKwh} ${offer.currency}/kWh`);
      }

      console.log('');

      // Stop after 5 iterations for demo
      if (iteration >= 5) {
        clearInterval(monitoringInterval);
        showDailySummary();
      }
    }, 5000); // Check every 5 seconds (simulating 5-minute intervals)

    // Subscribe to transaction notifications
    voltnet.client.on('transaction', (transaction) => {
      if (transaction.sellerId === voltnet.client['config'].participantId) {
        console.log('💰 Energy sold!');
        console.log(`   Energy: ${transaction.energy} kWh`);
        console.log(`   Earned: ${transaction.totalCost} ${transaction.currency}`);
        console.log('');
      }
    });

    // Function to show daily summary
    async function showDailySummary() {
      console.log('📈 Daily Summary\n');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats = await voltnet.client.getStatistics(
        today.toISOString(),
        new Date().toISOString()
      );

      console.log(`Energy produced: ${stats.totalProduced.toFixed(2)} kWh`);
      console.log(`Energy sold: ${(stats.totalProduced - stats.totalConsumed).toFixed(2)} kWh`);
      console.log(`Revenue: ${stats.totalEarned.toFixed(2)} ${stats.currency}`);
      console.log(`Average price: ${stats.avgPriceReceived?.toFixed(4)} ${stats.currency}/kWh`);

      // Calculate environmental impact
      const co2Saved = (stats.totalProduced * 0.5).toFixed(2); // 0.5 kg CO2 per kWh
      console.log(`\n🌍 Environmental Impact:`);
      console.log(`   CO2 emissions avoided: ${co2Saved} kg`);

      voltnet.client.disconnect();
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    voltnet.client.disconnect();
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export default main;
