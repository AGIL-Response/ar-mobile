import { useEffect, useState, useRef } from 'react';
import type { Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs';

/**
 * Deep equality check for arrays and objects
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  return false;
}

/**
 * Hook to subscribe to an Observable and return its current value
 * Optimized to prevent unnecessary re-renders
 */
export function useObservable<T>(observable: Observable<T> | null | undefined, initialValue?: T): T | undefined {
  const [value, setValue] = useState<T | undefined>(initialValue);
  const observableRef = useRef<Observable<T> | null | undefined>(observable);
  const subscriptionRef = useRef<any>(null);
  const valueRef = useRef<T | undefined>(initialValue);

  useEffect(() => {
    // Update ref when observable changes
    observableRef.current = observable;

    if (!observable) {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      return;
    }

    // Unsubscribe from previous observable if it exists
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    // Subscribe to the observable with error handling and distinctUntilChanged
    try {
      // Use distinctUntilChanged to prevent updates if value hasn't changed
      const distinctObservable = observable.pipe(
        distinctUntilChanged((prev, curr) => {
          // For arrays, do a deep comparison
          if (Array.isArray(prev) && Array.isArray(curr)) {
            return deepEqual(prev, curr);
          }
          // For objects, do a deep comparison
          if (typeof prev === 'object' && typeof curr === 'object' && prev !== null && curr !== null) {
            return deepEqual(prev, curr);
          }
          // For primitives, use ===
          return prev === curr;
        })
      );

      subscriptionRef.current = distinctObservable.subscribe({
        next: (val) => {
          // Only update if the observable is still the current one and value actually changed
          if (observableRef.current === observable) {
            // Check if value actually changed before updating state
            const hasChanged = !deepEqual(valueRef.current, val);
            if (hasChanged) {
              // Debug: Log when observable value changes (especially for messages)
              if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && 'id' in val[0]) {
                console.log('🔄 [useObservable] Value changed (array of objects):', {
                  length: val.length,
                  firstItemId: val[0].id,
                  firstItemContent: (val[0] as any).content?.substring(0, 50),
                });
              }
              valueRef.current = val;
              setValue(val);
            } else {
              console.log('⚠️ [useObservable] Value received but deepEqual says unchanged');
            }
          }
        },
        error: (err) => {
          console.error('Observable error:', err);
          // Don't update state on error, keep the last known good value
        },
      });
    } catch (error) {
      console.error('Error subscribing to observable:', error);
      // If subscription fails, don't set subscriptionRef to avoid cleanup issues
      subscriptionRef.current = null;
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [observable]);

  return value;
}

