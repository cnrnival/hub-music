/**
 * Hub Music - useLocalStorage Hook
 * Persistência de estado no localStorage com sincronização
 * State persistence in localStorage with synchronization
 *
 * @languages pt-BR / en-US
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseLocalStorageOptions<T> {
  /** Serializer for complex types */
  serializer?: {
    serialize: (value: T) => string;
    deserialize: (value: string) => T;
  };
  /** Listen to storage events from other tabs */
  syncAcrossTabs?: boolean;
  /** Validate stored value on load */
  validator?: (value: unknown) => value is T;
  /** Default value if storage is empty or invalid */
  defaultValue?: T;
}

/**
 * Hook para estado sincronizado com localStorage
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const {
    serializer = {
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    },
    syncAcrossTabs = true,
    validator,
    defaultValue,
  } = options;

  // Initialize state from localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return defaultValue ?? initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return defaultValue ?? initialValue;
      }

      const parsed = serializer.deserialize(item);

      if (validator && !validator(parsed)) {
        console.warn(`Invalid value in localStorage for key "${key}", using default`);
        return defaultValue ?? initialValue;
      }

      return parsed;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue ?? initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const newValue = value instanceof Function ? value(prev) : value;

      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(key, serializer.serialize(newValue));
        } catch (error) {
          console.error(`Error setting localStorage key "${key}":`, error);
        }
      }

      return newValue;
    });
  }, [key, serializer]);

  // Remove from localStorage
  const removeValue = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing localStorage key "${key}":`, error);
      }
    }
    setStoredValue(defaultValue ?? initialValue);
  }, [key, defaultValue, initialValue]);

  // Sync across tabs
  useEffect(() => {
    if (!syncAcrossTabs || typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key) return;

      try {
        if (e.newValue === null) {
          setStoredValue(defaultValue ?? initialValue);
        } else {
          const parsed = serializer.deserialize(e.newValue);
          if (!validator || validator(parsed)) {
            setStoredValue(parsed);
          }
        }
      } catch (error) {
        console.error(`Error syncing localStorage key "${key}":`, error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, serializer, validator, defaultValue, initialValue, syncAcrossTabs]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook para objeto com merge automático (shallow merge)
 */
export function useLocalStorageObject<T extends Record<string, unknown>>(
  key: string,
  initialValue: T,
  options: Omit<UseLocalStorageOptions<T>, 'serializer'> = {}
) {
  const [value, setValue, remove] = useLocalStorage<T>(key, initialValue, {
    ...options,
    serializer: {
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    },
  });

  const setPartial = useCallback((partial: Partial<T> | ((prev: T) => Partial<T>)) => {
    setValue((prev) => {
      const newPartial = partial instanceof Function ? partial(prev) : partial;
      return { ...prev, ...newPartial };
    });
  }, [setValue]);

  return [value, setValue, setPartial, remove] as const;
}

/**
 * Hook para array com operações comuns
 */
export function useLocalStorageArray<T>(
  key: string,
  initialValue: T[] = [],
  options: Omit<UseLocalStorageOptions<T[]>, 'serializer'> = {}
) {
  const [value, setValue, remove] = useLocalStorage<T[]>(key, initialValue, {
    ...options,
    serializer: {
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    },
  });

  const push = useCallback((item: T) => {
    setValue((prev) => [...prev, item]);
  }, [setValue]);

  const removeItem = useCallback((index: number) => {
    setValue((prev) => prev.filter((_, i) => i !== index));
  }, [setValue]);

  const removeBy = useCallback((predicate: (item: T) => boolean) => {
    setValue((prev) => prev.filter((item) => !predicate(item)));
  }, [setValue]);

  const update = useCallback((index: number, item: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const newItem = item instanceof Function ? item(prev[index]) : item;
      return prev.map((v, i) => (i === index ? newItem : v));
    });
  }, [setValue]);

  const clear = useCallback(() => {
    setValue([]);
  }, [setValue]);

  return { value, setValue, push, removeItem, removeBy, update, clear, remove };
}

// SessionStorage variant
export function useSessionStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const {
    serializer = {
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    },
    validator,
    defaultValue,
  } = options;

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return defaultValue ?? initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      if (item === null) {
        return defaultValue ?? initialValue;
      }

      const parsed = serializer.deserialize(item);

      if (validator && !validator(parsed)) {
        return defaultValue ?? initialValue;
      }

      return parsed;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return defaultValue ?? initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const newValue = value instanceof Function ? value(prev) : value;

      if (typeof window !== 'undefined') {
        try {
          window.sessionStorage.setItem(key, serializer.serialize(newValue));
        } catch (error) {
          console.error(`Error setting sessionStorage key "${key}":`, error);
        }
      }

      return newValue;
    });
  }, [key, serializer]);

  const removeValue = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing sessionStorage key "${key}":`, error);
      }
    }
    setStoredValue(defaultValue ?? initialValue);
  }, [key, defaultValue, initialValue]);

  return [storedValue, setValue, removeValue];
}