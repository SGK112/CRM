'use client';

import {
    ArrowRightIcon,
    BellIcon,
    CalendarIcon,
    ChartBarIcon,
    CheckCircleIcon,
    ClipboardDocumentListIcon,
    ClockIcon,
    CurrencyDollarIcon,
    ExclamationTriangleIcon,
    StarIcon,
    UserGroupIcon,
    UserIcon,
    UserPlusIcon,
} from '@heroicons/react/24/outline';
import {
    StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  workspaceId: string;
}

interface DashboardStats {
  totalRevenue: number;
  activeProjects: number;
  totalClients: number;
  avgProjectValue: number;
  pendingTasks: number;
  upcomingAppointments: number;
}

interface RecentContact {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  type: string;
  company?: string;
  createdAt: string;
}

interface ApiContact {
  id?: string;
  _id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  type?: string;
  contactType?: string;
  company?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiStats {
  clients?: { count: number; total: number };
  projects?: { count: number; active: number; completed: number };
  notifications?: { count: number; unread: number };
  documents?: { count: number; recent: number };
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    activeProjects: 0,
    totalClients: 0,
    avgProjectValue: 0,
    pendingTasks: 0,
    upcomingAppointments: 0,
  });
  const [recentContacts, setRecentContacts] = useState<RecentContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiStats, setApiStats] = useState<ApiStats>({});

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Load real data from APIs
    const loadDashboardData = async () => {
      try {
        const authToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (authToken && authToken !== 'null' && authToken !== 'undefined' && authToken.length > 10) {
          headers.Authorization = `Bearer ${authToken}`;
        }

        // Fetch all data in parallel
        const [clientsRes, projectsRes, notificationsRes, documentsRes] = await Promise.all([
          fetch('/api/clients', { headers }).catch(() => null),
          fetch('/api/projects/count', { headers }).catch(() => null),
          fetch('/api/notifications/count', { headers }).catch(() => null),
          fetch('/api/documents/count', { headers }).catch(() => null),
        ]);

        // Process clients data
        if (clientsRes && clientsRes.ok) {
          const clientsData = await clientsRes.json();
          const contacts = clientsData.data || clientsData.clients || clientsData || [];

          // Sort by creation date and take the 5 most recent
          const sortedContacts = contacts
            .sort((a: ApiContact, b: ApiContact) => 
              new Date(b.createdAt || b.updatedAt || '').getTime() - 
              new Date(a.createdAt || a.updatedAt || '').getTime()
            )
            .slice(0, 5)
            .map((contact: ApiContact) => ({
              id: contact.id || contact._id || '',
              name: contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
              firstName: contact.firstName,
              lastName: contact.lastName,
              email: contact.email,
              type: contact.type || contact.contactType || 'client',
              company: contact.company,
              createdAt: contact.createdAt || contact.updatedAt || ''
            }));

          setRecentContacts(sortedContacts);
          
          // Update API stats
          setApiStats(prev => ({ 
            ...prev, 
            clients: { count: contacts.length, total: contacts.length }
          }));
        }

        // Process projects data
        if (projectsRes && projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setApiStats(prev => ({ 
            ...prev, 
            projects: {
              count: projectsData.count || 0,
              active: projectsData.active || 0,
              completed: projectsData.completed || 0
            }
          }));
        }

        // Process notifications data
        if (notificationsRes && notificationsRes.ok) {
          const notificationsData = await notificationsRes.json();
          setApiStats(prev => ({ 
            ...prev, 
            notifications: {
              count: notificationsData.count || 0,
              unread: notificationsData.unread || 0
            }
          }));
        }

        // Process documents data
        if (documentsRes && documentsRes.ok) {
          const documentsData = await documentsRes.json();
          setApiStats(prev => ({ 
            ...prev, 
            documents: {
              count: documentsData.count || 0,
              recent: documentsData.recent || 0
            }
          }));
        }

      } catch (error) {
        // Gracefully handle API errors - continue with empty data
      }
    };

    loadDashboardData();

    // Update stats with real data
    setTimeout(() => {
      setStats(prevStats => ({
        ...prevStats,
        activeProjects: apiStats.projects?.active || 0,
        totalClients: apiStats.clients?.count || 0,
        pendingTasks: apiStats.notifications?.unread || 0,
        // Calculate estimated values based on real data
        totalRevenue: (apiStats.projects?.completed || 0) * 25000, // Estimate $25k per completed project
        avgProjectValue: apiStats.projects?.active ? 25000 : 0,
        upcomingAppointments: 0, // Will be replaced when calendar API is available
      }));
      setLoading(false);
    }, 1000);
  }, [apiStats.projects?.active, apiStats.clients?.count, apiStats.notifications?.unread, apiStats.projects?.completed]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = user?.firstName || 'there';

    if (hour < 12) return `Good morning, ${firstName}!`;
    if (hour < 17) return `Good afternoon, ${firstName}!`;
    return `Good evening, ${firstName}!`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          <p className="mt-4 text-lg text-white">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg)] min-h-full">
      {/* Mobile-First Header */}
      <div className="sticky top-0 bg-[var(--bg)] backdrop-blur-md border-b border-[var(--border)] z-30">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-[var(--text)] truncate">
                  {getGreeting()}
                </h1>
                <p className="text-sm text-slate-400">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/notifications"
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors relative"
              >
                <BellIcon className="h-5 w-5 text-white" />
                {apiStats.notifications && apiStats.notifications.unread > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-600 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">
                      {apiStats.notifications.unread > 9 ? '9+' : apiStats.notifications.unread}
                    </span>
                  </div>
                )}
              </Link>
              <Link
                href="/dashboard/settings/profile"
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <UserIcon className="h-5 w-5 text-white" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-black rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-900 rounded-xl">
                <CurrencyDollarIcon className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Revenue</p>
                <p className="text-lg font-bold text-white">
                  ${(stats.totalRevenue / 1000).toFixed(0)}k
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900 rounded-xl">
                <ClipboardDocumentListIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Projects</p>
                <p className="text-lg font-bold text-white">{stats.activeProjects}</p>
              </div>
            </div>
          </div>

          <div className="bg-black rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-900 rounded-xl">
                <UserGroupIcon className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Clients</p>
                <p className="text-lg font-bold text-white">{stats.totalClients}</p>
              </div>
            </div>
          </div>

          <div className="bg-black rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-900 rounded-xl">
                <StarIcon className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Avg Value</p>
                <p className="text-lg font-bold text-white">
                  ${(stats.avgProjectValue / 1000).toFixed(0)}k
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-900 rounded-xl">
                <CheckCircleIcon className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Tasks</p>
                <p className="text-lg font-bold text-white">{stats.pendingTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-black rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-900 rounded-xl">
                <CalendarIcon className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Meetings</p>
                <p className="text-lg font-bold text-white">{stats.upcomingAppointments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <Link
              href="/dashboard/clients/new"
              className="group p-4 bg-black rounded-2xl border border-slate-700 hover:border-amber-600 transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-orange-600 rounded-xl mb-3 group-hover:bg-orange-700 transition-all">
                  <UserPlusIcon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">Add Contact</span>
              </div>
            </Link>

            <Link
              href="/dashboard/estimates/new"
              className="group p-4 bg-black rounded-2xl border border-slate-700 hover:border-blue-600 transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mb-3 group-hover:from-blue-600 group-hover:to-indigo-700 transition-all">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">New Estimate</span>
              </div>
            </Link>

            <Link
              href="/dashboard/projects/new"
              className="group p-4 bg-black rounded-2xl border border-slate-700 hover:border-green-600 transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mb-3 group-hover:from-green-600 group-hover:to-emerald-700 transition-all">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-white group-hover:text-green-400 transition-colors">New Project</span>
              </div>
            </Link>

            <Link
              href="/dashboard/invoices/new"
              className="group p-4 bg-black rounded-2xl border border-slate-700 hover:border-emerald-600 transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl mb-3 group-hover:from-emerald-600 group-hover:to-teal-700 transition-all">
                  <CurrencyDollarIcon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">Invoice</span>
              </div>
            </Link>

            <Link
              href="/dashboard/analytics"
              className="group p-4 bg-black rounded-2xl border border-slate-700 hover:border-indigo-600 transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl mb-3 group-hover:from-indigo-600 group-hover:to-blue-700 transition-all">
                  <ChartBarIcon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">Analytics</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* System Status */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-2xl border border-slate-700">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">System Overview</h2>
                  <Link
                    href="/dashboard/analytics"
                    className="text-amber-600 hover:text-amber-500 text-sm font-medium flex items-center gap-1"
                  >
                    View Details
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">Active Projects</h3>
                      <ClipboardDocumentListIcon className="h-5 w-5 text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{apiStats.projects?.active || 0}</p>
                    <p className="text-sm text-slate-400">
                      {apiStats.projects?.completed || 0} completed
                    </p>
                  </div>

                  <div className="p-4 bg-slate-800 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">Total Clients</h3>
                      <UserGroupIcon className="h-5 w-5 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-green-400">{apiStats.clients?.count || 0}</p>
                    <p className="text-sm text-slate-400">
                      {recentContacts.length} added recently
                    </p>
                  </div>

                  <div className="p-4 bg-slate-800 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">Documents</h3>
                      <ClockIcon className="h-5 w-5 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-purple-400">{apiStats.documents?.count || 0}</p>
                    <p className="text-sm text-slate-400">
                      {apiStats.documents?.recent || 0} recent
                    </p>
                  </div>

                  <div className="p-4 bg-slate-800 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">Notifications</h3>
                      <BellIcon className="h-5 w-5 text-amber-400" />
                    </div>
                    <p className="text-2xl font-bold text-amber-400">{apiStats.notifications?.count || 0}</p>
                    <p className="text-sm text-slate-400">
                      {apiStats.notifications?.unread || 0} unread
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Contacts & Actions */}
          <div className="space-y-6">
            <div className="bg-black rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Contacts</h3>
                <Link
                  href="/dashboard/clients"
                  className="text-amber-600 hover:text-amber-500 text-sm font-medium flex items-center gap-1"
                >
                  View All
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>

              <div className="space-y-3">
                {recentContacts.length === 0 ? (
                  <div className="text-center py-8">
                    <UserGroupIcon className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No contacts yet</p>
                    <Link
                      href="/dashboard/clients/new"
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-amber-600 text-black rounded-lg hover:bg-amber-500 transition-colors text-sm font-medium"
                    >
                      <UserPlusIcon className="h-4 w-4" />
                      Add First Contact
                    </Link>
                  </div>
                ) : (
                  recentContacts.map((contact) => (
                    <Link
                      key={contact.id}
                      href={`/dashboard/clients/${contact.id}?type=${contact.type || 'client'}`}
                      className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-orange-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {(contact.name || contact.company || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {contact.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {contact.email}
                        </p>
                        {contact.company && (
                          <p className="text-xs text-slate-500 truncate">
                            {contact.company}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          contact.type === 'business' ? 'bg-blue-900 text-blue-300 border border-blue-700' :
                          contact.type === 'individual' ? 'bg-green-900 text-green-300 border border-green-700' :
                          'bg-slate-700 text-slate-300 border border-slate-600'
                        }`}>
                          {contact.type}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Business Metrics */}
            <div className="bg-black rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Business Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Projects Completed</span>
                  <span className="text-white font-semibold">{apiStats.projects?.completed || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Estimated Revenue</span>
                  <span className="text-green-400 font-semibold">
                    ${((apiStats.projects?.completed || 0) * 25000).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Active Clients</span>
                  <span className="text-blue-400 font-semibold">{apiStats.clients?.count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Business Health</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIconSolid
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.min(Math.floor((apiStats.projects?.active || 0) / 2) + 3, 5) 
                            ? 'text-amber-400' 
                            : 'text-slate-600'
                        }`}
                      />
                    ))}
                    <span className="text-white font-semibold ml-1">
                      {apiStats.projects?.active ? 'Good' : 'Getting Started'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}