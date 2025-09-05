'use client';

import { simple } from '@/lib/simple-ui';
import {
    ArrowPathIcon,
    BellIcon,
    BuildingStorefrontIcon,
    ChatBubbleLeftRightIcon,
    ClockIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    EnvelopeIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    PhoneIcon,
    PlusIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import {
    BellIcon as BellIconSolid,
    CheckCircleIcon as CheckCircleIconSolid
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CreateContactSlideOver from '../../../src/components/clients/CreateContactSlideOver';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'lead';
  projectsCount: number;
  totalValue: number;
  lastContact?: string;
  unreadNotifications?: number;
  quickbooksSynced?: boolean;
  estimatesSent?: number;
  estimatesViewed?: number;
  lastEstimateViewed?: string;
}

interface Notification {
  id: string;
  type: 'email' | 'sms' | 'estimate_viewed' | 'estimate_read';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  clientId?: string;
  clientName?: string;
}

export default function ClientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [syncingClient, setSyncingClient] = useState<string | null>(null);
  const [showCreateSlideOver, setShowCreateSlideOver] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // If we were redirected back after creating a new contact, fetch it and prepend
  useEffect(() => {
    const createdId = searchParams?.get?.('createdId');
    if (!createdId) return;

    const fetchCreated = async () => {
      try {
        const res = await fetch(`/api/clients/${createdId}`);
        if (!res.ok) return;
        const data = await res.json();
        // Don't duplicate if already in list
        setClients(prev => (prev.some(c => c.id === data.id || c.id === data._id) ? prev : [{
          id: data._id || data.id,
          name: `${data.firstName ? data.firstName + ' ' : ''}${data.lastName ?? ''}`.trim() || data.name || 'New Contact',
          email: data.email || '',
          phone: data.phone || '',
          status: String((data as unknown as { status?: string }).status || 'active') as Client['status'],
          projectsCount: data.totalProjects || 0,
          totalValue: data.totalValue || 0,
          lastContact: data.lastContact || data.updatedAt || new Date().toISOString(),
          unreadNotifications: 0,
        }, ...prev]));

        // Clean the URL
        router.replace('/dashboard/clients');
      } catch (e) {
        // ignore
      }
    };

    fetchCreated();
  }, [searchParams, router]);

  const loadData = async () => {
    setLoading(true);

    try {
      // Load clients from API
      const clientsResponse = await fetch('/api/clients');
      const clientsData = await clientsResponse.json();

      // Load notifications
      const notificationsResponse = await fetch('/api/notifications');
      const notificationsData = await notificationsResponse.json();

      setClients(clientsData.clients || []);
      setNotifications(notificationsData.notifications || []);
    } catch (error) {
      // Fallback to mock data
      setClients([
        {
          id: '1',
          name: 'Johnson Family',
          email: 'contact@johnsonfamily.com',
          phone: '(555) 123-4567',
          status: 'active',
          projectsCount: 2,
          totalValue: 45000,
          lastContact: '2024-09-03T10:30:00Z',
          unreadNotifications: 3,
          quickbooksSynced: true,
          estimatesSent: 2,
          estimatesViewed: 1,
          lastEstimateViewed: '2024-09-02T14:20:00Z'
        },
        {
          id: '2',
          name: 'Martinez Construction',
          email: 'info@martinezconstruction.com',
          phone: '(555) 234-5678',
          status: 'active',
          projectsCount: 1,
          totalValue: 28000,
          lastContact: '2024-09-01T09:15:00Z',
          unreadNotifications: 1,
          quickbooksSynced: false,
          estimatesSent: 1,
          estimatesViewed: 1,
          lastEstimateViewed: '2024-08-30T16:45:00Z'
        },
        {
          id: '3',
          name: 'Wilson Enterprises',
          email: 'hello@wilsonenterprises.com',
          phone: '(555) 345-6789',
          status: 'lead',
          projectsCount: 0,
          totalValue: 0,
          lastContact: '2024-08-28T11:00:00Z',
          unreadNotifications: 0,
          quickbooksSynced: false,
          estimatesSent: 0,
          estimatesViewed: 0
        }
      ]);

      setNotifications([
        {
          id: '1',
          type: 'estimate_viewed',
          title: 'Estimate Viewed',
          message: 'Johnson Family viewed your kitchen renovation estimate',
          timestamp: '2024-09-03T10:30:00Z',
          read: false,
          clientId: '1',
          clientName: 'Johnson Family'
        },
        {
          id: '2',
          type: 'email',
          title: 'Email Sent',
          message: 'Follow-up email sent to Martinez Construction',
          timestamp: '2024-09-01T09:15:00Z',
          read: true,
          clientId: '2',
          clientName: 'Martinez Construction'
        }
      ]);
    }

    setLoading(false);
  };

  const syncToQuickBooks = async (clientId: string) => {
    setSyncingClient(clientId);
    try {
      const response = await fetch(`/api/clients/${clientId}/sync-quickbooks`, {
        method: 'POST'
      });

      if (response.ok) {
        // Try to use returned client object to update state if provided
        const updated = await response.json().catch(() => null);
        if (updated && (updated._id || updated.id)) {
          const id = updated._id || updated.id;
          setClients(prev => prev.map(client => client.id === clientId ? ({
            id,
            name: updated.name || client.name,
            email: updated.email || client.email,
            phone: updated.phone || client.phone,
            status: (updated.status || client.status) as Client['status'],
            projectsCount: updated.totalProjects ?? client.projectsCount,
            totalValue: updated.totalValue ?? client.totalValue,
            lastContact: updated.lastContact ?? client.lastContact,
            unreadNotifications: updated.unreadNotifications ?? client.unreadNotifications,
            quickbooksSynced: updated.quickbooksSynced ?? true,
            estimatesSent: updated.estimatesSent ?? client.estimatesSent,
            estimatesViewed: updated.estimatesViewed ?? client.estimatesViewed,
          }) : client));
        } else {
          // Fallback: mark as synced
          setClients(prev => prev.map(client =>
            client.id === clientId
              ? { ...client, quickbooksSynced: true }
              : client
          ));
        }
      } else {
        // Server returned non-OK
      }
    } catch (error) {
      // network or parse error - ignore for now
    } finally {
      setSyncingClient(null);
    }
  };

  // Handle a created contact from the slide-over or the create page.
  // Prepend an optimistic item, then fetch the full record and replace it.
  const handleCreated = async (created: { id?: string; _id?: string; name?: string; firstName?: string; lastName?: string; email?: string; phone?: string; status?: string; totalProjects?: number; totalValue?: number }) => {
    const id = created._id || created.id || String(Date.now());
    const name = created.name || `${created.firstName || ''} ${created.lastName || ''}`.trim() || 'New Contact';

    const optimistic: Client = {
      id,
      name,
      email: created.email || '',
      phone: created.phone || '',
      status: (created.status || 'active') as Client['status'],
      projectsCount: created.totalProjects || 0,
      totalValue: created.totalValue || 0,
    };

    // Prepend optimistic entry
    setClients(prev => [optimistic, ...prev]);

    // Try to fetch authoritative record from API and replace optimistic
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (!res.ok) return;
      const full = await res.json();
      const fullId = full._id || full.id || id;
      const replaced: Client = {
        id: fullId,
        name: full.name || `${full.firstName || ''} ${full.lastName || ''}`.trim() || optimistic.name,
        email: full.email || optimistic.email,
        phone: full.phone || optimistic.phone,
        status: (full.status || optimistic.status) as Client['status'],
        projectsCount: full.totalProjects || optimistic.projectsCount || 0,
        totalValue: full.totalValue || optimistic.totalValue || 0,
        lastContact: full.lastContact || full.updatedAt || optimistic.lastContact,
        unreadNotifications: full.unreadNotifications ?? optimistic.unreadNotifications ?? 0,
        quickbooksSynced: full.quickbooksSynced ?? optimistic.quickbooksSynced,
        estimatesSent: full.estimatesSent ?? optimistic.estimatesSent,
        estimatesViewed: full.estimatesViewed ?? optimistic.estimatesViewed,
      };

      setClients(prev => prev.map(c => (c.id === optimistic.id ? replaced : c)));
    } catch (e) {
      // ignore - keep optimistic
    }
  };

  const sendNotification = async (clientId: string, type: 'email' | 'sms', message: string) => {
    try {
      const endpoint = type === 'email' ? '/api/communications/email' : '/api/communications/sms';
      const payload = type === 'email'
        ? { clientId, subject: 'Update from Remodely CRM', message }
        : { clientId, message };

      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Add notification to list
      const newNotification: Notification = {
        id: Date.now().toString(),
        type,
        title: `${type.toUpperCase()} Sent`,
        message: `Message sent to ${clients.find(c => c.id === clientId)?.name}`,
        timestamp: new Date().toISOString(),
        read: false,
        clientId,
        clientName: clients.find(c => c.id === clientId)?.name
      };

      setNotifications(prev => [newNotification, ...prev]);
    } catch (error) {
      // Handle error silently or show user feedback
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });

      setNotifications(prev => prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      // Handle error silently or show user feedback
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    leads: clients.filter(c => c.status === 'lead').length,
    totalValue: clients.reduce((sum, c) => sum + c.totalValue, 0),
    totalNotifications: unreadNotifications,
    estimatesViewed: clients.reduce((sum, c) => sum + (c.estimatesViewed || 0), 0)
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIconSolid className="h-4 w-4 text-green-500" />;
      case 'lead': return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'inactive': return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default: return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email': return <EnvelopeIcon className="h-4 w-4 text-blue-500" />;
      case 'sms': return <ChatBubbleLeftRightIcon className="h-4 w-4 text-green-500" />;
      case 'estimate_viewed': return <EyeIcon className="h-4 w-4 text-purple-500" />;
      case 'estimate_read': return <DocumentTextIcon className="h-4 w-4 text-indigo-500" />;
      default: return <BellIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className={simple.page()}>
        <div className={simple.loading.container}>
          <div className={`${simple.loading.spinner} h-8 w-8`} />
          <p className={simple.text.body('mt-4')}>Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={simple.page()}>
      {/* Header */}
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className={simple.text.title('flex items-center gap-3')}>
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
              Clients
            </h1>
            <p className={simple.text.body()}>Manage client relationships and communications</p>
          </div>
        </div>

  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Notifications Button */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={simple.button('secondary', 'relative flex items-center gap-2 w-full sm:w-auto')}
            aria-expanded={showNotifications}
          >
            <BellIcon className="h-4 w-4" />
            Notifications
            {unreadNotifications > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>

          <div>
            <button
              onClick={() => setShowCreateSlideOver(true)}
              className={simple.button('primary', 'flex items-center gap-2 w-full sm:w-auto')}
            >
              <PlusIcon className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>
      </div>

        <CreateContactSlideOver
          open={showCreateSlideOver}
          onClose={() => setShowCreateSlideOver(false)}
          onCreated={handleCreated}
        />

      {/* Notifications Panel */}
      {showNotifications && (
        <div className={`${simple.card('mb-6')} max-h-96 overflow-y-auto`}>
          <div className={simple.section()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={simple.text.subtitle('flex items-center gap-2')}>
                <BellIcon className="h-5 w-5" />
                Recent Notifications
              </h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      notification.read
                        ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <button
                            onClick={() => markNotificationRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={simple.empty.container}>
                <BellIcon className={simple.empty.icon} />
                <p className={simple.empty.description}>No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid - mobile-first stacked */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8`}>
        <div className={`${simple.card()} w-full`}>
          <div className={simple.section('flex items-center justify-between')}>
            <div>
              <p className={simple.text.small('mb-1')}>Total Clients</p>
              <p className={simple.text.title('text-2xl')}>{stats.total}</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-blue-600 opacity-80" />
          </div>
  </div>

  <div className={`${simple.card()} w-full`}>
          <div className={simple.section('flex items-center justify-between')}>
            <div>
              <p className={simple.text.small('mb-1')}>Active</p>
              <p className={simple.text.title('text-2xl')}>{stats.active}</p>
            </div>
            <CheckCircleIconSolid className="h-8 w-8 text-green-600 opacity-80" />
          </div>
  </div>

  <div className={`${simple.card()} w-full`}>
          <div className={simple.section('flex items-center justify-between')}>
            <div>
              <p className={simple.text.small('mb-1')}>Leads</p>
              <p className={simple.text.title('text-2xl')}>{stats.leads}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-600 opacity-80" />
          </div>
  </div>

  <div className={`${simple.card()} w-full`}>
          <div className={simple.section('flex items-center justify-between')}>
            <div>
              <p className={simple.text.small('mb-1')}>Total Value</p>
              <p className={simple.text.title('text-2xl')}>${(stats.totalValue / 1000).toFixed(0)}k</p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-green-600 opacity-80" />
          </div>
        </div>

        <div className={simple.card()}>
          <div className={simple.section('flex items-center justify-between')}>
            <div>
              <p className={simple.text.small('mb-1')}>Notifications</p>
              <p className={simple.text.title('text-2xl')}>{stats.totalNotifications}</p>
            </div>
            <BellIconSolid className="h-8 w-8 text-red-600 opacity-80" />
          </div>
        </div>

        <div className={`${simple.card()} w-full`}>
          <div className={simple.section('flex items-center justify-between')}>
            <div>
              <p className={simple.text.small('mb-1')}>Notifications</p>
              <p className={simple.text.title('text-2xl')}>{stats.totalNotifications}</p>
            </div>
            <BellIconSolid className="h-8 w-8 text-red-600 opacity-80" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={simple.input('pl-10')}
          />
        </div>

        <div className="flex gap-2">
          <button className={simple.button('secondary', 'flex items-center gap-2')}>
            <ArrowPathIcon className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Client List */}
      {filteredClients.length > 0 ? (
  // Mobile-first: single column by default, expand to two/three columns on larger screens
  <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4`}>
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className={simple.card('hover:scale-[1.02] transition-all duration-200 group')}
            >
              <div className={simple.section()}>
                {/* Client Header - stacked mobile-first */}
    <div className="flex flex-col sm:flex-row items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <h3 className={simple.text.subtitle('mb-1')}>{client.name}</h3>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(client.status)}
                      <span className={`text-xs font-medium capitalize ${
                        client.status === 'active' ? 'text-green-600' :
                        client.status === 'lead' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {client.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className={`${simple.spacing.xs} mb-4`}>
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                    <span className={simple.text.small()}>{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                    <span className={simple.text.small()}>{client.phone}</span>
                  </div>
                </div>

                {/* Stats and QuickBooks Status */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className={simple.text.small()}>Projects</span>
                    <p className="font-medium text-gray-900 dark:text-white">{client.projectsCount}</p>
                  </div>
                  <div>
                    <span className={simple.text.small()}>Value</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      ${client.totalValue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className={simple.text.small()}>Estimates</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {client.estimatesSent || 0} sent
                    </p>
                  </div>
                  <div>
                    <span className={simple.text.small()}>QuickBooks</span>
                    <div className="flex items-center gap-1">
                      {client.quickbooksSynced ? (
                        <>
                          <CheckCircleIconSolid className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-green-600">Synced</span>
                        </>
                      ) : (
                        <>
                          <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                          <span className="text-xs text-yellow-600">Not synced</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Last Activity */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className={simple.text.small()}>
                      Last contact: {client.lastContact ? new Date(client.lastContact).toLocaleDateString() : 'Never'}
                    </span>
                    {client.unreadNotifications && client.unreadNotifications > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full">
                        <BellIcon className="h-3 w-3" />
                        {client.unreadNotifications}
                      </span>
                    )}
                  </div>

                  {/* Quick Actions - mobile-first stacked buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-3">
                    <button
                      onClick={() => sendNotification(client.id, 'email', 'Following up on your project...')}
                      className="w-full sm:w-auto text-left px-3 py-2 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm flex items-center gap-2"
                    >
                      <EnvelopeIcon className="h-4 w-4 text-blue-600" />
                      <span>Send Email</span>
                    </button>

                    <button
                      onClick={() => sendNotification(client.id, 'sms', 'Hi! Just checking in on your project.')}
                      className="w-full sm:w-auto text-left px-3 py-2 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm flex items-center gap-2"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4 text-green-600" />
                      <span>Send SMS</span>
                    </button>

                    {!client.quickbooksSynced && (
                      <button
                        onClick={() => syncToQuickBooks(client.id)}
                        disabled={syncingClient === client.id}
                        className="w-full sm:w-auto text-left px-3 py-2 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm flex items-center gap-2 disabled:opacity-50"
                      >
                        {syncingClient === client.id ? (
                          <ArrowPathIcon className="h-4 w-4 animate-spin text-purple-600" />
                        ) : (
                          <BuildingStorefrontIcon className="h-4 w-4 text-purple-600" />
                        )}
                        <span>Sync QuickBooks</span>
                      </button>
                    )}
                  </div>

                  {/* Action Buttons - stacked on mobile */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className={`${simple.button('secondary', 'w-full sm:flex-1 text-center')}`}
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/dashboard/clients/${client.id}/estimates`}
                      className={`${simple.button('secondary', 'w-full sm:flex-1 text-center')}`}
                    >
                      Estimates
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={simple.empty.container}>
          <UserGroupIcon className={simple.empty.icon} />
          <h3 className={simple.empty.title}>
            {searchTerm ? 'No clients found' : 'No clients yet'}
          </h3>
          <p className={simple.empty.description}>
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first client'}
          </p>
          {!searchTerm && (
            <Link
              href="/dashboard/clients/new"
              className={simple.button('primary', 'inline-flex items-center gap-2')}
            >
              <PlusIcon className="h-4 w-4" />
              Add Your First Client
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
