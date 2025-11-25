/**
 * EV Charging Example
 * 
 * This example demonstrates smart EV charging with optimal pricing
 */

import { createClient, EnergySource, utils } from '../src';

async function main() {
  const voltnet = createClient({
    apiUrl: 'https://api.voltnet.xyz',
    apiKey: process.env.VOLTNET_API_KEY || 'your-api-key',
    participantId: process.env.VOLTNET_PARTICIPANT_ID || 'ev-owner-001',
    enableRealtime: true
  });

  console.log('🚗 VOLTNET - Smart EV Charging\n');

  try {
    // EV battery specs
    const batteryCapacity = 75; // kWh (Tesla Model 3 Long Range)
    const currentCharge = 20; // 20% current charge
    const targetCharge = 80; // Target 80% for battery health
    const chargingPower = 11; // 11 kW home charger

    const energyNeeded = (batteryCapacity * (targetCharge - currentCharge) / 100);
    const hoursNeeded = energyNeeded / chargingPower;

    console.log('🔋 Battery Status:');
    console.log(`   Capacity: ${batteryCapacity} kWh`);
    console.log(`   Current: ${currentCharge}%`);
    console.log(`   Target: ${targetCharge}%`);
    console.log(`   Energy needed: ${energyNeeded.toFixed(2)} kWh`);
    console.log(`   Charging time: ${hoursNeeded.toFixed(2)} hours\n`);

    // Find optimal charging time
    console.log('⏰ Finding optimal charging time...');
    const optimal = await voltnet.pricing.getOptimalChargingTime(
      hoursNeeded,
      new Date().toISOString()
    );

    console.log(`   Best start time: ${new Date(optimal.optimalStart).toLocaleString()}`);
    console.log(`   Estimated cost: ${optimal.estimatedCost.toFixed(2)} USD`);
    console.log(`   Average price: ${optimal.pricePerKwh.toFixed(4)} USD/kWh\n`);

    // Compare with immediate charging
    const currentPrice = await voltnet.pricing.getCurrentPrice();
    const immediateChargingCost = voltnet.pricing.calculateCost(energyNeeded, currentPrice);

    console.log('💡 Price Comparison:');
    console.log(`   Charge now: $${immediateChargingCost.toFixed(2)}`);
    console.log(`   Optimal time: $${optimal.estimatedCost.toFixed(2)}`);
    console.log(`   Savings: $${(immediateChargingCost - optimal.estimatedCost).toFixed(2)} (${((1 - optimal.estimatedCost / immediateChargingCost) * 100).toFixed(1)}%)\n`);

    // Find best P2P offers (prefer green energy)
    console.log('🌱 Searching for green energy offers...');
    const bestOffer = await voltnet.market.getBestOffer({
      energyNeeded,
      maxPrice: currentPrice.pricePerKwh,
      preferredSource: EnergySource.SOLAR
    });

    if (bestOffer) {
      console.log(`   ✅ Found green energy offer!`);
      console.log(`   Seller: ${bestOffer.sellerId}`);
      console.log(`   Price: ${bestOffer.pricePerKwh} ${bestOffer.currency}/kWh`);
      console.log(`   Source: ${bestOffer.source}`);
      console.log(`   Distance: ~${Math.random() * 5 + 1}km\n`);

      const greenCost = energyNeeded * bestOffer.pricePerKwh;
      const co2Saved = utils.calculateGreenSavings(energyNeeded);

      console.log(`🌍 Environmental Impact:`);
      console.log(`   Cost: $${greenCost.toFixed(2)}`);
      console.log(`   CO2 saved: ${co2Saved.toFixed(2)} kg\n`);
    } else {
      console.log(`   No green energy offers available right now\n`);
    }

    // Start charging simulation
    console.log('⚡ Starting charging session...\n');
    
    let chargedEnergy = 0;
    let totalCost = 0;
    let startTime = Date.now();

    const chargingInterval = setInterval(async () => {
      // Simulate charging for 5 minutes
      const intervalHours = 5 / 60; // 5 minutes
      const intervalEnergy = chargingPower * intervalHours;
      
      chargedEnergy += intervalEnergy;
      
      // Get current price and calculate cost
      const price = await voltnet.pricing.getCurrentPrice();
      const intervalCost = voltnet.pricing.calculateCost(intervalEnergy, price);
      totalCost += intervalCost;

      const percentCharged = currentCharge + (chargedEnergy / batteryCapacity * 100);
      const elapsedMinutes = Math.round((Date.now() - startTime) / 1000 / 60);

      console.log(`📊 Charging Progress (${elapsedMinutes} min):`);
      console.log(`   Battery: ${percentCharged.toFixed(1)}%`);
      console.log(`   Energy: ${chargedEnergy.toFixed(2)} / ${energyNeeded.toFixed(2)} kWh`);
      console.log(`   Current price: ${price.pricePerKwh.toFixed(4)} ${price.currency}/kWh`);
      console.log(`   Total cost: $${totalCost.toFixed(2)}`);
      console.log(`   Power: ${utils.formatPower(chargingPower)}\n`);

      // Submit measurement
      await voltnet.meter.submitMeasurement({
        deviceId: 'ev-charger-home-01',
        timestamp: new Date().toISOString(),
        energy: intervalEnergy,
        power: chargingPower,
        source: bestOffer ? bestOffer.source : EnergySource.GRID
      });

      // Stop when target reached
      if (chargedEnergy >= energyNeeded) {
        clearInterval(chargingInterval);
        showChargingSummary();
      }
    }, 3000); // Every 3 seconds (simulating 5-minute intervals)

    // Show final summary
    async function showChargingSummary() {
      console.log('✅ Charging Complete!\n');
      console.log('📋 Session Summary:');
      console.log(`   Energy charged: ${chargedEnergy.toFixed(2)} kWh`);
      console.log(`   Final battery: ${(currentCharge + (chargedEnergy / batteryCapacity * 100)).toFixed(1)}%`);
      console.log(`   Total cost: $${totalCost.toFixed(2)}`);
      console.log(`   Average price: $${(totalCost / chargedEnergy).toFixed(4)}/kWh`);
      console.log(`   Duration: ${((Date.now() - startTime) / 1000 / 60).toFixed(1)} minutes (simulated)\n`);

      // Calculate range added (assuming 4 miles per kWh)
      const rangeAdded = chargedEnergy * 4;
      console.log(`🚗 Range added: ~${rangeAdded.toFixed(0)} miles\n`);

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
