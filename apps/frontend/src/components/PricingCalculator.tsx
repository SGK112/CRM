'use client';

import { LineItem } from '@/types/shared';

interface PricingCalculatorProps {
  items: LineItem[];
  discountType: 'percent' | 'fixed';
  discountValue: number;
  taxRate: number;
  onDiscountTypeChange: (type: 'percent' | 'fixed') => void;
  onDiscountValueChange: (value: number) => void;
  onTaxRateChange: (rate: number) => void;
  className?: string;
}

export default function PricingCalculator({
  items,
  discountType,
  discountValue,
  taxRate,
  onDiscountTypeChange,
  onDiscountValueChange,
  onTaxRateChange,
  className = '',
}: PricingCalculatorProps) {
  const calculateItemTotal = (item: LineItem) => {
    const sellPrice = item.sellPrice || (item.baseCost * (1 + (item.marginPct || 0) / 100));
    return (item.quantity || 0) * sellPrice;
  };

  const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

  const discountAmount = discountType === 'percent'
    ? (subtotal * discountValue) / 100
    : discountValue;

  const discountedSubtotal = subtotal - discountAmount;
  const taxableAmount = items
    .filter(item => item.taxable)
    .reduce((sum, item) => sum + calculateItemTotal(item), 0) - discountAmount;

  const taxAmount = (taxableAmount * taxRate) / 100;
  const total = discountedSubtotal + taxAmount;

  return (
    <div className={`surface-solid p-6 ${className}`}>
      <h2 className="text-lg font-medium mb-4">Pricing Summary</h2>

      <div className="space-y-4">
        {/* Discount Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Discount Type
            </label>
            <select
              value={discountType}
              onChange={(e) => onDiscountTypeChange(e.target.value as 'percent' | 'fixed')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="percent">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Discount Value
            </label>
            <input
              type="number"
              value={discountValue}
              onChange={(e) => onDiscountValueChange(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              min="0"
              step="0.01"
              placeholder={discountType === 'percent' ? '10' : '100.00'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Tax Rate (%)
            </label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => onTaxRateChange(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              min="0"
              max="100"
              step="0.01"
              placeholder="8.25"
            />
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-[var(--border)] pt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-dim)]">Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-dim)]">
                  Discount ({discountType === 'percent' ? `${discountValue}%` : `$${discountValue}`}):
                </span>
                <span className="text-red-600">-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-dim)]">Taxable Amount:</span>
              <span>${Math.max(0, taxableAmount).toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-dim)]">Tax ({taxRate}%):</span>
              <span>${Math.max(0, taxAmount).toFixed(2)}</span>
            </div>

            <div className="border-t border-[var(--border)] pt-2 mt-2">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>${Math.max(0, total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div className="text-xs text-[var(--text-dim)] bg-[var(--surface-2)] p-3 rounded-lg">
          <p><strong>Tax Calculation:</strong> Only items marked as "taxable" are included in tax calculations.</p>
          <p><strong>Discount:</strong> Applied to all items before tax calculation.</p>
        </div>
      </div>
    </div>
  );
}
