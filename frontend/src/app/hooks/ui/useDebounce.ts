/**
 * Hub Music - useDebounce Hook
 * Debounce para valores e callbacks
 * Debounce for values and callbacks
 *
 * @languages pt-BR / en-US
 */

import { useEffect, useRef, useCallback, useState } from 'react';

// Debounce a value
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Debounce a callback
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<number | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const debouncedCallback = useCallback(
    ((...args: unknown[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        callbackRef.current(...args);
        timeoutRef.current = null;
      }, delay);
    }) as T,
    [delay]
  );

  // Cancel on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

// Debounce with leading edge (execute immediately, then debounce)
export function useDebouncedCallbackLeading<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<number | null>(null);
  const callbackRef = useRef(callback);
  const lastArgsRef = useRef<unknown[] | null>(null);
  callbackRef.current = callback;

  const debouncedCallback = useCallback(
    ((...args: unknown[]) => {
      lastArgsRef.current = args;

      if (timeoutRef.current === null) {
        // Leading edge - execute immediately
        callbackRef.current(...args);
      } else {
        // Clear existing timeout
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for trailing edge
      timeoutRef.current = window.setTimeout(() => {
        if (lastArgsRef.current) {
          callbackRef.current(...lastArgsRef.current);
        }
        timeoutRef.current = null;
        lastArgsRef.current = null;
      }, delay);
    }) as T,
    [delay]
  );

  // Cancel on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

// Throttle a callback
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number
): T {
  const lastRunRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const callbackRef = useRef(callback);
  const lastArgsRef = useRef<unknown[] | null>(null);
  callbackRef.current = callback;

  const throttledCallback = useCallback(
    ((...args: unknown[]) => {
      const now = Date.now();
      const remaining = limit - (now - lastRunRef.current);

      lastArgsRef.current = args;

      if (remaining <= 0) {
        // Execute immediately
        lastRunRef.current = now;
        callbackRef.current(...args);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      } else if (!timeoutRef.current) {
        // Schedule for later
        timeoutRef.current = window.setTimeout(() => {
          lastRunRef.current = Date.now();
          timeoutRef.current = null;
          if (lastArgsRef.current) {
            callbackRef.current(...lastArgsRef.current);
          }
        }, remaining);
      }
    }) as T,
    [limit]
  );

  // Cancel on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

// Debounce state setter
export function useDebouncedState<T>(initialValue: T, delay: number): [T, (value: T) => void] {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timeoutRef = useRef<number | null>(null);

  const setDebounced = useCallback((newValue: T) => {
    setValue(newValue);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setDebouncedValue(newValue);
      timeoutRef.current = null;
    }, delay);
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [debouncedValue, setDebounced];
}