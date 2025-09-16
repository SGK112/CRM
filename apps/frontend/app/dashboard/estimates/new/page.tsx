'use client';

import {
    PlusIcon,
    TrashIcon,
    EnvelopeIcon,
    PhoneIcon,
} from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ClientApiResponse {
  _id: string;
  id?: string;
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
  status?: string;
}

interface Client {
  _id: string;
  id?: string;
  name?: string;
  firstName: string;
  lastName: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string | {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  city?: string;
  state?: string;
  zipCode?: string;
  status?: string;
}

interface Project {
  _id: string;
  title: string;
  clientId?: string;
  status?: string;
}

interface LineItem {
  name: string;
  description?: string;
  quantity: number;
  baseCost: number;
  marginPct: number;
  taxable: boolean;
  sku?: string;
  category?: string;
}

const CATEGORIES = ['Materials', 'Labor', 'Equipment', 'Permits', 'Overhead', 'Other'];

export default function NewEstimatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Core state
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearchQuery, setClientSearchQuery] = useState<string>('');
  const [showClientDropdown, setShowClientDropdown] = useState<boolean>(false);
  
  // Form state
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
  
  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [clientsLoading, setClientsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('accessToken') || localStorage.getItem('token') 
    : '';

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      setClientsLoading(true);
      setError('');

      try {
        // Fetch clients
        const clientsRes = await fetch('/api/clients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (clientsRes.ok) {
          const clientsData = await clientsRes.json();
          const clientsList = clientsData.data || clientsData.clients || clientsData;
          const processedClients = clientsList.map((c: ClientApiResponse) => ({
            ...c,
            name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim(),
          }));
          setClients(processedClients);

          // Handle pre-selected client from URL
          const clientId = searchParams?.get('clientId');
          if (clientId) {
            const preSelectedClient = processedClients.find((c: ClientApiResponse) => 
              c._id === clientId || c.id === clientId
            );
            if (preSelectedClient) {
              setSelectedClientId(clientId);
              setSelectedClient(preSelectedClient);
              setClientSearchQuery(
                preSelectedClient.company || 
                preSelectedClient.name || 
                `${preSelectedClient.firstName} ${preSelectedClient.lastName}`
              );
            }
          }
        }

        // Fetch projects
        const projectsRes = await fetch('/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          const projectsList = projectsData.data || projectsData.projects || projectsData || [];
          setProjects(projectsList);
          
          // Handle pre-selected project from URL
          const projectId = searchParams?.get('projectId');
          if (projectId) {
            setSelectedProjectId(projectId);
          }
        }
      } catch (err) {
        setError('Failed to load data. Please try again.');
      } finally {
        setClientsLoading(false);
      }
    };

    fetchData();
  }, [token, searchParams]);

  // Client selection helpers
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

  const handleClientSelect = (client: Client) => {
    setSelectedClientId(client._id);
    setSelectedClient(client);
    setClientSearchQuery(client.company || client.name || `${client.firstName} ${client.lastName}`);
    setShowClientDropdown(false);
    setSelectedProjectId(''); // Reset project when client changes
    setValidationErrors(prev => ({ ...prev, client: '' }));
  };

  // Line item management
  const addItem = () => {
    setItems([...items, {
      name: '',
      description: '',
      quantity: 1,
      baseCost: 0,
      marginPct: 50,
      taxable: true,
      category: 'Materials',
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number | boolean) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    
    // Clear validation error for this item
    setValidationErrors(prev => ({ ...prev, [`item_${index}_${field}`]: '' }));
  };

  // Calculations
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

    return {
      subtotalCost,
      subtotalSell,
      discountAmount,
      taxAmount,
      total,
      totalMargin: subtotalSell - subtotalCost,
    };
  };

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!selectedClientId) {
      errors.client = 'Please select a client';
    }

    items.forEach((item, index) => {
      if (!item.name.trim()) {
        errors[`item_${index}_name`] = 'Item name is required';
      }
      if (item.quantity <= 0) {
        errors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (item.baseCost < 0) {
        errors[`item_${index}_baseCost`] = 'Cost cannot be negative';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Please fix the validation errors below');
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
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          baseCost: item.baseCost,
          marginPct: item.marginPct,
          taxable: item.taxable,
          sku: item.sku,
          category: item.category,
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
        if (newId) {
          router.push(`/dashboard/estimates/${newId}/review`);
        } else {
          setError('Created estimate missing id.');
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(`Failed to create estimate: ${errorData.error || res.statusText}`);
      }
    } catch (err) {
      setError('Failed to create estimate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();
  const clientProjects = projects.filter(p => p.clientId === selectedClientId);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">New Estimate</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Create a professional estimate for your client
          </p>
        </div>
        <button 
          onClick={() => router.back()} 
          className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Client & Project Selection */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Client & Project</h2>
          
          <div className="space-y-4">
            {/* Client Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={clientSearchQuery}
                  onChange={(e) => {
                    setClientSearchQuery(e.target.value);
                    setShowClientDropdown(true);
                    if (!e.target.value) {
                      setSelectedClientId('');
                      setSelectedClient(null);
                      setSelectedProjectId('');
                    }
                  }}
                  onFocus={() => setShowClientDropdown(true)}
                  onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                  placeholder="Search clients..."
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.client ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  required
                />
                
                {validationErrors.client && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.client}</p>
                )}
                
                {/* Loading indicator */}
                {clientsLoading && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 text-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading clients...</span>
                  </div>
                )}
                
                {/* Client Search Dropdown */}
                {showClientDropdown && filteredClients.length > 0 && !clientsLoading && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredClients.slice(0, 10).map((client) => (
                      <div
                        key={client._id}
                        onClick={() => handleClientSelect(client)}
                        className="p-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700"
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
              </div>
            </div>

            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project (Optional)
              </label>
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  No projects found for this client.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Line Items</h2>
            <button 
              type="button" 
              onClick={addItem} 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => {
              const sellPrice = item.baseCost * (1 + item.marginPct / 100);
              const lineTotal = sellPrice * item.quantity;

              return (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Item #{index + 1}
                      </span>
                      <select
                        value={item.category || 'Materials'}
                        onChange={e => updateItem(index, 'category', e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        ${lineTotal.toFixed(2)}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={e => updateItem(index, 'name', e.target.value)}
                        placeholder="Enter item name"
                        className={`w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors[`item_${index}_name`] ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        required
                      />
                      {validationErrors[`item_${index}_name`] && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors[`item_${index}_name`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                        className={`w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors[`item_${index}_quantity`] ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        min="0.01"
                        step="0.01"
                        required
                      />
                      {validationErrors[`item_${index}_quantity`] && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors[`item_${index}_quantity`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Unit Cost ($) *
                      </label>
                      <input
                        type="number"
                        value={item.baseCost}
                        onChange={e => updateItem(index, 'baseCost', Number(e.target.value))}
                        className={`w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors[`item_${index}_baseCost`] ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        min="0"
                        step="0.01"
                        required
                      />
                      {validationErrors[`item_${index}_baseCost`] && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors[`item_${index}_baseCost`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Margin %
                      </label>
                      <input
                        type="number"
                        value={item.marginPct}
                        onChange={e => updateItem(index, 'marginPct', Number(e.target.value))}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        min="0"
                        step="0.1"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={item.description || ''}
                        onChange={e => updateItem(index, 'description', e.target.value)}
                        placeholder="Enter item description"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={item.sku || ''}
                        onChange={e => updateItem(index, 'sku', e.target.value)}
                        placeholder="Optional"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={item.taxable}
                          onChange={e => updateItem(index, 'taxable', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Taxable</span>
                      </label>
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex gap-6">
                      <span>Unit Price: ${sellPrice.toFixed(2)}</span>
                      <span>Line Total: ${lineTotal.toFixed(2)}</span>
                      <span>Line Margin: ${((sellPrice - item.baseCost) * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing & Tax */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Pricing & Tax</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={e => setDiscountType(e.target.value as 'percent' | 'fixed')}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="percent">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount Value
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={e => setDiscountValue(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="0"
                step="0.01"
                placeholder={discountType === 'percent' ? '0-100' : '$0.00'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={taxRate}
                onChange={e => setTaxRate(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Notes</h2>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add any notes or terms for this estimate..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
            rows={4}
          />
        </div>

        {/* Summary */}
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Estimate Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${totals.subtotalSell.toFixed(2)}</span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount:</span>
                <span>-${totals.discountAmount.toFixed(2)}</span>
              </div>
            )}
            {totals.taxAmount > 0 && (
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${totals.taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>${totals.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Total Margin:</span>
                <span>${totals.totalMargin.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end space-x-4">
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="px-6 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : `Create Estimate ($${totals.total.toFixed(2)})`}
          </button>
        </div>
      </form>
    </div>
  );
}