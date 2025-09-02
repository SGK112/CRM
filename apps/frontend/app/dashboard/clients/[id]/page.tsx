'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: string;
  createdAt: string;
}

export default function ClientDetailPage() {
  const { id: clientId } = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!clientId) return;

    const fetchClient = async () => {
      try {
        const response = await fetch(`/api/clients/${clientId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setClient(data);
        } else {
          setError('Client not found');
        }
      } catch (error) {
        setError('Failed to fetch client');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="py-32 text-center">
        <h2 className="text-2xl font-bold mb-2">{error || 'Client Not Found'}</h2>
        <p className="text-gray-700">The requested client could not be located.</p>
        <div className="mt-6">
          <Link href="/dashboard/clients" className="text-blue-600 hover:underline">
            Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/clients" className="text-gray-700 hover:text-gray-700">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-brand-700 dark:text-brand-400">
              {client.firstName} {client.lastName}
            </h1>
            <p className="text-sm text-gray-700 mt-1">
              Client since {new Date(client.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              if (!clientId || deleting) return;
              const ok = window.confirm('Delete this client? This cannot be undone.');
              if (!ok) return;
              setDeleting(true);
              try {
                const res = await fetch(`/api/clients/${clientId}`, {
                  method: 'DELETE',
                  headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
                });
                if (res.ok) router.push('/dashboard/clients');
              } finally {
                setDeleting(false);
              }
            }}
            className="pill pill-ghost sm text-red-600"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
          <Link href={`/dashboard/clients/${clientId}/edit`} className="pill pill-ghost sm">
            Edit
          </Link>
        </div>
      </div>

      {/* Client Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <p className="text-gray-900 dark:text-white">{client.email}</p>
              </div>
              {client.phone && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Phone:</span>
                  <p className="text-gray-900 dark:text-white">{client.phone}</p>
                </div>
              )}
              {client.company && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Company:</span>
                  <p className="text-gray-900 dark:text-white">{client.company}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <span
                  className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                    client.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : client.status === 'lead'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {client.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                href={`/dashboard/clients/${clientId}/edit`}
                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit Client
              </Link>
              <button className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
