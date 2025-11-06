/**
 * Location Monitor Component
 * Wraps location monitoring with network speed tracking
 * This component uses hooks to get network speed and updates a global reference
 * that the location store can access
 */

import { useEffect } from 'react';
import { useRnSpeedTest } from 'rn-speed-test';

export function LocationMonitor() {
  const { networkSpeed } = useRnSpeedTest();

  // Update global reference for network speed so the store can access it
  // Convert from MBps to Mbps (multiply by 8)
  useEffect(() => {
    console.log(
      `\x1b[34m🐣️ location-monitor network speed`,
      `${JSON.stringify(networkSpeed, undefined, 2)}\x1b[0m`,
    );
    if (networkSpeed !== undefined && networkSpeed !== null) {
      // Convert MBps to Mbps (1 MBps = 8 Mbps)
      const networkMbps = networkSpeed * 8;
      (global as any).__networkSpeed = networkMbps;
    }
  }, [networkSpeed]);

  // This component doesn't render anything, it just sets up the network speed tracking
  return null;
}


