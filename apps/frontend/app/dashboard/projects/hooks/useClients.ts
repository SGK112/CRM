'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface Client {
  _id?: string;
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: 'active' | 'inactive' | 'lead';
  contactType?: 'client' | 'subcontractor' | 'vendor' | 'contributor' | 'team';
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UseClientsReturn {
  clients: Client[];
  loading: boolean;
  error: string | null;
  refreshClients: () => Promise<void>;
  getClient: (id: string) => Promise<Client | null>;
  searchClients: (query: string) => Client[];
}

export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      throw new Error('No authentication token found');
    }
    return { Authorization: `Bearer ${token}` };
  }, [router]);

  const refreshClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/clients', {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch clients: ${response.status}`);
      }

      const data = await response.json();
      const clientsData = Array.isArray(data) ? data : data.clients || [];

      // Normalize client data
      const normalizedClients = clientsData.map((client: Client & { [key: string]: unknown }) => ({
        _id: client._id || client.id,
        id: client.id || client._id,
        name: client.name || `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Unnamed Contact',
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email || '',
        phone: client.phone || '',
        company: client.company || '',
        status: client.status || 'active',
        contactType: client.contactType || 'client',
        address: client.address || '',
        city: client.city || '',
        state: client.state || '',
        zipCode: client.zipCode || '',
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      }));

      setClients(normalizedClients);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load clients';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader]);

  const getClient = useCallback(async (id: string): Promise<Client | null> => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch client: ${response.status}`);
      }

      const client = await response.json();
      return {
        _id: client._id || client.id,
        id: client.id || client._id,
        name: client.name || `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Unnamed Contact',
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email || '',
        phone: client.phone || '',
        company: client.company || '',
        status: client.status || 'active',
        contactType: client.contactType || 'client',
        address: client.address || '',
        city: client.city || '',
        state: client.state || '',
        zipCode: client.zipCode || '',
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load client';
      setError(errorMessage);
      return null;
    }
  }, [getAuthHeader]);

  const searchClients = useCallback((query: string): Client[] => {
    if (!query.trim()) return clients;

    const searchLower = query.toLowerCase();
    return clients.filter(client =>
      client.name?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.company?.toLowerCase().includes(searchLower) ||
      client.phone?.includes(query)
    );
  }, [clients]);

  // Initial load
  useEffect(() => {
    refreshClients();
  }, [refreshClients]);

  return {
    clients,
    loading,
    error,
    refreshClients,
    getClient,
    searchClients,
  };
}
