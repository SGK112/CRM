"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SubscriptionInfo {
  plan?: string | null;
  status?: string | null;
  trialEndsAt?: string | null; // ISO string
  loading: boolean;
  error?: string | null;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionInfo | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<string | null>();
  const [status, setStatus] = useState<string | null>();
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('accessToken');
    if (!token) { setLoading(false); return; }
    try {
      setError(null);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      });
      if (!res.ok) throw new Error('Failed subscription fetch');
      const data = await res.json();
      setPlan(data.subscriptionPlan || null);
      setStatus(data.subscriptionStatus || null);
      setTrialEndsAt(data.trialEndsAt || null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <SubscriptionContext.Provider value={{ plan, status, trialEndsAt, loading, error, refresh: load }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
