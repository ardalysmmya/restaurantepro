import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';

export function useSupabase() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return useAuthStore();
}
