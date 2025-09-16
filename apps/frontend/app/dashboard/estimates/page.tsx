'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DocumentTextIcon,
  EyeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PaperAirplaneIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';


interface Estimate {
  _id: string;
  number: string;
  status: string;
  clientId?: string;
  subtotalSell: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  client?: {
    firstName: string;
    lastName: string;
    company?: string;
  };
  project?: {
    title: string;
  };
}

export default function EstimatesPage() {
  const router = useRouter();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: number; name: string; firstName?: string; email: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
        fetchEstimates();
      } catch (e) {
        // Handle auth error
        router.push('/auth/login');
      }
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  const fetchEstimates = async () => {
    try {
      const response = await fetch('/api/estimates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const list = (data.estimates || []).map((raw: unknown) => {
          const e = raw as Partial<Estimate> & { id?: string };
          return { ...e, _id: e._id || (e as { id?: string }).id } as Estimate;
        });
        setEstimates(list);
      } else {
        // Failed to fetch estimates
      }
    } catch (error) {
      // Error fetching estimates
    } finally {
      setLoading(false);
    }
  };

  const deleteEstimate = async (estimateId: string) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) {
      alert('Not authenticated');
      return;
    }
    const ok = window.confirm('Delete this estimate? This cannot be undone.');
    if (!ok) return;
    try {
      const res = await fetch(`/api/estimates/${estimateId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.deleted) {
        setEstimates(prev => prev.filter(e => e._id !== estimateId));
      } else if (res.status === 401) {
        alert('Unauthorized: please log in again.');
      } else if (res.status === 404) {
        alert('Estimate not found (may already be deleted).');
        setEstimates(prev => prev.filter(e => e._id !== estimateId));
      } else {
        alert(`Failed to delete estimate${data.error ? ': ' + data.error : ''}`);
      }
    } catch (e) {
      alert('Network error deleting estimate');
    }
  };

  const filteredEstimates = estimates.filter(estimate => {
    const clientName = estimate.client ?
      `${estimate.client.firstName} ${estimate.client.lastName}` :
      'Unknown Client';

    const matchesSearch =
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (estimate.client?.company && estimate.client.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      estimate.number.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || estimate.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const safeStatus = (typeof status === 'string' && status.length) ? status : 'unknown';
    const statusConfig = {
      'draft': { color: 'text-gray-700 bg-gray-100 border-gray-200', icon: DocumentTextIcon },
      'sent': { color: 'text-blue-700 bg-blue-100 border-blue-200', icon: PaperAirplaneIcon },
      'viewed': { color: 'text-brand-700 bg-brand-100 border-brand-200', icon: EyeIcon },
      'accepted': { color: 'text-green-700 bg-green-100 border-green-200', icon: CheckCircleIcon },
      'rejected': { color: 'text-red-700 bg-red-100 border-red-200', icon: XCircleIcon },
      'unknown': { color: 'text-slate-700 bg-slate-100 border-slate-200', icon: ClockIcon }
    } as const;

    const config = statusConfig[safeStatus as keyof typeof statusConfig];
    const Icon = config.icon;
    const label = safeStatus === 'unknown'
      ? 'Unknown'
      : safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1);

    return (
      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md border ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </span>
    );
  };

  const stats = {
    total: estimates.length,
    draft: estimates.filter(e => e.status === 'draft').length,
    sent: estimates.filter(e => e.status === 'sent').length,
    viewed: estimates.filter(e => e.status === 'viewed').length,
    accepted: estimates.filter(e => e.status === 'accepted').length,
    rejected: estimates.filter(e => e.status === 'rejected').length,
    totalValue: estimates.reduce((sum, e) => sum + (e.total || 0), 0),
    acceptedValue: estimates.filter(e => e.status === 'accepted').reduce((sum, e) => sum + (e.total || 0), 0)
  };

  const EstimateCard = ({ estimate }: { estimate: Estimate }) => {
    const clientName = estimate.client ?
      `${estimate.client.firstName} ${estimate.client.lastName}` :
      'Unknown Client';

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    if (viewMode === 'list') {
      return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 hover:bg-slate-800/50 transition-all">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white font-semibold border border-slate-700">
              {getInitials(clientName)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-white truncate">#{estimate.number}</h3>
                {getStatusBadge(estimate.status)}
              </div>
              <div className="flex items-center space-x-4 text-sm text-slate-400">
                {estimate.clientId ? (
                  <Link
                    href={`/dashboard/clients/${estimate.clientId}?source=estimate&estimate=${estimate._id}`}
                    className="truncate hover:text-amber-400 transition-colors"
                  >
                    {clientName}
                  </Link>
                ) : (
                  <span className="truncate">{clientName}</span>
                )}
                {estimate.client?.company && (
                  <span className="text-slate-500">• {estimate.client.company}</span>
                )}
                <span className="text-slate-500">
                  {new Date(estimate.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Value & Actions */}
            <div className="text-right">
              <p className="text-sm font-semibold text-white">
                ${(estimate.total || 0).toLocaleString()}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <Link
                  href={`/dashboard/estimates/${estimate._id}`}
                  className="p-1 text-slate-400 hover:text-brand-500 transition-colors"
                >
                  <EyeIcon className="w-4 h-4" />
                </Link>
                <Link
                  href={`/dashboard/estimates/${estimate._id}/edit`}
                  className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => deleteEstimate(estimate._id)}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 hover:bg-slate-800/50 transition-all group">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white font-semibold border border-slate-700">
            {getInitials(clientName)}
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(estimate.status)}
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="font-semibold text-white group-hover:text-slate-300 transition-colors mb-1">
            #{estimate.number}
          </h3>
          {estimate.clientId ? (
            <Link
              href={`/dashboard/clients/${estimate.clientId}?source=estimate&estimate=${estimate._id}`}
              className="text-sm text-slate-400 truncate hover:text-amber-400 transition-colors block"
            >
              {clientName}
            </Link>
          ) : (
            <p className="text-sm text-slate-400 truncate">{clientName}</p>
          )}
          {estimate.client?.company && (
            <p className="text-xs text-slate-500">{estimate.client.company}</p>
          )}
        </div>

        {/* Value */}
        <div className="mb-4">
          <p className="text-lg font-bold text-white">
            ${(estimate.total || 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-400">
            Created {new Date(estimate.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link
              href={`/dashboard/estimates/${estimate._id}`}
              className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <EyeIcon className="w-4 h-4" />
            </Link>
            <Link
              href={`/dashboard/estimates/${estimate._id}/edit`}
              className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <PencilIcon className="w-4 h-4" />
            </Link>
          </div>
          <button
            onClick={() => deleteEstimate(estimate._id)}
            className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-black border-b border-slate-800">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Estimates</h1>
              <p className="text-sm text-slate-400">
                Hey {user?.firstName || 'there'}, you have {stats.total} estimates worth ${stats.totalValue.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
              <div className="flex bg-slate-900 rounded-lg border border-slate-800 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <ListBulletIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Create New Estimate */}
              <Link
                href="/dashboard/estimates/new"
                className="inline-flex items-center px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-400 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Estimate
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Total</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
              <DocumentTextIcon className="w-8 h-8 text-slate-600" />
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Sent</p>
                <p className="text-xl font-bold text-white">{stats.sent}</p>
              </div>
              <PaperAirplaneIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Viewed</p>
                <p className="text-xl font-bold text-white">{stats.viewed}</p>
              </div>
              <EyeIcon className="w-8 h-8 text-brand-500" />
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Accepted</p>
                <p className="text-xl font-bold text-white">{stats.accepted}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search estimates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="viewed">Viewed</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Estimates Grid/List */}
        {filteredEstimates.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No estimates found</h3>
            <p className="text-slate-400 mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first estimate'
              }
            </p>
            <Link
              href="/dashboard/estimates/new"
              className="inline-flex items-center px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-400 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Estimate
            </Link>
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-4"
          }>
            {filteredEstimates.map((estimate) => (
              <EstimateCard key={estimate._id} estimate={estimate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
