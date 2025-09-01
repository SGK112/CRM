'use client';

import { useState, useEffect } from 'react';

interface InboxStats {
  total: number;
  unread: number;
  starred: number;
  archived: number;
}

export function useInboxStats() {
  const [stats, setStats] = useState<InboxStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3001/api/notifications/count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          total: data.count || 0,
          unread: data.count || 0,
          starred: 0,
          archived: 0
        });
      }
    } catch (error) {
      // Silently fail - inbox stats are not critical
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, refetch: fetchStats };
}
