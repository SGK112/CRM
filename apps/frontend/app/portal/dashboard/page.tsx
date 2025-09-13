'use client';

import {
    ArrowTopRightOnSquareIcon,
    BellIcon,
    CalendarIcon,
    ChatBubbleLeftRightIcon,
    CheckCircleIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    EnvelopeIcon,
    ExclamationTriangleIcon,
    MapPinIcon,
    PhoneIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PortalData {
  client: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  projects: {
    active: number;
    completed: number;
    totalValue: number;
  };
  estimates: {
    pending: number;
    approved: number;
    total: number;
  };
  invoices: {
    pending: number;
    paid: number;
    overdue: number;
    totalOutstanding: number;
  };
  messages: {
    unread: number;
    total: number;
  };
  appointments: {
    upcoming: number;
    thisWeek: number;
  };
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    date: string;
    read: boolean;
  }>;
}

export default function PortalDashboard() {
  const router = useRouter();
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('portal_token');
    const clientId = localStorage.getItem('portal_client_id');

    if (!token || !clientId) {
      router.push('/portal/login');
      return;
    }

    // Fetch portal data
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/portal/dashboard/${clientId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setPortalData(data);
        } else if (response.status === 401) {
          // Token expired, redirect to login
          localStorage.removeItem('portal_token');
          localStorage.removeItem('portal_client_id');
          router.push('/portal/login');
        }
      } catch (error) {
        // Handle error silently or show notification
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_client_id');
    router.push('/portal/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-white">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!portalData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Unable to load portal data</p>
          <button
            onClick={() => router.push('/portal/login')}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />;
      case 'error': return <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />;
      default: return <BellIcon className="h-5 w-5 text-blue-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-black border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-amber-600 rounded-lg flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Client Portal</h1>
                <p className="text-sm text-slate-400">Welcome back, {portalData.client.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-black rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-900 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-400">Active Projects</p>
                <p className="text-2xl font-bold text-white">{portalData.projects.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-black rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-900 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-400">Pending Invoices</p>
                <p className="text-2xl font-bold text-white">{portalData.invoices.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-black rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-900 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-400">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-white">{portalData.appointments.upcoming}</p>
              </div>
            </div>
          </div>

          <div className="bg-black rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-orange-900 rounded-lg">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-400">Unread Messages</p>
                <p className="text-2xl font-bold text-white">{portalData.messages.unread}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-black rounded-2xl p-6 border border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Link
                  href="/portal/estimates"
                  className="flex flex-col items-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group"
                >
                  <DocumentTextIcon className="h-8 w-8 text-amber-600 mb-2" />
                  <span className="text-sm font-medium text-white">View Estimates</span>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors mt-1" />
                </Link>

                <Link
                  href="/portal/invoices"
                  className="flex flex-col items-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group"
                >
                  <CurrencyDollarIcon className="h-8 w-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-white">Pay Invoices</span>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors mt-1" />
                </Link>

                <Link
                  href="/portal/calendar"
                  className="flex flex-col items-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group"
                >
                  <CalendarIcon className="h-8 w-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-white">Schedule</span>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors mt-1" />
                </Link>

                <Link
                  href="/portal/messages"
                  className="flex flex-col items-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group"
                >
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-white">Messages</span>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors mt-1" />
                </Link>

                <Link
                  href="/portal/projects"
                  className="flex flex-col items-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group"
                >
                  <UserIcon className="h-8 w-8 text-indigo-600 mb-2" />
                  <span className="text-sm font-medium text-white">Projects</span>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors mt-1" />
                </Link>

                <Link
                  href="/portal/profile"
                  className="flex flex-col items-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group"
                >
                  <UserIcon className="h-8 w-8 text-slate-600 mb-2" />
                  <span className="text-sm font-medium text-white">My Profile</span>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors mt-1" />
                </Link>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-black rounded-2xl p-6 border border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-6">Your Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
                  <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="font-medium text-white">{portalData.client.email}</p>
                  </div>
                </div>
                {portalData.client.phone && (
                  <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
                    <PhoneIcon className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Phone</p>
                      <p className="font-medium text-white">{portalData.client.phone}</p>
                    </div>
                  </div>
                )}
                {(portalData.client.address || portalData.client.city) && (
                  <div className="flex items-start gap-3 p-3 bg-slate-800 rounded-xl md:col-span-2">
                    <MapPinIcon className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-400">Address</p>
                      <div className="font-medium text-white">
                        {portalData.client.address && <p>{portalData.client.address}</p>}
                        {(portalData.client.city || portalData.client.state || portalData.client.zipCode) && (
                          <p>
                            {portalData.client.city}{portalData.client.city && portalData.client.state && ', '}
                            {portalData.client.state} {portalData.client.zipCode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Notifications */}
            <div className="bg-black rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Updates</h3>
              <div className="space-y-3">
                {portalData.notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 p-3 bg-slate-800 rounded-xl">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(notification.date).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-amber-600 rounded-full mt-2"></div>
                    )}
                  </div>
                ))}
              </div>
              <Link
                href="/portal/notifications"
                className="block mt-4 text-center text-sm text-amber-600 hover:text-amber-500"
              >
                View All Notifications
              </Link>
            </div>

            {/* Project Status */}
            <div className="bg-black rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Project Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Value</span>
                  <span className="text-white font-semibold">
                    ${portalData.projects.totalValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Completed</span>
                  <span className="text-green-400 font-semibold">{portalData.projects.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">In Progress</span>
                  <span className="text-blue-400 font-semibold">{portalData.projects.active}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
