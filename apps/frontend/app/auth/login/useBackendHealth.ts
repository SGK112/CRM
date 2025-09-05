import { useCallback, useEffect, useState } from 'react';

export function useBackendHealth() {
  const [backendUp, setBackendUp] = useState(true);
  const [checkingHealth, setCheckingHealth] = useState(false);

  const checkHealth = useCallback(async (attempt = 1) => {
    setCheckingHealth(true);

    // Try proxy endpoint first
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      if (res.ok) {
        setBackendUp(true);
        setCheckingHealth(false);
        return;
      }
    } catch {
      // Ignore and try direct backend fallback
    }

    // Try direct backend as fallback
    try {
      const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
        .replace(/\/$/, '')
        .replace(/(?:\/api)+$/, '');
      const res = await fetch(`${base}/api/health`, { cache: 'no-store' });
      setBackendUp(res.ok);
    } catch {
      setBackendUp(false);
    } finally {
      setCheckingHealth(false);
    }

    // Light retry with backoff if still down
    if (attempt < 3) {
      setTimeout(() => checkHealth(attempt + 1), attempt * 800);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return { backendUp, checkingHealth, retryHealthCheck: checkHealth };
}
