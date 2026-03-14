import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

/**
 * A custom hook to manage filter state and sync it with URL query parameters.
 * This ensures filters are bookmarkable and shareable.
 */
export function useFilters<T extends Record<string, string | undefined>>(initialFilters: T) {
  const [location, setLocation] = useLocation();
  const [filters, setFilters] = useState<T>(initialFilters);

  // Initialize from URL on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlFilters: Partial<T> = {};
    let hasChanges = false;

    Object.keys(initialFilters).forEach((key) => {
      const val = searchParams.get(key);
      if (val !== null) {
        // @ts-ignore - dynamic key assignment
        urlFilters[key] = val;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setFilters((prev) => ({ ...prev, ...urlFilters }));
    }
  }, []);

  const updateFilter = useCallback((key: keyof T, value: string | undefined) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      
      // Sync to URL
      const searchParams = new URLSearchParams(window.location.search);
      if (value) {
        searchParams.set(key as string, value);
      } else {
        searchParams.delete(key as string);
      }
      
      const newSearch = searchParams.toString();
      const newUrl = newSearch ? `${location}?${newSearch}` : location;
      
      // Update URL without triggering a full re-render of wouter (using history API)
      window.history.replaceState(null, '', newUrl);
      
      return newFilters;
    });
  }, [location]);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    window.history.replaceState(null, '', location);
  }, [initialFilters, location]);

  return { filters, updateFilter, clearFilters };
}
