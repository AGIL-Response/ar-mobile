import { arrayToCoordinates, attributesChanged, coordinatesChanged, createStore, resetStore } from './utils';

describe('stores/utils', () => {
  describe('arrayToCoordinates', () => {
    it('returns null when coords is null', () => {
      expect(arrayToCoordinates(null)).toBeNull();
    });

    it('returns null when coords is undefined', () => {
      expect(arrayToCoordinates(undefined)).toBeNull();
    });

    it('converts [lon, lat] array to coordinates object', () => {
      const result = arrayToCoordinates([100.5, 13.75]);

      expect(result).toEqual({
        longitude: 100.5,
        latitude: 13.75,
        altitude: undefined,
      });
    });

    it('converts [lon, lat, alt] array to coordinates object', () => {
      const result = arrayToCoordinates([100.5, 13.75, 10]);

      expect(result).toEqual({
        longitude: 100.5,
        latitude: 13.75,
        altitude: 10,
      });
    });

    it('ignores extra elements in the array', () => {
      const result = arrayToCoordinates([100.5, 13.75, 10, 999]);

      expect(result).toEqual({
        longitude: 100.5,
        latitude: 13.75,
        altitude: 10,
      });
    });
  });

  describe('coordinatesChanged', () => {
    it('returns false when both coordinates are null', () => {
      expect(coordinatesChanged(null, null)).toBe(false);
    });

    it('returns true when old coordinates are null and new are not', () => {
      const newCoords = {
        latitude: 13.75,
        longitude: 100.5,
        altitude: 10,
      };

      expect(coordinatesChanged(null, newCoords)).toBe(true);
    });

    it('returns true when new coordinates are null and old are not', () => {
      const oldCoords = {
        latitude: 13.75,
        longitude: 100.5,
        altitude: 10,
      };

      expect(coordinatesChanged(oldCoords, null)).toBe(true);
    });

    it('returns false when coordinates are within threshold', () => {
      const oldCoords = {
        latitude: 13.75001,
        longitude: 100.50001,
        altitude: 10,
      };

      const newCoords = {
        latitude: 13.750015, // diff 0.000005
        longitude: 100.500015, // diff 0.000005
        altitude: 10.000005, // very small diff
      };

      expect(coordinatesChanged(oldCoords, newCoords)).toBe(false);
    });

    it('returns true when latitude changes beyond threshold', () => {
      const oldCoords = {
        latitude: 13.75,
        longitude: 100.5,
        altitude: 10,
      };

      const newCoords = {
        latitude: 13.7601, // diff > 0.00001
        longitude: 100.5,
        altitude: 10,
      };

      expect(coordinatesChanged(oldCoords, newCoords)).toBe(true);
    });

    it('returns true when longitude changes beyond threshold', () => {
      const oldCoords = {
        latitude: 13.75,
        longitude: 100.5,
        altitude: 10,
      };

      const newCoords = {
        latitude: 13.75,
        longitude: 100.5101, // diff > 0.00001
        altitude: 10,
      };

      expect(coordinatesChanged(oldCoords, newCoords)).toBe(true);
    });

    it('returns true when altitude changes beyond threshold', () => {
      const oldCoords = {
        latitude: 13.75,
        longitude: 100.5,
        altitude: 10,
      };

      const newCoords = {
        latitude: 13.75,
        longitude: 100.5,
        altitude: 12, // diff 2
      };

      expect(coordinatesChanged(oldCoords, newCoords)).toBe(true);
    });

    it('treats missing altitude as 0 when comparing', () => {
      const oldCoords = {
        latitude: 13.75,
        longitude: 100.5,
        altitude: undefined,
      };

      const newCoords = {
        latitude: 13.75,
        longitude: 100.5,
        altitude: 0,
      };

      expect(coordinatesChanged(oldCoords, newCoords)).toBe(false);
    });
  });

  describe('attributesChanged', () => {
    it('returns false when both attributes are null', () => {
      expect(attributesChanged(null, null)).toBe(false);
    });

    it('returns true when old attributes are null and new are not', () => {
      expect(attributesChanged(null, { networkMbps: 1, batteryPercentage: 50 })).toBe(true);
    });

    it('returns true when new attributes are null and old are not', () => {
      expect(attributesChanged({ networkMbps: 1, batteryPercentage: 50 }, null)).toBe(true);
    });

    it('returns false when attributes are within network threshold and same battery percentage', () => {
      const oldAttrs = { networkMbps: 1.0, batteryPercentage: 50 };
      const newAttrs = { networkMbps: 1.005, batteryPercentage: 50.4 };

      expect(attributesChanged(oldAttrs, newAttrs)).toBe(false);
    });

    it('returns true when networkMbps changes beyond threshold', () => {
      const oldAttrs = { networkMbps: 1.0, batteryPercentage: 50 };
      const newAttrs = { networkMbps: 1.02, batteryPercentage: 50 };

      expect(attributesChanged(oldAttrs, newAttrs)).toBe(true);
    });

    it('returns true when batteryPercentage changes after rounding', () => {
      const oldAttrs = { networkMbps: 1.0, batteryPercentage: 50.4 };
      const newAttrs = { networkMbps: 1.0, batteryPercentage: 50.6 };

      // 50.4 -> 50, 50.6 -> 51
      expect(attributesChanged(oldAttrs, newAttrs)).toBe(true);
    });

    it('handles missing networkMbps as 0', () => {
      const oldAttrs = { batteryPercentage: 50 };
      const newAttrs = { networkMbps: 0.005, batteryPercentage: 50 };

      expect(attributesChanged(oldAttrs, newAttrs)).toBe(false);
    });

    it('handles missing batteryPercentage as 0', () => {
      const oldAttrs = { networkMbps: 1 };
      const newAttrs = { networkMbps: 1, batteryPercentage: 0 };

      expect(attributesChanged(oldAttrs, newAttrs)).toBe(false);
    });
  });

  describe('createStore', () => {
    type CounterState = {
      count: number;
      actions: {
        increment: () => void;
        reset: () => void;
      };
    };

    const createCounterStore = (set: any) => ({
      count: 0,
      actions: {
        increment: () =>
          set((state: CounterState) => ({
            ...state,
            count: state.count + 1,
          })),
        reset: () =>
          set((state: CounterState) => ({
            ...state,
            count: 0,
          })),
      },
    });

    it('creates a zustand store and updates state', () => {
      const useCounterStore = createStore<CounterState>(createCounterStore);

      const initialState = useCounterStore.getState();
      expect(initialState.count).toBe(0);

      // Increment the counter
      initialState.actions.increment();
      expect(useCounterStore.getState().count).toBe(1);

      // Reset the counter
      useCounterStore.getState().actions.reset();
      expect(useCounterStore.getState().count).toBe(0);
    });
  });

  describe('resetStore', () => {
    it('resets state properties to initial state', () => {
      const initialState = {
        a: 1,
        b: 2,
      };

      const state: any = {
        a: 10,
        b: 20,
        c: 30,
      };

      const set = (updater: (draft: any) => void) => {
        updater(state);
      };

      resetStore(initialState, set);

      expect(state).toEqual({
        a: 1,
        b: 2,
        c: 30,
      });
    });
  });
});
