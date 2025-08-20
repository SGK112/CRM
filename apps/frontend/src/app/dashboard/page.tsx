'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
// Legacy ChatBot removed; CopilotWidget supersedes it.
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalRevenue: number;
  activeProjects: number;
  totalClients: number;
  pendingTasks: number;
  revenueChange: number;
  projectsChange: number;
  clientsChange: number;
  tasksChange: number;
}

interface RecentActivity {
  id: string;
  type: 'project' | 'client' | 'payment' | 'message' | 'appointment';
  title: string;
  description: string;
  timestamp: string;
  status?: 'completed' | 'pending' | 'cancelled';
}

interface Project {
  id: string;
  title: string;
  client: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold';
  progress: number;
  budget: number;
  dueDate: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 234500,
    activeProjects: 12,
    totalClients: 48,
    pendingTasks: 23,
    revenueChange: 12.5,
    projectsChange: 8.2,
    clientsChange: 15.3,
    tasksChange: -5.1
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'project',
      title: 'Smith Kitchen Renovation',
      description: 'Project milestone completed - Cabinet installation finished',
      timestamp: '2 hours ago',
      status: 'completed'
    },
    {
      id: '2',
      type: 'client',
      title: 'New Client Added',
      description: 'Johnson Family - Bathroom renovation inquiry',
      timestamp: '4 hours ago'
    },
    {
      id: '3',
      type: 'payment',
      title: 'Payment Received',
      description: '$15,000 payment from Davis Deck Project',
      timestamp: '6 hours ago',
      status: 'completed'
    },
    {
      id: '4',
      type: 'appointment',
      title: 'Site Visit Scheduled',
      description: 'Wilson Kitchen - Initial consultation tomorrow 2:00 PM',
      timestamp: '8 hours ago'
    },
    {
      id: '5',
      type: 'message',
      title: 'Client Message',
      description: 'Brown Family: Question about material selection',
      timestamp: '1 day ago',
      status: 'pending'
    }
  ]);

  const [activeProjects, setActiveProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'Smith Kitchen Renovation',
      client: 'John & Mary Smith',
      status: 'in_progress',
      progress: 75,
      budget: 45000,
      dueDate: '2025-09-15'
    },
    {
      id: '2',
      title: 'Johnson Bathroom Remodel',
      client: 'Sarah Johnson',
      status: 'planning',
      progress: 25,
      budget: 28000,
      dueDate: '2025-10-01'
    },
    {
      id: '3',
      title: 'Davis Deck Construction',
      client: 'Mike Davis',
      status: 'review',
      progress: 90,
      budget: 22000,
      dueDate: '2025-08-25'
    },
    {
      id: '4',
      title: 'Wilson Kitchen Extension',
      client: 'Lisa Wilson',
      status: 'in_progress',
      progress: 40,
      budget: 65000,
      dueDate: '2025-11-30'
    }
  ]);

  // QuickActions removed; Copilot handles smart actions now.

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'review':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'on_hold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project':
        return ClipboardDocumentListIcon;
      case 'client':
        return UserGroupIcon;
      case 'payment':
        return CurrencyDollarIcon;
      case 'message':
        return ChatBubbleLeftRightIcon;
      case 'appointment':
        return CalendarDaysIcon;
      default:
        return BellIcon;
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard/analytics')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <EyeIcon className="h-5 w-5 mr-2" />
              View Reports
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <div className="surface-1 rounded-xl shadow-sm border border-token p-6 overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-[var(--text-dim)]">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-[var(--text)]">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-600/20 rounded-full flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stats.revenueChange >= 0 ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(stats.revenueChange)}%
              </span>
              <span className="text-sm text-gray-600 dark:text-[var(--text-dim)] ml-1">vs last month</span>
            </div>
          </div>

          {/* Active Projects */}
          <div className="surface-1 rounded-xl shadow-sm border border-token p-6 overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-[var(--text-dim)]">Active Projects</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-[var(--text)]">{stats.activeProjects}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-600/20 rounded-full flex-shrink-0">
                <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stats.projectsChange >= 0 ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${stats.projectsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(stats.projectsChange)}%
              </span>
              <span className="text-sm text-gray-600 dark:text-[var(--text-dim)] ml-1">vs last month</span>
            </div>
          </div>

          {/* Total Clients */}
          <div className="surface-1 rounded-xl shadow-sm border border-token p-6 overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-[var(--text-dim)]">Total Clients</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-[var(--text)]">{stats.totalClients}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-600/20 rounded-full flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stats.clientsChange >= 0 ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${stats.clientsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(stats.clientsChange)}%
              </span>
              <span className="text-sm text-gray-600 dark:text-[var(--text-dim)] ml-1">vs last month</span>
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="surface-1 rounded-xl shadow-sm border border-token p-6 overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-[var(--text-dim)]">Pending Tasks</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-[var(--text)]">{stats.pendingTasks}</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-600/20 rounded-full flex-shrink-0">
                <BellIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stats.tasksChange >= 0 ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${stats.tasksChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(stats.tasksChange)}%
              </span>
              <span className="text-sm text-gray-600 dark:text-[var(--text-dim)] ml-1">vs last month</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Projects */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Active Projects</h2>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {activeProjects.map((project) => (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{project.title}</h3>
                          <p className="text-sm text-gray-600">{project.client}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Budget: {formatCurrency(project.budget)}</span>
                        <span className="text-gray-600">Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const IconComponent = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="p-2 bg-gray-100 rounded-full">
                            <IconComponent className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                        </div>
                        {activity.status && (
                          <div className="flex-shrink-0">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                              activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {activity.status}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Revenue Chart */}
        <div className="surface-1 rounded-xl shadow-sm border border-token p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-[var(--text)]">Revenue Overview</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 dark:bg-blue-600/20 dark:text-blue-300 rounded-md">30 Days</button>
              <button className="px-3 py-1 text-sm text-gray-600 dark:text-[var(--text-dim)] hover:bg-gray-100 dark:hover:bg-[var(--surface-2)] rounded-md">90 Days</button>
              <button className="px-3 py-1 text-sm text-gray-600 dark:text-[var(--text-dim)] hover:bg-gray-100 dark:hover:bg-[var(--surface-2)] rounded-md">1 Year</button>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-[var(--surface-2)] rounded-lg">
            <p className="text-gray-500 dark:text-[var(--text-dim)]">Revenue chart will be displayed here</p>
          </div>
        </div>

        {/* Quick Actions FAB */}
  {/* QuickActions removed */}

  {/* Legacy ChatBot removed */}
      </div>
    </Layout>
  );
}
