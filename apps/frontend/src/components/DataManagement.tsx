'use client';

import { showNotification } from '@/components/NotificationBanner';
import {
    ArchiveBoxIcon,
    BellIcon,
    CalendarIcon,
    ClockIcon,
    CloudArrowDownIcon,
    CurrencyDollarIcon,
    DocumentIcon,
    ExclamationTriangleIcon,
    FolderIcon,
    PhotoIcon,
    ShieldCheckIcon,
    TrashIcon,
    UsersIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

interface DataStats {
  total: number;
  selected: number;
  size?: string;
}

interface DataCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  stats: DataStats;
  hasDemo: boolean;
  lastActivity?: string;
}

export default function DataManagement() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<'delete' | 'archive' | 'organize' | ''>('');
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Mock data - in real implementation, this would come from API
  const dataCategories: DataCategory[] = [
    {
      id: 'notifications',
      name: 'Notifications',
      icon: BellIcon,
      description: 'System notifications, alerts, and messages',
      stats: { total: 156, selected: 0, size: '2.3 MB' },
      hasDemo: true,
      lastActivity: '2 hours ago'
    },
    {
      id: 'contacts',
      name: 'Contact Cards',
      icon: UsersIcon,
      description: 'Client information, leads, and business contacts',
      stats: { total: 48, selected: 0, size: '5.7 MB' },
      hasDemo: true,
      lastActivity: '1 day ago'
    },
    {
      id: 'invoices',
      name: 'Invoices',
      icon: CurrencyDollarIcon,
      description: 'Billing documents and payment records',
      stats: { total: 23, selected: 0, size: '12.1 MB' },
      hasDemo: true,
      lastActivity: '3 days ago'
    },
    {
      id: 'estimates',
      name: 'Estimates',
      icon: DocumentIcon,
      description: 'Project quotes and pricing proposals',
      stats: { total: 31, selected: 0, size: '8.4 MB' },
      hasDemo: true,
      lastActivity: '1 day ago'
    },
    {
      id: 'appointments',
      name: 'Appointments',
      icon: CalendarIcon,
      description: 'Scheduled meetings and calendar events',
      stats: { total: 67, selected: 0, size: '1.9 MB' },
      hasDemo: true,
      lastActivity: '6 hours ago'
    },
    {
      id: 'projects',
      name: 'Projects',
      icon: FolderIcon,
      description: 'Project files, timelines, and documentation',
      stats: { total: 14, selected: 0, size: '45.2 MB' },
      hasDemo: false,
      lastActivity: '2 days ago'
    },
    {
      id: 'media',
      name: 'Media Files',
      icon: PhotoIcon,
      description: 'Images, documents, and uploaded files',
      stats: { total: 89, selected: 0, size: '127.8 MB' },
      hasDemo: true,
      lastActivity: '1 day ago'
    },
    {
      id: 'designs',
      name: 'Designs',
      icon: PhotoIcon,
      description: 'Design templates and revisions',
      stats: { total: 12, selected: 0, size: '28.3 MB' },
      hasDemo: false,
      lastActivity: '5 days ago'
    }
  ];

  const [categories, setCategories] = useState(dataCategories);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map(cat => cat.id));
    }
  };

  const handleActionSelect = (action: 'delete' | 'archive' | 'organize') => {
    if (selectedCategories.length === 0) {
      showNotification.error({
        title: 'No Selection',
        message: 'Please select at least one data category'
      });
      return;
    }
    setSelectedAction(action);
    setConfirmAction(action);
  };

  const executeAction = async () => {
    if (!selectedAction || selectedCategories.length === 0) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/data-management/bulk-action', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: selectedAction,
          categories: selectedCategories,
          includeDemo: true // Option to include demo data
        }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification.success({
          title: 'Success',
          message: `Successfully ${selectedAction}d ${selectedCategories.length} data categories`
        });

        // Update local state to reflect changes
        if (selectedAction === 'delete') {
          setCategories(prev =>
            prev.map(cat =>
              selectedCategories.includes(cat.id)
                ? { ...cat, stats: { ...cat.stats, total: 0 } }
                : cat
            )
          );
        }

        setSelectedCategories([]);
        setSelectedAction('');
      } else {
        showNotification.error({
          title: 'Action Failed',
          message: data.message || 'Failed to execute action'
        });
      }
    } catch (error) {
      showNotification.error({
        title: 'Action Failed',
        message: 'Failed to execute action'
      });
    } finally {
      setLoading(false);
      setConfirmAction(null);
    }
  };

  const executeResetAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/dev/reset-all-data', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        showNotification.success({
          title: 'Data Reset',
          message: 'All data has been reset successfully'
        });
        // Reset all categories
        setCategories(prev =>
          prev.map(cat => ({ ...cat, stats: { ...cat.stats, total: 0 } }))
        );
        setSelectedCategories([]);
      } else {
        showNotification.error({
          title: 'Reset Failed',
          message: data.message || 'Failed to reset data'
        });
      }
    } catch (error) {
      showNotification.error({
        title: 'Reset Failed',
        message: 'Failed to reset data. This feature may require admin permissions.'
      });
    } finally {
      setLoading(false);
      setConfirmAction(null);
    }
  };

  const exportData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/data-management/export', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categories: selectedCategories.length > 0 ? selectedCategories : categories.map(c => c.id),
          format: 'json'
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crm-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showNotification.success({
          title: 'Export Complete',
          message: 'Data exported successfully'
        });
      } else {
        showNotification.error({
          title: 'Export Failed',
          message: 'Failed to export data'
        });
      }
    } catch (error) {
      showNotification.error({
        title: 'Export Failed',
        message: 'Failed to export data'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalStats = () => {
    const selected = categories.filter(cat => selectedCategories.includes(cat.id));
    return {
      totalItems: selected.reduce((sum, cat) => sum + cat.stats.total, 0),
      totalSize: selected.reduce((sum, cat) => {
        const size = parseFloat(cat.stats.size?.replace(/[^\d.]/g, '') || '0');
        return sum + size;
      }, 0).toFixed(1)
    };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text)] mb-4">
          Data Management Center
        </h3>
        <p className="text-sm text-gray-600 dark:text-[var(--text-dim)] mb-6">
          Organize, archive, or delete your CRM data. Select categories below to perform bulk actions.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-center">
            <FolderIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Total Categories</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{categories.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <div className="flex items-center">
            <DocumentIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-300">Total Items</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                {categories.reduce((sum, cat) => sum + cat.stats.total, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
          <div className="flex items-center">
            <CloudArrowDownIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-purple-900 dark:text-purple-300">Selected Items</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{stats.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-orange-900 dark:text-orange-300">Data Size</p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{stats.totalSize} MB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
        <button
          onClick={handleSelectAll}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
        >
          <FolderIcon className="h-4 w-4 mr-2" />
          {selectedCategories.length === categories.length ? 'Deselect All' : 'Select All'}
        </button>

        <button
          onClick={() => handleActionSelect('organize')}
          disabled={selectedCategories.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <FolderIcon className="h-4 w-4 mr-2" />
          Organize ({selectedCategories.length})
        </button>

        <button
          onClick={() => handleActionSelect('archive')}
          disabled={selectedCategories.length === 0}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <ArchiveBoxIcon className="h-4 w-4 mr-2" />
          Archive ({selectedCategories.length})
        </button>

        <button
          onClick={() => handleActionSelect('delete')}
          disabled={selectedCategories.length === 0}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <TrashIcon className="h-4 w-4 mr-2" />
          Delete ({selectedCategories.length})
        </button>

        <button
          onClick={exportData}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <CloudArrowDownIcon className="h-4 w-4 mr-2" />
          Export Data
        </button>
      </div>

      {/* Data Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const IconComponent = category.icon;
          const isSelected = selectedCategories.includes(category.id);

          return (
            <div
              key={category.id}
              onClick={() => handleCategoryToggle(category.id)}
              className={`cursor-pointer border-2 rounded-lg p-4 transition-all duration-200 hover:shadow-lg ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <IconComponent className={`h-6 w-6 mr-3 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                  <div>
                    <h4 className={`font-medium ${isSelected ? 'text-blue-900 dark:text-blue-300' : 'text-gray-900 dark:text-[var(--text)]'}`}>
                      {category.name}
                    </h4>
                    {category.hasDemo && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Has Demo Data
                      </span>
                    )}
                  </div>
                </div>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-[var(--text-dim)] mb-3">
                {category.description}
              </p>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700 dark:text-[var(--text)]">
                  {category.stats.total} items
                </span>
                <span className="text-gray-500 dark:text-[var(--text-dim)]">
                  {category.stats.size}
                </span>
              </div>

              {category.lastActivity && (
                <div className="mt-2 text-xs text-gray-500 dark:text-[var(--text-dim)]">
                  Last activity: {category.lastActivity}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Advanced Options Toggle */}
      <div className="border-t pt-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-sm font-medium text-gray-700 dark:text-[var(--text)] hover:text-gray-900 dark:hover:text-white"
        >
          <ShieldCheckIcon className="h-4 w-4 mr-2" />
          Advanced Data Operations
          <svg
            className={`ml-2 h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAdvanced && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <h4 className="font-medium text-red-900 dark:text-red-300 mb-2 flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              Danger Zone
            </h4>
            <p className="text-sm text-red-700 dark:text-red-400 mb-4">
              These actions are irreversible and will permanently delete all data.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setConfirmAction('reset-all')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Reset All CRM Data
              </button>

              <div className="text-xs text-red-600 dark:text-red-400">
                This will delete ALL contacts, projects, invoices, estimates, appointments, and uploaded files.
                Only your user account will remain.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text)]">
                Confirm {confirmAction === 'reset-all' ? 'Reset All Data' : `${confirmAction} Action`}
              </h3>
            </div>

            <p className="text-sm text-gray-600 dark:text-[var(--text-dim)] mb-6">
              {confirmAction === 'reset-all'
                ? 'This will permanently delete ALL your CRM data including contacts, projects, invoices, estimates, appointments, and files. This action cannot be undone.'
                : `Are you sure you want to ${confirmAction} the selected data categories? This action ${confirmAction === 'delete' ? 'cannot be undone' : 'can be reversed later'}.`
              }
            </p>

            {confirmAction !== 'reset-all' && selectedCategories.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <p className="text-sm font-medium text-gray-700 dark:text-[var(--text)] mb-2">
                  Selected categories:
                </p>
                <ul className="text-sm text-gray-600 dark:text-[var(--text-dim)]">
                  {selectedCategories.map(id => {
                    const cat = categories.find(c => c.id === id);
                    return cat ? (
                      <li key={id}>• {cat.name} ({cat.stats.total} items)</li>
                    ) : null;
                  })}
                </ul>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction === 'reset-all' ? executeResetAllData : executeAction}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {confirmAction === 'reset-all' ? 'Reset All Data' : `Confirm ${confirmAction}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
