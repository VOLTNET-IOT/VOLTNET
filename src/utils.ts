/**
 * Utility functions for VOLTNET SDK
 */

/**
 * Convert watts to kilowatts
 */
export function wattsToKw(watts: number): number {
  return watts / 1000;
}

/**
 * Convert kilowatts to watts
 */
export function kwToWatts(kw: number): number {
  return kw * 1000;
}

/**
 * Calculate energy from power and time
 * @param powerKw Power in kilowatts
 * @param hours Duration in hours
 * @returns Energy in kWh
 */
export function calculateEnergy(powerKw: number, hours: number): number {
  return powerKw * hours;
}

/**
 * Calculate power from energy and time
 * @param energyKwh Energy in kWh
 * @param hours Duration in hours
 * @returns Power in kW
 */
export function calculatePower(energyKwh: number, hours: number): number {
  if (hours === 0) return 0;
  return energyKwh / hours;
}

/**
 * Format energy value with unit
 * @param kwh Energy in kWh
 * @param decimals Number of decimal places
 * @returns Formatted string
 */
export function formatEnergy(kwh: number, decimals: number = 2): string {
  if (kwh < 1) {
    return `${(kwh * 1000).toFixed(decimals)} Wh`;
  } else if (kwh < 1000) {
    return `${kwh.toFixed(decimals)} kWh`;
  } else {
    return `${(kwh / 1000).toFixed(decimals)} MWh`;
  }
}

/**
 * Format power value with unit
 * @param kw Power in kW
 * @param decimals Number of decimal places
 * @returns Formatted string
 */
export function formatPower(kw: number, decimals: number = 2): string {
  if (kw < 1) {
    return `${(kw * 1000).toFixed(decimals)} W`;
  } else if (kw < 1000) {
    return `${kw.toFixed(decimals)} kW`;
  } else {
    return `${(kw / 1000).toFixed(decimals)} MW`;
  }
}

/**
 * Format currency value
 * @param amount Amount
 * @param currency Currency code
 * @param decimals Number of decimal places
 * @returns Formatted string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  decimals: number = 2
): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    RUB: '₽',
    GBP: '£',
    JPY: '¥',
    CNY: '¥'
  };

  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toFixed(decimals)}`;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param lat1 Latitude 1
 * @param lon1 Longitude 1
 * @param lat2 Latitude 2
 * @param lon2 Longitude 2
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if a point is within a radius of another point
 * @param point Point to check
 * @param center Center point
 * @param radiusKm Radius in kilometers
 * @returns True if within radius
 */
export function isWithinRadius(
  point: { lat: number; lon: number },
  center: { lat: number; lon: number },
  radiusKm: number
): boolean {
  const distance = calculateDistance(point.lat, point.lon, center.lat, center.lon);
  return distance <= radiusKm;
}

/**
 * Generate unique ID
 * @returns Unique identifier string
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate ISO 8601 timestamp
 * @param timestamp Timestamp string
 * @returns True if valid
 */
export function isValidTimestamp(timestamp: string): boolean {
  const date = new Date(timestamp);
  return !isNaN(date.getTime());
}

/**
 * Get current timestamp in ISO 8601 format
 * @returns Current timestamp
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Calculate time difference in hours
 * @param start Start timestamp
 * @param end End timestamp
 * @returns Difference in hours
 */
export function getHoursDifference(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  return diffMs / (1000 * 60 * 60);
}

/**
 * Parse energy value from string
 * @param value String value (e.g., "10 kWh", "500 Wh")
 * @returns Energy in kWh
 */
export function parseEnergy(value: string): number {
  const match = value.match(/^([\d.]+)\s*(Wh|kWh|MWh|GWh)$/i);
  if (!match) {
    throw new Error(`Invalid energy format: ${value}`);
  }

  const [, amount, unit] = match;
  const num = parseFloat(amount);

  switch (unit.toLowerCase()) {
    case 'wh':
      return num / 1000;
    case 'kwh':
      return num;
    case 'mwh':
      return num * 1000;
    case 'gwh':
      return num * 1000000;
    default:
      throw new Error(`Unknown unit: ${unit}`);
  }
}

/**
 * Validate energy measurement data
 * @param measurement Measurement object
 * @returns Validation result with errors if any
 */
export function validateMeasurement(measurement: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!measurement.deviceId) {
    errors.push('deviceId is required');
  }

  if (!measurement.timestamp || !isValidTimestamp(measurement.timestamp)) {
    errors.push('valid timestamp is required');
  }

  if (typeof measurement.energy !== 'number' || measurement.energy < 0) {
    errors.push('energy must be a non-negative number');
  }

  if (measurement.power !== undefined && 
      (typeof measurement.power !== 'number' || measurement.power < 0)) {
    errors.push('power must be a non-negative number');
  }

  if (!measurement.source) {
    errors.push('source is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calculate CO2 emissions based on energy source
 * @param energyKwh Energy in kWh
 * @param source Energy source
 * @returns CO2 emissions in kg
 */
export function calculateCO2(energyKwh: number, source: string): number {
  // CO2 emissions in kg per kWh by source
  const emissionFactors: Record<string, number> = {
    solar: 0.05,
    wind: 0.02,
    hydro: 0.024,
    grid: 0.5, // Average grid mix
    battery: 0, // Depends on charging source
    other: 0.5
  };

  const factor = emissionFactors[source.toLowerCase()] || 0.5;
  return energyKwh * factor;
}

/**
 * Calculate savings by using green energy vs grid
 * @param energyKwh Energy in kWh
 * @returns CO2 savings in kg
 */
export function calculateGreenSavings(energyKwh: number): number {
  const gridEmissions = calculateCO2(energyKwh, 'grid');
  const greenEmissions = calculateCO2(energyKwh, 'solar');
  return gridEmissions - greenEmissions;
}

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param maxRetries Maximum number of retries
 * @param initialDelay Initial delay in ms
 * @returns Function result
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * Debounce a function
 * @param fn Function to debounce
 * @param delay Delay in ms
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle a function
 * @param fn Function to throttle
 * @param limit Time limit in ms
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
