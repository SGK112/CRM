"use client";

export const dynamic = 'force-dynamic';

import { simple } from '@/lib/simple-ui';
import {
    CurrencyDollarIcon,
    DocumentTextIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    ShoppingBagIcon,
    WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'estimates' | 'invoices' | 'materials'>('overview');
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
          createdAt: '2025-08-28'
        },
        {
          id: 'est-2',
          type: 'estimate',
          title: 'Bathroom Remodel - Johnson',
          clientName: 'Johnson Family',
          amount: 28900,
          status: 'approved',
          createdAt: '2025-08-25'
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
          dueDate: '2025-09-20'
        },
        {
          id: 'inv-2',
          type: 'invoice',
          title: 'Kitchen Cabinets - Martinez',
          clientName: 'Martinez Family',
          amount: 18200,
          status: 'sent',
          createdAt: '2025-08-22',
          dueDate: '2025-09-15'
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
          createdAt: '2025-08-15'
        },
        {
          id: 'mat-2',
          type: 'material',
          title: 'Subway Tile - White 3x6',
          category: 'Tile',
          unitPrice: 12,
          stock: 50,
          status: 'low-stock',
          createdAt: '2025-08-10'
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredItems = items.filter(item => {
    const matchesTab = activeTab === 'overview' || item.type === activeTab.slice(0, -1);
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = {
    totalEstimates: items.filter(i => i.type === 'estimate').length,
    pendingEstimates: items.filter(i => i.type === 'estimate' && i.status === 'pending').length,
    totalInvoices: items.filter(i => i.type === 'invoice').length,
    paidInvoices: items.filter(i => i.type === 'invoice' && i.status === 'paid').length,
    totalRevenue: items.filter(i => i.type === 'invoice' && i.status === 'paid')
                      .reduce((sum, i) => sum + (i.amount || 0), 0),
    pendingRevenue: items.filter(i => i.type === 'invoice' && i.status !== 'paid')
                        .reduce((sum, i) => sum + (i.amount || 0), 0),
    materialItems: items.filter(i => i.type === 'material').length,
    lowStock: items.filter(i => i.type === 'material' && i.status === 'low-stock').length
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: CurrencyDollarIcon },
    { key: 'estimates', label: 'Estimates', icon: DocumentTextIcon },
    { key: 'invoices', label: 'Invoices', icon: ShoppingBagIcon },
    { key: 'materials', label: 'Materials', icon: WrenchScrewdriverIcon }
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
    <div className="min-h-screen bg-black">
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-50 bg-black border-b border-slate-800">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Sales</h1>
                <p className="text-sm text-slate-400">All monetization tools</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/dashboard/estimates/new"
                className="p-2 bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
              >
                <PlusIcon className="h-4 w-4 text-black" />
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-slate-900 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{stats.totalEstimates}</div>
              <div className="text-xs text-slate-400">Estimates</div>
              <div className="text-xs text-amber-400">{stats.pendingEstimates} pending</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{stats.totalInvoices}</div>
              <div className="text-xs text-slate-400">Invoices</div>
              <div className="text-xs text-green-400">{stats.paidInvoices} paid</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-amber-400">${(stats.totalRevenue / 1000).toFixed(0)}k</div>
              <div className="text-xs text-slate-400">Revenue</div>
              <div className="text-xs text-slate-400">${(stats.pendingRevenue / 1000).toFixed(0)}k pending</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{stats.materialItems}</div>
              <div className="text-xs text-slate-400">Materials</div>
              <div className="text-xs text-orange-400">{stats.lowStock} low</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Mobile Tab Navigation */}
        <div className="flex bg-slate-900 rounded-lg p-1 mb-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'overview' | 'estimates' | 'invoices' | 'materials')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-amber-500 text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Content */}
        {activeTab === 'overview' ? (
          <div className="space-y-4">
            {/* Recent Activity */}
            <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {items.slice(0, 8).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        {item.type === 'estimate' && <DocumentTextIcon className="h-5 w-5 text-blue-400" />}
                        {item.type === 'invoice' && <ShoppingBagIcon className="h-5 w-5 text-green-400" />}
                        {item.type === 'material' && <WrenchScrewdriverIcon className="h-5 w-5 text-orange-400" />}
                        <div>
                          <h3 className="font-medium text-white text-sm">{item.title}</h3>
                          {item.clientName && (
                            <p className="text-xs text-slate-400">{item.clientName}</p>
                          )}
                          {item.category && (
                            <p className="text-xs text-slate-400">{item.category}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {item.amount && (
                          <p className="font-medium text-white text-sm">
                            ${item.amount.toLocaleString()}
                          </p>
                        )}
                        {item.unitPrice && (
                          <p className="font-medium text-white text-sm">
                            ${item.unitPrice}/unit
                          </p>
                        )}
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'paid' || item.status === 'approved' || item.status === 'in-stock'
                            ? 'bg-green-500/20 text-green-400'
                            : item.status === 'pending' || item.status === 'sent'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 gap-3">
                  <Link
                    href="/dashboard/estimates/new"
                    className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <DocumentTextIcon className="h-6 w-6 text-blue-400" />
                    <div>
                      <h3 className="font-medium text-white">Create Estimate</h3>
                      <p className="text-sm text-slate-400">Generate professional estimates</p>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/invoices/new"
                    className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <ShoppingBagIcon className="h-6 w-6 text-green-400" />
                    <div>
                      <h3 className="font-medium text-white">Create Invoice</h3>
                      <p className="text-sm text-slate-400">Send invoices to clients</p>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/catalog"
                    className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <WrenchScrewdriverIcon className="h-6 w-6 text-orange-400" />
                    <div>
                      <h3 className="font-medium text-white">Manage Materials</h3>
                      <p className="text-sm text-slate-400">Update price sheets</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* List View for specific tabs */
          <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h2>
                <Link
                  href={`/dashboard/${activeTab}/new`}
                  className="flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg text-sm font-medium transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add
                </Link>
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/dashboard/${item.type}s/${item.id}`}
                    className="flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {item.type === 'estimate' && <DocumentTextIcon className="h-5 w-5 text-blue-400" />}
                      {item.type === 'invoice' && <ShoppingBagIcon className="h-5 w-5 text-green-400" />}
                      {item.type === 'material' && <WrenchScrewdriverIcon className="h-5 w-5 text-orange-400" />}
                      <div>
                        <h3 className="font-medium text-white text-sm">{item.title}</h3>
                        {item.clientName && (
                          <p className="text-xs text-slate-400">{item.clientName}</p>
                        )}
                        {item.category && (
                          <p className="text-xs text-slate-400">Category: {item.category}</p>
                        )}
                        {item.stock && (
                          <p className="text-xs text-slate-400">Stock: {item.stock} units</p>
                        )}
                        <p className="text-xs text-slate-400">Created: {item.createdAt}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      {item.amount && (
                        <p className="font-medium text-white mb-1 text-sm">
                          ${item.amount.toLocaleString()}
                        </p>
                      )}
                      {item.unitPrice && (
                        <p className="font-medium text-white mb-1 text-sm">
                          ${item.unitPrice}/unit
                        </p>
                      )}
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'paid' || item.status === 'approved' || item.status === 'in-stock'
                          ? 'bg-green-500/20 text-green-400'
                          : item.status === 'pending' || item.status === 'sent'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {item.status}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <EyeIcon className="h-4 w-4 text-slate-400" />
                        <span className="text-xs text-slate-400">View</span>
                      </div>
                    </div>
                  </Link>
                ))}

                {filteredItems.length === 0 && (
                  <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 text-slate-400 mb-4">
                      {activeTab === 'estimates' && <DocumentTextIcon className="h-12 w-12" />}
                      {activeTab === 'invoices' && <ShoppingBagIcon className="h-12 w-12" />}
                      {activeTab === 'materials' && <WrenchScrewdriverIcon className="h-12 w-12" />}
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No {activeTab} found</h3>
                    <p className="text-slate-400 mb-4">
                      {searchTerm ? 'Try adjusting your search terms' : `Get started by creating your first ${activeTab.slice(0, -1)}`}
                    </p>
                    {!searchTerm && (
                      <Link
                        href={`/dashboard/${activeTab}/new`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-medium transition-colors"
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
    </div>
  );
}
