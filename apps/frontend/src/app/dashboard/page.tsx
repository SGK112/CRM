'use client';

import { simple } from '@/lib/simple-ui';
import {
    ChartBarIcon,
    ClipboardDocumentListIcon,
    CurrencyDollarIcon,
    PlusIcon,
    UserGroupIcon
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
    avgProjectValue: 0
  });
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      // Silently handle localStorage errors
    }

    // Load mock data
    setTimeout(() => {
      setStats({
        totalRevenue: 485000,
        activeProjects: 12,
        totalClients: 28,
        avgProjectValue: 87500
      });

      setRecentProjects([
        {
          id: '1',
          title: 'Modern Kitchen Renovation',
          client: 'Johnson Family',
          status: 'construction',
          budget: 95000,
          progress: 75
        },
        {
          id: '2',
          title: 'Master Bathroom Remodel',
          client: 'Davis Residence',
          status: 'finishing',
          budget: 42000,
          progress: 90
        },
        {
          id: '3',
          title: 'Victorian Home Restoration',
          client: 'Miller Estate',
          status: 'permits',
          budget: 350000,
          progress: 15
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
      case 'construction': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'finishing': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'permits': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'design': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className={simple.loading.page}>
        <div className={`${simple.loading.spinner} h-12 w-12`} />
      </div>
    );
  }

  return (
    <div className={simple.page()}>
      {/* Welcome Header */}
      <div className={`${simple.card()} mb-6`}>
        <div className={simple.section()}>
          <h1 className={simple.text.title('mb-2')}>
            {getGreeting()}
          </h1>
          <p className={simple.text.body()}>
            Here's what's happening with your remodeling business today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`${simple.grid.cols4} ${simple.grid.gap} mb-6`}>
        <div className={simple.card()}>
          <div className={simple.section('flex items-center justify-between')}>
            <div>
              <p className={simple.text.small('mb-1')}>Total Revenue</p>
              <p className={simple.text.title('text-2xl')}>${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-blue-600 opacity-80" />
          </div>
        </div>

        <div className={simple.card()}>
          <div className={simple.section('flex items-center justify-between')}>
            <div>
              <p className={simple.text.small('mb-1')}>Active Projects</p>
              <p className={simple.text.title('text-2xl')}>{stats.activeProjects}</p>
            </div>
            <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600 opacity-80" />
          </div>
        </div>

    <div className={simple.card()}>
          <div className={simple.section('flex items-center justify-between')}>
            <div>
      <p className={simple.text.small('mb-1')}>Total Contacts</p>
      <p className={simple.text.title('text-2xl')}>{stats.totalClients}</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-blue-600 opacity-80" />
          </div>
        </div>

        <div className={simple.card()}>
          <div className={simple.section('flex items-center justify-between')}>
            <div>
              <p className={simple.text.small('mb-1')}>Avg Project Value</p>
              <p className={simple.text.title('text-2xl')}>${stats.avgProjectValue.toLocaleString()}</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-blue-600 opacity-80" />
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className={simple.card('mb-6')}>
        <div className={simple.section()}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={simple.text.subtitle()}>Recent Projects</h2>
            <Link
              href="/dashboard/projects"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>

          <div className={simple.spacing.sm}>
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-gray-900 dark:text-white">{project.title}</h3>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${(project.budget / 1000).toFixed(0)}K
                  </span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className={simple.text.small()}>{project.client}</span>
                  <span className={simple.text.small()}>{project.progress}% complete</span>
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

      {/* Quick Actions */}
      <div className={`${simple.grid.cols3} ${simple.grid.gap}`}>
        <Link
          href="/dashboard/projects/new"
          className={`${simple.card('hover:scale-[1.02] transition-transform')} text-center`}
        >
          <div className={simple.section()}>
            <PlusIcon className="h-8 w-8 mx-auto mb-3 text-blue-600" />
            <div className="font-medium text-gray-900 dark:text-white">New Project</div>
            <p className={simple.text.small('mt-1')}>Start a new remodeling project</p>
          </div>
        </Link>

        <Link
          href="/dashboard/clients"
          className={`${simple.card('hover:scale-[1.02] transition-transform')} text-center`}
        >
          <div className={simple.section()}>
            <UserGroupIcon className="h-8 w-8 mx-auto mb-3 text-green-600" />
            <div className="font-medium text-gray-900 dark:text-white">Manage Clients</div>
            <p className={simple.text.small('mt-1')}>View and manage clients, vendors, and collaborators</p>
          </div>
        </Link>

        <Link
          href="/dashboard/analytics"
          className={`${simple.card('hover:scale-[1.02] transition-transform')} text-center`}
        >
          <div className={simple.section()}>
            <ChartBarIcon className="h-8 w-8 mx-auto mb-3 text-purple-600" />
            <div className="font-medium text-gray-900 dark:text-white">View Reports</div>
            <p className={simple.text.small('mt-1')}>Analyze business performance</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
