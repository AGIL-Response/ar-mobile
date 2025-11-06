/**
 * Utility functions to get battery status and network speed
 * These can be called from anywhere, not just React components
 */

import * as Battery from 'expo-battery';

/**
 * Get current battery percentage
 */
export async function getBatteryPercentage(): Promise<number> {
  try {
    const batteryLevel = await Battery.getBatteryLevelAsync();
    return batteryLevel * 100; // Convert to percentage
  } catch (error) {
    console.error('Error getting battery percentage:', error);
    return 100; // Default fallback
  }
}

/**
 * Get network speed using rn-speed-test
 * Note: This requires the component to be wrapped in RnSpeedTestProvider
 */
export async function getNetworkSpeed(): Promise<number | undefined> {
  try {
    // Import dynamically to avoid issues if not available
    const { useRnSpeedTest } = await import('rn-speed-test');
    
    // Since we can't use hooks here, we need to get it differently
    // For now, return undefined and handle it in the component
    // The actual implementation will need to be done in a component context
    return undefined;
  } catch (error) {
    console.error('Error getting network speed:', error);
    return undefined;
  }
}

