'use client';

import {
    ArrowRightIcon,
    ChartBarIcon,
    CheckCircleIcon,
    ClipboardDocumentListIcon,
    ClockIcon,
    CurrencyDollarIcon,
    ExclamationTriangleIcon,
    PlusIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
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
}

interface RecentProject {
  id: string;
  title: string;
  client: string;
  status: 'design' | 'permits' | 'construction' | 'finishing';
  budget: number;
  progress: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    activeProjects: 0,
    totalClients: 0,
    avgProjectValue: 0,
  });
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Load mock data
    setTimeout(() => {
      setStats({
        totalRevenue: 485000,
        activeProjects: 12,
        totalClients: 28,
        avgProjectValue: 87500,
      });

      setRecentProjects([
        {
          id: '1',
          title: 'Modern Kitchen Renovation',
          client: 'Johnson Family',
          status: 'construction',
          budget: 95000,
          progress: 75,
        },
        {
          id: '2',
          title: 'Master Bathroom Remodel',
          client: 'Davis Residence',
          status: 'finishing',
          budget: 42000,
          progress: 90,
        },
        {
          id: '3',
          title: 'Victorian Home Restoration',
          client: 'Miller Estate',
          status: 'permits',
          budget: 350000,
          progress: 15,
        },
      ]);

      setLoading(false);
    }, 800);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = user?.firstName || 'there';

    if (hour < 12) return `Good morning, ${firstName}!`;
    if (hour < 17) return `Good afternoon, ${firstName}!`;
    return `Good evening, ${firstName}!`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'construction':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'finishing':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'permits':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'design':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'construction':
        return <ClockIcon className="h-4 w-4" />;
      case 'finishing':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'permits':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'design':
        return <ChartBarIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-amber-50 to-orange-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-500/20 blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-gradient-to-r from-amber-400/15 to-orange-500/15 blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-0 left-1/2 h-64 w-64 rounded-full bg-gradient-to-r from-amber-400/10 to-orange-500/10 blur-3xl animate-pulse delay-500" />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="text-white text-lg">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-amber-50 to-orange-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-500/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-gradient-to-r from-amber-400/15 to-orange-500/15 blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 rounded-full bg-gradient-to-r from-amber-400/10 to-orange-500/10 blur-3xl animate-pulse delay-500" />
      </div>

      {/* Main content */}
      <div className="relative z-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              {getGreeting()}
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
              Here's what's happening with your Remodely CRM workspace today
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl bg-slate-800/80 backdrop-blur-sm p-6 shadow-2xl shadow-slate-900/50 border border-slate-700/50 hover:bg-slate-800/90 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Revenue</p>
                  <p className="text-3xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <CurrencyDollarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-800/80 backdrop-blur-sm p-6 shadow-2xl shadow-slate-900/50 border border-slate-700/50 hover:bg-slate-800/90 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Active Projects</p>
                  <p className="text-3xl font-bold text-white">{stats.activeProjects}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
                  <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-800/80 backdrop-blur-sm p-6 shadow-2xl shadow-slate-900/50 border border-slate-700/50 hover:bg-slate-800/90 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Clients</p>
                  <p className="text-3xl font-bold text-white">{stats.totalClients}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <UserGroupIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-800/80 backdrop-blur-sm p-6 shadow-2xl shadow-slate-900/50 border border-slate-700/50 hover:bg-slate-800/90 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Avg Project Value</p>
                  <p className="text-3xl font-bold text-white">${stats.avgProjectValue.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Projects and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Projects */}
            <div className="rounded-2xl bg-slate-800/80 backdrop-blur-sm p-6 shadow-2xl shadow-slate-900/50 border border-slate-700/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Projects</h2>
                <Link
                  href="/dashboard/projects"
                  className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors duration-200 flex items-center space-x-1"
                >
                  <span>View all</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {recentProjects.map(project => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-700/50 border border-slate-600/50 hover:bg-slate-700/70 transition-all duration-200"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                          {getStatusIcon(project.status)}
                          <span className="capitalize">{project.status}</span>
                        </div>
                        <h3 className="text-sm font-medium text-white truncate">{project.title}</h3>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-slate-400">
                        <span>{project.client}</span>
                        <span>${(project.budget / 1000).toFixed(0)}K budget</span>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-slate-600 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{project.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl bg-slate-800/80 backdrop-blur-sm p-6 shadow-2xl shadow-slate-900/50 border border-slate-700/50">
              <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/dashboard/projects/new"
                  className="group flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-600/10 border border-amber-500/20 hover:from-amber-500/20 hover:to-orange-600/20 transition-all duration-300 hover:scale-105"
                >
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                    <PlusIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">New Project</p>
                    <p className="text-xs text-slate-400">Start a remodeling project</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/clients"
                  className="group flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-600/10 border border-blue-500/20 hover:from-blue-500/20 hover:to-indigo-600/20 transition-all duration-300 hover:scale-105"
                >
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <UserGroupIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Manage Clients</p>
                    <p className="text-xs text-slate-400">View client relationships</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/analytics"
                  className="group flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-600/10 border border-purple-500/20 hover:from-purple-500/20 hover:to-pink-600/20 transition-all duration-300 hover:scale-105"
                >
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <ChartBarIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">View Reports</p>
                    <p className="text-xs text-slate-400">Analyze performance</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/calendar"
                  className="group flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/20 hover:from-green-500/20 hover:to-emerald-600/20 transition-all duration-300 hover:scale-105"
                >
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
                    <ClockIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Schedule</p>
                    <p className="text-xs text-slate-400">View your calendar</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
