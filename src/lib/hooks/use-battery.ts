/**
 * Hook to get battery status
 * Uses expo-battery for React Native/Expo
 */

import * as Battery from 'expo-battery';
import { useEffect, useState } from 'react';

export interface BatteryStatus {
  batteryPercentage: number;
  isCharging: boolean;
}

export function useBattery(): BatteryStatus | null {
  const [batteryStatus, setBatteryStatus] = useState<BatteryStatus | null>(null);

  useEffect(() => {
    let mounted = true;

    const getBatteryStatus = async () => {
      try {
        const batteryLevel = await Battery.getBatteryLevelAsync();
        const isCharging = await Battery.isChargingAsync();

        if (mounted) {
          setBatteryStatus({
            batteryPercentage: batteryLevel * 100, // Convert to percentage
            isCharging,
          });
        }
      } catch (error) {
        console.error('Error getting battery status:', error);
        if (mounted) {
          setBatteryStatus({
            batteryPercentage: 100,
            isCharging: false,
          });
        }
      }
    };

    getBatteryStatus();

    // Set up listener for battery changes
    const batteryLevelSubscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
      if (mounted) {
        setBatteryStatus((prev) => ({
          batteryPercentage: batteryLevel * 100,
          isCharging: prev?.isCharging || false,
        }));
      }
    });

    const batteryStateSubscription = Battery.addBatteryStateListener(({ batteryState }) => {
      if (mounted) {
        const isCharging = batteryState === Battery.BatteryState.CHARGING;
        setBatteryStatus((prev) => ({
          batteryPercentage: prev?.batteryPercentage || 100,
          isCharging,
        }));
      }
    });

    return () => {
      mounted = false;
      batteryLevelSubscription.remove();
      batteryStateSubscription.remove();
    };
  }, []);

  return batteryStatus;
}


