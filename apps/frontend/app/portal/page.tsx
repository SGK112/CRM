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
    EyeIcon,
    EyeSlashIcon,
    LockClosedIcon,
    MapPinIcon,
    PhoneIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ClientPortalData {
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

export default function UniversalClientPortal() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('client');
  const token = searchParams.get('token');

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [portalData, setPortalData] = useState<ClientPortalData | null>(null);

  useEffect(() => {
    // If we have a token, try to authenticate automatically
    if (token && clientId) {
      const authenticate = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/portal/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId, token })
          });

          if (response.ok) {
            const data = await response.json();
            setPortalData(data);
            setIsAuthenticated(true);
          } else {
            setAuthError('Invalid or expired access link');
          }
        } catch (error) {
          setAuthError('Failed to authenticate');
        } finally {
          setLoading(false);
        }
      };
      authenticate();
    }
  }, [token, clientId]);

  const authenticateWithPassword = async () => {
    if (!password.trim()) {
      setAuthError('Please enter a password');
      return;
    }

    setLoading(true);
    setAuthError('');

    try {
      const response = await fetch(`/api/portal/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, password })
      });

      if (response.ok) {
        const data = await response.json();
        setPortalData(data);
        setIsAuthenticated(true);
      } else {
        setAuthError('Invalid password');
      }
    } catch (error) {
      setAuthError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />;
      case 'error': return <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />;
      default: return <BellIcon className="h-5 w-5 text-blue-400" />;
    }
  };

  // Authentication Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-black rounded-2xl p-8 border border-slate-700">
            <div className="text-center mb-8">
              <div className="h-16 w-16 bg-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LockClosedIcon className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Client Portal Access</h1>
              <p className="text-slate-400">
                {token ? 'Verifying your access...' : 'Enter your password to access your portal'}
              </p>
            </div>

            {!token && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Portal Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && authenticateWithPassword()}
                      className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                      placeholder="Enter your portal password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-slate-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                {authError && (
                  <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{authError}</p>
                  </div>
                )}

                <button
                  onClick={authenticateWithPassword}
                  disabled={loading}
                  className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Accessing Portal...
                    </div>
                  ) : (
                    'Access Portal'
                  )}
                </button>
              </div>
            )}

            {token && loading && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
                <p className="text-slate-400">Verifying access...</p>
              </div>
            )}

            {token && authError && (
              <div className="text-center">
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4">
                  <p className="text-red-400">{authError}</p>
                </div>
                <p className="text-slate-400 text-sm">
                  Contact your project manager for a new access link.
                </p>
              </div>
            )}
          </div>

          <div className="text-center mt-6">
            <p className="text-slate-400 text-sm">
              Need help accessing your portal?{' '}
              <Link href="/contact" className="text-amber-600 hover:text-amber-500">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Portal Dashboard
  if (!portalData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-white">Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-black border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-amber-600 rounded-xl flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Your Project Portal</h1>
                <p className="text-sm text-slate-400">Welcome, {portalData.client.name}</p>
              </div>
            </div>
            <div className="text-sm text-slate-400">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-black rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center">
              <div className="p-3 bg-blue-900 rounded-xl">
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
              <div className="p-3 bg-green-900 rounded-xl">
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
              <div className="p-3 bg-purple-900 rounded-xl">
                <CalendarIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-400">Upcoming</p>
                <p className="text-2xl font-bold text-white">{portalData.appointments.upcoming}</p>
              </div>
            </div>
          </div>

          <div className="bg-black rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center">
              <div className="p-3 bg-orange-900 rounded-xl">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-400">New Messages</p>
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
                <div className="flex flex-col items-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group cursor-pointer">
                  <DocumentTextIcon className="h-8 w-8 text-amber-600 mb-2" />
                  <span className="text-sm font-medium text-white text-center">View Estimates</span>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors mt-1" />
                </div>

                <div className="flex flex-col items-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group cursor-pointer">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-white text-center">Pay Invoices</span>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors mt-1" />
                </div>

                <div className="flex flex-col items-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group cursor-pointer">
                  <CalendarIcon className="h-8 w-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-white text-center">Schedule Meeting</span>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors mt-1" />
                </div>

                <div className="flex flex-col items-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group cursor-pointer">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-white text-center">Send Message</span>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors mt-1" />
                </div>

                <div className="flex flex-col items-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group cursor-pointer">
                  <DocumentTextIcon className="h-8 w-8 text-indigo-600 mb-2" />
                  <span className="text-sm font-medium text-white text-center">Project Details</span>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors mt-1" />
                </div>

                <div className="flex flex-col items-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group cursor-pointer">
                  <UserIcon className="h-8 w-8 text-slate-600 mb-2" />
                  <span className="text-sm font-medium text-white text-center">Update Profile</span>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors mt-1" />
                </div>
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
            </div>

            {/* Project Summary */}
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
