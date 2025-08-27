'use client';

import { useState, useMemo } from 'react';
import { 
  BanknotesIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  ArrowTrendingUpIcon, 
  CreditCardIcon, 
  CurrencyDollarIcon, 
  FunnelIcon, 
  PlusCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { StandardPageWrapper, StandardCard, StandardSection, StandardGrid, StandardButton, StandardStat } from '../../../components/ui/StandardPageWrapper';

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
  const [searchTerm, setSearchTerm] = useState('');

  // Sample in-memory data (replace with API later)
  const estimates: Estimate[] = [
    { id: 'EST-1001', client: 'Smith Family', project: 'Kitchen Renovation', total: 18500, status: 'sent', createdAt: '2025-08-01', validUntil: '2025-08-20' },
    { id: 'EST-1002', client: 'Johnson LLC', project: 'Bathroom Remodel', total: 9200, status: 'accepted', createdAt: '2025-08-02', validUntil: '2025-08-18' },
    { id: 'EST-1003', client: 'Taylor Homes', total: 44250, status: 'draft', createdAt: '2025-08-10', validUntil: '2025-09-05' },
  ];
  
  const invoices: Invoice[] = [
    { id: 'INV-24001', client: 'Smith Family', project: 'Kitchen Renovation', total: 18500, balance: 9250, status: 'partial', issuedAt: '2025-08-05', dueAt: '2025-09-05' },
    { id: 'INV-24002', client: 'Johnson LLC', project: 'Bathroom Remodel', total: 9200, balance: 0, status: 'paid', issuedAt: '2025-08-07', dueAt: '2025-09-07' },
    { id: 'INV-24003', client: 'Taylor Homes', total: 44250, balance: 44250, status: 'sent', issuedAt: '2025-08-12', dueAt: '2025-09-11' },
  ];
  
  const payments: Payment[] = [
    { id: 'PAY-5001', client: 'Johnson LLC', source: 'INV-24002', invoiceId: 'INV-24002', amount: 9200, method: 'ach', status: 'completed', createdAt: '2025-08-08' },
    { id: 'PAY-5002', client: 'Smith Family', source: 'INV-24001', invoiceId: 'INV-24001', amount: 9250, method: 'card', status: 'completed', createdAt: '2025-08-09' },
    { id: 'PAY-5003', client: 'Taylor Homes', source: 'Deposit', amount: 10000, method: 'wire', status: 'pending', createdAt: '2025-08-13' },
  ];

  const filteredPayments = payments.filter(p => 
    (methodFilter === 'all' || p.method === methodFilter) && 
    (statusFilter === 'all' || p.status === statusFilter)
  );

  const totals = useMemo(() => {
    const estPending = estimates.filter(e => ['sent', 'draft'].includes(e.status)).length;
    const estValueOpen = estimates.filter(e => ['sent', 'draft'].includes(e.status)).reduce((s, e) => s + e.total, 0);
    const invOpen = invoices.filter(i => !['paid'].includes(i.status)).length;
    const aR = invoices.reduce((s, i) => s + i.balance, 0);
    const paidThisMonth = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
    const pendingPayments = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
    return { estPending, estValueOpen, invOpen, aR, paidThisMonth, pendingPayments };
  }, [estimates, invoices, payments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'sent': return 'blue';
      case 'accepted': return 'green';
      case 'rejected': return 'red';
      case 'expired': return 'orange';
      case 'partial': return 'orange';
      case 'paid': return 'green';
      case 'overdue': return 'red';
      case 'pending': return 'orange';
      case 'completed': return 'green';
      case 'failed': return 'red';
      default: return 'default';
    }
  };

  const getMethodColor = (method: Payment['method']) => {
    switch (method) {
      case 'card': return 'purple';
      case 'ach': return 'blue';
      case 'cash': return 'green';
      case 'check': return 'orange';
      case 'wire': return 'blue';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <StandardPageWrapper>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold theme-text">Sales Dashboard</h1>
            <p className="theme-text-muted mt-2">
              Manage estimates, invoices, and track payment performance across all client interactions.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['overview', 'estimates', 'invoices', 'payments'].map(t => (
              <StandardButton
                key={t}
                variant={tab === t ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setTab(t as any)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </StandardButton>
            ))}
          </div>
        </div>

        {tab === 'overview' && (
          <>
            {/* Actions & Filters */}
            <StandardCard>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <StandardButton 
                    as={Link} 
                    href="/dashboard/estimates/new"
                    icon={<PlusCircleIcon className="h-4 w-4" />}
                  >
                    New Estimate
                  </StandardButton>
                  <StandardButton 
                    as={Link} 
                    href="/dashboard/invoices/new"
                    variant="secondary"
                    icon={<PlusCircleIcon className="h-4 w-4" />}
                  >
                    New Invoice
                  </StandardButton>
                  <StandardButton 
                    as={Link} 
                    href="/dashboard/payments/new"
                    variant="secondary"
                    icon={<PlusCircleIcon className="h-4 w-4" />}
                  >
                    Record Payment
                  </StandardButton>
                </div>
                <div className="flex items-center flex-wrap gap-3">
                  <select 
                    value={range} 
                    onChange={e => setRange(e.target.value as any)} 
                    className="px-3 py-2 border theme-border rounded-lg theme-surface-1 theme-text focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="30d">Last 30 Days</option>
                    <option value="60d">Last 60 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="ytd">Year to Date</option>
                  </select>
                  <select 
                    value={methodFilter} 
                    onChange={e => setMethodFilter(e.target.value)} 
                    className="px-3 py-2 border theme-border rounded-lg theme-surface-1 theme-text focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="all">All Payment Methods</option>
                    <option value="card">Credit Card</option>
                    <option value="ach">ACH Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="wire">Wire Transfer</option>
                  </select>
                  <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)} 
                    className="px-3 py-2 border theme-border rounded-lg theme-surface-1 theme-text focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </StandardCard>

            {/* Stats Overview */}
            <StandardGrid cols={6} className="grid-cols-1 md:grid-cols-3 lg:grid-cols-6">
              <StandardStat
                label="Open Estimates"
                value={`${totals.estPending} (${currency(totals.estValueOpen)})`}
                color="blue"
                icon={<DocumentTextIcon className="h-6 w-6" />}
              />
              <StandardStat
                label="Open Invoices"
                value={`${totals.invOpen} (${currency(totals.aR)})`}
                color="orange"
                icon={<ClockIcon className="h-6 w-6" />}
              />
              <StandardStat
                label="A/R Balance"
                value={currency(totals.aR)}
                color="purple"
                icon={<BanknotesIcon className="h-6 w-6" />}
              />
              <StandardStat
                label="Paid This Month"
                value={currency(totals.paidThisMonth)}
                color="green"
                icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
              />
              <StandardStat
                label="Pending Payments"
                value={currency(totals.pendingPayments)}
                color="blue"
                icon={<CreditCardIcon className="h-6 w-6" />}
              />
              <StandardStat
                label="Estimate Value"
                value={currency(totals.estValueOpen)}
                color="default"
                icon={<CurrencyDollarIcon className="h-6 w-6" />}
              />
            </StandardGrid>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Estimates */}
              <StandardCard>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold theme-text">Recent Estimates</h3>
                  <StandardButton size="sm" as={Link} href="/dashboard/estimates">
                    View All
                  </StandardButton>
                </div>
                <div className="space-y-4">
                  {estimates.slice(0, 3).map((estimate) => (
                    <div key={estimate.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border theme-border hover:shadow-md transition-shadow">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium theme-text">{estimate.id}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            estimate.status === 'draft' ? 'theme-surface-2 theme-text-muted' :
                            estimate.status === 'sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                            estimate.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            estimate.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                            'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                          }`}>
                            {estimate.status}
                          </span>
                        </div>
                        <p className="text-sm theme-text-muted">{estimate.client}</p>
                        {estimate.project && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">{estimate.project}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold theme-text">{currency(estimate.total)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Valid until {formatDate(estimate.validUntil)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </StandardCard>

              {/* Recent Invoices */}
              <StandardCard>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold theme-text">Recent Invoices</h3>
                  <StandardButton size="sm" as={Link} href="/dashboard/invoices">
                    View All
                  </StandardButton>
                </div>
                <div className="space-y-4">
                  {invoices.slice(0, 3).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border theme-border hover:shadow-md transition-shadow">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium theme-text">{invoice.id}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            invoice.status === 'draft' ? 'theme-surface-2 theme-text-muted' :
                            invoice.status === 'sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                            'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                          }`}>
                            {invoice.status}
                          </span>
                        </div>
                        <p className="text-sm theme-text-muted">{invoice.client}</p>
                        {invoice.project && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">{invoice.project}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold theme-text">{currency(invoice.total)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Balance: {currency(invoice.balance)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Due {formatDate(invoice.dueAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </StandardCard>
            </div>

            {/* Recent Payments */}
            <StandardCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold theme-text">Recent Payments</h3>
                <StandardButton size="sm" as={Link} href="/dashboard/payments">
                  View All
                </StandardButton>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b theme-border">
                      <th className="text-left py-3 px-4 font-medium theme-text">Payment ID</th>
                      <th className="text-left py-3 px-4 font-medium theme-text">Client</th>
                      <th className="text-left py-3 px-4 font-medium theme-text">Amount</th>
                      <th className="text-left py-3 px-4 font-medium theme-text">Method</th>
                      <th className="text-left py-3 px-4 font-medium theme-text">Status</th>
                      <th className="text-left py-3 px-4 font-medium theme-text">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.slice(0, 5).map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 font-medium theme-text">{payment.id}</td>
                        <td className="py-3 px-4 theme-text-muted">{payment.client}</td>
                        <td className="py-3 px-4 font-semibold theme-text">{currency(payment.amount)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            payment.method === 'card' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                            payment.method === 'ach' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                            payment.method === 'cash' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            payment.method === 'check' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                            {payment.method.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            payment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            payment.status === 'pending' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 theme-text-muted">{formatDate(payment.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </StandardCard>
          </>
        )}

        {/* Estimates Tab */}
        {tab === 'estimates' && (
          <StandardCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold theme-text">All Estimates</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search estimates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border theme-border rounded-lg theme-surface-1 theme-text focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <StandardButton as={Link} href="/dashboard/estimates/new" icon={<PlusCircleIcon className="h-4 w-4" />}>
                  New Estimate
                </StandardButton>
              </div>
            </div>
            <StandardGrid cols={1}>
              {estimates.map((estimate) => (
                <StandardCard key={estimate.id} hover className="group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="font-semibold theme-text">{estimate.id}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          estimate.status === 'draft' ? 'theme-surface-2 theme-text-muted' :
                          estimate.status === 'sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          estimate.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          estimate.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                        }`}>
                          {estimate.status}
                        </span>
                      </div>
                      <p className="theme-text-muted mb-1">{estimate.client}</p>
                      {estimate.project && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">{estimate.project}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          Created {formatDate(estimate.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          Valid until {formatDate(estimate.validUntil)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold theme-text mb-2">{currency(estimate.total)}</p>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <StandardButton size="sm" variant="ghost" as={Link} href={`/dashboard/estimates/${estimate.id}`} icon={<EyeIcon className="h-4 w-4" />}>
                          View
                        </StandardButton>
                        <StandardButton size="sm" variant="ghost" as={Link} href={`/dashboard/estimates/${estimate.id}/edit`} icon={<PencilIcon className="h-4 w-4" />}>
                          Edit
                        </StandardButton>
                        <StandardButton size="sm" variant="ghost" icon={<TrashIcon className="h-4 w-4" />}>
                          Delete
                        </StandardButton>
                      </div>
                    </div>
                  </div>
                </StandardCard>
              ))}
            </StandardGrid>
          </StandardCard>
        )}

        {/* Invoices Tab */}
        {tab === 'invoices' && (
          <StandardCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold theme-text">All Invoices</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border theme-border rounded-lg theme-surface-1 theme-text focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <StandardButton as={Link} href="/dashboard/invoices/new" icon={<PlusCircleIcon className="h-4 w-4" />}>
                  New Invoice
                </StandardButton>
              </div>
            </div>
            <StandardGrid cols={1}>
              {invoices.map((invoice) => (
                <StandardCard key={invoice.id} hover className="group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="font-semibold theme-text">{invoice.id}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          invoice.status === 'draft' ? 'theme-surface-2 theme-text-muted' :
                          invoice.status === 'sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                      <p className="theme-text-muted mb-1">{invoice.client}</p>
                      {invoice.project && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">{invoice.project}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          Issued {formatDate(invoice.issuedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          Due {formatDate(invoice.dueAt)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold theme-text">{currency(invoice.total)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                        Balance: {currency(invoice.balance)}
                      </p>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <StandardButton size="sm" variant="ghost" as={Link} href={`/dashboard/invoices/${invoice.id}`} icon={<EyeIcon className="h-4 w-4" />}>
                          View
                        </StandardButton>
                        <StandardButton size="sm" variant="ghost" as={Link} href={`/dashboard/invoices/${invoice.id}/edit`} icon={<PencilIcon className="h-4 w-4" />}>
                          Edit
                        </StandardButton>
                        <StandardButton size="sm" variant="ghost" icon={<TrashIcon className="h-4 w-4" />}>
                          Delete
                        </StandardButton>
                      </div>
                    </div>
                  </div>
                </StandardCard>
              ))}
            </StandardGrid>
          </StandardCard>
        )}

        {/* Payments Tab */}
        {tab === 'payments' && (
          <StandardCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold theme-text">All Payments</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border theme-border rounded-lg theme-surface-1 theme-text focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <StandardButton as={Link} href="/dashboard/payments/new" icon={<PlusCircleIcon className="h-4 w-4" />}>
                  Record Payment
                </StandardButton>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b theme-border">
                    <th className="text-left py-3 px-4 font-medium theme-text">Payment ID</th>
                    <th className="text-left py-3 px-4 font-medium theme-text">Client</th>
                    <th className="text-left py-3 px-4 font-medium theme-text">Source</th>
                    <th className="text-left py-3 px-4 font-medium theme-text">Amount</th>
                    <th className="text-left py-3 px-4 font-medium theme-text">Method</th>
                    <th className="text-left py-3 px-4 font-medium theme-text">Status</th>
                    <th className="text-left py-3 px-4 font-medium theme-text">Date</th>
                    <th className="text-left py-3 px-4 font-medium theme-text">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 font-medium theme-text">{payment.id}</td>
                      <td className="py-3 px-4 theme-text-muted">{payment.client}</td>
                      <td className="py-3 px-4 theme-text-muted">{payment.source}</td>
                      <td className="py-3 px-4 font-semibold theme-text">{currency(payment.amount)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          payment.method === 'card' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                          payment.method === 'ach' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          payment.method === 'cash' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          payment.method === 'check' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          {payment.method.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          payment.status === 'pending' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 theme-text-muted">{formatDate(payment.createdAt)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <StandardButton size="sm" variant="ghost" as={Link} href={`/dashboard/payments/${payment.id}`} icon={<EyeIcon className="h-4 w-4" />}>
                            View
                          </StandardButton>
                          <StandardButton size="sm" variant="ghost" as={Link} href={`/dashboard/payments/${payment.id}/edit`} icon={<PencilIcon className="h-4 w-4" />}>
                            Edit
                          </StandardButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </StandardCard>
        )}
      </div>
    </StandardPageWrapper>
  );
}
