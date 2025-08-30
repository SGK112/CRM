'use client';

import { useState, useEffect } from 'react';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  lastLoginAt?: string;
  createdAt?: string;
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    subscriptionStatus: '',
    page: 1
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: '20',
        ...(filters.search && { search: filters.search }),
        ...(filters.role && { role: filters.role }),
        ...(filters.subscriptionStatus && { subscriptionStatus: filters.subscriptionStatus })
      });
      
      const response = await fetch(`/api/admin/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data: UsersResponse = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
      setError('');
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate' | 'delete') => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      let url = '';
      let method = 'POST';

      switch (action) {
        case 'suspend':
          url = `/api/admin/users/${userId}/suspend`;
          break;
        case 'activate':
          url = `/api/admin/users/${userId}/activate`;
          break;
        case 'delete':
          url = `/api/admin/users/${userId}`;
          method = 'DELETE';
          break;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      // Refresh users list
      await fetchUsers();
      
      // Clear selections
      setSelectedUsers([]);
      
      alert(`User ${action}d successfully`);
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      alert(`Failed to ${action} user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleBulkAction = async (action: 'suspend' | 'activate' | 'delete') => {
    if (selectedUsers.length === 0) {
      alert('Please select users first');
      return;
    }

    const confirmed = confirm(`Are you sure you want to ${action} ${selectedUsers.length} user(s)?`);
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      const response = await fetch('/api/admin/bulk-actions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          action
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      
      // Refresh users list
      await fetchUsers();
      
      // Clear selections
      setSelectedUsers([]);
      
      alert(`Bulk action completed: ${result.summary.successful} successful, ${result.summary.failed} failed`);
    } catch (error) {
      console.error('Bulk action failed:', error);
      alert(`Bulk action failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedUsers(prev => 
      prev.length === users.length ? [] : users.map(user => user._id)
    );
  };

  if (loading && users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              placeholder="Search by name or email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="sales_associate">Sales Associate</option>
              <option value="project_manager">Project Manager</option>
              <option value="team_member">Team Member</option>
              <option value="client">Client</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subscription</label>
            <select
              value={filters.subscriptionStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, subscriptionStatus: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Subscriptions</option>
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="past_due">Past Due</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ search: '', role: '', subscriptionStatus: '', page: 1 })}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedUsers.length} user(s) selected
            </span>
            <div className="space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('suspend')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm font-medium"
              >
                Suspend
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={users.length > 0 && selectedUsers.length === users.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subscription
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => toggleUserSelection(user._id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 capitalize">
                    {user.subscriptionPlan || 'No Plan'}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {user.subscriptionStatus || 'Unknown'}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {user.lastLoginAt 
                    ? new Date(user.lastLoginAt).toLocaleDateString()
                    : 'Never'
                  }
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Edit
                    </button>
                    {user.isActive ? (
                      <button
                        onClick={() => handleUserAction(user._id, 'suspend')}
                        className="text-yellow-600 hover:text-yellow-900 text-sm font-medium"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUserAction(user._id, 'activate')}
                        className="text-green-600 hover:text-green-900 text-sm font-medium"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => handleUserAction(user._id, 'delete')}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
            <p className="text-gray-500">Try adjusting your search filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={!pagination.hasPrev}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm font-medium text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={!pagination.hasNext}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}
    </div>
  );
}
