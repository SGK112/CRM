'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  ShoppingBagIcon,
  WrenchScrewdriverIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';

interface FinancialItem {
  id: string;
  type: 'estimate' | 'invoice' | 'material';
  title: string;
  clientName?: string;
  amount?: number;
  status: string;
  createdAt: string;
  dueDate?: string;
  category?: string;
  unitPrice?: number;
  stock?: number;
}

export default function FinancialPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'estimates' | 'invoices' | 'materials'>(
    'overview'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<FinancialItem[]>([]);

  useEffect(() => {
    // Mock data
    setTimeout(() => {
      setItems([
        // Estimates
        {
          id: 'est-1',
          type: 'estimate',
          title: 'Kitchen Renovation - Smith Family',
          clientName: 'Smith Family',
          amount: 45750,
          status: 'pending',
          createdAt: '2025-08-28',
        },
        {
          id: 'est-2',
          type: 'estimate',
          title: 'Bathroom Remodel - Johnson',
          clientName: 'Johnson Family',
          amount: 28900,
          status: 'approved',
          createdAt: '2025-08-25',
        },
        // Invoices
        {
          id: 'inv-1',
          type: 'invoice',
          title: 'Master Bath Project - Wilson',
          clientName: 'Wilson Family',
          amount: 32500,
          status: 'paid',
          createdAt: '2025-08-20',
          dueDate: '2025-09-20',
        },
        {
          id: 'inv-2',
          type: 'invoice',
          title: 'Kitchen Cabinets - Martinez',
          clientName: 'Martinez Family',
          amount: 18200,
          status: 'sent',
          createdAt: '2025-08-22',
          dueDate: '2025-09-15',
        },
        // Materials
        {
          id: 'mat-1',
          type: 'material',
          title: 'Quartz Countertops - Premium',
          category: 'Countertops',
          unitPrice: 85,
          stock: 150,
          status: 'in-stock',
          createdAt: '2025-08-15',
        },
        {
          id: 'mat-2',
          type: 'material',
          title: 'Subway Tile - White 3x6',
          category: 'Tile',
          unitPrice: 12,
          stock: 50,
          status: 'low-stock',
          createdAt: '2025-08-10',
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredItems = items.filter(item => {
    const matchesTab = activeTab === 'overview' || item.type === activeTab.slice(0, -1);
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = {
    totalEstimates: items.filter(i => i.type === 'estimate').length,
    pendingEstimates: items.filter(i => i.type === 'estimate' && i.status === 'pending').length,
    totalInvoices: items.filter(i => i.type === 'invoice').length,
    paidInvoices: items.filter(i => i.type === 'invoice' && i.status === 'paid').length,
    totalRevenue: items
      .filter(i => i.type === 'invoice' && i.status === 'paid')
      .reduce((sum, i) => sum + (i.amount || 0), 0),
    pendingRevenue: items
      .filter(i => i.type === 'invoice' && i.status !== 'paid')
      .reduce((sum, i) => sum + (i.amount || 0), 0),
    materialItems: items.filter(i => i.type === 'material').length,
    lowStock: items.filter(i => i.type === 'material' && i.status === 'low-stock').length,
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: CurrencyDollarIcon },
    { key: 'estimates', label: 'Estimates', icon: DocumentTextIcon },
    { key: 'invoices', label: 'Invoices', icon: ShoppingBagIcon },
    { key: 'materials', label: 'Materials', icon: WrenchScrewdriverIcon },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage estimates, invoices, and materials</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/estimates/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            New Estimate
          </Link>
          <Link
            href="/dashboard/invoices/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            New Invoice
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border">
          <div className="flex items-center gap-3">
            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Estimates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEstimates}</p>
              <p className="text-sm text-yellow-600">
                {stats.pendingEstimates} pending
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border">
          <div className="flex items-center gap-3">
            <ShoppingBagIcon className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Invoices</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalInvoices}</p>
              <p className="text-sm text-green-600">{stats.paidInvoices} paid</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border">
          <div className="flex items-center gap-3">
            <CreditCardIcon className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${(stats.totalRevenue / 1000).toFixed(0)}k
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ${(stats.pendingRevenue / 1000).toFixed(0)}k pending
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border">
          <div className="flex items-center gap-3">
            <WrenchScrewdriverIcon className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Materials</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.materialItems}</p>
              <p className="text-sm text-orange-600">{stats.lowStock} low stock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex bg-white dark:bg-gray-800 rounded-lg border p-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() =>
                  setActiveTab(tab.key as 'overview' | 'estimates' | 'invoices' | 'materials')
                }
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border p-6">
        <div className="space-y-3">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                {item.type === 'estimate' && (
                  <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                )}
                {item.type === 'invoice' && (
                  <ShoppingBagIcon className="h-5 w-5 text-green-600" />
                )}
                {item.type === 'material' && (
                  <WrenchScrewdriverIcon className="h-5 w-5 text-orange-600" />
                )}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                  {item.clientName && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.clientName}</p>
                  )}
                  {item.category && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">Category: {item.category}</p>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400">Created: {item.createdAt}</p>
                </div>
              </div>

              <div className="text-right">
                {item.amount && (
                  <p className="font-medium text-gray-900 dark:text-white mb-1">
                    ${item.amount.toLocaleString()}
                  </p>
                )}
                {item.unitPrice && (
                  <p className="font-medium text-gray-900 dark:text-white mb-1">
                    ${item.unitPrice}/unit
                  </p>
                )}
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'paid' || item.status === 'approved' || item.status === 'in-stock'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : item.status === 'pending' || item.status === 'sent'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <DocumentTextIcon className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No items found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : `Get started by creating your first ${activeTab}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
