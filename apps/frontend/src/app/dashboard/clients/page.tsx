'use client';

import { useState, useEffect, useMemo } from 'react';
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
  inactive: 'surface-2 text-secondary',
  churned: 'bg-red-100 text-red-800 dark:bg-red-600/20 dark:text-red-300',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-600/20 dark:text-emerald-300',
  client: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-600/20 dark:text-indigo-300',
  dead_lead: 'surface-3 text-tertiary'
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [totalCount, setTotalCount] = useState(0);
  const [useServerSearch, setUseServerSearch] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchClients();
  }, []);

  // Debounce search input for lighter server load
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // Trigger search when filters change
  useEffect(() => {
    if (useServerSearch) {
      fetchClients();
    } else {
      filterClientsLocally();
    }
  }, [debouncedSearch, statusFilter, sourceFilter, useServerSearch]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setSearchError(null);
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (sourceFilter !== 'all') params.append('source', sourceFilter);

      const queryString = params.toString();
      const url = `${API_BASE}/clients${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Normalize: ensure tags array & status fallback
        const normalized = Array.isArray(data) ? data.map((c: any) => ({
          ...c,
          tags: Array.isArray(c.tags) ? c.tags : [],
          status: c.status || 'lead'
        })) : [];
        setClients(normalized);
        setFilteredClients(normalized);
        
        // Fetch total count for pagination info
        const countUrl = `${API_BASE}/clients/count${queryString ? `?${queryString}` : ''}`;
        try {
          const countResponse = await fetch(countUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (countResponse.ok) {
            const count = await countResponse.json();
            setTotalCount(typeof count === 'number' ? count : count.count || normalized.length);
          } else {
            setTotalCount(normalized.length);
          }
        } catch (countError) {
          console.warn('Could not fetch count, using result length:', countError);
          setTotalCount(normalized.length);
        }
      } else if (response.status === 401) {
        router.push('/auth/login');
      } else {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setSearchError(error instanceof Error ? error.message : 'Failed to search clients');
      
      // Fallback to local filtering if server search fails
      if (useServerSearch) {
        console.log('Falling back to local search due to server error');
        setUseServerSearch(false);
        setSearchError(null);
        // Fetch all clients and filter locally
        fetchAllClientsForLocalFiltering();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllClientsForLocalFiltering = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const normalized = Array.isArray(data) ? data.map((c: any) => ({
          ...c,
          tags: Array.isArray(c.tags) ? c.tags : [],
          status: c.status || 'lead'
        })) : [];
        setClients(normalized);
        filterClientsLocally(normalized);
      }
    } catch (error) {
      console.error('Error fetching clients for local filtering:', error);
    }
  };

  const filterClientsLocally = (clientList = clients) => {
    let filtered = clientList;
    
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      filtered = filtered.filter(client => {
        const name = `${client.firstName} ${client.lastName}`.toLowerCase();
        return (
          name.includes(term) ||
          client.email?.toLowerCase().includes(term) ||
          (client.company && client.company.toLowerCase().includes(term)) ||
          (client.phone && client.phone.toLowerCase().includes(term)) ||
          (client.tags || []).some(t => t.toLowerCase().includes(term))
        );
      });
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(c => c.source === sourceFilter);
    }
    
    setFilteredClients(filtered);
    setTotalCount(filtered.length);
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

  const toggleExpand = (id:string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const stats = useMemo(() => {
    // Use all clients for stats regardless of current filter, but if using server search show filtered count
    const dataSource = useServerSearch ? filteredClients : clients;
    const allClients = useServerSearch && (debouncedSearch || statusFilter !== 'all' || sourceFilter !== 'all') ? clients : dataSource;
    
    return [
      { 
        label: 'Total', 
        value: useServerSearch && (debouncedSearch || statusFilter !== 'all' || sourceFilter !== 'all') 
          ? `${filteredClients.length}${totalCount !== filteredClients.length ? ` of ${totalCount}` : ''}` 
          : allClients.length 
      },
      { label: 'Active', value: allClients.filter(c => c.status === 'active').length },
      { label: 'Leads', value: allClients.filter(c => c.status === 'lead' || c.status === 'prospect').length }
    ];
  }, [clients, filteredClients, totalCount, useServerSearch, debouncedSearch, statusFilter, sourceFilter]);

  return (
    <Layout>
      <div className="h-[calc(100vh-140px)] flex flex-col gap-4">{/* viewport height adjust under global header */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-2 text-xs text-gray-500 font-mono flex flex-wrap gap-4">
            <span>Total fetched: {clients.length}</span>
            <span>Filtered: {filteredClients.length}</span>
            <span>Status filter: {statusFilter}</span>
            <span>Source filter: {sourceFilter}</span>
            <span>Search: "{searchTerm}"</span>
            <span>Server search: {useServerSearch ? 'enabled' : 'disabled'}</span>
          </div>
        )}
        
        {searchError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <strong>Search Error:</strong> {searchError}
          </div>
        )}
        <PageHeader
          title="Clients"
          subtitle="Manage relationships, contact info and lifecycle across your pipeline."
          stats={stats}
          actions={(
            <>
              <Link href="/dashboard/clients/import" className="pill pill-tint-purple inline-flex items-center gap-1 text-xs"><ArrowUpTrayIcon className="h-4 w-4"/>Import</Link>
              <Link href="/dashboard/clients/new" className="pill pill-tint-green inline-flex items-center gap-1 text-xs"><PlusIcon className="h-4 w-4"/>New Client</Link>
            </>
          )}
        />

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
  <div className="surface-1 rounded-lg border border-token p-4 mb-2 flex-shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients by name, email, company, phone, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9 pr-8"
            />
            {loading && useServerSearch && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
              </div>
            )}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title="Clear search"
              >
                ×
              </button>
            )}
            {!useServerSearch && (
              <div className="absolute -bottom-5 left-0 text-xs text-amber-600">
                Server search unavailable, using local search
              </div>
            )}
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
            <option value="completed">Completed</option>
            <option value="client">Client</option>
            <option value="dead_lead">Dead Lead</option>
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
          <button 
            onClick={() => { 
              setSearchTerm(''); 
              setStatusFilter('all'); 
              setSourceFilter('all'); 
            }} 
            className="pill pill-tint-gray text-xs h-10 self-end"
            disabled={!searchTerm && statusFilter === 'all' && sourceFilter === 'all'}
          >
            Reset
          </button>
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
        <div className="surface-1 rounded-lg border border-token overflow-hidden flex-1 min-h-0 flex flex-col">
          <div className="overflow-auto h-full rounded-b-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-[color-mix(in_oklab,var(--border),transparent_40%)] text-sm">
              <thead className="bg-gray-50 dark:bg-[var(--surface-2)] sticky top-0 z-10 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2 text-left">Client</th>
                  <th className="px-4 py-2 text-left hidden lg:table-cell">Contact</th>
                  <th className="px-4 py-2 text-left hidden md:table-cell">Company</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left hidden xl:table-cell">Source</th>
                  <th className="px-4 py-2 text-left hidden xl:table-cell">Location</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
        <tbody className="surface-1 divide-y divide-gray-200 dark:divide-[color-mix(in_oklab,var(--border),transparent_40%)]">
                {loading && Array.from({length:8}).map((_,i)=> (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-5 w-40 bg-slate-200 dark:bg-[var(--surface-2)] rounded"/></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-5 w-32 bg-slate-200 dark:bg-[var(--surface-2)] rounded"/></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-5 w-24 bg-slate-200 dark:bg-[var(--surface-2)] rounded"/></td>
                    <td className="px-4 py-3"><div className="h-5 w-16 bg-slate-200 dark:bg-[var(--surface-2)] rounded"/></td>
                    <td className="px-4 py-3 hidden xl:table-cell"><div className="h-5 w-20 bg-slate-200 dark:bg-[var(--surface-2)] rounded"/></td>
                    <td className="px-4 py-3 hidden xl:table-cell"><div className="h-5 w-24 bg-slate-200 dark:bg-[var(--surface-2)] rounded"/></td>
                    <td className="px-4 py-3"></td>
                  </tr>
                ))}
                {!loading && filteredClients.map((client) => (
          <>
          <tr key={client._id} className="hover:bg-gray-50 dark:hover:bg-[var(--surface-2)] cursor-pointer" onClick={()=> toggleExpand(client._id)}>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-200 to-blue-200 dark:from-indigo-600/30 dark:to-blue-600/30 flex items-center justify-center text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-inner">
                          {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                        </div>
                        <div className="ml-3 space-y-0.5">
                          <div className="font-medium text-slate-800 dark:text-[var(--text)] leading-tight">{client.firstName} {client.lastName}</div>
                          {client.company && <div className="text-[11px] text-slate-500 hidden md:block">{client.company}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell align-top">
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
                    <td className="px-4 py-3 hidden md:table-cell align-top">
                      {client.company ? <div className="flex items-center text-xs text-slate-600 dark:text-[var(--text-dim)]"><BuildingOfficeIcon className="h-4 w-4 text-slate-400 mr-1" />{client.company}</div> : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[client.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700'}`}>{client.status.replace('_',' ')}</span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell align-top text-xs text-slate-700 dark:text-[var(--text-dim)]">{formatSource(client.source)}</td>
                    <td className="px-4 py-3 hidden xl:table-cell align-top text-xs text-slate-600 dark:text-[var(--text-dim)]">{client.address ? (<span className="inline-flex items-center"><MapPinIcon className="h-4 w-4 text-slate-400 mr-1" />{client.address.city}, {client.address.state}</span>) : '—'}</td>
                    <td className="px-4 py-3 text-right text-xs font-medium align-top" onClick={e=> e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
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
                  {expanded.has(client._id) && (
                    <tr className="bg-gradient-to-r from-slate-50 to-white dark:from-[var(--surface-2)] dark:to-[var(--surface-1)]">
                      <td colSpan={7} className="px-6 pt-0 pb-4">
                        <div className="mt-2 grid md:grid-cols-4 gap-4 text-xs">
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-700 dark:text-[var(--text)] tracking-wide">Profile</p>
                            <p className="text-slate-600 dark:text-[var(--text-dim)]">{client.firstName} {client.lastName}{client.jobTitle ? ` • ${client.jobTitle}`:''}</p>
                            <p className="text-slate-500">Added {new Date(client.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-700 dark:text-[var(--text)] tracking-wide">Contact</p>
                            <p className="text-slate-600 dark:text-[var(--text-dim)]">{client.email}</p>
                            {client.phone && <p className="text-slate-600 dark:text-[var(--text-dim)]">{client.phone}</p>}
                          </div>
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-700 dark:text-[var(--text)] tracking-wide">Tags</p>
                            <div className="flex flex-wrap gap-1">
                              {(client.tags||[]).slice(0,6).map(t=> <span key={t} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[var(--surface-2)] text-[10px] border border-slate-200 dark:border-[var(--border)] text-slate-600 dark:text-[var(--text-dim)]">{t}</span>)}
                              {!client.tags?.length && <span className="text-slate-400">—</span>}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="font-semibold text-slate-700 dark:text-[var(--text)] tracking-wide">Quick Actions</p>
                            <div className="flex flex-wrap gap-2">
                              <Link href={`/dashboard/estimates/new?client=${client._id}`} className="pill pill-tint-blue text-[10px]">New Estimate</Link>
                              <Link href={`/dashboard/projects/new?client=${client._id}`} className="pill pill-tint-purple text-[10px]">New Project</Link>
                              <Link href={`mailto:${client.email}`} className="pill pill-tint-green text-[10px]">Email</Link>
                            </div>
                          </div>
                          {client.notes && <div className="md:col-span-4 border-t border-dashed border-token pt-3 text-slate-600 dark:text-[var(--text-dim)] line-clamp-2">{client.notes}</div>}
                        </div>
                      </td>
                    </tr>
                  )}
          </>
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
