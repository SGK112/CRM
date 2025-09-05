'use client';

import { useInboxStore, type Estimate } from '@/lib/inbox-store';
import { ExclamationTriangleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken') || localStorage.getItem('token');
};

// Fetch estimates from API
const fetchEstimates = async (): Promise<Estimate[]> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch('/api/estimates', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch estimates: ${response.status}`);
  }

  return response.json();
};

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Format date
const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
};

// Get status color
const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'text-green-400 bg-green-400/10';
    case 'pending':
      return 'text-amber-400 bg-amber-400/10';
    case 'rejected':
      return 'text-red-400 bg-red-400/10';
    case 'draft':
      return 'text-slate-400 bg-slate-400/10';
    default:
      return 'text-slate-400 bg-slate-400/10';
  }
};

export default function Inbox() {
  const {
    searchTerm,
    setSearchTerm,
    setEstimates,
    setLoading,
    setError,
    clearError,
    filteredEstimates,
    totalValue,
  } = useInboxStore();

  const [renderError, setRenderError] = useState<string | null>(null);

  // Fetch estimates using React Query
  const {
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['estimates'],
    queryFn: fetchEstimates,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onSuccess: (data) => {
      setEstimates(data);
      setLoading(false);
      clearError();
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to load estimates');
      setLoading(false);
    },
  });

  // Update loading state
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  // Handle render errors
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      setRenderError(error.message);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const filtered = filteredEstimates();
  const total = totalValue();

  if (renderError) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
            <h2 className="text-lg font-semibold text-red-400">Render Error</h2>
          </div>
          <p className="text-red-300 text-sm">{renderError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Construction Estimates</h1>
        <p className="text-slate-400">
          Manage and track your project estimates with real-time updates
        </p>
      </div>

      {/* Search and Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search estimates..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            aria-label="Search estimates"
          />
        </div>

        {/* Stats */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-amber-400">{formatCurrency(total)}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">Estimates</p>
              <p className="text-2xl font-bold text-white">{filtered.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {queryError && (
        <div className="mb-6 bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <p className="text-red-300">
              {queryError instanceof Error ? queryError.message : 'Failed to load estimates'}
            </p>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          <span className="ml-3 text-slate-400">Loading estimates...</span>
        </div>
      )}

      {/* Estimates Table */}
      {!isLoading && (
        <div className="bg-slate-800 text-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" role="table" aria-label="Estimates table">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Client Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Estimate ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      {searchTerm ? 'No estimates match your search' : 'No estimates found'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((estimate) => (
                    <tr
                      key={estimate._id}
                      className="hover:bg-slate-700 transition-colors duration-200"
                      role="row"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {estimate.client
                            ? `${estimate.client.firstName} ${estimate.client.lastName}`
                            : 'Unknown Client'
                          }
                        </div>
                        {estimate.client?.company && (
                          <div className="text-sm text-slate-400">
                            {estimate.client.company}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-amber-400">
                          {estimate.number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-400">
                          {formatCurrency(estimate.total)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(estimate.status)}`}
                        >
                          {estimate.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {formatDate(estimate.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile Card View for Small Screens */}
      <div className="md:hidden mt-6 space-y-4">
        {filtered.map((estimate) => (
          <div
            key={estimate._id}
            className="bg-slate-800 rounded-lg p-4 shadow-md hover:bg-slate-700 transition-colors duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-medium text-white">
                  {estimate.client
                    ? `${estimate.client.firstName} ${estimate.client.lastName}`
                    : 'Unknown Client'
                  }
                </h3>
                <p className="text-sm text-slate-400">{estimate.number}</p>
              </div>
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(estimate.status)}`}
              >
                {estimate.status}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-lg font-bold text-green-400">
                {formatCurrency(estimate.total)}
              </div>
              <div className="text-sm text-slate-400">
                {formatDate(estimate.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
