'use client';

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { simple } from '@/lib/simple-ui';

interface AnalyticsStats {
  totalRevenue: number;
  totalProjects: number;
  totalClients: number;
  completionRate: number;
}

interface RecentActivity {
  id: string;
  type: 'project' | 'client' | 'payment' | 'estimate';
  title: string;
  timestamp: string;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AnalyticsStats>({
    totalRevenue: 0,
    totalProjects: 0,
    totalClients: 0,
    completionRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);

      // Mock data - replace with actual API calls
      setTimeout(() => {
        setStats({
          totalRevenue: 0,
          totalProjects: 0,
          totalClients: 0,
          completionRate: 0,
        });

        setRecentActivity([]);

        setLoading(false);
      }, 1000);
    };

    loadAnalytics();
  }, []);

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
          <h1 className={simple.text.title('mb-2')}>Analytics Overview</h1>
          <p className={simple.text.body()}>Track your business performance and key metrics.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`${simple.grid.cols4} mb-6`}>
        <div className={simple.card('text-center')}>
          <div className={simple.section()}>
            <div className="flex items-center justify-center mb-2">
              <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <div className={simple.text.small()}>Total Revenue</div>
          </div>
        </div>

        <div className={simple.card('text-center')}>
          <div className={simple.section()}>
            <div className="flex items-center justify-center mb-2">
              <ClipboardDocumentListIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalProjects}
            </div>
            <div className={simple.text.small()}>Total Projects</div>
          </div>
        </div>

        <div className={simple.card('text-center')}>
          <div className={simple.section()}>
            <div className="flex items-center justify-center mb-2">
              <UserGroupIcon className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalClients}
            </div>
            <div className={simple.text.small()}>Total Clients</div>
          </div>
        </div>

        <div className={simple.card('text-center')}>
          <div className={simple.section()}>
            <div className="flex items-center justify-center mb-2">
              <ChartBarIcon className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.completionRate}%
            </div>
            <div className={simple.text.small()}>Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={simple.card()}>
        <div className={simple.section()}>
          <h2 className={simple.text.subtitle('mb-4')}>Recent Activity</h2>

          <div className="space-y-3">
            {recentActivity.map(activity => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      activity.type === 'project'
                        ? 'bg-blue-500'
                        : activity.type === 'payment'
                          ? 'bg-green-500'
                          : activity.type === 'estimate'
                            ? 'bg-orange-500'
                            : 'bg-purple-500'
                    }`}
                  />
                  <span className={simple.text.body()}>{activity.title}</span>
                </div>
                <span className={simple.text.small()}>{activity.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
