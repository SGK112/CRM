'use client';

import {
    BellIcon,
    ChatBubbleLeftRightIcon,
    ClockIcon,
    DocumentTextIcon,
    EnvelopeIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    UserGroupIcon,
    Squares2X2Icon,
    ListBulletIcon,
    PhoneIcon,
    BuildingOfficeIcon
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

  const [user, setUser] = useState<{ id: number; name: string; firstName?: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'client' | 'subcontractor' | 'vendor' | 'lead'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        // Failed to parse user data
      }
    }
    
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
    
    loadData();
  }, [refreshing]);

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
          setRefreshing(true);
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
        setRefreshing(true);
      }
    };

    fetchCreated();
  }, [searchParams, router]);

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email': return <EnvelopeIcon className="h-4 w-4 text-blue-500" />;
      case 'sms': return <ChatBubbleLeftRightIcon className="h-4 w-4 text-green-500" />;
      case 'estimate_viewed': return <EyeIcon className="h-4 w-4 text-purple-500" />;
      case 'estimate_read': return <DocumentTextIcon className="h-4 w-4 text-indigo-500" />;
      default: return <BellIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = activeTab === 'all' || 
      (activeTab === 'lead' && client.status === 'lead') ||
      (activeTab !== 'lead' && client.contactType === activeTab);
    
    return matchesSearch && matchesFilter;
  });

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-black border-b border-slate-800">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Contacts</h1>
              <p className="text-sm text-slate-400">
                Hey {user?.firstName || 'there'}, you have {stats.active} active contacts
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 bg-slate-900 rounded-lg border border-slate-800"
              >
                <BellIcon className="w-5 h-5 text-white" />
                {unreadNotifications > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-black">{unreadNotifications}</span>
                  </div>
                )}
              </button>

              {/* Add Contact */}
              <Link
                href="/dashboard/clients/new/enhanced"
                className="inline-flex items-center px-4 py-2 bg-amber-500 text-black text-sm font-medium rounded-lg hover:bg-amber-400 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-20 left-4 right-4 z-50 max-w-md mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <CheckCircleIconSolid className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-white">Contact Created!</h3>
                <p className="text-sm text-slate-400">Successfully added to your contacts.</p>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="text-slate-400 hover:text-white font-medium"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-x-4 top-20 z-50 max-w-md mx-auto">
          <div className="bg-slate-900 rounded-xl shadow-xl border border-slate-800 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-80">
              {notifications.length > 0 ? (
                <div className="divide-y divide-slate-800">
                  {notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-slate-800 transition-colors ${
                        !notification.read ? 'bg-slate-800' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm text-white">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <button
                                onClick={() => markNotificationRead(notification.id)}
                                className="text-amber-500 hover:text-amber-400 text-xs font-medium"
                              >
                                Mark Read
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-slate-400 mt-1">
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
                  <BellIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No notifications</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <UserGroupIcon className="h-5 w-5 text-amber-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-400">Total Contacts</p>
                <p className="text-lg font-semibold text-white">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircleIconSolid className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-400">Active</p>
                <p className="text-lg font-semibold text-white">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <ClockIcon className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-400">Leads</p>
                <p className="text-lg font-semibold text-white">{stats.leads}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <DocumentTextIcon className="h-5 w-5 text-amber-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-400">Total Value</p>
                <p className="text-lg font-semibold text-white">${(stats.totalValue / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {[
              { id: 'all', label: 'All', count: stats.total },
              { id: 'client', label: 'Clients', count: stats.clients },
              { id: 'subcontractor', label: 'Subcontractors', count: stats.subcontractors },
              { id: 'vendor', label: 'Vendors', count: stats.vendors },
              { id: 'lead', label: 'Leads', count: stats.leads },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'all' | 'client' | 'subcontractor' | 'vendor' | 'lead')}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              {filteredClients.length} of {stats.total} contacts
            </p>
            <div className="flex items-center bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ListBulletIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Contact Cards */}
        {filteredClients.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 gap-4" 
              : "space-y-3"
          }>
            {filteredClients.map((client) => (
              <ContactCard
                key={client.id}
                client={client}
                viewMode={viewMode}
                onViewDetails={() => router.push(`/dashboard/clients/${client.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <UserGroupIcon className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {searchQuery ? 'No contacts found' : 'No contacts yet'}
            </h3>
            <p className="text-slate-400 mb-6">
              {searchQuery ? 'Try adjusting your search terms' : 'Get started by adding your first contact'}
            </p>
            {!searchQuery && (
              <Link
                href="/dashboard/clients/new/enhanced"
                className="inline-flex items-center px-4 py-2 bg-amber-500 text-black text-sm font-medium rounded-lg hover:bg-amber-400 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Your First Contact
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Mobile Bottom Padding */}
      <div className="h-20"></div>
    </div>
  );
}

// Inline Contact Card Component
function ContactCard({ 
  client, 
  viewMode, 
  onViewDetails 
}: { 
  client: Client; 
  viewMode: 'grid' | 'list'; 
  onViewDetails: () => void;
}) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-50 border-green-200';
      case 'lead': return 'text-amber-500 bg-amber-50 border-amber-200';
      case 'inactive': return 'text-red-500 bg-red-50 border-red-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'client': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'subcontractor': return 'text-green-500 bg-green-50 border-green-200';
      case 'vendor': return 'text-purple-500 bg-purple-50 border-purple-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 hover:bg-slate-800/50 transition-all cursor-pointer"
           onClick={onViewDetails}>
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white font-semibold border border-slate-700">
            {getInitials(client.name)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-white truncate">{client.name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getStatusColor(client.status)}`}>
                {client.status}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              {client.email && (
                <div className="flex items-center space-x-1">
                  <EnvelopeIcon className="w-4 h-4" />
                  <span className="truncate max-w-[150px]">{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center space-x-1">
                  <PhoneIcon className="w-4 h-4" />
                  <span>{client.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="text-right">
            <p className="text-sm font-semibold text-white">
              ${(client.totalValue || 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-400">
              {client.projectsCount || 0} projects
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 hover:bg-slate-800/50 transition-all cursor-pointer group"
         onClick={onViewDetails}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white font-semibold border border-slate-700">
          {getInitials(client.name)}
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getStatusColor(client.status)}`}>
            {client.status}
          </span>
        </div>
      </div>

      {/* Name & Type */}
      <div className="mb-4">
        <h3 className="font-semibold text-white group-hover:text-slate-300 transition-colors truncate">
          {client.name}
        </h3>
        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md mt-1 border ${getTypeColor(client.contactType || 'client')}`}>
          {client.contactType || 'client'}
        </span>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        {client.email && (
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <EnvelopeIcon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{client.email}</span>
          </div>
        )}
        {client.phone && (
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <PhoneIcon className="w-4 h-4 flex-shrink-0" />
            <span>{client.phone}</span>
          </div>
        )}
        {client.company && (
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <BuildingOfficeIcon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{client.company}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="pt-4 border-t border-slate-700">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold text-white">
              {client.projectsCount || 0}
            </p>
            <p className="text-xs text-slate-400">Projects</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-white">
              ${((client.totalValue || 0) / 1000).toFixed(0)}k
            </p>
            <p className="text-xs text-slate-400">Value</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {client.email && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`mailto:${client.email}`, '_blank');
                }}
                className="p-1.5 rounded-lg bg-black hover:bg-slate-700 transition-colors border border-slate-700"
              >
                <EnvelopeIcon className="w-4 h-4 text-white" />
              </button>
            )}
            {client.phone && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`tel:${client.phone}`, '_blank');
                }}
                className="p-1.5 rounded-lg bg-black hover:bg-slate-700 transition-colors border border-slate-700"
              >
                <PhoneIcon className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            className="text-xs font-medium text-amber-500 hover:text-amber-400"
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
}
