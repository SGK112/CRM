'use client';

import {
    PlusIcon,
    TrashIcon,
    EnvelopeIcon,
    PhoneIcon,
} from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Import types from components
interface ClientApiResponse {
  _id: string;
  id?: string; // For compatibility
  name?: string;
  firstName: string;
  lastName: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  status?: string;
  contactType?: string;
  entityType?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Client {
  _id: string;
  id?: string; // For compatibility
  name?: string;
  firstName: string;
  lastName: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  } | string; // Support both object and string formats
  city?: string;
  state?: string;
  zipCode?: string;
  status?: string;
  totalProjects?: number;
  totalValue?: number;
  lastContact?: string;
  notes?: string;
  tags?: string[];
  contactType?: string;
  entityType?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Project {
  _id: string;
  title: string;
  clientId?: string;
  status?: string;
}

interface LineItem {
  priceItemId?: string;
  name: string;
  description?: string;
  quantity: number;
  baseCost: number;
  marginPct: number;
  taxable: boolean;
  sku?: string;
  sellPrice?: number;
  category?: string;
}

export default function NewEstimatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearchQuery, setClientSearchQuery] = useState<string>('');
  const [showClientDropdown, setShowClientDropdown] = useState<boolean>(false);
  const [clientsLoading, setClientsLoading] = useState<boolean>(true);
  const [items, setItems] = useState<LineItem[]>([
    {
      name: '',
      quantity: 1,
      baseCost: 0,
      marginPct: 50,
      taxable: true,
      category: 'Materials',
    },
  ]);
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [categories] = useState<string[]>([
    'Materials',
    'Labor',
    'Equipment',
    'Permits',
    'Overhead',
    'Other',
  ]);
  const [highlightedClientIndex, setHighlightedClientIndex] = useState<number>(-1);
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('accessToken') || localStorage.getItem('token')
      : '';

  // Handle keyboard navigation for client selection
  const handleClientSearchKeyDown = (e: React.KeyboardEvent) => {
    const visibleClients = filteredClients.slice(0, 10);
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedClientIndex(prev => Math.min(prev + 1, visibleClients.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedClientIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && highlightedClientIndex >= 0) {
      e.preventDefault();
      const selectedClient = visibleClients[highlightedClientIndex];
      if (selectedClient) {
        handleClientSelect(selectedClient);
      }
    } else if (e.key === 'Escape') {
      setShowClientDropdown(false);
      setHighlightedClientIndex(-1);
    } else {
      setHighlightedClientIndex(-1);
    }
  };

  // Pre-fill from URL params and fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      setClientsLoading(true);
      setError('');

      try {
        // Get URL params for pre-selection
        const clientId = searchParams?.get('clientId');
        const projectId = searchParams?.get('projectId');

        // Set URL param IDs first
        if (clientId) setSelectedClientId(clientId);
        if (projectId) setSelectedProjectId(projectId);

        // Fetch clients
        const clientsRes = await fetch('/api/clients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (clientsRes.ok) {
          const clientsData = await clientsRes.json();
          // Handle API response format {success: true, data: [...]}
          const clientsList = clientsData.data || clientsData.clients || clientsData;
          const processedClients = clientsList.map((c: ClientApiResponse) => ({
            ...c,
            name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim(),
          }));
          setClients(processedClients);

          // If we have a pre-selected client from URL params, set the client data
          if (clientId && processedClients.length > 0) {
            // Try both _id and id fields for compatibility
            const preSelectedClient = processedClients.find((c: ClientApiResponse) => 
              c._id === clientId || c.id === clientId
            );
            if (preSelectedClient) {
              const clientData = {
                ...preSelectedClient,
                name: preSelectedClient.name || `${preSelectedClient.firstName || ''} ${preSelectedClient.lastName || ''}`.trim(),
              };
              setSelectedClient(clientData);
              setClientSearchQuery(clientData.company || clientData.name || `${clientData.firstName} ${clientData.lastName}`);
            } else {
              // Client ID from URL not found - try fetching specific client
              try {
                const specificClientRes = await fetch(`/api/clients/${clientId}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (specificClientRes.ok) {
                  const specificClientData = await specificClientRes.json();
                  const clientData = specificClientData.data || specificClientData;
                  if (clientData) {
                    const processedClient = {
                      ...clientData,
                      name: clientData.name || `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim(),
                    };
                    setSelectedClient(processedClient);
                    setClientSearchQuery(processedClient.company || processedClient.name || `${processedClient.firstName} ${processedClient.lastName}`);
                    // Add the client to the clients list if not already there
                    setClients(prev => {
                      const exists = prev.find(c => c._id === clientData._id || c.id === clientData._id);
                      return exists ? prev : [...prev, processedClient];
                    });
                  }
                } else {
                  // Only show error if we can't fetch the specific client either
                  setSelectedClientId('');
                  setError(`Client with ID "${clientId}" not found. Please select a valid client.`);
                }
              } catch (specificErr) {
                // Silently clear selection on error
                setSelectedClientId('');
              }
            }
          }
        } else {
          throw new Error('Failed to fetch clients');
        }

        // Fetch projects
        const projectsRes = await fetch('/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          // Handle API response format {success: true, data: [...]}
          const projectsList = projectsData.data || projectsData.projects || projectsData || [];
          setProjects(projectsList);
        } else {
          // Projects API failed, use empty array
          setProjects([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load client data';
        setError(errorMessage);
        setClients([]);
        setProjects([]);
      } finally {
        setClientsLoading(false);
      }
    };

    fetchData();
  }, [token, searchParams]);

  // Helper function to get address display components
  const getAddressDisplay = (client: Client) => {
    if (!client.address && !client.city && !client.state && !client.zipCode) {
      return null;
    }

    // If address is a string, use it directly along with other fields
    if (typeof client.address === 'string') {
      const addressParts = [];
      if (client.address) addressParts.push(client.address);
      
      const cityStateZip = [];
      if (client.city) cityStateZip.push(client.city);
      if (client.state) cityStateZip.push(client.state);
      if (client.zipCode) cityStateZip.push(client.zipCode);
      
      if (cityStateZip.length > 0) {
        addressParts.push(cityStateZip.join(', '));
      }
      
      return addressParts;
    }

    // If address is an object, use object properties
    if (typeof client.address === 'object') {
      const addressParts = [];
      if (client.address.street) addressParts.push(client.address.street);
      
      const cityStateZip = [];
      if (client.address.city) cityStateZip.push(client.address.city);
      if (client.address.state) cityStateZip.push(client.address.state);
      if (client.address.zipCode) cityStateZip.push(client.address.zipCode);
      
      if (cityStateZip.length > 0) {
        addressParts.push(cityStateZip.join(', '));
      }
      
      if (client.address.country) addressParts.push(client.address.country);
      
      return addressParts;
    }

    return null;
  };

  // Filter projects by selected client
  const clientProjects = projects.filter(p => p.clientId === selectedClientId);

  // Filter clients based on search query
  const filteredClients = clients.filter(client => {
    const searchLower = clientSearchQuery.toLowerCase();
    const name = client.name || `${client.firstName} ${client.lastName}`;
    return (
      name.toLowerCase().includes(searchLower) ||
      (client.email && client.email.toLowerCase().includes(searchLower)) ||
      (client.company && client.company.toLowerCase().includes(searchLower)) ||
      (client.phone && client.phone.includes(searchLower))
    );
  });

  // Handle client selection
  const handleClientSelect = (client: Client) => {
    setSelectedClientId(client._id);
    setSelectedClient(client);
    setClientSearchQuery(`${client.company || client.name || `${client.firstName} ${client.lastName}`}`);
    setShowClientDropdown(false);
    setSelectedProjectId(''); // Reset project when client changes
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        name: '',
        description: '',
        quantity: 1,
        baseCost: 0,
        marginPct: 50,
        taxable: true,
        category: 'Materials',
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number | boolean) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-calculate sell price
    if (field === 'baseCost' || field === 'marginPct' || field === 'quantity') {
      const item = newItems[index];
      const cost = item.baseCost || 0;
      const margin = item.marginPct || 0;
      item.sellPrice = cost * (1 + margin / 100);
    }

    setItems(newItems);
  };

  // Category management functions - removed for production simplicity

  // Calculate totals
  const calculateTotals = () => {
    const subtotalCost = items.reduce((sum, item) => sum + item.baseCost * item.quantity, 0);
    const subtotalSell = items.reduce((sum, item) => {
      const sellPrice = item.baseCost * (1 + item.marginPct / 100);
      return sum + sellPrice * item.quantity;
    }, 0);

    let discountAmount = 0;
    if (discountType === 'percent') {
      discountAmount = subtotalSell * (discountValue / 100);
    } else {
      discountAmount = discountValue;
    }

    const afterDiscount = Math.max(0, subtotalSell - discountAmount);
    const taxAmount = afterDiscount * (taxRate / 100);
    const total = afterDiscount + taxAmount;
    const totalMargin = subtotalSell - subtotalCost;

    return {
      subtotalCost,
      subtotalSell,
      discountAmount,
      taxAmount,
      total,
      totalMargin,
      marginPercent: subtotalSell > 0 ? (totalMargin / subtotalSell) * 100 : 0,
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClientId) {
      setError('Please select a client');
      return;
    }

    if (!token) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const estimateData = {
        clientId: selectedClientId,
        projectId: selectedProjectId || undefined,
        items: items.map(item => ({
          priceItemId: item.priceItemId,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          baseCost: item.baseCost,
          marginPct: item.marginPct,
          taxable: item.taxable,
          sku: item.sku,
        })),
        discountType,
        discountValue,
        taxRate,
        notes,
      };

      const res = await fetch('/api/estimates', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(estimateData),
      });

      if (res.ok) {
        const created = await res.json();
        const newId = created._id || created.id;
        if (!newId) {
          setError('Created estimate missing id.');
        } else {
          // Redirect to review page instead of detail page
          router.push(`/dashboard/estimates/${newId}/review`);
        }
      } else {
        const errorText = await res.text();
        setError(`Failed to create estimate: ${res.status} ${errorText}`);
      }
    } catch (err) {
      setError('Failed to create estimate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">New Estimate</h1>
          <p className="text-sm text-[var(--text-dim)] mt-1">
            {isAIEnabled
              ? 'Create a professional estimate with AI-powered smart pricing and suggestions'
              : 'Create a professional estimate with standard pricing tools'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="pill pill-ghost sm">
            Cancel
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Client & Project Selection */}
        <div className="surface-solid p-6">
          <h2 className="text-lg font-medium mb-4">Client & Project Information</h2>
          
          {/* Client Selection with Search */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Select Client *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={clientSearchQuery}
                  onChange={(e) => {
                    setClientSearchQuery(e.target.value);
                    setShowClientDropdown(true);
                    setHighlightedClientIndex(-1);
                    if (!e.target.value) {
                      setSelectedClientId('');
                      setSelectedClient(null);
                      setSelectedProjectId('');
                    }
                  }}
                  onKeyDown={handleClientSearchKeyDown}
                  onFocus={() => {
                    setShowClientDropdown(true);
                    setHighlightedClientIndex(-1);
                  }}
                  onBlur={() => {
                    // Delay hiding dropdown to allow for selection
                    setTimeout(() => {
                      setShowClientDropdown(false);
                      setHighlightedClientIndex(-1);
                    }, 200);
                  }}
                  placeholder="Search clients by name, email, company..."
                  className="w-full p-3 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                  required
                />
                
                {/* Loading indicator */}
                {clientsLoading && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-[var(--border)] rounded-lg shadow-lg p-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Loading clients...</span>
                    </div>
                  </div>
                )}
                
                {/* Client Search Dropdown */}
                {showClientDropdown && filteredClients.length > 0 && !clientsLoading && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-[var(--border)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredClients.slice(0, 10).map((client, index) => (
                      <div
                        key={client._id}
                        onClick={() => handleClientSelect(client)}
                        className={`p-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors ${
                          index === highlightedClientIndex 
                            ? 'bg-blue-50 dark:bg-blue-900/20' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {client.company || `${client.firstName} ${client.lastName}`}
                            </p>
                            {client.company && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {client.firstName} {client.lastName}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {client.email && (
                                <span className="flex items-center gap-1">
                                  <EnvelopeIcon className="h-3 w-3" />
                                  {client.email}
                                </span>
                              )}
                              {client.phone && (
                                <span className="flex items-center gap-1">
                                  <PhoneIcon className="h-3 w-3" />
                                  {client.phone}
                                </span>
                              )}
                            </div>
                          </div>
                          {client.status && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              client.status === 'client' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                              client.status === 'lead' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {client.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* No clients found */}
                {showClientDropdown && clientSearchQuery && filteredClients.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-[var(--border)] rounded-lg shadow-lg p-4 text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-2">No clients found</p>
                    <button
                      type="button"
                      onClick={() => router.push(`/dashboard/clients/new?returnTo=${encodeURIComponent('/dashboard/estimates/new')}&prefill=${encodeURIComponent(clientSearchQuery)}`)}
                      className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-sm font-medium"
                    >
                      Create new client "{clientSearchQuery}"
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Client Information Display */}
            {selectedClient && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      {selectedClient.company || `${selectedClient.firstName} ${selectedClient.lastName}`}
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      {/* Contact Information */}
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Contact Information</h4>
                        <div className="space-y-1 text-blue-700 dark:text-blue-300">
                          {selectedClient.company && (
                            <p><span className="font-medium">Contact:</span> {selectedClient.firstName} {selectedClient.lastName}</p>
                          )}
                          {selectedClient.email && (
                            <p className="flex items-center gap-1">
                              <EnvelopeIcon className="h-4 w-4" />
                              <a href={`mailto:${selectedClient.email}`} className="hover:underline">
                                {selectedClient.email}
                              </a>
                            </p>
                          )}
                          {selectedClient.phone && (
                            <p className="flex items-center gap-1">
                              <PhoneIcon className="h-4 w-4" />
                              <a href={`tel:${selectedClient.phone}`} className="hover:underline">
                                {selectedClient.phone}
                              </a>
                            </p>
                          )}
                          {selectedClient.status && (
                            <p><span className="font-medium">Status:</span> {selectedClient.status}</p>
                          )}
                        </div>
                      </div>

                      {/* Address Information */}
                      {getAddressDisplay(selectedClient) && (
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Address</h4>
                          <div className="text-blue-700 dark:text-blue-300 text-sm">
                            {getAddressDisplay(selectedClient)?.map((line, index) => (
                              <p key={index}>{line}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Business Statistics */}
                      {(selectedClient.totalProjects !== undefined || selectedClient.totalValue !== undefined) && (
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Business History</h4>
                          <div className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                            {selectedClient.totalProjects !== undefined && (
                              <p><span className="font-medium">Projects:</span> {selectedClient.totalProjects}</p>
                            )}
                            {selectedClient.totalValue !== undefined && (
                              <p><span className="font-medium">Total Value:</span> ${selectedClient.totalValue.toLocaleString()}</p>
                            )}
                            {selectedClient.lastContact && (
                              <p><span className="font-medium">Last Contact:</span> {new Date(selectedClient.lastContact).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Notes and Tags */}
                      {(selectedClient.notes || (selectedClient.tags && selectedClient.tags.length > 0)) && (
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Additional Information</h4>
                          <div className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                            {selectedClient.notes && (
                              <p><span className="font-medium">Notes:</span> {selectedClient.notes}</p>
                            )}
                            {selectedClient.tags && selectedClient.tags.length > 0 && (
                              <div>
                                <span className="font-medium">Tags:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {selectedClient.tags.map((tag, index) => (
                                    <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 ml-4">
                    <button
                      type="button"
                      onClick={() => router.push(`/dashboard/clients/${selectedClient._id}`)}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-sm rounded-md hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClientId('');
                        setSelectedClient(null);
                        setClientSearchQuery('');
                        setSelectedProjectId('');
                      }}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Project (Optional)
              </label>
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="w-full p-3 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                disabled={!selectedClientId}
              >
                <option value="">No project selected</option>
                {clientProjects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.title} ({project.status})
                  </option>
                ))}
              </select>
              {selectedClientId && clientProjects.length === 0 && (
                <p className="text-xs text-[var(--text-faint)] mt-1">
                  No projects found for this client.
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/dashboard/projects/new?clientId=${selectedClientId}&returnTo=${encodeURIComponent('/dashboard/estimates/new')}`
                      )
                    }
                    className="text-[var(--accent)] hover:text-[var(--accent-hover)] ml-1"
                  >
                    Create one?
                  </button>
                </p>
              )}
            </div>

            {/* Quick Navigation Links */}
            <div className="pt-4 border-t border-[var(--border)]">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/clients')}
                  className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-md transition-colors"
                >
                  View All Clients
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/projects')}
                  className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-md transition-colors"
                >
                  View All Projects
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/clients/new')}
                  className="text-xs bg-brand-100 dark:bg-brand-900/20 hover:bg-brand-200 dark:hover:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-3 py-1.5 rounded-md transition-colors"
                >
                  + New Client
                </button>
                {selectedClientId && (
                  <>
                    <button
                      type="button"
                      onClick={() => router.push(`/dashboard/projects/new?clientId=${selectedClientId}`)}
                      className="text-xs bg-brand-100 dark:bg-brand-900/20 hover:bg-brand-200 dark:hover:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-3 py-1.5 rounded-md transition-colors"
                    >
                      + New Project for this Client
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push(`/dashboard/invoices/new` + (selectedClientId ? `?clientId=${selectedClientId}` : '') + (selectedProjectId ? `&projectId=${selectedProjectId}` : ''))}
                      className="text-xs bg-purple-100 dark:bg-purple-900/20 hover:bg-purple-200 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Create Invoice Instead
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="surface-solid p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-medium">Line Items</h2>
              {isAIEnabled && (
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
                  <svg
                    className="w-3 h-3 text-gray-700 dark:text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                    AI Enhanced
                  </span>
                </div>
              )}
            </div>
            <button type="button" onClick={addItem} className="pill pill-tint-green sm">
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Custom Item
            </button>
          </div>

          <div className="space-y-4">
            {!isAIEnabled && (
              <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Basic Mode:</strong> Standard description fields without AI suggestions.
                  Toggle AI Enhanced mode for smart suggestions and automated descriptions.
                </p>
              </div>
            )}
            {items.map((item, index) => {
              const sellPrice = item.baseCost * (1 + item.marginPct / 100);
              const lineTotal = sellPrice * item.quantity;

              return (
                <div key={index} className="border border-[var(--border)] rounded-lg p-4">
                  {/* Category at the top with custom option */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-sm font-medium text-[var(--text)] min-w-fit">
                        Category:
                      </label>
                      {showNewCategoryInput[index] ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={newCategoryInput[index] || ''}
                            onChange={e =>
                              setNewCategoryInput({
                                ...newCategoryInput,
                                [index]: e.target.value,
                              })
                            }
                            onKeyDown={e => handleCategoryKeyDown(e, index)}
                            placeholder="Enter new category"
                            className="flex-1 p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => addNewCategory(index)}
                            className="px-3 py-2 bg-brand-600 text-white rounded text-sm font-medium hover:bg-brand-700 transition-colors"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowNewCategoryInput({ ...showNewCategoryInput, [index]: false });
                              setNewCategoryInput({ ...newCategoryInput, [index]: '' });
                            }}
                            className="px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-1">
                          <select
                            value={item.category || 'Materials'}
                            onChange={e => updateItem(index, 'category', e.target.value)}
                            className="flex-1 p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() =>
                              setShowNewCategoryInput({ ...showNewCategoryInput, [index]: true })
                            }
                            className="flex items-center justify-center w-8 h-8 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/20 dark:hover:bg-brand-900/40 border border-brand-200 dark:border-brand-700 rounded text-brand-600 dark:text-brand-400 transition-colors"
                            title="Add new category"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Item total and remove button */}
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-sm font-medium text-brand-600 dark:text-brand-400 min-w-fit">
                        ${lineTotal.toFixed(2)}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="flex items-center justify-center w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Remove item"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[var(--text)] mb-1">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={e => updateItem(index, 'name', e.target.value)}
                        placeholder="Enter item name..."
                        onFocus={e => {
                          if (e.target.value === '') {
                            e.target.placeholder = '';
                          }
                        }}
                        onBlur={e => {
                          if (e.target.value === '') {
                            e.target.placeholder = 'Enter item name...';
                          }
                        }}
                        className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text)] mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                        className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        min="0.01"
                        step="0.01"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text)] mb-1">
                        Unit Cost ($) *
                      </label>
                      <input
                        type="number"
                        value={item.baseCost}
                        onChange={e => updateItem(index, 'baseCost', Number(e.target.value))}
                        className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text)] mb-1">
                        Margin % *
                      </label>
                      <input
                        type="number"
                        value={item.marginPct}
                        onChange={e => updateItem(index, 'marginPct', Number(e.target.value))}
                        className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        min="0"
                        step="0.1"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[var(--text)] mb-1">
                        Description
                      </label>
                      {isAIEnabled ? (
                        <AIWritingAssistant
                          value={item.description || ''}
                          onChange={value => updateItem(index, 'description', value)}
                          placeholder="AI will suggest detailed descriptions..."
                          itemName={item.name}
                          category={item.category}
                          className="text-sm"
                        />
                      ) : (
                        <textarea
                          value={item.description || ''}
                          onChange={e => updateItem(index, 'description', e.target.value)}
                          placeholder="Enter item description..."
                          className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent min-h-[80px] resize-y"
                          rows={3}
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text)] mb-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={item.sku || ''}
                        onChange={e => updateItem(index, 'sku', e.target.value)}
                        placeholder="Optional SKU"
                        onFocus={e => {
                          if (e.target.value === '') {
                            e.target.placeholder = '';
                          }
                        }}
                        onBlur={e => {
                          if (e.target.value === '') {
                            e.target.placeholder = 'Optional SKU';
                          }
                        }}
                        className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={item.taxable}
                          onChange={e => updateItem(index, 'taxable', e.target.checked)}
                          className="rounded border-[var(--border)] text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm text-[var(--text)]">Taxable</span>
                      </label>
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="mt-3 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
                    <div className="flex gap-6">
                      <span>Unit Price: ${sellPrice.toFixed(2)}</span>
                      <span>Line Total: ${lineTotal.toFixed(2)}</span>
                      <span>
                        Line Margin: ${((sellPrice - item.baseCost) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing & Tax */}
        <div className="surface-solid p-6">
          <h2 className="text-lg font-medium mb-4">Pricing & Tax</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={e => setDiscountType(e.target.value as 'percent' | 'fixed')}
                className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm"
              >
                <option value="percent">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">
                Discount Value
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={e => setDiscountValue(Number(e.target.value))}
                className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm"
                min="0"
                step="0.01"
                placeholder={discountType === 'percent' ? '0-100' : '$0.00'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={taxRate}
                onChange={e => setTaxRate(Number(e.target.value))}
                className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>
        </div>

        {/* General Notes */}
        <div className="surface-solid p-6">
          <h2 className="text-lg font-medium mb-4">General Notes</h2>
          <p className="text-sm text-[var(--text-dim)] mb-4">
            Add any general notes or terms for this estimate
          </p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Enter general notes, terms, or conditions..."
            className="w-full p-3 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent min-h-[100px] resize-y"
            rows={4}
          />
        </div>

        {/* Images & Project Documentation */}
        <div className="surface-solid p-6">
          <h2 className="text-lg font-medium mb-4">Project Images</h2>
          <p className="text-sm text-[var(--text-dim)] mb-4">
            Add reference images, progress photos, or before/after shots to support your estimate
          </p>
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            maxImages={10}
            allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
            categories={true}
          />
        </div>

        {/* Project Notes & Documentation */}
        <div className="surface-solid p-6">
          <h2 className="text-lg font-medium mb-4">Project Notes</h2>
          <p className="text-sm text-[var(--text-dim)] mb-4">
            Document project details, client requirements, or special considerations
          </p>
          <Notes
            notes={estimateNotes}
            onNotesChange={setEstimateNotes}
            allowPrivate={true}
            categories={true}
            currentUser={{ id: 'current-user', name: 'Current User' }}
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end space-x-4">
          <button type="button" onClick={() => router.back()} className="pill pill-ghost">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="pill pill-tint-green disabled:opacity-50"
          >
            {loading ? 'Creating...' : `Create Estimate ($${totals.total.toFixed(2)})`}
          </button>
        </div>
      </form>
    </div>
  );
}
