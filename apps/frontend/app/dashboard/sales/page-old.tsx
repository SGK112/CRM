/* eslint-disable no-extra-semi */
'use client';

import { useState, useMemo } from 'react';
import Layout from '../../../components/Layout';
import {
  BanknotesIcon,
  DocumentTextIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  FunnelIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';

interface Estimate {
  id: string;
  client: string;
  project?: string;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  validUntil: string;
}
interface Invoice {
  id: string;
  client: string;
  project?: string;
  total: number;
  balance: number;
  status: 'draft' | 'sent' | 'partial' | 'paid' | 'overdue';
  issuedAt: string;
  dueAt: string;
}
interface Payment {
  id: string;
  invoiceId?: string;
  source: string;
  client: string;
  amount: number;
  method: 'card' | 'ach' | 'cash' | 'check' | 'wire';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

const currency = (n: number) => n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });

export default function SalesPage() {
  const [tab, setTab] = useState<'overview' | 'estimates' | 'invoices' | 'payments'>('overview');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [range, setRange] = useState<'30d' | '60d' | '90d' | 'ytd'>('30d');

  // Sample in-memory data (replace with API later)
  const estimates: Estimate[] = [
    {
      id: 'EST-1001',
      client: 'Smith Family',
      project: 'Kitchen Renovation',
      total: 18500,
      status: 'sent',
      createdAt: '2025-08-01',
      validUntil: '2025-08-20',
    },
    {
      id: 'EST-1002',
      client: 'Johnson LLC',
      project: 'Bathroom Remodel',
      total: 9200,
      status: 'accepted',
      createdAt: '2025-08-02',
      validUntil: '2025-08-18',
    },
    {
      id: 'EST-1003',
      client: 'Taylor Homes',
      total: 44250,
      status: 'draft',
      createdAt: '2025-08-10',
      validUntil: '2025-09-05',
    },
  ];
  const invoices: Invoice[] = [
    {
      id: 'INV-24001',
      client: 'Smith Family',
      project: 'Kitchen Renovation',
      total: 18500,
      balance: 9250,
      status: 'partial',
      issuedAt: '2025-08-05',
      dueAt: '2025-09-05',
    },
    {
      id: 'INV-24002',
      client: 'Johnson LLC',
      project: 'Bathroom Remodel',
      total: 9200,
      balance: 0,
      status: 'paid',
      issuedAt: '2025-08-07',
      dueAt: '2025-09-07',
    },
    {
      id: 'INV-24003',
      client: 'Taylor Homes',
      total: 44250,
      balance: 44250,
      status: 'sent',
      issuedAt: '2025-08-12',
      dueAt: '2025-09-11',
    },
  ];
  const payments: Payment[] = [
    {
      id: 'PAY-5001',
      client: 'Johnson LLC',
      source: 'INV-24002',
      invoiceId: 'INV-24002',
      amount: 9200,
      method: 'ach',
      status: 'completed',
      createdAt: '2025-08-08',
    },
    {
      id: 'PAY-5002',
      client: 'Smith Family',
      source: 'INV-24001',
      invoiceId: 'INV-24001',
      amount: 9250,
      method: 'card',
      status: 'completed',
      createdAt: '2025-08-09',
    },
    {
      id: 'PAY-5003',
      client: 'Taylor Homes',
      source: 'Deposit',
      amount: 10000,
      method: 'wire',
      status: 'pending',
      createdAt: '2025-08-13',
    },
  ];

  // Derived filtered payments for overview visualizations
  const filteredPayments = payments.filter(
    p =>
      (methodFilter === 'all' || p.method === methodFilter) &&
      (statusFilter === 'all' || p.status === statusFilter)
  );

  const totals = useMemo(() => {
    const estPending = estimates.filter(e => ['sent', 'draft'].includes(e.status)).length;
    const estValueOpen = estimates
      .filter(e => ['sent', 'draft'].includes(e.status))
      .reduce((s, e) => s + e.total, 0);
    const invOpen = invoices.filter(i => !['paid'].includes(i.status)).length;
    const aR = invoices.reduce((s, i) => s + i.balance, 0);
    const paidThisMonth = payments
      .filter(p => p.status === 'completed')
      .reduce((s, p) => s + p.amount, 0);
    const pendingPayments = payments
      .filter(p => p.status === 'pending')
      .reduce((s, p) => s + p.amount, 0);
    return { estPending, estValueOpen, invOpen, aR, paidThisMonth, pendingPayments };
  }, [estimates, invoices, payments]);

  // Aggregate per-client financial snapshot for pill list
  const clientSummaries = useMemo(() => {
    interface Summary {
      client: string;
      openEstimates: number;
      openEstimateValue: number;
      invoiceTotal: number;
      balance: number;
      paid: number;
      pendingPayments: number;
      lastMethod?: string;
    }
    const map = new Map<string, Summary>();
    const ensure = (c: string) => {
      if (!map.has(c))
        map.set(c, {
          client: c,
          openEstimates: 0,
          openEstimateValue: 0,
          invoiceTotal: 0,
          balance: 0,
          paid: 0,
          pendingPayments: 0,
        });
      return map.get(c)!;
    };
    estimates.forEach(e => {
      const s = ensure(e.client);
      if (['sent', 'draft'].includes(e.status)) {
        s.openEstimates++;
        s.openEstimateValue += e.total;
      }
    });
    invoices.forEach(i => {
      const s = ensure(i.client);
      s.invoiceTotal += i.total;
      s.balance += i.balance;
      if (i.status === 'paid') s.paid += i.total;
    });
    payments.forEach(p => {
      const s = ensure(p.client);
      if (p.status === 'completed') {
        s.paid += p.amount;
        s.lastMethod = p.method;
      } else if (p.status === 'pending') {
        s.pendingPayments += p.amount;
        s.lastMethod = p.method;
      }
    });
    return Array.from(map.values()).sort(
      (a, b) => b.balance + b.openEstimateValue - (a.balance + a.openEstimateValue)
    );
  }, [estimates, invoices, payments]);

  const statusPill = (status: string) => {
    const map: Record<string, string> = {
      draft: 'pill pill-tint-neutral sm',
      sent: 'pill pill-tint-blue sm',
      accepted: 'pill pill-tint-green sm',
      rejected: 'pill pill-tint-red sm',
      expired: 'pill pill-tint-yellow sm',
      partial: 'pill pill-tint-yellow sm',
      paid: 'pill pill-tint-green sm',
      overdue: 'pill pill-tint-red sm',
      pending: 'pill pill-tint-yellow sm',
      completed: 'pill pill-tint-green sm',
      failed: 'pill pill-tint-red sm',
    };
    return <span className={map[status] || 'pill pill-tint-neutral sm'}>{status}</span>;
  };

  const methodPill = (m: Payment['method']) => {
    const map: Record<string, string> = {
      card: 'purple',
      ach: 'blue',
      cash: 'green',
      check: 'yellow',
      wire: 'indigo',
    };
    return <span className={`pill pill-tint-${map[m]} sm`}>{m}</span>;
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Sales</h1>
            <p className="text-sm text-gray-800 dark:text-[var(--text-dim)]">
              Estimates, invoices & payment performance
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['overview', 'estimates', 'invoices', 'payments'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t as any)}
                className={`pill ${tab === t ? 'pill-tint-blue' : 'pill-tint-neutral'} sm`}
                data-active={tab === t}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {tab === 'overview' && (
          <>
            {/* Actions & Filters Row */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <button className="pill pill-tint-green sm" title="New Estimate">
                  + Estimate
                </button>
                <button className="pill pill-tint-indigo sm" title="New Invoice">
                  + Invoice
                </button>
                <button className="pill pill-tint-purple sm" title="Record Payment">
                  + Payment
                </button>
              </div>
              <div className="flex items-center flex-wrap gap-2">
                <div className="pill sm pill-tint-neutral flex items-center gap-2">
                  <FunnelIcon className="h-4 w-4" />
                  <select
                    value={range}
                    onChange={e => setRange(e.target.value as any)}
                    className="bg-transparent focus:outline-none text-[11px]"
                  >
                    <option value="30d">30d</option>
                    <option value="60d">60d</option>
                    <option value="90d">90d</option>
                    <option value="ytd">YTD</option>
                  </select>
                </div>
                <select
                  value={methodFilter}
                  onChange={e => setMethodFilter(e.target.value)}
                  className="pill sm pill-tint-neutral bg-transparent focus:outline-none pr-6"
                >
                  <option value="all">All Methods</option>
                  <option value="card">Card</option>
                  <option value="ach">ACH</option>
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="wire">Wire</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="pill sm pill-tint-neutral bg-transparent focus:outline-none pr-6"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <StatCard
                icon={DocumentTextIcon}
                label="Open Estimates"
                value={totals.estPending}
                sub={currency(totals.estValueOpen)}
                tint="blue"
              />
              <StatCard
                icon={ClockIcon}
                label="Open Invoices"
                value={totals.invOpen}
                sub={currency(totals.aR)}
                tint="yellow"
              />
              <StatCard
                icon={BanknotesIcon}
                label="A/R Balance"
                value={currency(totals.aR)}
                tint="purple"
              />
              <StatCard
                icon={ArrowTrendingUpIcon}
                label="Paid (Month)"
                value={currency(totals.paidThisMonth)}
                tint="green"
              />
              <StatCard
                icon={CreditCardIcon}
                label="Pending Payments"
                value={currency(totals.pendingPayments)}
                tint="indigo"
              />
              <StatCard
                icon={CurrencyDollarIcon}
                label="Estimates Value"
                value={currency(totals.estValueOpen)}
                tint="neutral"
              />
            </div>
            {/* Revenue Sparkline */}
            <div className="surface-1 rounded-xl border border-token p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-gray-800 dark:text-gray-100">
                  Revenue Trend
                </h2>
                <span className="pill sm pill-tint-neutral">
                  {filteredPayments.length} payments
                </span>
              </div>
              {(() => {
                // Build simple sparkline from payments amounts by day index for demo
                const points = filteredPayments.map(p => ({
                  date: new Date(p.createdAt),
                  amount: p.amount,
                }));
                const sorted = [...points].sort((a, b) => +a.date - +b.date);
                const max = Math.max(1, ...sorted.map(p => p.amount));
                const w = 260;
                const h = 60;
                const pad = 4;
                const path = sorted
                  .map((p, i) => {
                    const x = pad + (i / Math.max(sorted.length - 1, 1)) * (w - pad * 2);
                    const y = h - pad - (p.amount / max) * (h - pad * 2);
                    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
                  })
                  .join(' ');
                return (
                  <div className="flex items-center gap-6 flex-wrap">
                    <svg
                      width={w}
                      height={h}
                      className="rounded-md bg-[var(--surface-2)] border border-token"
                    >
                      <path
                        d={path}
                        fill="none"
                        stroke="#4ade80"
                        strokeWidth={2}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                      {sorted.map((p, i) => {
                        const x = pad + (i / Math.max(sorted.length - 1, 1)) * (w - pad * 2);
                        const y = h - pad - (p.amount / max) * (h - pad * 2);
                        return <circle key={i} cx={x} cy={y} r={3} className="fill-emerald-400" />;
                      })}
                    </svg>
                    <div className="text-xs space-y-1 text-gray-800 dark:text-gray-300 min-w-[160px]">
                      <div className="flex justify-between">
                        <span>Total</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {currency(filteredPayments.reduce((s, p) => s + p.amount, 0))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg</span>
                        <span>
                          {currency(
                            filteredPayments.reduce((s, p) => s + p.amount, 0) /
                              (filteredPayments.length || 1)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Methods</span>
                        <span>
                          {Array.from(new Set(filteredPayments.map(p => p.method))).length}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            {/* Client summary pills */}
            <div className="surface-1 rounded-xl border border-token p-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-gray-800 dark:text-gray-100">
                  Client Financial Snapshot
                </h2>
                <span className="pill sm pill-tint-neutral">{clientSummaries.length} clients</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 custom-scroll">
                {clientSummaries.map(s => {
                  const risk = s.balance > 0 || s.openEstimateValue > 0 || s.pendingPayments > 0;
                  const tint =
                    s.balance > 0
                      ? 'red'
                      : s.pendingPayments > 0
                        ? 'yellow'
                        : s.openEstimateValue > 0
                          ? 'blue'
                          : 'green';
                  return (
                    <div
                      key={s.client}
                      className={`pill lg pill-tint-${tint} min-w-[240px] flex flex-col items-start !gap-1`}
                    >
                      <div className="w-full flex items-center justify-between">
                        <span className="font-semibold truncate max-w-[140px]">{s.client}</span>
                        {s.lastMethod && (
                          <span className="text-[10px] uppercase tracking-wide opacity-80">
                            {s.lastMethod}
                          </span>
                        )}
                      </div>
                      <div className="w-full flex flex-wrap gap-x-3 gap-y-1 text-[10px] leading-tight">
                        <span>{s.openEstimates > 0 && `Est ${currency(s.openEstimateValue)}`}</span>
                        <span>{s.balance > 0 && `AR ${currency(s.balance)}`}</span>
                        <span>
                          {s.pendingPayments > 0 && `Pend ${currency(s.pendingPayments)}`}
                        </span>
                        <span className="text-green-300/90">Paid {currency(s.paid)}</span>
                      </div>
                      {risk &&
                        s.balance === 0 &&
                        s.pendingPayments === 0 &&
                        s.openEstimateValue === 0 && (
                          <span className="text-[10px] opacity-70">Clear</span>
                        )}
                    </div>
                  );
                })}
                {clientSummaries.length === 0 && (
                  <div className="pill pill-tint-neutral">No client data</div>
                )}
              </div>
            </div>
            {/* Recent Activity */}
            <div className="surface-1 rounded-xl border border-token p-4 mt-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-gray-800 dark:text-gray-100">
                  Recent Activity
                </h2>
                <span className="pill sm pill-tint-neutral">
                  Last {filteredPayments.length} payments
                </span>
              </div>
              <div className="space-y-2">
                {filteredPayments.slice(0, 6).map(p => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-[11px] border border-token rounded-md px-3 py-1.5 hover:bg-[var(--surface-2)]/60"
                  >
                    <div className="flex items-center gap-2">
                      <span className="pill sm pill-tint-green">{currency(p.amount)}</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {p.client}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <span className="hidden sm:inline">{p.source}</span>
                      <span
                        className={`pill sm ${p.status === 'completed' ? 'pill-tint-green' : p.status === 'pending' ? 'pill-tint-yellow' : 'pill-tint-red'}`}
                      >
                        {p.status}
                      </span>
                      <span>{p.createdAt}</span>
                    </div>
                  </div>
                ))}
                {filteredPayments.length === 0 && (
                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    No payments in selection.
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {tab === 'estimates' && (
          <div className="surface-1 rounded-xl border border-token overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wide text-gray-700 dark:text-gray-300">
                <tr className="border-b border-token">
                  <th className="py-2 px-3">Estimate</th>
                  <th className="py-2 px-3">Client</th>
                  <th className="py-2 px-3">Project</th>
                  <th className="py-2 px-3">Total</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Created</th>
                  <th className="py-2 px-3">Valid Until</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/60">
                {estimates.map(e => (
                  <tr key={e.id} className="hover:bg-[var(--surface-2)]/60">
                    <td className="py-2 px-3 font-medium">{e.id}</td>
                    <td className="py-2 px-3">{e.client}</td>
                    <td className="py-2 px-3 text-[11px] text-gray-700 dark:text-gray-300">
                      {e.project || '-'}
                    </td>
                    <td className="py-2 px-3">{currency(e.total)}</td>
                    <td className="py-2 px-3">{statusPill(e.status)}</td>
                    <td className="py-2 px-3 text-[11px]">{e.createdAt}</td>
                    <td className="py-2 px-3 text-[11px]">{e.validUntil}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'invoices' && (
          <div className="surface-1 rounded-xl border border-token overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wide text-gray-700 dark:text-gray-300">
                <tr className="border-b border-token">
                  <th className="py-2 px-3">Invoice</th>
                  <th className="py-2 px-3">Client</th>
                  <th className="py-2 px-3">Project</th>
                  <th className="py-2 px-3">Total</th>
                  <th className="py-2 px-3">Balance</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Issued</th>
                  <th className="py-2 px-3">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/60">
                {invoices.map(i => (
                  <tr key={i.id} className="hover:bg-[var(--surface-2)]/60">
                    <td className="py-2 px-3 font-medium">{i.id}</td>
                    <td className="py-2 px-3">{i.client}</td>
                    <td className="py-2 px-3 text-[11px] text-gray-700 dark:text-gray-300">
                      {i.project || '-'}
                    </td>
                    <td className="py-2 px-3">{currency(i.total)}</td>
                    <td className="py-2 px-3">{currency(i.balance)}</td>
                    <td className="py-2 px-3">{statusPill(i.status)}</td>
                    <td className="py-2 px-3 text-[11px]">{i.issuedAt}</td>
                    <td className="py-2 px-3 text-[11px]">{i.dueAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'payments' && (
          <div className="surface-1 rounded-xl border border-token overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wide text-gray-700 dark:text-gray-300">
                <tr className="border-b border-token">
                  <th className="py-2 px-3">Payment</th>
                  <th className="py-2 px-3">Client</th>
                  <th className="py-2 px-3">Source</th>
                  <th className="py-2 px-3">Amount</th>
                  <th className="py-2 px-3">Method</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/60">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-[var(--surface-2)]/60">
                    <td className="py-2 px-3 font-medium">{p.id}</td>
                    <td className="py-2 px-3">{p.client}</td>
                    <td className="py-2 px-3 text-[11px] text-gray-700 dark:text-gray-300">
                      {p.source}
                    </td>
                    <td className="py-2 px-3">{currency(p.amount)}</td>
                    <td className="py-2 px-3">{methodPill(p.method)}</td>
                    <td className="py-2 px-3">{statusPill(p.status)}</td>
                    <td className="py-2 px-3 text-[11px]">{p.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

interface StatCardProps {
  icon: any;
  label: string;
  value: any;
  sub?: string;
  tint?: 'blue' | 'green' | 'yellow' | 'purple' | 'indigo' | 'neutral' | 'red';
}
function StatCard({ icon: Icon, label, value, sub, tint = 'blue' }: StatCardProps) {
  const tintClass = `pill-tint-${tint}`;
  return (
    <div className="surface-1 rounded-xl border border-token p-4 flex flex-col gap-3">
      <div className={`inline-flex ${tintClass} pill sm`}>
        {' '}
        <Icon className="h-4 w-4" />{' '}
      </div>
      <div className="text-xs uppercase tracking-wide text-gray-700 dark:text-gray-300 font-medium">
        {label}
      </div>
      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</div>
      {sub && <div className="text-[11px] text-gray-700 dark:text-gray-300">{sub}</div>}
    </div>
  );
}
