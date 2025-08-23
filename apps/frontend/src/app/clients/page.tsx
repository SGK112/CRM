'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../components/Layout';
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
  TrashIcon
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

const statusColors = {
  lead: 'bg-yellow-100 text-yellow-800',
  prospect: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  churned: 'bg-red-100 text-red-800'
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
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
        setClients(data);
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
      filtered = filtered.filter(client =>
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.phone && client.phone.includes(searchTerm)) ||
        client.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
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
      <div>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Clients</h1>
            <p className="text-gray-600">Manage your client relationships and contact information</p>
          </div>
          <Link
            href="/clients/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4 md:mt-0"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Client
          </Link>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        {Object.entries(statusColors).map(([status, colorClass]) => {
          const count = clients.filter(c => c.status === status).length;
          return (
            <div key={status} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                  {status}
                </div>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-500">clients</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="all">All Statuses</option>
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="churned">Churned</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="input"
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

  {/* Clients Table */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first client.</p>
          <Link
            href="/clients/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Client
          </Link>
        </div>
      ) : (
        <div className="surface-1 rounded-lg shadow-sm border border-token overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-[color-mix(in_oklab,var(--border),transparent_40%)]">
              <thead className="bg-gray-50 dark:bg-[var(--surface-2)]">
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
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[client.status]}`}>
                        {client.status}
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
                          href={`/clients/${client._id}`}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="View"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <Link
                          href={`/clients/${client._id}/edit`}
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
