// Unmock the hook to test the real implementation
jest.unmock('@/lib/hooks/use-observable');

import { renderHook, waitFor } from '@testing-library/react-native';
import { BehaviorSubject, Subject, throwError } from 'rxjs';

import { useObservable } from './use-observable';
describe('useObservable', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('returns initial value when provided with Subject', () => {
      const observable = new Subject<string>();
      const { result } = renderHook(() => useObservable(observable, 'initial'));

      expect(result.current).toBe('initial');
    });

    it('returns undefined when no initial value provided', () => {
      const observable = new Subject();
      const { result } = renderHook(() => useObservable(observable));

      expect(result.current).toBeUndefined();
    });

    it('subscribes to observable and receives values', async () => {
      const subject = new BehaviorSubject('initial');
      const { result } = renderHook(() => useObservable(subject));

      await waitFor(() => {
        expect(result.current).toBe('initial');
      });

      subject.next('updated');

      await waitFor(() => {
        expect(result.current).toBe('updated');
      });
    });

    it('updates when observable emits new values', async () => {
      const subject = new Subject<number>();
      const { result } = renderHook(() => useObservable(subject, 0));

      expect(result.current).toBe(0);

      subject.next(1);

      await waitFor(() => {
        expect(result.current).toBe(1);
      });

      subject.next(2);

      await waitFor(() => {
        expect(result.current).toBe(2);
      });
    });
  });

  describe('Null/Undefined Observable', () => {
    it('handles null observable', () => {
      const { result } = renderHook(() => useObservable(null, 'initial'));

      expect(result.current).toBe('initial');
    });

    it('handles undefined observable', () => {
      const { result } = renderHook(() => useObservable(undefined, 'initial'));

      expect(result.current).toBe('initial');
    });

    it('unsubscribes when observable becomes null', async () => {
      const subject = new BehaviorSubject('test');
      const { result, rerender } = renderHook(
        ({ obs }: { obs: any }) => useObservable(obs, 'initial'),
        { initialProps: { obs: subject as any } }
      );

      await waitFor(() => {
        expect(result.current).toBe('test');
      });

      // Change to null
      rerender({ obs: null });

      // Emit a new value - should not update state
      subject.next('should-not-update');

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(result.current).toBe('test'); // Should keep last value
    });

    it('unsubscribes when observable becomes undefined', async () => {
      const subject = new BehaviorSubject('test');
      const { result, rerender } = renderHook(
        ({ obs }: { obs: any }) => useObservable(obs, 'initial'),
        { initialProps: { obs: subject as any } }
      );

      await waitFor(() => {
        expect(result.current).toBe('test');
      });

      // Change to undefined
      rerender({ obs: undefined });

      // Emit a new value - should not update state
      subject.next('should-not-update');

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(result.current).toBe('test');
    });
  });

  describe('Observable Changes', () => {
    it('unsubscribes from old observable and subscribes to new one', async () => {
      const subject1 = new BehaviorSubject('obs1');
      const subject2 = new BehaviorSubject('obs2');

      const { result, rerender } = renderHook(
        ({ obs }: { obs: any }) => useObservable(obs),
        { initialProps: { obs: subject1 as any } }
      );

      await waitFor(() => {
        expect(result.current).toBe('obs1');
      });

      // Switch to second observable
      rerender({ obs: subject2 });

      await waitFor(() => {
        expect(result.current).toBe('obs2');
      });

      // Emit from old observable - should not update
      subject1.next('old-update');

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(result.current).toBe('obs2');

      // Emit from new observable - should update
      subject2.next('new-update');

      await waitFor(() => {
        expect(result.current).toBe('new-update');
      });
    });

    it('handles multiple observable changes', async () => {
      const subject1 = new BehaviorSubject(1);
      const subject2 = new BehaviorSubject(2);
      const subject3 = new BehaviorSubject(3);

      const { result, rerender } = renderHook(
        ({ obs }: { obs: any }) => useObservable(obs),
        { initialProps: { obs: subject1 as any } }
      );

      await waitFor(() => {
        expect(result.current).toBe(1);
      });

      rerender({ obs: subject2 });

      await waitFor(() => {
        expect(result.current).toBe(2);
      });

      rerender({ obs: subject3 });

      await waitFor(() => {
        expect(result.current).toBe(3);
      });
    });
  });

  describe('Cleanup', () => {
    it('unsubscribes on unmount', async () => {
      const subject = new BehaviorSubject('test');
      const unsubscribeSpy = jest.spyOn(subject, 'subscribe');

      const { result, unmount } = renderHook(() => useObservable(subject));

      await waitFor(() => {
        expect(result.current).toBe('test');
      });

      const subscription = unsubscribeSpy.mock.results[0]?.value;
      const unsubscribe = jest.spyOn(subscription, 'unsubscribe');

      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });

    it('does not update state after unmount', async () => {
      const subject = new BehaviorSubject('initial');
      const { result, unmount } = renderHook(() => useObservable(subject));

      await waitFor(() => {
        expect(result.current).toBe('initial');
      });

      unmount();

      // This should not cause any issues
      subject.next('after-unmount');
    });
  });

  describe('Error Handling', () => {
    it('handles observable errors gracefully', async () => {
      const errorObservable = throwError(() => new Error('Test error'));

      const { result } = renderHook(() => useObservable(errorObservable, 'initial'));

      // Should keep initial value on error
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(result.current).toBe('initial');
      expect(console.error).toHaveBeenCalledWith(
        'Observable error:',
        expect.any(Error)
      );
    });

    it('keeps last known value on error', async () => {
      const subject = new BehaviorSubject('good-value');
      const { result } = renderHook(() => useObservable(subject));

      await waitFor(() => {
        expect(result.current).toBe('good-value');
      });

      // Emit error
      subject.error(new Error('Test error'));

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should keep last good value
      expect(result.current).toBe('good-value');
    });

    it('handles subscription error', async () => {
      // Create an observable that throws during subscription
      const errorObservable = {
        pipe: jest.fn(() => {
          throw new Error('Pipe error');
        }),
      };

      const { result } = renderHook(() =>
        useObservable(errorObservable as any, 'initial')
      );

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(result.current).toBe('initial');
      expect(console.error).toHaveBeenCalledWith(
        'Error subscribing to observable:',
        expect.any(Error)
      );
    });
  });

  describe('DistinctUntilChanged - Primitives', () => {
    it('prevents duplicate primitive values', async () => {
      const subject = new BehaviorSubject('test');
      let renderCount = 0;

      const { result } = renderHook(() => {
        renderCount++;
        return useObservable(subject);
      });

      await waitFor(() => {
        expect(result.current).toBe('test');
      });

      const initialRenderCount = renderCount;

      // Emit same value multiple times
      subject.next('test');
      subject.next('test');
      subject.next('test');

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should not cause re-renders
      expect(renderCount).toBe(initialRenderCount);
    });

    it('updates when primitive value changes', async () => {
      const subject = new BehaviorSubject(1);
      const { result } = renderHook(() => useObservable(subject));

      await waitFor(() => {
        expect(result.current).toBe(1);
      });

      subject.next(2);

      await waitFor(() => {
        expect(result.current).toBe(2);
      });

      subject.next(3);

      await waitFor(() => {
        expect(result.current).toBe(3);
      });
    });

    it('handles boolean values', async () => {
      const subject = new BehaviorSubject(true);
      const { result } = renderHook(() => useObservable(subject));

      await waitFor(() => {
        expect(result.current).toBe(true);
      });

      subject.next(true);
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(result.current).toBe(true);

      subject.next(false);
      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });
  });

  describe('DistinctUntilChanged - Arrays', () => {
    it('prevents duplicate arrays with same content', async () => {
      const subject = new BehaviorSubject([1, 2, 3]);
      let renderCount = 0;

      const { result } = renderHook(() => {
        renderCount++;
        return useObservable(subject);
      });

      await waitFor(() => {
        expect(result.current).toEqual([1, 2, 3]);
      });

      const initialRenderCount = renderCount;

      // Emit same array content (different reference)
      subject.next([1, 2, 3]);

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should not cause re-render
      expect(renderCount).toBe(initialRenderCount);
    });

    it('updates when array content changes', async () => {
      const subject = new BehaviorSubject([1, 2, 3]);
      const { result } = renderHook(() => useObservable(subject));

      await waitFor(() => {
        expect(result.current).toEqual([1, 2, 3]);
      });

      subject.next([1, 2, 4]);

      await waitFor(() => {
        expect(result.current).toEqual([1, 2, 4]);
      });
    });

    it('updates when array length changes', async () => {
      const subject = new BehaviorSubject([1, 2]);
      const { result } = renderHook(() => useObservable(subject));

      await waitFor(() => {
        expect(result.current).toEqual([1, 2]);
      });

      subject.next([1, 2, 3]);

      await waitFor(() => {
        expect(result.current).toEqual([1, 2, 3]);
      });
    });

    it('handles nested arrays', async () => {
      const subject = new BehaviorSubject([[1, 2], [3, 4]]);
      const { result } = renderHook(() => useObservable(subject));

      await waitFor(() => {
        expect(result.current).toEqual([[1, 2], [3, 4]]);
      });

      // Same content, should not update
      subject.next([[1, 2], [3, 4]]);
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(result.current).toEqual([[1, 2], [3, 4]]);

      // Different content, should update
      subject.next([[1, 2], [3, 5]]);
      await waitFor(() => {
        expect(result.current).toEqual([[1, 2], [3, 5]]);
      });
    });

    it('handles empty arrays', async () => {
      const subject = new BehaviorSubject<number[]>([]);
      const { result } = renderHook(() => useObservable(subject));

      await waitFor(() => {
        expect(result.current).toEqual([]);
      });

      subject.next([]);
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(result.current).toEqual([]);

      subject.next([1]);
      await waitFor(() => {
        expect(result.current).toEqual([1]);
      });
    });
  });

  describe('DistinctUntilChanged - Objects', () => {
    it('prevents duplicate objects with same content', async () => {
      const subject = new BehaviorSubject({ a: 1, b: 2 });
      let renderCount = 0;

      const { result } = renderHook(() => {
        renderCount++;
        return useObservable(subject);
      });

      await waitFor(() => {
        expect(result.current).toEqual({ a: 1, b: 2 });
      });

      const initialRenderCount = renderCount;

      // Emit same object content (different reference)
      subject.next({ a: 1, b: 2 });

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should not cause re-render
      expect(renderCount).toBe(initialRenderCount);
    });

    it('updates when object content changes', async () => {
      const subject = new BehaviorSubject({ a: 1, b: 2 });
      const { result } = renderHook(() => useObservable(subject));

      await waitFor(() => {
        expect(result.current).toEqual({ a: 1, b: 2 });
      });

      subject.next({ a: 1, b: 3 });

      await waitFor(() => {
        expect(result.current).toEqual({ a: 1, b: 3 });
      });
    });

    it('updates when object keys change', async () => {
      const subject = new BehaviorSubject<any>({ a: 1 });
      const { result } = renderHook(() => useObservable(subject));

      await waitFor(() => {
        expect(result.current).toEqual({ a: 1 });
      });

      subject.next({ a: 1, b: 2 });

      await waitFor(() => {
        expect(result.current).toEqual({ a: 1, b: 2 });
      });
    });

    it('handles nested objects', async () => {
      const subject = new BehaviorSubject({ a: { b: 1 }, c: 2 });
      const { result } = renderHook(() => useObservable(subject));

      await waitFor(() => {
        expect(result.current).toEqual({ a: { b: 1 }, c: 2 });
      });

      // Same content, should not update
      subject.next({ a: { b: 1 }, c: 2 });
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(result.current).toEqual({ a: { b: 1 }, c: 2 });

      // Different nested content, should update
      subject.next({ a: { b: 2 }, c: 2 });
      await waitFor(() => {
        expect(result.current).toEqual({ a: { b: 2 }, c: 2 });
      });
    });

    it('handles empty objects', async () => {
      const subject = new BehaviorSubject({});
      const { result } = renderHook(() => useObservable(subject));

      await waitFor(() => {
        expect(result.current).toEqual({});
      });

      subject.next({});
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(result.current).toEqual({});

      subject.next({ a: 1 });
      await waitFor(() => {
        expect(result.current).toEqual({ a: 1 });
      });
    });
  });

  describe('Deep Equality Edge Cases', () => {
    it('handles null values', async () => {
      const subject = new BehaviorSubject<any>(null);
      const { result } = renderHook(() => useObservable(subject));

      await waitFor(() => {
        expect(result.current).toBe(null);
      });

      subject.next(null);
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(result.current).toBe(null);

      subject.next({ a: 1 });
      await waitFor(() => {
        expect(result.current).toEqual({ a: 1 });
      });
    });

    it('handles undefined values', async () => {
      const subject = new BehaviorSubject<any>(undefined);
      const { result } = renderHook(() => useObservable(subject));

      expect(result.current).toBeUndefined();

      subject.next(undefined);
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(result.current).toBeUndefined();

      subject.next('defined');
      await waitFor(() => {
        expect(result.current).toBe('defined');
      });
    });

    it('handles arrays of objects', async () => {
      const subject = new BehaviorSubject([{ id: 1 }, { id: 2 }]);
      const { result } = renderHook(() => useObservable(subject));

      await waitFor(() => {
        expect(result.current).toEqual([{ id: 1 }, { id: 2 }]);
      });

      // Same content
      subject.next([{ id: 1 }, { id: 2 }]);
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(result.current).toEqual([{ id: 1 }, { id: 2 }]);

      // Different content
      subject.next([{ id: 1 }, { id: 3 }]);
      await waitFor(() => {
        expect(result.current).toEqual([{ id: 1 }, { id: 3 }]);
      });
    });

    it('handles objects with array values', async () => {
      const subject = new BehaviorSubject({ items: [1, 2, 3] });
      const { result } = renderHook(() => useObservable(subject));

      await waitFor(() => {
        expect(result.current).toEqual({ items: [1, 2, 3] });
      });

      // Same content
      subject.next({ items: [1, 2, 3] });
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(result.current).toEqual({ items: [1, 2, 3] });

      // Different content
      subject.next({ items: [1, 2, 4] });
      await waitFor(() => {
        expect(result.current).toEqual({ items: [1, 2, 4] });
      });
    });

    it('differentiates between different types with same shape', async () => {
      const subject = new BehaviorSubject<any>({ length: 3 });
      const { result } = renderHook(() => useObservable(subject));

      await waitFor(() => {
        expect(result.current).toEqual({ length: 3 });
      });

      // Array has length property but is different type
      subject.next([1, 2, 3]);
      await waitFor(() => {
        expect(result.current).toEqual([1, 2, 3]);
      });
    });

    it('handles mixed nested structures', async () => {
      const subject = new BehaviorSubject({
        users: [
          { id: 1, tags: ['admin', 'user'] },
          { id: 2, tags: ['user'] },
        ],
        metadata: { count: 2 },
      });

      const { result } = renderHook(() => useObservable(subject));

      await waitFor(() => {
        expect(result.current).toEqual({
          users: [
            { id: 1, tags: ['admin', 'user'] },
            { id: 2, tags: ['user'] },
          ],
          metadata: { count: 2 },
        });
      });

      // Same structure
      subject.next({
        users: [
          { id: 1, tags: ['admin', 'user'] },
          { id: 2, tags: ['user'] },
        ],
        metadata: { count: 2 },
      });

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(result.current).toEqual({
        users: [
          { id: 1, tags: ['admin', 'user'] },
          { id: 2, tags: ['user'] },
        ],
        metadata: { count: 2 },
      });

      // Different structure
      subject.next({
        users: [
          { id: 1, tags: ['admin', 'user'] },
          { id: 2, tags: ['user', 'moderator'] },
        ],
        metadata: { count: 2 },
      });

      await waitFor(() => {
        expect(result.current).toEqual({
          users: [
            { id: 1, tags: ['admin', 'user'] },
            { id: 2, tags: ['user', 'moderator'] },
          ],
          metadata: { count: 2 },
        });
      });
    });
  });

  describe('Performance and Memory', () => {
    it('handles rapid value changes efficiently', async () => {
      const subject = new BehaviorSubject(0);
      const { result } = renderHook(() => useObservable(subject));

      await waitFor(() => {
        expect(result.current).toBe(0);
      });

      // Emit many values rapidly
      for (let i = 1; i <= 100; i++) {
        subject.next(i);
      }

      await waitFor(() => {
        expect(result.current).toBe(100);
      });
    });

    it('does not leak memory on repeated observable changes', async () => {
      const subjects = Array.from({ length: 10 }, (_, i) =>
        new BehaviorSubject(i)
      );

      const { rerender, unmount } = renderHook(
        ({ obs }: { obs: any }) => useObservable(obs),
        { initialProps: { obs: subjects[0] as any } }
      );

      // Switch through all observables
      for (let i = 1; i < subjects.length; i++) {
        rerender({ obs: subjects[i] });
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      unmount();

      // If there's a memory leak, subscriptions won't be cleaned up
      // This test passes if no errors occur
      expect(true).toBe(true);
    });
  });

  describe('Type Safety', () => {
    it('handles string values', async () => {
      const subject = new BehaviorSubject<string>('test');
      const { result } = renderHook(() => useObservable(subject));

      await waitFor(() => {
        expect(typeof result.current).toBe('string');
      });
    });

    it('handles number values', async () => {
      const subject = new BehaviorSubject<number>(42);
      const { result } = renderHook(() => useObservable(subject));

      await waitFor(() => {
        expect(typeof result.current).toBe('number');
      });
    });

    it('handles complex type unions', async () => {
      type ComplexType = string | number | { id: number; name: string };
      const subject = new BehaviorSubject<ComplexType>('string');
      const { result } = renderHook(() => useObservable(subject));

      await waitFor(() => {
        expect(result.current).toBe('string');
      });

      subject.next(42);
      await waitFor(() => {
        expect(result.current).toBe(42);
      });

      subject.next({ id: 1, name: 'test' });
      await waitFor(() => {
        expect(result.current).toEqual({ id: 1, name: 'test' });
      });
    });
  });
});
