'use client';

import { useState, useEffect, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon, CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { API_BASE } from '../lib/api';

interface PriceItem {
  _id: string;
  sku: string;
  name: string;
  description?: string;
  baseCost: number;
  defaultMarginPct: number;
  unit: string;
  vendorId?: string;
  tags?: string[];
}

interface Vendor {
  _id: string;
  name: string;
}

interface SelectedItem extends PriceItem {
  quantity: number;
  customPrice?: number;
  customMargin?: number;
}

interface PricingSelectorProps {
  onItemSelect: (item: SelectedItem) => void;
  selectedItems?: SelectedItem[];
  className?: string;
  placeholder?: string;
  showVendorFilter?: boolean;
}

export default function PricingSelector({
  onItemSelect,
  selectedItems = [],
  className = '',
  placeholder = 'Search and select items...',
  showVendorFilter = true,
}: PricingSelectorProps) {
  const [items, setItems] = useState<PriceItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredItems, setFilteredItems] = useState<PriceItem[]>([]);
  const [query, setQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [selected, setSelected] = useState<PriceItem | null>(null);
  const [loading, setLoading] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [query, selectedVendor, items]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, vendorsRes] = await Promise.all([
        fetch(`${API_BASE}/pricing/items`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/vendors`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setItems(itemsData);
      }

      if (vendorsRes.ok) {
        const vendorsData = await vendorsRes.json();
        setVendors(vendorsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    // Filter by vendor
    if (selectedVendor !== 'all') {
      filtered = filtered.filter(item => item.vendorId === selectedVendor);
    }

    // Filter by search query
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.sku.toLowerCase().includes(searchTerm) ||
          item.description?.toLowerCase().includes(searchTerm) ||
          (item.tags || []).some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Exclude already selected items
    const selectedIds = selectedItems.map(item => item._id);
    filtered = filtered.filter(item => !selectedIds.includes(item._id));

    setFilteredItems(filtered);
  };

  const handleSelectItem = (item: PriceItem) => {
    const selectedItem: SelectedItem = {
      ...item,
      quantity: 1,
    };
    onItemSelect(selectedItem);
    setSelected(null);
    setQuery('');
  };

  const calculateSellPrice = (item: PriceItem) => {
    return item.baseCost * (1 + (item.defaultMarginPct || 0) / 100);
  };

  return (
    <div className={className}>
      {/* Vendor Filter */}
      {showVendorFilter && vendors.length > 0 && (
        <div className="mb-4">
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            value={selectedVendor}
            onChange={e => setSelectedVendor(e.target.value)}
          >
            <option value="all">All Vendors</option>
            {vendors.map(vendor => (
              <option key={vendor._id} value={vendor._id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Item Search */}
      <Combobox value={selected} onChange={handleSelectItem}>
        <div className="relative">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-gray-700 text-left border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <Combobox.Input
              className="w-full border-none py-2 pl-10 pr-10 text-sm leading-5 text-gray-900 dark:text-white bg-transparent focus:ring-0 focus:outline-none"
              displayValue={(item: PriceItem | null) => item?.name || ''}
              onChange={event => setQuery(event.target.value)}
              placeholder={placeholder}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </Combobox.Button>
          </div>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {loading && (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                  Loading items...
                </div>
              )}

              {!loading && filteredItems.length === 0 && query !== '' && (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                  No items found.
                </div>
              )}

              {!loading &&
                filteredItems.map(item => (
                  <Combobox.Option
                    key={item._id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'
                      }`
                    }
                    value={item}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex justify-between">
                          <div className="flex-1">
                            <div
                              className={`block truncate font-medium ${selected ? 'font-medium' : 'font-normal'}`}
                            >
                              {item.name}
                            </div>
                            <div
                              className={`text-xs ${active ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                              SKU: {item.sku} • {item.unit}
                              {item.description && ` • ${item.description}`}
                            </div>
                          </div>
                          <div
                            className={`text-sm ${active ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}
                          >
                            ${calculateSellPrice(item).toFixed(2)}
                          </div>
                        </div>

                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-white' : 'text-blue-600'
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>

      {/* Selected Items Summary */}
      {selectedItems.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Selected Items ({selectedItems.length})
          </h4>
          <div className="space-y-2">
            {selectedItems.slice(0, 3).map(item => (
              <div key={item._id} className="flex justify-between items-center text-sm">
                <span className="text-gray-900 dark:text-white">
                  {item.quantity}× {item.name}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  ${((item.customPrice || calculateSellPrice(item)) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            {selectedItems.length > 3 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                +{selectedItems.length - 3} more items...
              </div>
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-gray-900 dark:text-white">Total:</span>
              <span className="text-gray-900 dark:text-white">
                $
                {selectedItems
                  .reduce(
                    (sum, item) =>
                      sum + (item.customPrice || calculateSellPrice(item)) * item.quantity,
                    0
                  )
                  .toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
