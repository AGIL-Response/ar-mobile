// Unmock the store to test the real implementation (must be before imports)
jest.unmock('@/stores/device-info');

// eslint-disable-next-line import/first
import { act, renderHook } from '@testing-library/react-native';

// eslint-disable-next-line import/first
// eslint-disable-next-line @typescript-eslint/no-var-requires
const realDeviceInfoModule = jest.requireActual('./index') as typeof import('./index');
// eslint-disable-next-line import/first
const useDeviceInfoStore = realDeviceInfoModule.useDeviceInfoStore;

// Mock expo-battery
jest.mock('expo-battery', () => {
  const mockSubscription = {
    remove: jest.fn(),
  };

  return {
    __esModule: true,
    default: {
      BatteryState: {
        UNKNOWN: 0,
        UNPLUGGED: 1,
        CHARGING: 2,
        FULL: 3,
      },
      getBatteryLevelAsync: jest.fn().mockResolvedValue(0.75), // 75%
      getBatteryStateAsync: jest.fn().mockResolvedValue(2), // CHARGING
      addBatteryLevelListener: jest.fn().mockReturnValue(mockSubscription),
      addBatteryStateListener: jest.fn().mockReturnValue(mockSubscription),
    },
    BatteryState: {
      UNKNOWN: 0,
      UNPLUGGED: 1,
      CHARGING: 2,
      FULL: 3,
    },
    getBatteryLevelAsync: jest.fn().mockResolvedValue(0.75),
    getBatteryStateAsync: jest.fn().mockResolvedValue(2),
    addBatteryLevelListener: jest.fn().mockReturnValue(mockSubscription),
    addBatteryStateListener: jest.fn().mockReturnValue(mockSubscription),
  };
});

// eslint-disable-next-line import/first
import * as Battery from 'expo-battery';

describe('DeviceInfoStore', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Stop all monitoring and clear callbacks before resetting
    const state = useDeviceInfoStore.getState();
    try {
      // Clear callback first to prevent interval callbacks from accessing stale state
      state.actions.setCheckNetworkSpeedCallback(null);
      state.actions.stopNetworkSpeedMonitoring();
      state.actions.stopBatteryMonitoring();
      state.actions.reset();
    } catch (e) {
      // Ignore errors during cleanup
    }
    // Clear all pending timers
    jest.clearAllTimers();
  });

  afterEach(() => {
    // Clean up any remaining intervals and callbacks
    const state = useDeviceInfoStore.getState();
    try {
      state.actions.setCheckNetworkSpeedCallback(null);
      state.actions.stopNetworkSpeedMonitoring();
      state.actions.stopBatteryMonitoring();
    } catch (e) {
      // Ignore errors during cleanup
    }
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    it('initializes with correct default values', () => {
      const { result } = renderHook(() => useDeviceInfoStore());

      expect(result.current.networkSpeedConfig).toEqual({
        token: 'YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm',
        timeout: 10000,
        https: true,
        urlCount: 5,
        bufferSize: 8,
      });
      expect(result.current.networkSpeedIntervalMs).toBe(30000);
      expect(result.current.networkSpeed).toBeNull();
      expect(result.current.networkSpeedText).toBe('undefined Mbps');
      expect(result.current.isCheckingNetworkSpeed).toBe(false);
      expect(result.current.networkSpeedError).toBeNull();
      expect(result.current.networkSpeedInterval).toBeNull();
      expect(result.current.checkNetworkSpeedCallback).toBeNull();

      expect(result.current.batteryIntervalMs).toBe(30000);
      expect(result.current.batteryPercentage).toBeNull();
      expect(result.current.isCharging).toBe(false);
      expect(result.current.isCheckingBattery).toBe(false);
      expect(result.current.batteryError).toBeNull();
      expect(result.current.batteryInterval).toBeNull();
      expect(result.current.batteryLevelSubscription).toBeNull();
      expect(result.current.batteryStateSubscription).toBeNull();
    });
  });

  describe('setNetworkSpeedConfig', () => {
    it('updates network speed config', () => {
      const { result } = renderHook(() => useDeviceInfoStore());

      act(() => {
        result.current.actions.setNetworkSpeedConfig({ timeout: 20000, urlCount: 10 });
      });

      expect(result.current.networkSpeedConfig.timeout).toBe(20000);
      expect(result.current.networkSpeedConfig.urlCount).toBe(10);
      expect(result.current.networkSpeedConfig.token).toBe('YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm'); // Preserved
    });
  });

  describe('setNetworkSpeedIntervalMs', () => {
    it('updates interval and restarts monitoring if running', () => {
      const { result } = renderHook(() => useDeviceInfoStore());

      // Start monitoring first
      act(() => {
        result.current.actions.startNetworkSpeedMonitoring();
      });

      const initialInterval = result.current.networkSpeedInterval;
      expect(initialInterval).not.toBeNull();

      // Update interval
      act(() => {
        result.current.actions.setNetworkSpeedIntervalMs(10000);
      });

      expect(result.current.networkSpeedIntervalMs).toBe(10000);
      // Should have a new interval (old one cleared, new one created)
      expect(result.current.networkSpeedInterval).not.toBeNull();
      expect(result.current.networkSpeedInterval).not.toBe(initialInterval);
    });

    it('updates interval without restarting if not running', () => {
      const { result } = renderHook(() => useDeviceInfoStore());

      act(() => {
        result.current.actions.setNetworkSpeedIntervalMs(10000);
      });

      expect(result.current.networkSpeedIntervalMs).toBe(10000);
      expect(result.current.networkSpeedInterval).toBeNull();
    });
  });

  describe('setCheckNetworkSpeedCallback', () => {
    it('sets the callback', () => {
      const { result } = renderHook(() => useDeviceInfoStore());
      const callback = jest.fn();

      act(() => {
        result.current.actions.setCheckNetworkSpeedCallback(callback);
      });

      expect(result.current.checkNetworkSpeedCallback).toBe(callback);
    });

    it('can set callback to null', () => {
      const { result } = renderHook(() => useDeviceInfoStore());
      const callback = jest.fn();

      act(() => {
        result.current.actions.setCheckNetworkSpeedCallback(callback);
        result.current.actions.setCheckNetworkSpeedCallback(null);
      });

      expect(result.current.checkNetworkSpeedCallback).toBeNull();
    });
  });

  describe('triggerNetworkSpeedCheck', () => {
    it('calls the callback if set', () => {
      const { result } = renderHook(() => useDeviceInfoStore());
      const callback = jest.fn();

      act(() => {
        result.current.actions.setCheckNetworkSpeedCallback(callback);
        result.current.actions.triggerNetworkSpeedCheck();
      });

      expect(callback).toHaveBeenCalled();
    });

    it('does nothing if callback is not set', () => {
      const { result } = renderHook(() => useDeviceInfoStore());

      act(() => {
        result.current.actions.triggerNetworkSpeedCheck();
      });

      // Should not throw
      expect(result.current.checkNetworkSpeedCallback).toBeNull();
    });
  });

  describe('setNetworkSpeed', () => {
    it('updates network speed and text', () => {
      const { result } = renderHook(() => useDeviceInfoStore());

      act(() => {
        result.current.actions.setNetworkSpeed(42.5);
      });

      expect(result.current.networkSpeed).toBe(42.5);
      expect(result.current.networkSpeedText).toBe('42.5 Mbps');
      expect(result.current.isCheckingNetworkSpeed).toBe(false);
      expect(result.current.networkSpeedError).toBeNull();
    });
  });

  describe('setNetworkSpeedError', () => {
    it('sets error and stops checking', () => {
      const { result } = renderHook(() => useDeviceInfoStore());

      act(() => {
        useDeviceInfoStore.setState({ isCheckingNetworkSpeed: true });
        result.current.actions.setNetworkSpeedError('Network error');
      });

      expect(result.current.isCheckingNetworkSpeed).toBe(false);
      expect(result.current.networkSpeedError).toBe('Network error');
    });
  });

  describe('setCheckingNetworkSpeed', () => {
    it('updates checking state', () => {
      const { result } = renderHook(() => useDeviceInfoStore());

      act(() => {
        result.current.actions.setCheckingNetworkSpeed(true);
      });

      expect(result.current.isCheckingNetworkSpeed).toBe(true);

      act(() => {
        result.current.actions.setCheckingNetworkSpeed(false);
      });

      expect(result.current.isCheckingNetworkSpeed).toBe(false);
    });
  });

  describe('startNetworkSpeedMonitoring', () => {
    it('creates an interval that triggers callback', () => {
      const { result } = renderHook(() => useDeviceInfoStore());
      const callback = jest.fn();

      act(() => {
        result.current.actions.setCheckNetworkSpeedCallback(callback);
        result.current.actions.startNetworkSpeedMonitoring();
      });

      expect(result.current.networkSpeedInterval).not.toBeNull();

      // Advance timers to trigger interval
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      expect(callback).toHaveBeenCalled();
    });

    it('clears existing interval before creating new one', () => {
      const { result } = renderHook(() => useDeviceInfoStore());
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      act(() => {
        result.current.actions.startNetworkSpeedMonitoring();
      });

      const firstInterval = result.current.networkSpeedInterval;

      act(() => {
        result.current.actions.startNetworkSpeedMonitoring();
      });

      expect(clearIntervalSpy).toHaveBeenCalledWith(firstInterval);
      expect(result.current.networkSpeedInterval).not.toBe(firstInterval);

      clearIntervalSpy.mockRestore();
    });
  });

  describe('stopNetworkSpeedMonitoring', () => {
    it('clears interval and sets to null', () => {
      const { result } = renderHook(() => useDeviceInfoStore());
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      act(() => {
        result.current.actions.startNetworkSpeedMonitoring();
      });

      const interval = result.current.networkSpeedInterval;
      expect(interval).not.toBeNull();

      act(() => {
        result.current.actions.stopNetworkSpeedMonitoring();
      });

      expect(clearIntervalSpy).toHaveBeenCalledWith(interval);
      expect(result.current.networkSpeedInterval).toBeNull();

      clearIntervalSpy.mockRestore();
    });

    it('does nothing if interval is null', () => {
      const { result } = renderHook(() => useDeviceInfoStore());

      act(() => {
        result.current.actions.stopNetworkSpeedMonitoring();
      });

      expect(result.current.networkSpeedInterval).toBeNull();
    });
  });

  describe('checkBattery', () => {
    it('successfully checks battery and updates state', async () => {
      const { result } = renderHook(() => useDeviceInfoStore());

      await act(async () => {
        await result.current.actions.checkBattery();
      });

      expect(Battery.getBatteryLevelAsync).toHaveBeenCalled();
      expect(Battery.getBatteryStateAsync).toHaveBeenCalled();
      expect(result.current.batteryPercentage).toBe(75); // 0.75 * 100
      expect(result.current.isCharging).toBe(true); // BatteryState.CHARGING = 2
      expect(result.current.isCheckingBattery).toBe(false);
      expect(result.current.batteryError).toBeNull();
    });

    it('handles battery check error', async () => {
      const { result } = renderHook(() => useDeviceInfoStore());
      const errorMessage = 'Battery check failed';
      (Battery.getBatteryLevelAsync as jest.Mock).mockRejectedValueOnce(
        new Error(errorMessage)
      );

      await act(async () => {
        await result.current.actions.checkBattery();
      });

      expect(result.current.isCheckingBattery).toBe(false);
      expect(result.current.batteryError).toBe(errorMessage);
    });

    it('sets checking state during battery check', async () => {
      const { result } = renderHook(() => useDeviceInfoStore());

      // Start the check and check state within act
      await act(async () => {
        const checkPromise = result.current.actions.checkBattery();
        // Check state immediately after starting - should be checking
        expect(useDeviceInfoStore.getState().isCheckingBattery).toBe(true);
        await checkPromise;
      });

      expect(result.current.isCheckingBattery).toBe(false);
    });
  });

  describe('setBatteryIntervalMs', () => {
    it('updates interval and restarts monitoring if running', async () => {
      const { result } = renderHook(() => useDeviceInfoStore());

      // Start monitoring first
      await act(async () => {
        result.current.actions.startBatteryMonitoring();
      });

      const initialInterval = result.current.batteryInterval;
      expect(initialInterval).not.toBeNull();

      // Update interval
      act(() => {
        result.current.actions.setBatteryIntervalMs(15000);
      });

      expect(result.current.batteryIntervalMs).toBe(15000);
      // Should have a new interval
      expect(result.current.batteryInterval).not.toBeNull();
      expect(result.current.batteryInterval).not.toBe(initialInterval);
    });

    it('updates interval without restarting if not running', () => {
      const { result } = renderHook(() => useDeviceInfoStore());

      act(() => {
        result.current.actions.setBatteryIntervalMs(15000);
      });

      expect(result.current.batteryIntervalMs).toBe(15000);
      expect(result.current.batteryInterval).toBeNull();
    });
  });

  describe('startBatteryMonitoring', () => {
    it('checks battery immediately and sets up interval', async () => {
      const { result } = renderHook(() => useDeviceInfoStore());

      await act(async () => {
        result.current.actions.startBatteryMonitoring();
      });

      expect(Battery.getBatteryLevelAsync).toHaveBeenCalled();
      expect(result.current.batteryInterval).not.toBeNull();
      expect(result.current.batteryLevelSubscription).not.toBeNull();
      expect(result.current.batteryStateSubscription).not.toBeNull();
    });

    it('sets up battery listeners', async () => {
      const { result } = renderHook(() => useDeviceInfoStore());

      await act(async () => {
        result.current.actions.startBatteryMonitoring();
      });

      expect(Battery.addBatteryLevelListener).toHaveBeenCalled();
      expect(Battery.addBatteryStateListener).toHaveBeenCalled();
    });

    it('clears existing interval and listeners before starting', async () => {
      const { result } = renderHook(() => useDeviceInfoStore());
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      await act(async () => {
        result.current.actions.startBatteryMonitoring();
      });

      const firstInterval = result.current.batteryInterval;
      const firstLevelSub = result.current.batteryLevelSubscription;
      const firstStateSub = result.current.batteryStateSubscription;

      // Mock remove methods
      if (firstLevelSub) {
        (firstLevelSub as any).remove = jest.fn();
      }
      if (firstStateSub) {
        (firstStateSub as any).remove = jest.fn();
      }

      await act(async () => {
        result.current.actions.startBatteryMonitoring();
      });

      expect(clearIntervalSpy).toHaveBeenCalledWith(firstInterval);
      if (firstLevelSub) {
        expect((firstLevelSub as any).remove).toHaveBeenCalled();
      }
      if (firstStateSub) {
        expect((firstStateSub as any).remove).toHaveBeenCalled();
      }

      clearIntervalSpy.mockRestore();
    });

    it('triggers battery check at interval', async () => {
      const { result } = renderHook(() => useDeviceInfoStore());
      (Battery.getBatteryLevelAsync as jest.Mock).mockClear();

      await act(async () => {
        result.current.actions.startBatteryMonitoring();
      });

      // Initial call
      expect(Battery.getBatteryLevelAsync).toHaveBeenCalledTimes(1);

      // Advance timers
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      // Should be called again
      expect(Battery.getBatteryLevelAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('stopBatteryMonitoring', () => {
    it('clears interval and listeners', async () => {
      const { result, unmount } = renderHook(() => useDeviceInfoStore());
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      await act(async () => {
        result.current.actions.startBatteryMonitoring();
      });

      const interval = result.current.batteryInterval;
      const levelSub = result.current.batteryLevelSubscription;
      const stateSub = result.current.batteryStateSubscription;

      // Mock remove methods
      if (levelSub) {
        (levelSub as any).remove = jest.fn();
      }
      if (stateSub) {
        (stateSub as any).remove = jest.fn();
      }

      act(() => {
        result.current.actions.stopBatteryMonitoring();
      });

      expect(clearIntervalSpy).toHaveBeenCalledWith(interval);
      if (levelSub) {
        expect((levelSub as any).remove).toHaveBeenCalled();
      }
      if (stateSub) {
        expect((stateSub as any).remove).toHaveBeenCalled();
      }
      expect(result.current.batteryInterval).toBeNull();
      expect(result.current.batteryLevelSubscription).toBeNull();
      expect(result.current.batteryStateSubscription).toBeNull();

      clearIntervalSpy.mockRestore();
      unmount();
    });

    it('does nothing if not monitoring', () => {
      const { result, unmount } = renderHook(() => useDeviceInfoStore());

      act(() => {
        result.current.actions.stopBatteryMonitoring();
      });

      expect(result.current.batteryInterval).toBeNull();
      unmount();
    });
  });

  describe('clearError', () => {
    it('clears all error fields', () => {
      act(() => {
        useDeviceInfoStore.setState({
          networkSpeedError: 'Network error',
          batteryError: 'Battery error',
        } as any);
        useDeviceInfoStore.getState().actions.clearError();
      });

      const state = useDeviceInfoStore.getState();
      expect((state as any).error).toBeNull();
      expect(state.networkSpeedError).toBeNull();
      expect(state.batteryError).toBeNull();
    });
  });

  describe('reset', () => {
    it('stops monitoring and resets to initial state', async () => {
      // Set up some state
      await act(async () => {
        useDeviceInfoStore.getState().actions.setNetworkSpeed(99);
        useDeviceInfoStore.getState().actions.setNetworkSpeedIntervalMs(10000);
        useDeviceInfoStore.getState().actions.startNetworkSpeedMonitoring();
        useDeviceInfoStore.getState().actions.startBatteryMonitoring();
      });

      act(() => {
        useDeviceInfoStore.getState().actions.reset();
      });

      // Should be reset to initial state
      const state = useDeviceInfoStore.getState();
      expect(state.networkSpeed).toBeNull();
      expect(state.networkSpeedIntervalMs).toBe(30000);
      expect(state.networkSpeedInterval).toBeNull();
      expect(state.batteryInterval).toBeNull();
      expect(state.batteryLevelSubscription).toBeNull();
      expect(state.batteryStateSubscription).toBeNull();
    });
  });

  describe('initialize', () => {
    it('checks battery and starts monitoring', async () => {
      (Battery.getBatteryLevelAsync as jest.Mock).mockClear();

      await act(async () => {
        useDeviceInfoStore.getState().actions.initialize();
      });

      expect(Battery.getBatteryLevelAsync).toHaveBeenCalled();
      const state = useDeviceInfoStore.getState();
      expect(state.networkSpeedInterval).not.toBeNull();
      expect(state.batteryInterval).not.toBeNull();
    });
  });
});
