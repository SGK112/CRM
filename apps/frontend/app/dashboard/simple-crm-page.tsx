'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SimpleCRMLayout from '@/components/SimpleCRMLayout';
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalClients: number;
  activeProjects: number;
  monthlyRevenue: number;
  upcomingAppointments: number;
}

interface RecentProject {
  id: string;
  name: string;
  client: string;
  status: 'planning' | 'in_progress' | 'completed';
  progress: number;
  budget: number;
}

export default function SimpleCRMDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeProjects: 0,
    monthlyRevenue: 0,
    upcomingAppointments: 0,
  });

  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);

  useEffect(() => {
    // Mock data for demo - replace with actual API calls
    setStats({
      totalClients: 47,
      activeProjects: 12,
      monthlyRevenue: 125000,
      upcomingAppointments: 8,
    });

    setRecentProjects([
      {
        id: '1',
        name: 'Kitchen Renovation',
        client: 'Johnson Family',
        status: 'in_progress',
        progress: 65,
        budget: 45000,
      },
      {
        id: '2',
        name: 'Bathroom Remodel',
        client: 'Smith Residence',
        status: 'planning',
        progress: 15,
        budget: 28000,
      },
      {
        id: '3',
        name: 'Deck Installation',
        client: 'Miller Home',
        status: 'in_progress',
        progress: 80,
        budget: 18000,
      },
    ]);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <SimpleCRMLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back! Here's what's happening with your business.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Clients
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalClients}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <ClipboardDocumentListIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Projects
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.activeProjects}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Monthly Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.monthlyRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <CalendarDaysIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Appointments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.upcomingAppointments}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/dashboard/clients/new"
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-center transition-colors duration-200 flex flex-col items-center"
          >
            <UserGroupIcon className="h-8 w-8 mb-2" />
            <div className="font-medium">Add New Client</div>
          </Link>

          <Link
            href="/dashboard/projects/new"
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-center transition-colors duration-200 flex flex-col items-center"
          >
            <PlusIcon className="h-8 w-8 mb-2" />
            <div className="font-medium">New Project</div>
          </Link>

          <Link
            href="/dashboard/estimates/new"
            className="bg-amber-600 hover:bg-amber-700 text-white p-6 rounded-lg text-center transition-colors duration-200 flex flex-col items-center"
          >
            <CurrencyDollarIcon className="h-8 w-8 mb-2" />
            <div className="font-medium">Create Estimate</div>
          </Link>
        </div>

        {/* Recent Projects */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Projects
              </h2>
              <Link
                href="/dashboard/projects"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {recentProjects.map(project => (
                <div
                  key={project.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">{project.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}
                    >
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Client: {project.client}
                  </p>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Budget: {formatCurrency(project.budget)}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {project.progress}% Complete
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SimpleCRMLayout>
  );
}
