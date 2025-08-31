'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  ChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { getUserPlan } from '@/lib/plans';
import { simple } from '@/lib/simple-ui';

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

export default function RemodelingDashboard() {
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
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Get current user plan
    getUserPlan();

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
    }, 1000);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = user?.firstName || 'there';
    
    if (hour < 12) return `Good morning, ${firstName}!`;
    if (hour < 17) return `Good afternoon, ${firstName}!`;
    return `Good evening, ${firstName}!`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={simple.page('max-w-6xl mx-auto')}>
      {/* Simple Header */}
      <div className={simple.card('mb-6')}>
        <div className={simple.section()}>
          <h1 className={simple.text.title('mb-2')}>
            {getGreeting()}
          </h1>
          <p className={simple.text.body()}>
            Here's what's happening with your remodeling business today.
          </p>
        </div>
      </div>

      {/* Simple Stats Grid */}
      <div className={`${simple.grid.cols4} mb-6`}>
        <div className={simple.card('text-center')}>
          <div className={simple.section()}>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <div className={simple.text.small()}>Total Revenue</div>
          </div>
        </div>
        
        <div className={simple.card('text-center')}>
          <div className={simple.section()}>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.activeProjects}
            </div>
            <div className={simple.text.small()}>Active Projects</div>
          </div>
        </div>
        
        <div className={simple.card('text-center')}>
          <div className={simple.section()}>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalClients}
            </div>
            <div className={simple.text.small()}>Total Clients</div>
          </div>
        </div>
        
        <div className={simple.card('text-center')}>
          <div className={simple.section()}>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${stats.avgProjectValue.toLocaleString()}
            </div>
            <div className={simple.text.small()}>Avg Project</div>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className={simple.card('mb-6')}>
        <div className={simple.section()}>
          <div className="flex items-center justify-between mb-4">
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
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{project.title}</h3>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${(project.budget / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className={simple.text.small()}>{project.client}</span>
                  <span className={`${simple.text.small()} capitalize`}>{project.status}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <div className="text-right mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{project.progress}% complete</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simple Quick Actions */}
      <div className={simple.grid.cols3}>
        <Link
          href="/dashboard/projects/new"
          className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-center transition-colors duration-200"
        >
          <PlusIcon className="h-8 w-8 mx-auto mb-2" />
          <div className="font-medium">New Project</div>
        </Link>

        <Link
          href="/dashboard/clients"
          className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-center transition-colors duration-200"
        >
          <UserGroupIcon className="h-8 w-8 mx-auto mb-2" />
          <div className="font-medium">Manage Clients</div>
        </Link>

        <Link
          href="/dashboard/analytics"
          className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg text-center transition-colors duration-200"
        >
          <ChartBarIcon className="h-8 w-8 mx-auto mb-2" />
          <div className="font-medium">View Reports</div>
        </Link>
      </div>
    </div>
  );
}
