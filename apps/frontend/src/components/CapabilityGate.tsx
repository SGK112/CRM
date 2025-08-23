"use client";
import React, { useState } from 'react';
import { useSubscription } from './subscription-context';
import { hasAllCapabilities } from './capabilities';

export function CapabilityGate({ need, children, fallback, onUpgrade }: { need: string | string[]; children: React.ReactNode; fallback?: React.ReactNode; onUpgrade?: () => void; }) {
  const { plan, loading } = useSubscription();
  if (loading) return <>{fallback || null}</>;
  const allowed = hasAllCapabilities(need, plan);
  if (allowed) return <>{children}</>;
  return <>{fallback || <UpgradeInline onUpgrade={onUpgrade} />}</>;
}

export function UpgradeInline({ onUpgrade }: { onUpgrade?: () => void }) {
  return (
    <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300">
      <div className="flex items-center justify-between gap-2">
        <span>Upgrade your plan to use this feature.</span>
        <a href="/billing/cart" onClick={onUpgrade} className="inline-flex items-center rounded bg-amber-600 hover:bg-amber-500 px-3 py-1 text-[11px] font-semibold text-white shadow shadow-amber-600/30 transition">Upgrade</a>
      </div>
    </div>
  );
}

export function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900/80 backdrop-blur shadow-xl">
        <div className="p-5 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-slate-100">Get more with Professional</h3>
          <p className="text-[12px] text-slate-400 mt-1">Unlock Voice Agent, Design Studio, API access and advanced reporting.</p>
        </div>
        <div className="p-5 space-y-2 text-[13px] text-slate-300">
          <ul className="list-disc pl-5 space-y-1">
            <li>AI Voice Agent outbound/inbound</li>
            <li>Design Studio with templates</li>
            <li>Priority support</li>
            <li>API access and automations</li>
          </ul>
        </div>
        <div className="p-5 border-t border-slate-800 flex items-center justify-between">
          <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-200">Not now</button>
          <a href="/billing/cart?plan=growth" className="inline-flex items-center rounded bg-amber-600 hover:bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow shadow-amber-600/30 transition">Upgrade</a>
        </div>
      </div>
    </div>
  );
}
