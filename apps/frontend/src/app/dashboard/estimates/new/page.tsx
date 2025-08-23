'use client';
import Layout from '../../../../components/Layout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Client {
  _id: string;
  name: string;
  company?: string;
}

interface PriceItem {
  _id: string;
  name: string;
  sku?: string;
  baseCost: number;
  defaultMarginPct: number;
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
}

export default function NewEstimatePage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [priceItems, setPriceItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Form state
  const [selectedClientId, setSelectedClientId] = useState<string>('');
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

  const token = (typeof window !== 'undefined') ? 
    (localStorage.getItem('accessToken') || localStorage.getItem('token')) : '';

  // Fetch clients and price items
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
          setClients(clientsData);
        }

        // Fetch price items
        const priceRes = await fetch('/api/pricing/items', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (priceRes.ok) {
          const priceData = await priceRes.json();
          setPriceItems(priceData);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, [token]);

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
    setItems(newItems);
  };

  const selectPriceItem = (index: number, priceItemId: string) => {
    const priceItem = priceItems.find(p => p._id === priceItemId);
    if (priceItem) {
      updateItem(index, 'priceItemId', priceItemId);
      updateItem(index, 'name', priceItem.name);
      updateItem(index, 'baseCost', priceItem.baseCost);
      updateItem(index, 'marginPct', priceItem.defaultMarginPct);
      updateItem(index, 'sku', priceItem.sku);
    }
  };

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
        items: items,
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
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">New Estimate</h1>
            <p className="text-sm text-[var(--text-dim)] mt-1">Create a new estimate for a client</p>
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

          {/* Client Selection */}
          <div className="surface-solid p-6">
            <h2 className="text-lg font-medium mb-4">Client Information</h2>
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Select Client *
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
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
          </div>

          {/* Line Items */}
          <div className="surface-solid p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Line Items</h2>
              <button
                type="button"
                onClick={addItem}
                className="pill pill-tint-blue sm"
              >
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border border-[var(--border)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-sm">Item {index + 1}</h3>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text)] mb-1">
                        From Price List (Optional)
                      </label>
                      <select
                        value={item.priceItemId || ''}
                        onChange={(e) => selectPriceItem(index, e.target.value)}
                        className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm"
                      >
                        <option value="">Custom item...</option>
                        {priceItems.map(priceItem => (
                          <option key={priceItem._id} value={priceItem._id}>
                            {priceItem.name} ({priceItem.sku}) - ${priceItem.baseCost}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
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
                        Base Cost ($) *
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
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Settings */}
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

          {/* Notes */}
          <div className="surface-solid p-6">
            <h2 className="text-lg font-medium mb-4">Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm"
              rows={4}
              placeholder="Optional notes for this estimate..."
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
              {loading ? 'Creating...' : 'Create Estimate'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
