'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { simple } from '@/lib/simple-ui';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'lead';
  projectsCount: number;
  totalValue: number;
}

export default function ClientsPage() {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadClients = async () => {
      setLoading(true);

      // Mock data - replace with actual API calls
      setTimeout(() => {
        setClients([
          {
            id: '1',
            name: 'Johnson Family',
            email: 'contact@johnsonfamily.com',
            phone: '(555) 123-4567',
            status: 'active',
            projectsCount: 2,
            totalValue: 45000
          },
          {
            id: '2',
            name: 'Martinez Construction',
            email: 'info@martinezconstruction.com',
            phone: '(555) 234-5678',
            status: 'active',
            projectsCount: 1,
            totalValue: 28000
          },
          {
            id: '3',
            name: 'Wilson Enterprises',
            email: 'hello@wilsonenterprises.com',
            phone: '(555) 345-6789',
            status: 'lead',
            projectsCount: 0,
            totalValue: 0
          }
        ]);
        setLoading(false);
      }, 800);
    };

    loadClients();
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    leads: clients.filter(c => c.status === 'lead').length,
    totalValue: clients.reduce((sum, c) => sum + c.totalValue, 0)
  };

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
              <p className={simple.text.small('mb-1')}>Total Value</p>
              <p className={simple.text.title('text-2xl')}>${(stats.totalValue / 1000).toFixed(0)}k</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xs font-bold">$</span>
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
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={simple.input('pl-10')}
          />
        </div>
      </div>

      {/* Client List */}
      {filteredClients.length > 0 ? (
        <div className={`${simple.grid.cols1} lg:grid-cols-2 xl:grid-cols-3 ${simple.grid.gap}`}>
          {filteredClients.map((client) => (
            <Link
              key={client.id}
              href={`/dashboard/clients/${client.id}`}
              className={simple.card('hover:scale-[1.02] transition-transform')}
            >
              <div className={simple.section()}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className={simple.text.subtitle('mb-1')}>{client.name}</h3>
                    <span className={simple.badge(
                      client.status === 'active' ? 'success' :
                      client.status === 'lead' ? 'warning' : 'neutral'
                    )}>
                      {client.status}
                    </span>
                  </div>
                </div>

                <div className={`${simple.spacing.xs} mb-4`}>
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                    <span className={simple.text.small()}>{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                    <span className={simple.text.small()}>{client.phone}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <span className={simple.text.small()}>Projects</span>
                    <p className="font-medium text-gray-900 dark:text-white">{client.projectsCount}</p>
                  </div>
                  <div className="text-right">
                    <span className={simple.text.small()}>Value</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      ${client.totalValue.toLocaleString()}
                    </p>
                  </div>
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
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first client'}
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
