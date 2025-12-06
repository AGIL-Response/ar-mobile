import {
  persist,
  PersistOptions,
} from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { create } from 'zustand';
import type { LocationCoordinates } from '@/lib/socket';

interface ICreateZustand {
  persist?: PersistOptions<any>;
}

const createStore = <T>(store: any, options?: ICreateZustand) => {
  let _store: any = immer(store);
  if (options?.persist) {
    _store = persist(_store, options.persist);
  }
  return create<T>(_store);
};

const resetStore = (initState: any, set: any) => {
  set((state: any) => {
    Object.keys(initState).forEach((k) => {
      state[k] = initState[k];
    });
  });
};

/**
 * Converts GeoJSON coordinate array to LocationCoordinates object
 * GeoJSON format: [longitude, latitude, altitude?]
 * @param coords - Coordinate array or null/undefined
 * @returns LocationCoordinates object or null
 */
export const arrayToCoordinates = (
  coords: number[] | null | undefined
): LocationCoordinates | null => {
  if (!coords) return null;
  return {
    longitude: coords[0],
    latitude: coords[1],
    altitude: coords[2],
  };
};

/**
 * Checks if coordinates have changed beyond a threshold
 * @param old - Previous coordinates or null
 * @param new_ - New coordinates or null
 * @returns true if coordinates have changed significantly
 */
export const coordinatesChanged = (
  old: LocationCoordinates | null,
  new_: LocationCoordinates | null
): boolean => {
  if (!old && !new_) return false;
  if (!old || !new_) return true;
  
  // Compare with small threshold for floating point precision
  const threshold = 0.00001; // ~1 meters
  return (
    Math.abs(old.latitude - new_.latitude) > threshold ||
    Math.abs(old.longitude - new_.longitude) > threshold ||
    Math.abs((old.altitude || 0) - (new_.altitude || 0)) > threshold
  );
};

/**
 * Checks if attributes (networkMbps, batteryPercentage) have changed
 * @param old - Previous attributes or null
 * @param new_ - New attributes or null
 * @returns true if attributes have changed significantly
 */
export const attributesChanged = (
  old: { networkMbps?: number | null; batteryPercentage?: number | null } | null,
  new_: { networkMbps?: number | null; batteryPercentage?: number | null } | null
): boolean => {
  if (!old && !new_) return false;
  if (!old || !new_) return true;
  
  // Compare networkMbps (with small threshold for floating point)
  if (Math.abs((old.networkMbps || 0) - (new_.networkMbps || 0)) > 0.01) {
    return true;
  }
  
  // Compare batteryPercentage (integer comparison)
  if (Math.round(old.batteryPercentage || 0) !== Math.round(new_.batteryPercentage || 0)) {
    return true;
  }
  
  return false;
};

export {
  createStore,
  resetStore,
};
