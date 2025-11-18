// src/hooks/useDebounce.ts
/**
 * Custom hook for debouncing values
 * Delays updating a value until after a specified delay has passed
 * Useful for search inputs, API calls, etc.
 */

import { useEffect, useState } from "react";

/**
 * Debounce a value with a specified delay
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes before delay expires
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
