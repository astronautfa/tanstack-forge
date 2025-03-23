import { useState, useEffect, useCallback } from 'react';
import localforage from 'localforage';

localforage.config({
    name: 'tanstack-forge',
    storeName: 'my-storage',
    description: 'Storage for my application'
});

/**
 * Hook for easy access to localforage with a React-friendly API
 * 
 * @param key - The storage key to use
 * @param initialValue - Default value if key doesn't exist in storage
 * @returns [storedValue, setValue, removeValue, error]
 */
export function useStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((val: T) => T)) => Promise<void>, () => Promise<void>, Error | null] {
    // State to store our value
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    // State to track any errors
    const [error, setError] = useState<Error | null>(null);

    // Initialize: Read from localforage on mount
    useEffect(() => {
        const loadStoredValue = async () => {
            try {
                // Get from localforage
                const value = await localforage.getItem<T>(key);

                // Set state to either stored value or initial value
                setStoredValue(value !== null ? value : initialValue);
            } catch (err) {
                console.error(`Error reading from storage for key "${key}":`, err);
                setError(err instanceof Error ? err : new Error(String(err)));
            }
        };

        loadStoredValue();
    }, [key, initialValue]);

    // Define setter function
    const setValue = useCallback(
        async (value: T | ((val: T) => T)) => {
            try {
                // Allow value to be a function like React's setState
                const valueToStore =
                    value instanceof Function ? value(storedValue) : value;

                // Save to localforage
                await localforage.setItem(key, valueToStore);

                // Save state
                setStoredValue(valueToStore);
                setError(null);
            } catch (err) {
                console.error(`Error saving to storage for key "${key}":`, err);
                setError(err instanceof Error ? err : new Error(String(err)));
            }
        },
        [key, storedValue]
    );

    // Define remove function
    const removeValue = useCallback(
        async () => {
            try {
                // Remove from localforage
                await localforage.removeItem(key);

                // Reset to initial value
                setStoredValue(initialValue);
                setError(null);
            } catch (err) {
                console.error(`Error removing from storage for key "${key}":`, err);
                setError(err instanceof Error ? err : new Error(String(err)));
            }
        },
        [key, initialValue]
    );

    return [storedValue, setValue, removeValue, error];
}

/**
 * A simplified hook for cases where you only need to get data once
 * without subscribing to changes
 */
export async function getStoredValue<T>(key: string, defaultValue: T): Promise<T> {
    try {
        const value = await localforage.getItem<T>(key);
        return value !== null ? value : defaultValue;
    } catch (error) {
        console.error(`Error retrieving value for key "${key}":`, error);
        return defaultValue;
    }
}

/**
 * A utility function to set a value without hooks
 */
export async function setStoredValue<T>(key: string, value: T): Promise<void> {
    try {
        await localforage.setItem(key, value);
    } catch (error) {
        console.error(`Error setting value for key "${key}":`, error);
        throw error;
    }
}

/**
 * Example of creating a specialized version for specific data types
 */
export function useUserPreferences<T extends Record<string, any>>(
    userId: string,
    defaultPreferences: T
) {
    return useStorage<T>(`user_prefs_${userId}`, defaultPreferences);
}