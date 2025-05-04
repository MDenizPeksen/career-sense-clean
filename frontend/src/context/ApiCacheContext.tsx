import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface ApiCacheContextType {
  getCache: <T>(key: string) => T | null;
  setCache: <T>(key: string, data: T, expiryMs?: number) => void;
  clearCache: (key?: string) => void;
  isStale: (key: string, maxAgeMs: number) => boolean;
}

const ApiCacheContext = createContext<ApiCacheContextType | undefined>(undefined);

interface ApiCacheProviderProps {
  children: ReactNode;
  defaultExpiryMs?: number;
}

export const ApiCacheProvider: React.FC<ApiCacheProviderProps> = ({ 
  children, 
  defaultExpiryMs = 5 * 60 * 1000 // 5 minutes default
}) => {
  const [cache, setCache] = useState<Record<string, CacheItem<any>>>({});

  const getCache = useCallback(<T,>(key: string): T | null => {
    const item = cache[key];
    if (!item) return null;
    return item.data;
  }, [cache]);

  const setCacheValue = useCallback(<T,>(key: string, data: T, expiryMs?: number) => {
    setCache(prevCache => ({
      ...prevCache,
      [key]: {
        data,
        timestamp: Date.now(),
        expiryMs: expiryMs || defaultExpiryMs
      }
    }));
  }, [defaultExpiryMs]);

  const clearCacheValue = useCallback((key?: string) => {
    if (key) {
      setCache(prevCache => {
        const newCache = { ...prevCache };
        delete newCache[key];
        return newCache;
      });
    } else {
      setCache({});
    }
  }, []);

  const isStale = useCallback((key: string, maxAgeMs: number): boolean => {
    const item = cache[key];
    if (!item) return true;
    
    const now = Date.now();
    const age = now - item.timestamp;
    return age > maxAgeMs;
  }, [cache]);

  return (
    <ApiCacheContext.Provider
      value={{
        getCache,
        setCache: setCacheValue,
        clearCache: clearCacheValue,
        isStale
      }}
    >
      {children}
    </ApiCacheContext.Provider>
  );
};

export const useApiCache = (): ApiCacheContextType => {
  const context = useContext(ApiCacheContext);
  if (context === undefined) {
    throw new Error('useApiCache must be used within an ApiCacheProvider');
  }
  return context;
};

// Custom hook for cached API requests
export function useCachedApiRequest<T>(
  requestFn: () => Promise<T>,
  cacheKey: string,
  options: {
    enabled?: boolean;
    maxAgeMs?: number;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const { enabled = true, maxAgeMs = 5 * 60 * 1000, onSuccess, onError } = options;
  const { getCache, setCache, isStale } = useApiCache();
  const [data, setData] = useState<T | null>(getCache<T>(cacheKey));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (force: boolean = false) => {
    // Skip if disabled
    if (!enabled) return;
    
    // Return cached data if it exists and isn't stale
    if (!force && getCache<T>(cacheKey) && !isStale(cacheKey, maxAgeMs)) {
      const cachedData = getCache<T>(cacheKey);
      setData(cachedData);
      if (onSuccess && cachedData) onSuccess(cachedData);
      return cachedData;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await requestFn();
      setData(result);
      setCache<T>(cacheKey, result, maxAgeMs);
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      if (onError) onError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey, enabled, getCache, isStale, maxAgeMs, onError, onSuccess, requestFn, setCache]);

  return { data, isLoading, error, execute, refetch: () => execute(true) };
}
