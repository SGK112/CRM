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

  function getEmailFromToken(): string | null {
    try {
      const token = (typeof window !== 'undefined') ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) : null;
      if (!token) return null;
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload?.email || payload?.user?.email || payload?.upn || null;
    } catch { return null; }
  }

  const load = async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('accessToken');
    if (!token) { setLoading(false); return; }
    try {
      setError(null);
  const res = await fetch(`/api/billing/me`, {
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
      // Testing override for demo account (dev/local only)
      try {
        const email = getEmailFromToken();
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        const isLocal = ['localhost', '127.0.0.1', '::1'].includes(host);
        const allowOverride = isLocal || process.env.NEXT_PUBLIC_DEMO_OVERRIDE === '1';
        if (allowOverride && email && email.toLowerCase() === 'demo@test.com') {
          // Force Enterprise-like capabilities for testing regardless of backend value
          setPlan('enterprise');
          setStatus('trial');
          setTrialEndsAt('2099-12-31T23:59:59.000Z');
        }
      } catch {/* no-op */}
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
