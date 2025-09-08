'use client';

import {
  ChartBarIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  UserGroupIcon,
  BellIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  StarIcon,
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

interface RecentProject {
  id: string;
  title: string;
  client: string;
  status: 'design' | 'permits' | 'construction' | 'finishing';
  budget: number;
  progress: number;
  nextMilestone?: string;
}

interface RecentActivity {
  id: string;
  type: 'project' | 'client' | 'payment' | 'appointment';
  title: string;
  description: string;
  time: string;
  status?: 'success' | 'warning' | 'info';
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
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
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
        pendingTasks: 7,
        upcomingAppointments: 3,
      });

      setRecentProjects([
        {
          id: '1',
          title: 'Modern Kitchen Renovation',
          client: 'Johnson Family',
          status: 'construction',
          budget: 95000,
          progress: 75,
          nextMilestone: 'Cabinet installation'
        },
        {
          id: '2',
          title: 'Master Bathroom Remodel',
          client: 'Davis Residence',
          status: 'finishing',
          budget: 42000,
          progress: 90,
          nextMilestone: 'Final inspection'
        },
        {
          id: '3',
          title: 'Victorian Home Restoration',
          client: 'Miller Estate',
          status: 'permits',
          budget: 350000,
          progress: 15,
          nextMilestone: 'Permit approval'
        },
      ]);

      setRecentActivity([
        {
          id: '1',
          type: 'payment',
          title: 'Payment Received',
          description: 'Johnson Family - $25,000 progress payment',
          time: '2 hours ago',
          status: 'success'
        },
        {
          id: '2',
          type: 'appointment',
          title: 'Site Visit Scheduled',
          description: 'Miller Estate - Tomorrow at 2:00 PM',
          time: '4 hours ago',
          status: 'info'
        },
        {
          id: '3',
          type: 'project',
          title: 'Milestone Completed',
          description: 'Davis Residence - Tile installation finished',
          time: '6 hours ago',
          status: 'success'
        },
        {
          id: '4',
          type: 'client',
          title: 'New Lead',
          description: 'Sarah Wilson - Kitchen remodel inquiry',
          time: '1 day ago',
          status: 'info'
        }
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
        return 'text-blue-400 bg-blue-900 border-blue-700';
      case 'finishing':
        return 'text-green-400 bg-green-900 border-green-700';
      case 'permits':
        return 'text-amber-400 bg-amber-900 border-amber-700';
      case 'design':
        return 'text-purple-400 bg-purple-900 border-purple-700';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-600';
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <CurrencyDollarIcon className="h-5 w-5 text-green-400" />;
      case 'appointment':
        return <CalendarIcon className="h-5 w-5 text-blue-400" />;
      case 'project':
        return <ClipboardDocumentListIcon className="h-5 w-5 text-purple-400" />;
      case 'client':
        return <UserIcon className="h-5 w-5 text-amber-400" />;
      default:
        return <BellIcon className="h-5 w-5 text-slate-400" />;
    }
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
    <div className="min-h-screen bg-slate-900">
      {/* Mobile-First Header */}
      <div className="sticky top-0 bg-black backdrop-blur-md border-b border-slate-700 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-white truncate">
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
                href="/notifications"
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors relative"
              >
                <BellIcon className="h-5 w-5 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-600 rounded-full"></div>
              </Link>
              <Link
                href="/profile"
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
        <div className="bg-black rounded-2xl p-6 border border-slate-700 mb-8">
          <h2 className="text-lg font-semibold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link
              href="/dashboard/projects/new"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group"
            >
              <div className="p-3 bg-amber-600 rounded-xl group-hover:bg-amber-500 transition-colors">
                <PlusIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-white text-center">New Project</span>
            </Link>

            <Link
              href="/dashboard/clients"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group"
            >
              <div className="p-3 bg-blue-600 rounded-xl group-hover:bg-blue-500 transition-colors">
                <UserGroupIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-white text-center">Manage Clients</span>
            </Link>

            <Link
              href="/portal/invite"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group"
            >
              <div className="p-3 bg-cyan-600 rounded-xl group-hover:bg-cyan-500 transition-colors">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-white text-center">Client Portal</span>
            </Link>

            <Link
              href="/dashboard/analytics"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group"
            >
              <div className="p-3 bg-purple-600 rounded-xl group-hover:bg-purple-500 transition-colors">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-white text-center">Analytics</span>
            </Link>

            <Link
              href="/dashboard/calendar"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group"
            >
              <div className="p-3 bg-green-600 rounded-xl group-hover:bg-green-500 transition-colors">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-white text-center">Calendar</span>
            </Link>

            <Link
              href="/dashboard/documents"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group"
            >
              <div className="p-3 bg-indigo-600 rounded-xl group-hover:bg-indigo-500 transition-colors">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-white text-center">Documents</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-2xl border border-slate-700">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Active Projects</h2>
                  <Link 
                    href="/dashboard/projects"
                    className="text-amber-600 hover:text-amber-500 text-sm font-medium flex items-center gap-1"
                  >
                    View All
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="block p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{project.title}</h3>
                        <p className="text-sm text-slate-400">{project.client}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                          {getStatusIcon(project.status)}
                          {project.status}
                        </span>
                        <span className="text-sm font-medium text-white">
                          ${project.budget.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-white font-medium">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-amber-600 h-2 rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      {project.nextMilestone && (
                        <p className="text-xs text-slate-400 mt-2">
                          Next: {project.nextMilestone}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <div className="bg-black rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-800 rounded-xl">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/dashboard/activity"
                className="block mt-4 text-center text-sm text-amber-600 hover:text-amber-500"
              >
                View All Activity
              </Link>
            </div>

            {/* Quick Stats Summary */}
            <div className="bg-black rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">This Month</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Projects Completed</span>
                  <span className="text-white font-semibold">4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Revenue Generated</span>
                  <span className="text-green-400 font-semibold">$125,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">New Clients</span>
                  <span className="text-blue-400 font-semibold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Client Satisfaction</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIconSolid
                        key={i}
                        className={`h-4 w-4 ${i < 4 ? 'text-amber-500' : 'text-slate-600'}`}
                      />
                    ))}
                    <span className="text-white font-semibold ml-1">4.8</span>
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
