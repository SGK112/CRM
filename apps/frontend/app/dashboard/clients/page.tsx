'use client';

import {
    ArrowPathIcon,
    BellIcon,
    ChatBubbleLeftRightIcon,
    ClockIcon,
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
    CheckCircleIcon as CheckCircleIconSolid
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ClientData {
  _id?: string;
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: string;
  contactType?: string;
  company?: string;
  totalProjects?: number;
  totalValue?: number;
  lastContact?: string;
  updatedAt?: string;
  unreadNotifications?: number;
  quickbooksSynced?: boolean;
  estimatesSent?: number;
  estimatesViewed?: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'lead';
  contactType?: 'client' | 'subcontractor' | 'vendor' | 'contributor' | 'team';
  projectsCount: number;
  totalValue: number;
  lastContact?: string;
  unreadNotifications?: number;
  quickbooksSynced?: boolean;
  estimatesSent?: number;
  estimatesViewed?: number;
  lastEstimateViewed?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
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

export default function ContactsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const loadData = async () => {
    if (!refreshing) setLoading(true);

    try {
      // Load clients from API
      const clientsResponse = await fetch('/api/clients');
      const clientsData = await clientsResponse.json();

      // Load notifications
      const notificationsResponse = await fetch('/api/notifications');
      const notificationsData = await notificationsResponse.json();

      const processedClients = (clientsData.clients || []).map((client: ClientData) => ({
        id: client._id || client.id || '',
        name: client.name || `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Unnamed Contact',
        email: client.email || '',
        phone: client.phone || '',
        status: (client.status || 'active') as Client['status'],
        contactType: client.contactType as Client['contactType'] || 'client',
        projectsCount: client.totalProjects || 0,
        totalValue: client.totalValue || 0,
        lastContact: client.lastContact || client.updatedAt,
        unreadNotifications: client.unreadNotifications || 0,
        quickbooksSynced: client.quickbooksSynced || false,
        estimatesSent: client.estimatesSent || 0,
        estimatesViewed: client.estimatesViewed || 0,
        firstName: client.firstName,
        lastName: client.lastName,
        company: client.company,
      }));

      setClients(processedClients);
      setNotifications(notificationsData.notifications || []);
    } catch (error) {
      // Enhanced fallback data
      setClients([
        {
          id: '1',
          name: 'Johnson Family',
          email: 'contact@johnsonfamily.com',
          phone: '(555) 123-4567',
          status: 'active',
          contactType: 'client',
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
          contactType: 'subcontractor',
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
          contactType: 'vendor',
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
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show success message and handle newly created contacts
  useEffect(() => {
    const created = searchParams?.get?.('created');
    
    if (created === 'true') {
      setShowSuccessMessage(true);
      // Auto-hide success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
        router.replace('/dashboard/clients'); // Clean URL
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  // Fetch newly created contact and update the list
  useEffect(() => {
    const createdId = searchParams?.get?.('createdId');
    if (!createdId) return;

    const fetchCreated = async () => {
      try {
        const res = await fetch(`/api/clients/${createdId}`);
        if (!res.ok) {
          // If individual fetch fails, refresh the whole list
          await loadData();
          return;
        }
        const data = await res.json();
        
        const newContact: Client = {
          id: data._id || data.id || createdId,
          name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'New Contact',
          email: data.email || '',
          phone: data.phone || '',
          status: (data.status || 'active') as Client['status'],
          contactType: data.contactType || 'client',
          projectsCount: data.totalProjects || 0,
          totalValue: data.totalValue || 0,
          lastContact: data.lastContact || data.updatedAt || new Date().toISOString(),
          unreadNotifications: 0,
          firstName: data.firstName,
          lastName: data.lastName,
          company: data.company,
        };

        // Don't duplicate if already in list
        setClients(prev => {
          const exists = prev.some(c => c.id === newContact.id);
          return exists ? prev : [newContact, ...prev];
        });

        // Clean the URL
        router.replace('/dashboard/clients');
      } catch (e) {
        // Fallback to full refresh
        await loadData();
      }
    };

    fetchCreated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]);

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
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
      // Handle error silently
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
      // Handle error silently
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    leads: clients.filter(c => c.status === 'lead').length,
    totalValue: clients.reduce((sum, c) => sum + c.totalValue, 0),
    totalNotifications: unreadNotifications,
    estimatesViewed: clients.reduce((sum, c) => sum + (c.estimatesViewed || 0), 0),
    clients: clients.filter(c => c.contactType === 'client').length,
    subcontractors: clients.filter(c => c.contactType === 'subcontractor').length,
    vendors: clients.filter(c => c.contactType === 'vendor').length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIconSolid className="h-4 w-4 text-green-500" />;
      case 'lead': return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'inactive': return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default: return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'client': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'subcontractor': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'vendor': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'contributor': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'team': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Success Message Banner */}
      {showSuccessMessage && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircleIconSolid className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Contact Created Successfully!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                  Your new contact has been added and all integrations are being set up.
                </p>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="text-green-400 hover:text-green-600 dark:hover:text-green-300"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-First Header */}
      <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <UserGroupIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Contacts
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {stats.total} total contacts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <BellIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Add Contact */}
              <Link
                href="/dashboard/clients/new"
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Add Contact</span>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:bg-white dark:focus:bg-slate-700 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-x-0 top-24 z-50 mx-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-80">
              {notifications.length > 0 ? (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                        !notification.read ? 'bg-orange-50 dark:bg-orange-900/10' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm text-slate-900 dark:text-white">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <button
                                onClick={() => markNotificationRead(notification.id)}
                                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                              >
                                Mark Read
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <BellIcon className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">No notifications yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile-First Stats Grid */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Active</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.leads}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Leads</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.clients}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Clients</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.vendors}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Vendors</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">${(stats.totalValue / 1000).toFixed(0)}k</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Value</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>

          <div className="text-sm text-slate-600 dark:text-slate-400">
            {filteredClients.length} of {stats.total} contacts
          </div>
        </div>

        {/* Contact Cards Grid */}
        {filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                {/* Contact Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                      {client.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(client.status)}
                      <span className={`text-xs font-medium capitalize ${
                        client.status === 'active' ? 'text-green-600' :
                        client.status === 'lead' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {client.status}
                      </span>
                      {client.contactType && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContactTypeColor(client.contactType)}`}>
                          {client.contactType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <EnvelopeIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{client.email || 'No email'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <PhoneIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{client.phone || 'No phone'}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{client.projectsCount}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      ${(client.totalValue / 1000).toFixed(0)}k
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Value</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => sendNotification(client.id, 'email', 'Following up on your project...')}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium transition-colors"
                    >
                      <EnvelopeIcon className="h-4 w-4" />
                      Email
                    </button>

                    <button
                      onClick={() => sendNotification(client.id, 'sms', 'Hi! Just checking in on your project.')}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium transition-colors"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      SMS
                    </button>
                  </div>

                  <Link
                    href={`/dashboard/clients/${client.id}`}
                    className="w-full text-center px-3 py-2 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    View Details
                  </Link>
                </div>

                {/* Last Contact & Notifications */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500">
                    {client.lastContact ? `Last: ${new Date(client.lastContact).toLocaleDateString()}` : 'Never contacted'}
                  </span>
                  {client.unreadNotifications && client.unreadNotifications > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full font-medium">
                      <BellIcon className="h-3 w-3" />
                      {client.unreadNotifications}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserGroupIcon className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {searchTerm ? 'No contacts found' : 'No contacts yet'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first contact'}
            </p>
            {!searchTerm && (
              <Link
                href="/dashboard/clients/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                Add Your First Contact
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
