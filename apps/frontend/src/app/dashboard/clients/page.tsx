'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  UserIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { API_BASE } from '@/lib/api';

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notes?: string;
  source: 'referral' | 'website' | 'social_media' | 'advertisement' | 'cold_outreach' | 'other';
  status: 'lead' | 'prospect' | 'active' | 'inactive' | 'churned';
  tags: string[];
  customFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Unified pill palette (mirrors projects page style with dark variants)
const statusColors = {
  lead: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
  prospect: 'bg-blue-100 text-blue-800 dark:bg-blue-600/20 dark:text-blue-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-600/20 dark:text-green-300',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-[var(--surface-2)] dark:text-[var(--text-dim)]',
  churned: 'bg-red-100 text-red-800 dark:bg-red-600/20 dark:text-red-300',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-600/20 dark:text-emerald-300',
  client: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-600/20 dark:text-indigo-300',
  dead_lead: 'bg-gray-200 text-gray-600 dark:bg-gray-700/40 dark:text-gray-400'
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  // Bulk import logic moved to dedicated page
  const router = useRouter();

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, statusFilter, sourceFilter]);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${API_BASE}/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Normalize: ensure tags array & status fallback
        const normalized = Array.isArray(data) ? data.map((c:any) => ({
          ...c,
          tags: Array.isArray(c.tags) ? c.tags : [],
          status: c.status || 'lead'
        })) : [];
        setClients(normalized);
      } else {
        console.error('Failed to fetch clients');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = clients;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(client => {
        try {
          return (
            `${client.firstName} ${client.lastName}`.toLowerCase().includes(term) ||
            client.email.toLowerCase().includes(term) ||
            (client.company && client.company.toLowerCase().includes(term)) ||
            (client.phone && client.phone.includes(searchTerm)) ||
            ((client.tags || []).some(tag => tag.toLowerCase().includes(term)))
          );
        } catch {
          return false;
        }
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(client => client.source === sourceFilter);
    }

    setFilteredClients(filtered);
  };

  const deleteClient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/clients/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setClients(clients.filter(c => c._id !== id));
      } else {
        console.error('Failed to delete client');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  // (removed upload handler)

  const formatSource = (source: string) => {
    return source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="h-full flex flex-col">
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-2 text-xs text-gray-500 font-mono flex flex-wrap gap-4">
            <span>Total fetched: {clients.length}</span>
            <span>Filtered: {filteredClients.length}</span>
            <span>Status filter: {statusFilter}</span>
            <span>Source filter: {sourceFilter}</span>
            <span>Search: "{searchTerm}"</span>
          </div>
        )}
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Clients</h1>
            <p className="text-gray-600">Manage your client relationships and contact information</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/clients/import"
              className="inline-flex items-center px-4 py-2 border border-indigo-200 text-indigo-700 bg-white rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
              Bulk Import
            </Link>
            <Link
              href="/dashboard/clients/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Client
            </Link>
          </div>
        </div>

      {/* Status summary chips (pill style like Projects) */}
      <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0">
        {[{ key: 'all', label: 'All' }, ...Object.keys(statusColors).map(k => ({ key: k, label: k }))].map(chip => {
          const count = chip.key === 'all' ? clients.length : clients.filter(c => c.status === chip.key).length;
          const colorClass = chip.key === 'all'
            ? 'bg-gray-100 text-gray-800 dark:bg-[var(--surface-2)] dark:text-[var(--text)]'
            : (statusColors as any)[chip.key];
          return (
            <button
              key={chip.key}
              onClick={() => setStatusFilter(chip.key)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium border transition backdrop-blur-sm ${
                statusFilter === chip.key
                  ? 'ring-2 ring-offset-1 ring-blue-500 border-blue-500 shadow-sm dark:ring-offset-[var(--surface-1)]'
                  : 'border-transparent hover:border-gray-300 dark:hover:border-[var(--border)]'
              } ${colorClass}`}
            >
              {chip.label.charAt(0).toUpperCase() + chip.label.slice(1)} ({count})
            </button>
          );
        })}
      </div>

  {/* Filters */}
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 flex-shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[var(--surface-2)] dark:border-token"
          >
            <option value="all">All Statuses</option>
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="churned">Churned</option>
            <option value="completed">Completed</option>
            <option value="client">Client</option>
            <option value="dead_lead">Dead Lead</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[var(--surface-2)] dark:border-token"
          >
            <option value="all">All Sources</option>
            <option value="referral">Referral</option>
            <option value="website">Website</option>
            <option value="social_media">Social Media</option>
            <option value="advertisement">Advertisement</option>
            <option value="cold_outreach">Cold Outreach</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

  {/* Bulk import button moved to header */}

  {/* Clients Table */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12 flex-shrink-0">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first client.</p>
          <Link
            href="/dashboard/clients/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Client
          </Link>
        </div>
      ) : (
        <div className="surface-1 rounded-lg shadow-sm border border-token overflow-hidden flex-1 min-h-0">
          <div className="overflow-auto h-full">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-[color-mix(in_oklab,var(--border),transparent_40%)]">
              <thead className="bg-gray-50 dark:bg-[var(--surface-2)] sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
        <tbody className="surface-1 divide-y divide-gray-200 dark:divide-[color-mix(in_oklab,var(--border),transparent_40%)]">
                {filteredClients.map((client) => (
          <tr key={client._id} className="hover:bg-gray-50 dark:hover:bg-[var(--surface-2)]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.firstName} {client.lastName}
                          </div>
                          {client.jobTitle && (
                            <div className="text-sm text-gray-500">{client.jobTitle}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-1" />
                          {client.email}
                        </div>
                        {client.phone && (
                          <div className="flex items-center">
                            <PhoneIcon className="h-4 w-4 text-gray-400 mr-1" />
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.company ? (
                        <div className="flex items-center text-sm text-gray-900">
                          <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-1" />
                          {client.company}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium backdrop-blur-sm ${statusColors[client.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700'}`}>
                        {client.status.replace('_',' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatSource(client.source)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.address ? (
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                          {client.address.city}, {client.address.state}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/dashboard/clients/${client._id}`}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="View"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <Link
                          href={`/dashboard/clients/${client._id}/edit`}
                          className="text-gray-400 hover:text-green-600 transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => deleteClient(client._id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
}
