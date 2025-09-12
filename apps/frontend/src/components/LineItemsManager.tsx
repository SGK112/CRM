'use client';

import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { LineItem } from '@/types/shared';

interface LineItemsManagerProps {
  items: LineItem[];
  onItemsChange: (items: LineItem[]) => void;
  categories: string[];
  title?: string;
  allowDelete?: boolean;
}

export default function LineItemsManager({
  items,
  onItemsChange,
  categories,
  title = 'Line Items',
  allowDelete = true,
}: LineItemsManagerProps) {
  const addItem = () => {
    const newItems = [
      ...items,
      {
        name: '',
        quantity: 1,
        baseCost: 0,
        marginPct: 50,
        taxable: true,
        category: 'Materials',
      },
    ];
    onItemsChange(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1 && allowDelete) {
      const newItems = items.filter((_, i) => i !== index);
      onItemsChange(newItems);
    }
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number | boolean) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-calculate sell price
    if (field === 'baseCost' || field === 'marginPct' || field === 'quantity') {
      const item = newItems[index];
      const baseCost = Number(item.baseCost) || 0;
      const marginPct = Number(item.marginPct) || 0;
      item.sellPrice = baseCost * (1 + marginPct / 100);
    }

    onItemsChange(newItems);
  };

  const calculateItemTotal = (item: LineItem) => {
    const sellPrice = item.sellPrice || (item.baseCost * (1 + (item.marginPct || 0) / 100));
    return (item.quantity || 0) * sellPrice;
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  return (
    <div className="surface-solid p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">{title}</h2>
        <button
          onClick={addItem}
          className="pill pill-brand sm"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          Add Item
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-4 bg-[var(--surface-2)] rounded-lg border border-[var(--border)]">
            {/* Item Name */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-medium text-[var(--text-dim)] mb-1">
                Item Name *
              </label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="Enter item name"
                required
              />
            </div>

            {/* Description */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-medium text-[var(--text-dim)] mb-1">
                Description
              </label>
              <input
                type="text"
                value={item.description || ''}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="Optional description"
              />
            </div>

            {/* Quantity */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-[var(--text-dim)] mb-1">
                Qty
              </label>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                min="0"
                step="0.01"
              />
            </div>

            {/* Base Cost */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-[var(--text-dim)] mb-1">
                Cost
              </label>
              <input
                type="number"
                value={item.baseCost}
                onChange={(e) => updateItem(index, 'baseCost', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            {/* Margin */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-[var(--text-dim)] mb-1">
                Margin %
              </label>
              <input
                type="number"
                value={item.marginPct}
                onChange={(e) => updateItem(index, 'marginPct', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                min="0"
                step="0.1"
                placeholder="50"
              />
            </div>

            {/* Category */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-[var(--text-dim)] mb-1">
                Category
              </label>
              <select
                value={item.category || 'Materials'}
                onChange={(e) => updateItem(index, 'category', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Total */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-[var(--text-dim)] mb-1">
                Total
              </label>
              <div className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300">
                ${calculateItemTotal(item).toFixed(2)}
              </div>
            </div>

            {/* Actions */}
            <div className="lg:col-span-1 flex items-end">
              {allowDelete && items.length > 1 && (
                <button
                  onClick={() => removeItem(index)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  title="Remove item"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Subtotal */}
      <div className="mt-4 flex justify-end">
        <div className="text-right">
          <div className="text-sm text-[var(--text-dim)]">Subtotal</div>
          <div className="text-lg font-semibold">${calculateSubtotal().toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
