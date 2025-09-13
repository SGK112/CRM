'use client';

import { ArrowPathIcon, BellIcon, CheckIcon, ExclamationCircleIcon, InformationCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  clientId?: string;
  clientName?: string;
  priority: string;
  category: string;
  relatedId?: string;
  relatedType?: string;
  metadata?: Record<string, unknown>;
}

const getNotificationIcon = (type: string, priority?: string) => {
  if (priority === 'urgent' || type === 'error') {
    return ExclamationCircleIcon;
  }
  return InformationCircleIcon;
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'high':
      return 'text-brand-600 bg-brand-50 border-brand-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low':
    default:
      return 'text-blue-600 bg-blue-50 border-blue-200';
  }
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return time.toLocaleDateString();
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setError(null);
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (error) {
      // Error fetching notifications - silently fail for user experience
      setError('Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif
          )
        );
        // Refresh sidebar counts if function exists
        const windowWithRefresh = window as Window & { refreshSidebarCounts?: () => void };
        if (typeof window !== 'undefined' && windowWithRefresh.refreshSidebarCounts) {
          windowWithRefresh.refreshSidebarCounts();
        }
      }
    } catch (error) {
      // Error marking notification as read - silently fail for user experience
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, read: true }))
        );
        // Refresh sidebar counts if function exists
        const windowWithRefresh = window as Window & { refreshSidebarCounts?: () => void };
        if (typeof window !== 'undefined' && windowWithRefresh.refreshSidebarCounts) {
          windowWithRefresh.refreshSidebarCounts();
        }
      }
    } catch (error) {
      // Error marking all notifications as read - silently fail for user experience
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
        // Refresh sidebar counts if function exists
        const windowWithRefresh = window as Window & { refreshSidebarCounts?: () => void };
        if (typeof window !== 'undefined' && windowWithRefresh.refreshSidebarCounts) {
          windowWithRefresh.refreshSidebarCounts();
        }
      }
    } catch (error) {
      // Error deleting notification - silently fail for user experience
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const filteredNotifs = getFilteredNotifications();
    const allSelected = filteredNotifs.every(n => selectedNotifications.includes(n.id));

    if (allSelected) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifs.map(n => n.id));
    }
  };

  const deleteSelected = async () => {
    for (const id of selectedNotifications) {
      await deleteNotification(id);
    }
    setSelectedNotifications([]);
  };

  const markSelectedAsRead = async () => {
    for (const id of selectedNotifications) {
      await markAsRead(id);
    }
    setSelectedNotifications([]);
  };

  const getFilteredNotifications = () => {
    return notifications.filter(notification => {
      const matchesReadFilter = filter === 'all' ||
        (filter === 'read' && notification.read) ||
        (filter === 'unread' && !notification.read);

      const matchesCategory = categoryFilter === 'all' || notification.category === categoryFilter;

      return matchesReadFilter && matchesCategory;
    });
  };

  const categories = Array.from(new Set(notifications.map(n => n.category).filter(Boolean)));
  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading notifications</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchNotifications}
                className="mt-3 text-sm font-medium text-red-800 hover:text-red-900"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-700 dark:text-brand-400 mb-2">
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Stay updated with your CRM activities and client interactions
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
              {unreadCount} unread
            </span>
          )}
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CheckIcon className="h-4 w-4 mr-2" />
            Mark All Read
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
              {(['all', 'unread', 'read'] as const).map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    filter === filterOption
                      ? 'bg-brand-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                  {filterOption === 'unread' && unreadCount > 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-500 text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedNotifications.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedNotifications.length} selected
              </span>
              <button
                onClick={markSelectedAsRead}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Mark as Read
              </button>
              <button
                onClick={deleteSelected}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedNotifications([])}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No notifications found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'all' ? "You don't have any notifications yet." : `No ${filter} notifications to show.`}
            </p>
          </div>
        ) : (
          <>
            {filteredNotifications.length > 1 && (
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleSelectAll}
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  {filteredNotifications.every(n => selectedNotifications.includes(n.id))
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
              </div>
            )}

            {filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type, notification.priority);
              const isSelected = selectedNotifications.includes(notification.id);

              return (
                <div
                  key={notification.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg border transition-all duration-200 ${
                    notification.read
                      ? 'border-gray-200 dark:border-gray-700'
                      : 'border-brand-200 dark:border-brand-700 bg-brand-50/50 dark:bg-brand-900/10'
                  } ${isSelected ? 'ring-2 ring-brand-500' : ''}`}
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelection(notification.id)}
                          className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className={`flex-shrink-0 ${getPriorityColor(notification.priority)} rounded-lg p-2`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`text-lg font-medium ${
                              notification.read
                                ? 'text-gray-900 dark:text-gray-100'
                                : 'text-brand-900 dark:text-brand-100'
                            }`}>
                              {notification.title}
                            </h3>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                              {notification.message}
                            </p>

                            <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>{formatTimeAgo(notification.timestamp)}</span>
                              {notification.category && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                                  {notification.category}
                                </span>
                              )}
                              {notification.clientName && (
                                <span>Client: {notification.clientName}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-brand-600 hover:text-brand-700 p-2 rounded-lg hover:bg-brand-50"
                                title="Mark as read"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                              title="Delete notification"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
