/**
 * Device Info Store
 * Zustand store for network speed and battery status
 */

import * as Battery from 'expo-battery';
import type { StateCreator } from 'zustand';

import type { IBaseState, InitStateType } from '@/stores/interfaces/IBaseState';
import { createStore, resetStore } from '@/stores/utils';

export type NetworkSpeedConfig = {
  token: string;
  timeout: number;
  https: boolean;
  urlCount: number;
  bufferSize: number;
};

export interface DeviceInfoState extends IBaseState {
  // Network speed config
  networkSpeedConfig: NetworkSpeedConfig;
  networkSpeedIntervalMs: number; // Interval time in milliseconds
  
  // Network speed
  networkSpeed: number | null; // Speed in Mbps
  networkSpeedText: string;
  isCheckingNetworkSpeed: boolean;
  networkSpeedError: string | null;
  networkSpeedInterval: NodeJS.Timeout | null;
  checkNetworkSpeedCallback: (() => void) | null; // Callback to trigger network speed check
  
  // Battery
  batteryPercentage: number | null;
  isCharging: boolean;
  isCheckingBattery: boolean;
  batteryError: string | null;
  batteryLevelSubscription: any;
  batteryStateSubscription: any;

  // Actions
  actions: {
    initialize: () => void;
    setNetworkSpeedConfig: (config: Partial<NetworkSpeedConfig>) => void;
    setNetworkSpeedIntervalMs: (intervalMs: number) => void;
    setCheckNetworkSpeedCallback: (callback: (() => void) | null) => void;
    setNetworkSpeed: (speed: number) => void;
    setNetworkSpeedError: (error: string | null) => void;
    setCheckingNetworkSpeed: (checking: boolean) => void;
    triggerNetworkSpeedCheck: () => void;
    startNetworkSpeedMonitoring: () => void;
    stopNetworkSpeedMonitoring: () => void;
    checkBattery: () => Promise<void>;
    startBatteryMonitoring: () => void;
    stopBatteryMonitoring: () => void;
    clearError: () => void;
    reset: () => void;
  };
}

const initialState: InitStateType<DeviceInfoState> = {
  networkSpeedConfig: {
    token: 'YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm',
    timeout: 10000,
    https: true,
    urlCount: 5,
    bufferSize: 8,
  },
  networkSpeedIntervalMs: 30000, // 30 seconds default
  networkSpeed: null,
  networkSpeedText: 'undefined Mbps',
  isCheckingNetworkSpeed: false,
  networkSpeedError: null,
  networkSpeedInterval: null,
  checkNetworkSpeedCallback: null,
  batteryPercentage: null,
  isCharging: false,
  isCheckingBattery: false,
  batteryError: null,
  batteryLevelSubscription: null,
  batteryStateSubscription: null,
  isLoading: false,
  error: null,
};

const deviceInfoStore: StateCreator<DeviceInfoState> = (set, get) => ({
  ...initialState,

  actions: {
    initialize: () => {
      // Initial checks
      get().actions.checkBattery();

      // Start monitoring
      get().actions.startNetworkSpeedMonitoring();
      get().actions.startBatteryMonitoring();
    },

    setNetworkSpeedConfig: (config: Partial<NetworkSpeedConfig>) => {
      set((state: DeviceInfoState) => {
        state.networkSpeedConfig = {
          ...state.networkSpeedConfig,
          ...config,
        };
      });
    },

    setNetworkSpeedIntervalMs: (intervalMs: number) => {
      set((state: DeviceInfoState) => {
        state.networkSpeedIntervalMs = intervalMs;
      });
      // Restart monitoring with new interval if already running
      const currentState = get() as DeviceInfoState;
      if (currentState.networkSpeedInterval) {
        get().actions.stopNetworkSpeedMonitoring();
        get().actions.startNetworkSpeedMonitoring();
      }
    },

    setCheckNetworkSpeedCallback: (callback: (() => void) | null) => {
      set((state: DeviceInfoState) => {
        state.checkNetworkSpeedCallback = callback;
      });
    },

    triggerNetworkSpeedCheck: () => {
      const state = get() as DeviceInfoState;
      if (state.checkNetworkSpeedCallback) {
        state.checkNetworkSpeedCallback();
      }
    },

    setNetworkSpeed: (speed: number) => {
      set((state: DeviceInfoState) => {
        state.networkSpeed = speed;
        state.networkSpeedText = `${speed} Mbps`;
        state.isCheckingNetworkSpeed = false;
        state.networkSpeedError = null;
      });
    },

    setNetworkSpeedError: (error: string | null) => {
      set((state: DeviceInfoState) => {
        state.isCheckingNetworkSpeed = false;
        state.networkSpeedError = error;
      });
    },

    setCheckingNetworkSpeed: (checking: boolean) => {
      set((state: DeviceInfoState) => {
        state.isCheckingNetworkSpeed = checking;
      });
    },

    startNetworkSpeedMonitoring: () => {
      const state = get() as DeviceInfoState;
      
      // Clear existing interval if any
      if (state.networkSpeedInterval) {
        clearInterval(state.networkSpeedInterval);
      }

      // Check immediately (will be triggered by component)
      // Then check at the configured interval
      const interval = setInterval(() => {
        get().actions.triggerNetworkSpeedCheck();
      }, state.networkSpeedIntervalMs);

      set((state: DeviceInfoState) => {
        state.networkSpeedInterval = interval;
      });
    },

    stopNetworkSpeedMonitoring: () => {
      const state = get() as DeviceInfoState;
      
      if (state.networkSpeedInterval) {
        clearInterval(state.networkSpeedInterval);
        set((state: DeviceInfoState) => {
          state.networkSpeedInterval = null;
        });
      }
    },

    checkBattery: async () => {
      set((state: DeviceInfoState) => {
        state.isCheckingBattery = true;
        state.batteryError = null;
      });

      try {
        const batteryLevel = await Battery.getBatteryLevelAsync();
        const isCharging = await Battery.isChargingAsync();

        set((state: DeviceInfoState) => {
          state.batteryPercentage = batteryLevel * 100; // Convert to percentage
          state.isCharging = isCharging;
          state.isCheckingBattery = false;
          console.log('✅ Battery updated:', {
            percentage: state.batteryPercentage,
            isCharging: state.isCharging,
          });
        });
      } catch (error) {
        set((state: DeviceInfoState) => {
          state.isCheckingBattery = false;
          state.batteryError = error instanceof Error ? error.message : 'Failed to check battery';
        });
      }
    },

    startBatteryMonitoring: () => {
      const state = get() as DeviceInfoState;
      
      // Clear existing listeners if any
      if (state.batteryLevelSubscription) {
        state.batteryLevelSubscription.remove();
      }
      if (state.batteryStateSubscription) {
        state.batteryStateSubscription.remove();
      }

      // Check immediately
      get().actions.checkBattery();

      // Set up listeners for battery changes
      const batteryLevelSubscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
        set((state: DeviceInfoState) => {
          state.batteryPercentage = batteryLevel * 100;
        });
      });

      const batteryStateSubscription = Battery.addBatteryStateListener(({ batteryState }) => {
        const isCharging = batteryState === Battery.BatteryState.CHARGING;
        set((state: DeviceInfoState) => {
          state.isCharging = isCharging;
        });
      });

      set((state: DeviceInfoState) => {
        state.batteryLevelSubscription = batteryLevelSubscription;
        state.batteryStateSubscription = batteryStateSubscription;
      });
    },

    stopBatteryMonitoring: () => {
      const state = get() as DeviceInfoState;
      
      if (state.batteryLevelSubscription) {
        state.batteryLevelSubscription.remove();
        set((state: DeviceInfoState) => {
          state.batteryLevelSubscription = null;
        });
      }
      if (state.batteryStateSubscription) {
        state.batteryStateSubscription.remove();
        set((state: DeviceInfoState) => {
          state.batteryStateSubscription = null;
        });
      }
    },

    clearError: () => {
      set((state: DeviceInfoState) => {
        state.error = null;
        state.networkSpeedError = null;
        state.batteryError = null;
      });
    },

    reset: () => {
      const state = get() as DeviceInfoState;
      
      // Stop monitoring
      get().actions.stopNetworkSpeedMonitoring();
      get().actions.stopBatteryMonitoring();

      resetStore(initialState, set);
    },
  },
});

export const useDeviceInfoStore = createStore<DeviceInfoState>(deviceInfoStore);
