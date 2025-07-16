import { useState, useEffect, useRef, useCallback } from 'react';
import { icnApi } from '@/services/icnApi';

interface RealtimeConfig {
  enableSSE?: boolean;
  pollingInterval?: number;
}

interface RealtimeState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  lastUpdate: Date | null;
}

/**
 * Custom hook for real-time data updates with SSE fallback to polling
 * 
 * @param endpoint - API endpoint to fetch data from
 * @param fetchFn - Function to fetch initial/fallback data
 * @param config - Configuration options
 */
export function useRealtimeData<T>(
  endpoint: string,
  fetchFn: () => Promise<T>,
  config: RealtimeConfig = {}
): RealtimeState<T> & {
  refetch: () => Promise<void>;
  reconnect: () => void;
} {
  const {
    enableSSE = true,
    pollingInterval = 10000 // 10 seconds
  } = config;

  const [state, setState] = useState<RealtimeState<T>>({
    data: null,
    isLoading: true,
    error: null,
    isConnected: false,
    lastUpdate: null
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);

  // Fetch data function with error handling
  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const data = await fetchFn();
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          data,
          isLoading: false,
          error: null,
          lastUpdate: new Date()
        }));
      }
      
      retryCountRef.current = 0; // Reset retry count on success
    } catch (error) {
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          lastUpdate: new Date()
        }));
      }
    }
  }, [fetchFn]);

  // Setup Server-Sent Events connection
  const setupSSE = useCallback(() => {
    if (!enableSSE || typeof EventSource === 'undefined') {
      return false;
    }

    try {
      // For now, we'll simulate SSE since icn-core doesn't have it yet
      // In the future, this would connect to something like `/api/v1/events?filter=${endpoint}`
      console.log(`[SSE] Would connect to events for ${endpoint} (simulated)`);
      
      // Fallback to polling for now
      return false;
    } catch (error) {
      console.warn('[SSE] Failed to setup Server-Sent Events:', error);
      return false;
    }
  }, [enableSSE, endpoint]);

  // Setup polling fallback
  const setupPolling = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
    }

    const poll = () => {
      fetchData().finally(() => {
        if (mountedRef.current) {
          pollingTimeoutRef.current = setTimeout(poll, pollingInterval);
        }
      });
    };

    pollingTimeoutRef.current = setTimeout(poll, pollingInterval);
    
    setState(prev => ({ ...prev, isConnected: true }));
  }, [fetchData, pollingInterval]);

  // Reconnect function
  const reconnect = useCallback(() => {
    // Close existing connections
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }

    // Reset retry count
    retryCountRef.current = 0;
    
    // Try SSE first, fallback to polling
    const sseConnected = setupSSE();
    if (!sseConnected) {
      setupPolling();
    }
  }, [setupSSE, setupPolling]);

  // Manual refetch function
  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Initialize connection on mount
  useEffect(() => {
    // Initial data fetch
    fetchData();
    
    // Setup real-time connection
    const sseConnected = setupSSE();
    if (!sseConnected) {
      setupPolling();
    }

    return () => {
      mountedRef.current = false;
      
      // Cleanup SSE
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      
      // Cleanup polling
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, [fetchData, setupSSE, setupPolling]);

  // Handle visibility change for efficient polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, reduce polling frequency or pause
        if (pollingTimeoutRef.current) {
          clearTimeout(pollingTimeoutRef.current);
        }
      } else {
        // Page is visible, resume normal polling
        if (!eventSourceRef.current && pollingInterval) {
          setupPolling();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setupPolling, pollingInterval]);

  return {
    ...state,
    refetch,
    reconnect
  };
}

// Specific hooks for common data types
export function useRealtimeNodeStatus() {
  return useRealtimeData(
    'status',
    () => icnApi.getNodeStatus(),
    { pollingInterval: 5000 } // Update every 5 seconds
  );
}

export function useRealtimeJobs() {
  return useRealtimeData(
    'jobs',
    () => icnApi.getJobs(),
    { pollingInterval: 3000 } // Update every 3 seconds for jobs
  );
}

export function useRealtimeAccountInfo() {
  return useRealtimeData(
    'account',
    async () => {
      try {
        return await icnApi.getCurrentAccountInfo();
      } catch (error) {
        console.warn('Account info unavailable, using fallback');
        return { did: 'unknown', mana: 0 };
      }
    },
    { pollingInterval: 10000 } // Update every 10 seconds
  );
}

export function useRealtimePeers() {
  return useRealtimeData(
    'peers',
    async () => {
      try {
        return await icnApi.getNetworkPeers();
      } catch (error) {
        console.warn('Network peers unavailable (libp2p stub), using fallback');
        return []; // Return empty array as fallback
      }
    },
    { pollingInterval: 15000 } // Update every 15 seconds
  );
} 