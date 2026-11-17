import { QueryClient } from '@tanstack/react-query';

// Shared so non-React code (e.g. authStore on logout) can reach the cache.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Serve cached data for 30s before refetching on mount. Mutations
      // invalidate the keys they affect, so this only skips redundant reads.
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
