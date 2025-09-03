'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { simple } from '@/lib/simple-ui';

type ClientDoc = {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: 'lead' | 'active' | 'inactive' | 'client' | 'prospect' | 'completed' | 'dead_lead';
};

export default function ClientsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ClientDoc[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('accessToken') || '';
        const res = await fetch('/api/clients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Failed to load clients (${res.status})`);
        const data = (await res.json()) as ClientDoc[];
        setRows(Array.isArray(data) ? data : []);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to load clients';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(c =>
      `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.company || '').toLowerCase().includes(q)
    );
  }, [rows, searchTerm]);

  const stats = useMemo(() => {
    const total = rows.length;
    const active = rows.filter(c => c.status === 'active' || c.status === 'client').length;
    const leads = rows.filter(c => c.status === 'lead' || c.status === 'prospect').length;
    return { total, active, leads };
  }, [rows]);

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
          <h1 className={simple.text.title()}>Clients</h1>
          <p className={simple.text.body()}>Manage your client relationships</p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className={simple.button('primary', 'flex items-center gap-2')}
        >
          <PlusIcon className="h-4 w-4" />
          Add Client
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className={`${simple.grid.cols4} ${simple.grid.gap} mb-6`}>
        <div className={simple.card()}>
          <div className={simple.section('flex items-center justify-between')}>
            <div>
              <p className={simple.text.small('mb-1')}>Total Clients</p>
              <p className={simple.text.title('text-2xl')}>{stats.total}</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-blue-600 opacity-80" />
          </div>
        </div>

        <div className={simple.card()}>
          <div className={simple.section('flex items-center justify-between')}>
            <div>
              <p className={simple.text.small('mb-1')}>Active</p>
              <p className={simple.text.title('text-2xl')}>{stats.active}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="h-3 w-3 bg-green-600 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className={simple.card()}>
          <div className={simple.section('flex items-center justify-between')}>
            <div>
              <p className={simple.text.small('mb-1')}>Leads</p>
              <p className={simple.text.title('text-2xl')}>{stats.leads}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <div className="h-3 w-3 bg-yellow-600 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className={simple.card()}>
          <div className={simple.section('flex items-center justify-between')}>
            <div>
              <p className={simple.text.small('mb-1')}>New</p>
              <p className={simple.text.title('text-2xl')}>—</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xs font-bold">i</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={simple.input('pl-10')}
          />
        </div>
      </div>

      {/* Client List */}
      {filtered.length > 0 ? (
        <div className={`${simple.grid.cols1} lg:grid-cols-2 xl:grid-cols-3 ${simple.grid.gap}`}>
          {filtered.map(c => (
            <Link
              key={c._id}
              href={`/dashboard/clients/${c._id}`}
              className={simple.card('hover:scale-[1.02] transition-transform')}
            >
              <div className={simple.section()}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className={simple.text.subtitle('mb-1')}>
                      {(c.firstName || '') + ' ' + (c.lastName || '')}
                    </h3>
                    {!!c.status && (
                      <span
                        className={simple.badge(
                          c.status === 'active' || c.status === 'client'
                            ? 'success'
                            : c.status === 'lead' || c.status === 'prospect'
                              ? 'warning'
                              : 'neutral'
                        )}
                      >
                        {c.status}
                      </span>
                    )}
                  </div>
                </div>

                <div className={`${simple.spacing.xs} mb-2`}>
                  {!!c.email && (
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                      <span className={simple.text.small()}>{c.email}</span>
                    </div>
                  )}
                  {!!c.phone && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4 text-gray-400" />
                      <span className={simple.text.small()}>{c.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={simple.empty.container}>
          <UserGroupIcon className={simple.empty.icon} />
          <h3 className={simple.empty.title}>
            {searchTerm ? 'No clients found' : 'No clients yet'}
          </h3>
          <p className={simple.empty.description}>
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Get started by adding your first client'}
          </p>
          {!searchTerm && (
            <Link
              href="/dashboard/clients/new"
              className={simple.button('primary', 'inline-flex items-center gap-2')}
            >
              <PlusIcon className="h-4 w-4" />
              Add Your First Client
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
