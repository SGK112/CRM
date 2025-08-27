'use client';
import PricingSelector from '../../../../components/PricingSelector';
import ImageUpload from '../../../../components/forms/ImageUpload';
import Notes from '../../../../components/forms/Notes';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Client {
  _id: string;
  name: string;
  firstName: string;
  lastName: string;
  company?: string;
  email?: string;
  phone?: string;
}

interface Project {
  _id: string;
  title: string;
  clientId: string;
  status: string;
}

interface SelectedPriceItem {
  _id: string;
  sku: string;
  name: string;
  description?: string;
  baseCost: number;
  defaultMarginPct: number;
  unit: string;
  vendorId?: string;
  tags?: string[];
  quantity: number;
  customPrice?: number;
  customMargin?: number;
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
}

export default function NewEstimatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Form state
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedPriceItems, setSelectedPriceItems] = useState<SelectedPriceItem[]>([]);
  const [items, setItems] = useState<LineItem[]>([
    {
      name: 'New Item',
      description: '',
      quantity: 1,
      baseCost: 0,
      marginPct: 50,
      taxable: true
    }
  ]);
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(8.5);
  const [notes, setNotes] = useState<string>('');
  const [images, setImages] = useState<any[]>([]);
  const [estimateNotes, setEstimateNotes] = useState<any[]>([]);

  const token = (typeof window !== 'undefined') ? 
    (localStorage.getItem('accessToken') || localStorage.getItem('token')) : '';

  // Pre-fill from URL params
  useEffect(() => {
    const clientId = searchParams?.get('clientId');
    const projectId = searchParams?.get('projectId');
    
    if (clientId) setSelectedClientId(clientId);
    if (projectId) setSelectedProjectId(projectId);
  }, [searchParams]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        // Fetch clients
        const clientsRes = await fetch('/api/clients', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (clientsRes.ok) {
          const clientsData = await clientsRes.json();
          setClients(clientsData.map((c: any) => ({
            ...c,
            name: `${c.firstName} ${c.lastName}`.trim()
          })));
        }

        // Fetch projects
        const projectsRes = await fetch('/api/projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, [token]);

  // Filter projects by selected client
  const clientProjects = projects.filter(p => p.clientId === selectedClientId);

  // Handle pricing selector changes
  const handlePriceItemSelect = (selectedItem: SelectedPriceItem) => {
    // Convert to line item and add to items
    const newLineItem: LineItem = {
      priceItemId: selectedItem._id,
      name: selectedItem.name,
      description: selectedItem.description || '',
      quantity: selectedItem.quantity,
      baseCost: selectedItem.baseCost,
      marginPct: selectedItem.customMargin || selectedItem.defaultMarginPct,
      taxable: true,
      sku: selectedItem.sku,
      sellPrice: selectedItem.customPrice || (selectedItem.baseCost * (1 + (selectedItem.customMargin || selectedItem.defaultMarginPct) / 100))
    };
    
    setItems([...items, newLineItem]);
    
    // Update selected items for the pricing selector
    setSelectedPriceItems([...selectedPriceItems, selectedItem]);
  };

  const addItem = () => {
    setItems([...items, {
      name: 'New Item',
      description: '',
      quantity: 1,
      baseCost: 0,
      marginPct: 50,
      taxable: true
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof LineItem, value: any) => {
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

  // Calculate totals
  const calculateTotals = () => {
    const subtotalCost = items.reduce((sum, item) => sum + (item.baseCost * item.quantity), 0);
    const subtotalSell = items.reduce((sum, item) => {
      const sellPrice = item.baseCost * (1 + item.marginPct / 100);
      return sum + (sellPrice * item.quantity);
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
      marginPercent: subtotalSell > 0 ? (totalMargin / subtotalSell) * 100 : 0
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
          sku: item.sku
        })),
        discountType,
        discountValue,
        taxRate,
        notes
      };

      const res = await fetch('/api/estimates', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(estimateData)
      });

      if (res.ok) {
        const created = await res.json();
        router.push(`/dashboard/estimates/${created._id}`);
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
            <p className="text-sm text-[var(--text-dim)] mt-1">Create a professional estimate with smart pricing</p>
          </div>
          <button
            onClick={() => router.back()}
            className="pill pill-ghost sm"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Client & Project Selection */}
          <div className="surface-solid p-6">
            <h2 className="text-lg font-medium mb-4">Client & Project</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Select Client *
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => {
                    setSelectedClientId(e.target.value);
                    setSelectedProjectId(''); // Reset project when client changes
                  }}
                  className="w-full p-3 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                  required
                >
                  <option value="">Choose a client...</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>
                      {client.company ? `${client.company} (${client.name})` : client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Project (Optional)
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
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
                      onClick={() => router.push(`/dashboard/projects/new?clientId=${selectedClientId}&returnTo=${encodeURIComponent('/dashboard/estimates/new')}`)}
                      className="text-[var(--accent)] hover:text-[var(--accent-hover)] ml-1"
                    >
                      Create one?
                    </button>
                  </p>
                )}
                {!selectedClientId && clients.length === 0 && (
                  <p className="text-xs text-[var(--text-faint)] mt-1">
                    No clients found. 
                    <button
                      type="button"
                      onClick={() => router.push(`/dashboard/clients/new?returnTo=${encodeURIComponent('/dashboard/estimates/new')}`)}
                      className="text-[var(--accent)] hover:text-[var(--accent-hover)] ml-1"
                    >
                      Create one?
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Smart Pricing Selector */}
          <div className="surface-solid p-6">
            <h2 className="text-lg font-medium mb-4">Add from Price List</h2>
            <PricingSelector
              onItemSelect={handlePriceItemSelect}
              selectedItems={selectedPriceItems}
              placeholder="Search and select items from your price lists..."
              showVendorFilter={true}
              className="w-full"
            />
          </div>

          {/* Line Items */}
          <div className="surface-solid p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Line Items</h2>
              <button
                type="button"
                onClick={addItem}
                className="pill pill-tint-green sm"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Custom Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => {
                const sellPrice = item.baseCost * (1 + item.marginPct / 100);
                const lineTotal = sellPrice * item.quantity;
                
                return (
                  <div key={index} className="border border-[var(--border)] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-sm">Item {index + 1}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[var(--accent)]">
                          ${lineTotal.toFixed(2)}
                        </span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700 p-1"
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
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm"
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
                          onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                          className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm"
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
                          onChange={(e) => updateItem(index, 'baseCost', Number(e.target.value))}
                          className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm"
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
                          onChange={(e) => updateItem(index, 'marginPct', Number(e.target.value))}
                          className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm"
                          min="0"
                          step="0.1"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[var(--text)] mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm"
                          placeholder="Optional description"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--text)] mb-1">
                          SKU
                        </label>
                        <input
                          type="text"
                          value={item.sku || ''}
                          onChange={(e) => updateItem(index, 'sku', e.target.value)}
                          className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm"
                          placeholder="Optional SKU"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={item.taxable}
                            onChange={(e) => updateItem(index, 'taxable', e.target.checked)}
                            className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                          />
                          <span className="text-sm text-[var(--text)]">Taxable</span>
                        </label>
                      </div>
                    </div>

                    {/* Price breakdown */}
                    <div className="mt-3 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-dim)]">
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
          <div className="surface-solid p-6">
            <h2 className="text-lg font-medium mb-4">Pricing & Tax</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">
                  Discount Type
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'percent' | 'fixed')}
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
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
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
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Estimate Summary */}
          <div className="surface-solid p-6">
            <h2 className="text-lg font-medium mb-4">Estimate Summary</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal (Cost):</span>
                  <span>${totals.subtotalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal (Sell):</span>
                  <span>${totals.subtotalSell.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Total Margin:</span>
                  <span>${totals.totalMargin.toFixed(2)} ({totals.marginPercent.toFixed(1)}%)</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-${totals.discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({taxRate}%):</span>
                  <span>${totals.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-[var(--border)]">
                  <span>Total:</span>
                  <span>${totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
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
            <button
              type="button"
              onClick={() => router.back()}
              className="pill pill-ghost"
            >
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
