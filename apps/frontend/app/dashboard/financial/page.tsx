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
  EyeIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { simple } from '@/lib/simple-ui';

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

export default function SimplifiedFinancialHub() {
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
      <div className={simple.page()}>
        <div className={simple.loading.container}>
          <div className={`${simple.loading.spinner} h-8 w-8`} />
        </div>
      </div>
    );
  }

  return (
    <div className={simple.page()}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className={simple.text.title()}>Sales</h1>
          <p className={simple.text.body()}>All your monetization tools in one place</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/estimates/new"
            className={simple.button('primary', 'flex items-center gap-2')}
          >
            <PlusIcon className="h-4 w-4" />
            New Estimate
          </Link>
          <Link
            href="/dashboard/invoices/new"
            className={simple.button('secondary', 'flex items-center gap-2')}
          >
            <PlusIcon className="h-4 w-4" />
            New Invoice
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={`${simple.grid.cols4} gap-4 sm:gap-6 mb-6`}>
        <div className={simple.card()}>
          <div className={simple.section('py-4 sm:py-5')}>
            <div className="flex items-center gap-3">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              <div>
                <p className={simple.text.small()}>Estimates</p>
                <p className={simple.text.title('text-2xl')}>{stats.totalEstimates}</p>
                <p className={simple.text.small('text-yellow-600')}>
                  {stats.pendingEstimates} pending
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={simple.card()}>
          <div className={simple.section('py-4 sm:py-5')}>
            <div className="flex items-center gap-3">
              <ShoppingBagIcon className="h-8 w-8 text-green-600" />
              <div>
                <p className={simple.text.small()}>Invoices</p>
                <p className={simple.text.title('text-2xl')}>{stats.totalInvoices}</p>
                <p className={simple.text.small('text-green-600')}>{stats.paidInvoices} paid</p>
              </div>
            </div>
          </div>
        </div>

        <div className={simple.card()}>
          <div className={simple.section('py-4 sm:py-5')}>
            <div className="flex items-center gap-3">
              <CreditCardIcon className="h-8 w-8 text-purple-600" />
              <div>
                <p className={simple.text.small()}>Revenue</p>
                <p className={simple.text.title('text-2xl')}>
                  ${(stats.totalRevenue / 1000).toFixed(0)}k
                </p>
                <p className={simple.text.small('text-gray-600')}>
                  ${(stats.pendingRevenue / 1000).toFixed(0)}k pending
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={simple.card()}>
          <div className={simple.section('py-4 sm:py-5')}>
            <div className="flex items-center gap-3">
              <WrenchScrewdriverIcon className="h-8 w-8 text-orange-600" />
              <div>
                <p className={simple.text.small()}>Materials</p>
                <p className={simple.text.title('text-2xl')}>{stats.materialItems}</p>
                <p className={simple.text.small('text-orange-600')}>{stats.lowStock} low stock</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 overflow-x-auto whitespace-nowrap">
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
            className={simple.input('pl-10')}
          />
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' ? (
        /* Overview Tab */
        <div className={`${simple.spacing.md}`}>
          {/* Recent Activity */}
          <div className={simple.card()}>
            <div className={simple.section()}>
              <h2 className={simple.text.subtitle('mb-4')}>Recent Activity</h2>
              <div className="space-y-3">
                {items.slice(0, 8).map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
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
                          <p className={simple.text.small()}>{item.clientName}</p>
                        )}
                        {item.category && <p className={simple.text.small()}>{item.category}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      {item.amount && (
                        <p className="font-medium text-gray-900 dark:text-white">
                          ${item.amount.toLocaleString()}
                        </p>
                      )}
                      {item.unitPrice && (
                        <p className="font-medium text-gray-900 dark:text-white">
                          ${item.unitPrice}/unit
                        </p>
                      )}
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'paid' ||
                          item.status === 'approved' ||
                          item.status === 'in-stock'
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
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={simple.card()}>
            <div className={simple.section()}>
              <h2 className={simple.text.subtitle('mb-4')}>Quick Actions</h2>
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6`}>
                <Link
                  href="/dashboard/estimates/new"
                  className={simple.card('hover:scale-[1.02] transition-transform text-center')}
                >
                  <div className={simple.section('py-6')}>
                    <DocumentTextIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className={simple.text.subtitle('mb-1')}>Create Estimate</h3>
                    <p className={simple.text.small()}>Generate professional estimates</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/invoices/new"
                  className={simple.card('hover:scale-[1.02] transition-transform text-center')}
                >
                  <div className={simple.section('py-6')}>
                    <ShoppingBagIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className={simple.text.subtitle('mb-1')}>Create Invoice</h3>
                    <p className={simple.text.small()}>Send invoices to clients</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/catalog"
                  className={simple.card('hover:scale-[1.02] transition-transform text-center')}
                >
                  <div className={simple.section('py-6')}>
                    <WrenchScrewdriverIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <h3 className={simple.text.subtitle('mb-1')}>Manage Materials</h3>
                    <p className={simple.text.small()}>Update price sheets</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* List View for specific tabs */
        <div className={simple.card()}>
          <div className={simple.section()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={simple.text.subtitle()}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
              <Link
                href={`/dashboard/${activeTab}/new`}
                className={simple.button('primary', 'flex items-center gap-2')}
              >
                <PlusIcon className="h-4 w-4" />
                Add {activeTab.slice(0, -1)}
              </Link>
            </div>

            <div className="space-y-3">
              {filteredItems.map(item => (
                <Link
                  key={item.id}
                  href={`/dashboard/${item.type}s/${item.id}`}
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
                      {item.clientName && <p className={simple.text.small()}>{item.clientName}</p>}
                      {item.category && (
                        <p className={simple.text.small()}>Category: {item.category}</p>
                      )}
                      {item.stock && (
                        <p className={simple.text.small()}>Stock: {item.stock} units</p>
                      )}
                      <p className={simple.text.small()}>Created: {item.createdAt}</p>
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
                        item.status === 'paid' ||
                        item.status === 'approved' ||
                        item.status === 'in-stock'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : item.status === 'pending' || item.status === 'sent'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}
                    >
                      {item.status}
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                      <span className={simple.text.small()}>View</span>
                    </div>
                  </div>
                </Link>
              ))}

              {filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    {activeTab === 'estimates' && <DocumentTextIcon className="h-12 w-12" />}
                    {activeTab === 'invoices' && <ShoppingBagIcon className="h-12 w-12" />}
                    {activeTab === 'materials' && <WrenchScrewdriverIcon className="h-12 w-12" />}
                  </div>
                  <h3 className={simple.text.subtitle('mb-2')}>No {activeTab} found</h3>
                  <p className={simple.text.body('mb-4')}>
                    {searchTerm
                      ? 'Try adjusting your search terms'
                      : `Get started by creating your first ${activeTab.slice(0, -1)}`}
                  </p>
                  {!searchTerm && (
                    <Link
                      href={`/dashboard/${activeTab}/new`}
                      className={simple.button('primary', 'inline-flex items-center gap-2')}
                    >
                      <PlusIcon className="h-4 w-4" />
                      Create {activeTab.slice(0, -1)}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
