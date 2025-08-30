'use client';

import { useState } from 'react';

interface BulkActionsProps {
  selectedUserIds: string[];
  onActionComplete: () => void;
  onClearSelection: () => void;
}

export default function BulkActions({ selectedUserIds, onActionComplete, onClearSelection }: BulkActionsProps) {
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'suspend' | 'activate' | 'delete' | 'update-plan' | ''>('');
  const [selectedPlan, setSelectedPlan] = useState('');

  const handleBulkAction = async () => {
    if (!selectedAction || selectedUserIds.length === 0) {
      alert('Please select an action and users');
      return;
    }

    const confirmed = confirm(`Are you sure you want to ${selectedAction} ${selectedUserIds.length} user(s)?`);
    if (!confirmed) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      const requestBody: any = {
        userIds: selectedUserIds,
        action: selectedAction
      };

      if (selectedAction === 'update-plan' && selectedPlan) {
        requestBody.data = { subscriptionPlan: selectedPlan };
      }

      const response = await fetch('/api/admin/bulk-actions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      
      alert(`Bulk action completed: ${result.summary.successful} successful, ${result.summary.failed} failed`);
      
      // Reset form
      setSelectedAction('');
      setSelectedPlan('');
      onClearSelection();
      onActionComplete();
    } catch (error) {
      console.error('Bulk action failed:', error);
      alert(`Bulk action failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (selectedUserIds.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Bulk Actions ({selectedUserIds.length} users selected)
        </h3>
        <p className="text-blue-700 text-sm">
          Select an action to perform on all selected users.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-2">Action</label>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value as any)}
            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            disabled={loading}
          >
            <option value="">Select action...</option>
            <option value="activate">Activate Users</option>
            <option value="suspend">Suspend Users</option>
            <option value="update-plan">Update Subscription Plan</option>
            <option value="delete">Delete Users (Dangerous!)</option>
          </select>
        </div>

        {selectedAction === 'update-plan' && (
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">New Plan</label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              disabled={loading}
            >
              <option value="">Select plan...</option>
              <option value="basic">Basic Plan</option>
              <option value="professional">Professional Plan</option>
              <option value="enterprise">Enterprise Plan</option>
            </select>
          </div>
        )}

        <div className="flex items-end space-x-2">
          <button
            onClick={handleBulkAction}
            disabled={loading || !selectedAction || (selectedAction === 'update-plan' && !selectedPlan)}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium flex-1"
          >
            {loading ? 'Processing...' : 'Execute Action'}
          </button>
          <button
            onClick={onClearSelection}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Action Descriptions */}
      <div className="text-sm text-blue-700 space-y-1">
        {selectedAction === 'activate' && (
          <p>✅ This will activate all selected user accounts, allowing them to log in and use the system.</p>
        )}
        {selectedAction === 'suspend' && (
          <p>⚠️ This will suspend all selected user accounts, preventing them from accessing the system.</p>
        )}
        {selectedAction === 'update-plan' && (
          <p>💳 This will update the subscription plan for all selected users.</p>
        )}
        {selectedAction === 'delete' && (
          <p>🚨 <strong>WARNING:</strong> This will permanently delete all selected user accounts and their data. This action cannot be undone!</p>
        )}
      </div>
    </div>
  );
}
