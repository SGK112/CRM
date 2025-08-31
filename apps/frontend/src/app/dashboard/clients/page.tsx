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
            name: 'Davis Family',
            email: 'hello@davisfamily.com',
            phone: '(555) 345-6789',
            status: 'lead',
            projectsCount: 0,
            totalValue: 0
          },
          {
            id: '4',
            name: 'Smith Enterprises',
            email: 'contact@smithenterprises.com',
            phone: '(555) 456-7890',
            status: 'active',
            projectsCount: 3,
            totalValue: 125000
          }
        ]);
        
        setLoading(false);
      }, 1000);
    };

    loadClients();
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    leads: clients.filter(c => c.status === 'lead').length,
    totalValue: clients.reduce((sum, c) => sum + c.totalValue, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={simple.page('max-w-6xl mx-auto')}>
      {/* Header */}
      <div className={simple.card('mb-6')}>
        <div className={simple.section()}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={simple.text.title('mb-2')}>
                Client Management
              </h1>
              <p className={simple.text.body()}>
                Manage your clients and track project relationships.
              </p>
            </div>
            <Link
              href="/dashboard/clients/new"
              className={simple.button('primary', 'flex items-center space-x-2')}
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Client</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`${simple.grid.cols4} mb-6`}>
        <div className={simple.card('text-center')}>
          <div className={simple.section()}>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalClients}
            </div>
            <div className={simple.text.small()}>Total Clients</div>
          </div>
        </div>
        
        <div className={simple.card('text-center')}>
          <div className={simple.section()}>
            <div className="text-2xl font-bold text-green-600">
              {stats.activeClients}
            </div>
            <div className={simple.text.small()}>Active</div>
          </div>
        </div>
        
        <div className={simple.card('text-center')}>
          <div className={simple.section()}>
            <div className="text-2xl font-bold text-blue-600">
              {stats.leads}
            </div>
            <div className={simple.text.small()}>Leads</div>
          </div>
        </div>
        
        <div className={simple.card('text-center')}>
          <div className={simple.section()}>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${stats.totalValue.toLocaleString()}
            </div>
            <div className={simple.text.small()}>Total Value</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className={simple.card('mb-6')}>
        <div className={simple.section()}>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={simple.input('pl-10')}
            />
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className={simple.grid.cols2}>
        {filteredClients.map((client) => (
          <div key={client.id} className={simple.card('hover:shadow-lg transition-shadow')}>
            <div className={simple.section()}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className={simple.text.subtitle('mb-1')}>
                    {client.name}
                  </h3>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    client.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    client.status === 'lead' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {client.status}
                  </span>
                </div>
                <UserGroupIcon className="w-6 h-6 text-gray-400" />
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <PhoneIcon className="w-4 h-4" />
                  <span>{client.phone}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Projects: </span>
                  <span className="font-medium">{client.projectsCount}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Value: </span>
                  <span className="font-medium">${client.totalValue.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={`/dashboard/clients/${client.id}`}
                  className={simple.button('secondary', 'w-full text-center')}
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className={simple.card('text-center py-12')}>
          <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className={simple.text.subtitle('mb-2')}>
            No clients found
          </h3>
          <p className={simple.text.body('mb-4')}>
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first client'}
          </p>
          {!searchTerm && (
            <Link
              href="/dashboard/clients/new"
              className={simple.button('primary')}
            >
              Add Client
            </Link>
          )}
        </div>
      )}
    </div>
  );
}