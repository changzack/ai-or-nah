import { useState, useEffect, useCallback } from "react";

export interface UseFetchOptions<T> {
  /**
   * URL to fetch from
   */
  url: string;

  /**
   * Transform the response data
   */
  transform?: (data: any) => T;

  /**
   * Whether to fetch immediately on mount (default: true)
   */
  immediate?: boolean;

  /**
   * Fetch options (method, headers, body, etc.)
   */
  fetchOptions?: RequestInit;

  /**
   * Called when fetch succeeds
   */
  onSuccess?: (data: T) => void;

  /**
   * Called when fetch fails
   */
  onError?: (error: Error) => void;

  /**
   * Dependencies that trigger a refetch
   */
  deps?: React.DependencyList;
}

export interface UseFetchReturn<T> {
  /**
   * The fetched data
   */
  data: T | null;

  /**
   * Whether currently fetching
   */
  loading: boolean;

  /**
   * Error if fetch failed
   */
  error: Error | null;

  /**
   * Manually trigger a refetch
   */
  refetch: () => Promise<void>;

  /**
   * Reset state to initial
   */
  reset: () => void;
}

/**
 * Custom hook for fetching data from an API
 * Eliminates duplicate fetch→state→render patterns
 *
 * @example
 * const { data, loading, error, refetch } = useFetch<Product[]>({
 *   url: "/api/products",
 *   transform: (res) => res.products
 * });
 */
export function useFetch<T = any>(options: UseFetchOptions<T>): UseFetchReturn<T> {
  const {
    url,
    transform,
    immediate = true,
    fetchOptions,
    onSuccess,
    onError,
    deps = [],
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, fetchOptions);
      const json = await response.json();

      // Handle error responses
      if (!response.ok || json.status === "error") {
        throw new Error(json.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Transform data if needed
      const result = transform ? transform(json) : json;
      setData(result);

      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);

      // Call error callback
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [url, fetchOptions, transform, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData, ...deps]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    reset,
  };
}
