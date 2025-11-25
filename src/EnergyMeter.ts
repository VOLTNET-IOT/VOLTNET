import { VoltnetClient } from './VoltnetClient';
import {
  EnergyMeasurement,
  EnergySource,
  DeviceRegistration
} from './types';

/**
 * Energy Meter Module
 * Handles energy measurement submission and device management
 */
export class EnergyMeter {
  private client: VoltnetClient;

  constructor(client: VoltnetClient) {
    this.client = client;
  }

  /**
   * Submit energy measurement
   * @param measurement Energy measurement data
   * @returns Submitted measurement with confirmation
   */
  async submitMeasurement(measurement: EnergyMeasurement): Promise<EnergyMeasurement> {
    const response = await this.client.getHttpClient().post('/measurements', measurement);
    return response.data;
  }

  /**
   * Submit batch of measurements
   * @param measurements Array of energy measurements
   * @returns Confirmation of batch submission
   */
  async submitBatch(measurements: EnergyMeasurement[]): Promise<{ success: boolean; count: number }> {
    const response = await this.client.getHttpClient().post('/measurements/batch', {
      measurements
    });
    return response.data;
  }

  /**
   * Get measurements for a device in a time range
   * @param deviceId Device ID
   * @param from Start timestamp (ISO 8601)
   * @param to End timestamp (ISO 8601)
   * @returns Array of measurements
   */
  async getMeasurements(
    deviceId: string,
    from: string,
    to: string
  ): Promise<EnergyMeasurement[]> {
    const response = await this.client.getHttpClient().get('/measurements', {
      params: { deviceId, from, to }
    });
    return response.data;
  }

  /**
   * Get latest measurement for a device
   * @param deviceId Device ID
   * @returns Latest measurement
   */
  async getLatestMeasurement(deviceId: string): Promise<EnergyMeasurement> {
    const response = await this.client.getHttpClient().get(`/measurements/${deviceId}/latest`);
    return response.data;
  }

  /**
   * Register a new IoT device
   * @param device Device registration data
   * @returns Registered device information
   */
  async registerDevice(device: DeviceRegistration): Promise<DeviceRegistration> {
    const response = await this.client.getHttpClient().post('/devices', device);
    return response.data;
  }

  /**
   * Get device information
   * @param deviceId Device ID
   * @returns Device information
   */
  async getDevice(deviceId: string): Promise<DeviceRegistration> {
    const response = await this.client.getHttpClient().get(`/devices/${deviceId}`);
    return response.data;
  }

  /**
   * Get all devices for current participant
   * @returns Array of devices
   */
  async getDevices(): Promise<DeviceRegistration[]> {
    const response = await this.client.getHttpClient().get('/devices');
    return response.data;
  }

  /**
   * Update device information
   * @param deviceId Device ID
   * @param updates Partial device data to update
   * @returns Updated device information
   */
  async updateDevice(
    deviceId: string,
    updates: Partial<DeviceRegistration>
  ): Promise<DeviceRegistration> {
    const response = await this.client.getHttpClient().patch(`/devices/${deviceId}`, updates);
    return response.data;
  }

  /**
   * Delete device
   * @param deviceId Device ID
   * @returns Success confirmation
   */
  async deleteDevice(deviceId: string): Promise<{ success: boolean }> {
    const response = await this.client.getHttpClient().delete(`/devices/${deviceId}`);
    return response.data;
  }

  /**
   * Verify measurement signature
   * @param measurement Measurement with signature
   * @param publicKey Public key of the device
   * @returns Verification result
   */
  verifySignature(measurement: EnergyMeasurement, publicKey: string): boolean {
    // This is a placeholder - in real implementation, you would use crypto library
    // to verify the signature using the device's public key
    if (!measurement.signature) return false;
    
    // Example verification logic would go here
    // For now, just return true if signature exists
    return true;
  }

  /**
   * Create a signed measurement
   * @param measurement Measurement data without signature
   * @param privateKey Private key for signing
   * @returns Signed measurement
   */
  signMeasurement(
    measurement: Omit<EnergyMeasurement, 'signature'>,
    privateKey: string
  ): EnergyMeasurement {
    // This is a placeholder - in real implementation, you would use crypto library
    // to create a signature
    
    const dataToSign = JSON.stringify({
      deviceId: measurement.deviceId,
      timestamp: measurement.timestamp,
      energy: measurement.energy,
      power: measurement.power
    });

    // In real implementation, use crypto library to sign
    const signature = `sig_${Buffer.from(dataToSign).toString('base64')}`;

    return {
      ...measurement,
      signature
    };
  }

  /**
   * Calculate energy consumption/production for a period
   * @param deviceId Device ID
   * @param from Start timestamp
   * @param to End timestamp
   * @returns Total energy in kWh
   */
  async calculateEnergyTotal(
    deviceId: string,
    from: string,
    to: string
  ): Promise<{ total: number; source: EnergySource }> {
    const measurements = await this.getMeasurements(deviceId, from, to);
    
    const total = measurements.reduce((sum, m) => sum + m.energy, 0);
    const source = measurements[0]?.source || EnergySource.OTHER;

    return { total, source };
  }

  /**
   * Get real-time power consumption
   * @param deviceId Device ID
   * @returns Current power in kW
   */
  async getCurrentPower(deviceId: string): Promise<number> {
    const latest = await this.getLatestMeasurement(deviceId);
    return latest.power || 0;
  }
}
