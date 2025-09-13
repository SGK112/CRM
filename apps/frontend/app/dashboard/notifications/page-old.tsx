'use client';

import { useState, useEffect } from 'react';
import { 
  BellIcon, 
  CheckIcon, 
  EyeIcon, 
  EnvelopeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  clientId?: string;
  clientName?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'system' | 'client' | 'estimate' | 'payment' | 'email' | 'project';
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'estimate_viewed':
    case 'estimate_created':
      return DocumentTextIcon;
    case 'email':
    case 'email_sent':
      return EnvelopeIcon;
    case 'client_message':
    case 'client_update':
      return UserGroupIcon;
    case 'payment':
    case 'invoice_paid':
      return CreditCardIcon;
    case 'system_alert':
    case 'error':
      return ExclamationTriangleIcon;
    case 'project_update':
      return ClockIcon;
    default:
      return BellIcon;
  }
};

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'urgent':
      return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
    case 'high':
      return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'low':
    default:
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300';
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
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch('/api/notifications', {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        // Failed to fetch notifications - continue with empty array
        setNotifications([]);
      }
    } catch (error) {
      // Error fetching notifications - continue with empty array
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ read: true }),
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
      }
    } catch (error) {
      // Error marking notification as read - silently fail
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers,
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      // Error marking all notifications as read - silently fail
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      // Error deleting notification - silently fail
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesReadFilter = filter === 'all' || 
      (filter === 'unread' && !notification.read) ||
      (filter === 'read' && notification.read);
    
    const matchesCategoryFilter = categoryFilter === 'all' || 
      notification.category === categoryFilter ||
      notification.type.includes(categoryFilter);
    
    return matchesReadFilter && matchesCategoryFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const categories = ['all', 'system', 'client', 'estimate', 'payment', 'email', 'project'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 max-w-md mx-auto text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Loading Notifications...</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Fetching your latest updates...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center">
                  <BellIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Notifications
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchNotifications}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200 disabled:opacity-50"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Refresh
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Mark All Read
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter:</span>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All ({notifications.length})</option>
                  <option value="unread">Unread ({unreadCount})</option>
                  <option value="read">Read ({notifications.length - unreadCount})</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
              <div className="text-center py-12">
                <BellIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {filter === 'unread' 
                    ? "You're all caught up! No new notifications to review."
                    : "You don't have any notifications yet."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map(notification => {
                const IconComponent = getNotificationIcon(notification.type);
                const priorityClasses = getPriorityColor(notification.priority);
                
                return (
                  <div
                    key={notification.id}
                    className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg border transition-all duration-200 hover:shadow-xl hover:scale-[1.01] ${
                      !notification.read 
                        ? 'border-l-4 border-l-blue-500 border-slate-200 dark:border-slate-600 bg-blue-50/50 dark:bg-blue-950/20' 
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-4 p-6">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${priorityClasses}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-medium ${!notification.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{notification.message}</p>
                            {notification.clientName && (
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                Client: {notification.clientName}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-slate-500 whitespace-nowrap">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                                  title="Mark as read"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                                title="Delete notification"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
