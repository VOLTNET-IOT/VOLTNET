/**
 * Tests for utility functions
 */

import {
  wattsToKw,
  kwToWatts,
  calculateEnergy,
  formatEnergy,
  formatPower,
  calculateDistance,
  isWithinRadius,
  validateMeasurement,
  calculateCO2,
  calculateGreenSavings
} from './utils';

describe('Unit Conversion', () => {
  test('wattsToKw converts correctly', () => {
    expect(wattsToKw(1000)).toBe(1);
    expect(wattsToKw(5000)).toBe(5);
    expect(wattsToKw(500)).toBe(0.5);
  });

  test('kwToWatts converts correctly', () => {
    expect(kwToWatts(1)).toBe(1000);
    expect(kwToWatts(5)).toBe(5000);
    expect(kwToWatts(0.5)).toBe(500);
  });

  test('calculateEnergy works correctly', () => {
    expect(calculateEnergy(10, 2)).toBe(20); // 10 kW for 2 hours = 20 kWh
    expect(calculateEnergy(5, 0.5)).toBe(2.5); // 5 kW for 0.5 hours = 2.5 kWh
  });
});

describe('Formatting', () => {
  test('formatEnergy formats correctly', () => {
    expect(formatEnergy(0.5)).toBe('500.00 Wh');
    expect(formatEnergy(1.5)).toBe('1.50 kWh');
    expect(formatEnergy(1500)).toBe('1.50 MWh');
  });

  test('formatPower formats correctly', () => {
    expect(formatPower(0.5)).toBe('500.00 W');
    expect(formatPower(5)).toBe('5.00 kW');
    expect(formatPower(5000)).toBe('5.00 MW');
  });
});

describe('Geolocation', () => {
  test('calculateDistance calculates correctly', () => {
    // New York to Los Angeles
    const distance = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
    expect(distance).toBeGreaterThan(3900); // ~3944 km
    expect(distance).toBeLessThan(4000);
  });

  test('isWithinRadius works correctly', () => {
    const point = { lat: 40.7128, lon: -74.0060 };
    const center = { lat: 40.7580, lon: -73.9855 };
    
    expect(isWithinRadius(point, center, 10)).toBe(true); // ~6.5 km
    expect(isWithinRadius(point, center, 5)).toBe(false);
  });
});

describe('Validation', () => {
  test('validateMeasurement validates correctly', () => {
    const validMeasurement = {
      deviceId: 'meter-001',
      timestamp: new Date().toISOString(),
      energy: 5.0,
      source: 'solar'
    };

    const result = validateMeasurement(validMeasurement);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('validateMeasurement catches errors', () => {
    const invalidMeasurement = {
      energy: -5.0,
      source: 'solar'
    };

    const result = validateMeasurement(invalidMeasurement);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('Environmental Calculations', () => {
  test('calculateCO2 calculates correctly', () => {
    expect(calculateCO2(100, 'solar')).toBe(5); // 100 kWh * 0.05 kg/kWh
    expect(calculateCO2(100, 'grid')).toBe(50); // 100 kWh * 0.5 kg/kWh
  });

  test('calculateGreenSavings calculates correctly', () => {
    const savings = calculateGreenSavings(100);
    expect(savings).toBeGreaterThan(0);
    expect(savings).toBe(45); // 50 - 5
  });
});
