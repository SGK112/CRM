/**
 * Mobile-Optimized Clients Page
 *
 * This component demonstrates mobile optimization patterns that can be applied
 * across the CRM without breaking existing functionality.
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { PageHeader } from '../../../components/ui/PageHeader';
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
  ArrowUpTrayIcon,
  Bars3Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import { API_BASE } from '@/lib/api';
import CommunicationModal from '@/components/CommunicationModal';
import { mobileOptimized, mobileClasses, responsive, mobile } from '@/lib/mobile';

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
  lead: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
  prospect: 'bg-blue-100 text-blue-800 dark:bg-blue-600/20 dark:text-blue-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300',
  churned: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
};

const sourceColors = {
  referral: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300',
  website: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
  social_media: 'bg-pink-100 text-pink-800 dark:bg-pink-500/20 dark:text-pink-300',
  advertisement: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300',
  cold_outreach: 'bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300',
};

export default function MobileOptimizedClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [communicationModal, setCommunicationModal] = useState<{
    isOpen: boolean;
    client?: Client;
    type?: 'email' | 'sms';
  }>({
    isOpen: false,
  });

  // Mobile-specific state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/api/clients`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }

      const data = await response.json();
      setClients(data.clients || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch =
        !searchTerm ||
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      const matchesSource = sourceFilter === 'all' || client.source === sourceFilter;

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [clients, searchTerm, statusFilter, sourceFilter]);

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/api/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete client');
      }

      setClients(clients.filter(client => client._id !== clientId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete client');
    }
  };

  // Mobile-optimized client card component
  const ClientCard = ({ client }: { client: Client }) => (
    <div
      className={mobileOptimized(
        mobileClasses.card.container(),
        'transition-all duration-200',
        'hover:shadow-md hover:scale-[1.02]',
        mobile.touchTarget()
      )}
    >
      <div className={mobileClasses.card.body()}>
        {/* Header with name and status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className={mobileOptimized(mobileClasses.text.subheading(), 'truncate')}>
              {client.firstName} {client.lastName}
            </h3>
            {client.company && (
              <p
                className={mobileOptimized(
                  mobileClasses.text.small(),
                  'text-gray-800 dark:text-gray-300 truncate'
                )}
              >
                {client.company}
              </p>
            )}
          </div>
          <span
            className={mobileOptimized(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              statusColors[client.status]
            )}
          >
            {client.status}
          </span>
        </div>

        {/* Contact info */}
        <div className={responsive.spacing.xs()}>
          {client.email && (
            <div className="flex items-center text-sm text-gray-800 dark:text-gray-300">
              <EnvelopeIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center text-sm text-gray-800 dark:text-gray-300">
              <PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{client.phone}</span>
            </div>
          )}
          {client.address && (
            <div className="flex items-center text-sm text-gray-800 dark:text-gray-300">
              <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">
                {client.address.city}, {client.address.state}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <span
              className={mobileOptimized(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                sourceColors[client.source]
              )}
            >
              {client.source.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => router.push(`/dashboard/clients/${client._id}`)}
              className={mobileOptimized(
                mobile.touchTarget(),
                'p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors'
              )}
              title="View client"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => router.push(`/dashboard/clients/${client._id}/edit`)}
              className={mobileOptimized(
                mobile.touchTarget(),
                'p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-md transition-colors'
              )}
              title="Edit client"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCommunicationModal({ isOpen: true, client, type: 'email' })}
              className={mobileOptimized(
                mobile.touchTarget(),
                'p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-md transition-colors'
              )}
              title="Send email"
            >
              <EnvelopeIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteClient(client._id)}
              className={mobileOptimized(
                mobile.touchTarget(),
                'p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-colors'
              )}
              title="Delete client"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile-optimized list item component
  const ClientListItem = ({ client }: { client: Client }) => (
    <div
      className={mobileOptimized(
        'bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700',
        'px-4 py-3 sm:px-6 sm:py-4',
        mobile.touchTarget()
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  {client.firstName[0]}
                  {client.lastName[0]}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={mobileOptimized(
                  mobileClasses.text.body(),
                  'font-medium text-gray-900 dark:text-gray-100 truncate'
                )}
              >
                {client.firstName} {client.lastName}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span
                  className={mobileOptimized(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    statusColors[client.status]
                  )}
                >
                  {client.status}
                </span>
                {client.company && (
                  <span
                    className={mobileOptimized(
                      mobileClasses.text.small(),
                      'text-gray-700 dark:text-gray-300 truncate'
                    )}
                  >
                    {client.company}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1 ml-4">
          <button
            onClick={() => router.push(`/dashboard/clients/${client._id}`)}
            className={mobileOptimized(
              mobile.touchTarget(),
              'p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors'
            )}
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push(`/dashboard/clients/${client._id}/edit`)}
            className={mobileOptimized(
              mobile.touchTarget(),
              'p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-md transition-colors'
            )}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className={mobileOptimized(mobileClasses.container.responsive(), 'py-6')}>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={mobileClasses.container.responsive()}>
        {/* Mobile-optimized page header */}
        <div
          className={mobileOptimized(
            responsive.padding.md(),
            'border-b border-gray-200 dark:border-gray-700'
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className={mobileClasses.text.heading()}>Clients</h1>
              <p
                className={mobileOptimized(
                  mobileClasses.text.body(),
                  'text-gray-800 dark:text-gray-300 mt-1'
                )}
              >
                Manage your client relationships and contacts
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {/* View mode toggle - mobile only */}
              <div
                className={mobileOptimized(
                  responsive.showOnMobile(),
                  'flex items-center border border-gray-300 dark:border-gray-600 rounded-lg p-1'
                )}
              >
                <button
                  onClick={() => setViewMode('grid')}
                  className={mobileOptimized(
                    'p-1 rounded-md transition-colors',
                    viewMode === 'grid'
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                      : 'text-gray-400'
                  )}
                >
                  <Bars3Icon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={mobileOptimized(
                    'p-1 rounded-md transition-colors',
                    viewMode === 'list'
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                      : 'text-gray-400'
                  )}
                >
                  <ListBulletIcon className="h-4 w-4" />
                </button>
              </div>

              <Link
                href="/dashboard/clients/new"
                className={mobileOptimized(
                  mobileClasses.button.primary(),
                  'bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
                  'flex items-center space-x-2 transition-colors',
                  mobile.touchTarget()
                )}
              >
                <PlusIcon className="h-4 w-4" />
                <span className={responsive.hideOnMobile()}>Add Client</span>
                <span className={responsive.showOnMobile()}>Add</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile-optimized filters and search */}
        <div
          className={mobileOptimized(
            responsive.padding.sm(),
            'border-b border-gray-200 dark:border-gray-700'
          )}
        >
          {/* Search bar */}
          <div className="mb-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={mobileOptimized(
                  mobileClasses.form.input(),
                  'pl-10 border border-gray-300 dark:border-gray-600 rounded-lg',
                  'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                )}
              />
            </div>
          </div>

          {/* Filter toggle for mobile */}
          <div className={responsive.showOnMobile()}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={mobileOptimized(
                'flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg',
                'text-sm text-gray-800 dark:text-gray-300 transition-colors',
                mobile.touchTarget()
              )}
            >
              <Bars3Icon className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filters */}
          <div
            className={mobileOptimized(
              showFilters || responsive.hideOnMobile() ? 'block' : 'hidden',
              'mt-4 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4'
            )}
          >
            <div className="flex-1 sm:flex-none">
              <label
                className={mobileOptimized(
                  mobileClasses.form.label(),
                  'text-gray-700 dark:text-gray-300'
                )}
              >
                Status
              </label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className={mobileOptimized(
                  mobileClasses.form.input(),
                  'border border-gray-300 dark:border-gray-600 rounded-lg',
                  'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                )}
              >
                <option value="all">All Statuses</option>
                <option value="lead">Lead</option>
                <option value="prospect">Prospect</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="churned">Churned</option>
              </select>
            </div>

            <div className="flex-1 sm:flex-none">
              <label
                className={mobileOptimized(
                  mobileClasses.form.label(),
                  'text-gray-700 dark:text-gray-300'
                )}
              >
                Source
              </label>
              <select
                value={sourceFilter}
                onChange={e => setSourceFilter(e.target.value)}
                className={mobileOptimized(
                  mobileClasses.form.input(),
                  'border border-gray-300 dark:border-gray-600 rounded-lg',
                  'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                )}
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
        </div>

        {/* Results */}
        <div className={responsive.padding.md()}>
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3
                className={mobileOptimized(
                  mobileClasses.text.subheading(),
                  'mt-4 text-gray-900 dark:text-gray-100'
                )}
              >
                No clients found
              </h3>
              <p
                className={mobileOptimized(
                  mobileClasses.text.body(),
                  'mt-2 text-gray-800 dark:text-gray-300'
                )}
              >
                {searchTerm || statusFilter !== 'all' || sourceFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first client'}
              </p>
              {!searchTerm && statusFilter === 'all' && sourceFilter === 'all' && (
                <Link
                  href="/dashboard/clients/new"
                  className={mobileOptimized(
                    'mt-4 inline-flex items-center space-x-2 px-4 py-2 border border-transparent',
                    'text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700',
                    'dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors',
                    mobile.touchTarget()
                  )}
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add your first client</span>
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Results count */}
              <div className="mb-4">
                <p
                  className={mobileOptimized(
                    mobileClasses.text.small(),
                    'text-gray-800 dark:text-gray-300'
                  )}
                >
                  Showing {filteredClients.length} of {clients.length} clients
                </p>
              </div>

              {/* Grid view */}
              {viewMode === 'grid' && (
                <div className={mobileClasses.grid.cards()}>
                  {filteredClients.map(client => (
                    <ClientCard key={client._id} client={client} />
                  ))}
                </div>
              )}

              {/* List view */}
              {viewMode === 'list' && (
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {filteredClients.map(client => (
                    <ClientListItem key={client._id} client={client} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Communication Modal */}
        {communicationModal.isOpen && communicationModal.client && (
          <CommunicationModal
            isOpen={communicationModal.isOpen}
            onClose={() => setCommunicationModal({ isOpen: false })}
            client={communicationModal.client}
          />
        )}
      </div>
    </Layout>
  );
}
