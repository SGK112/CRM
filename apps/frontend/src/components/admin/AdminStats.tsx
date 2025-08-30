'use client';

import { useState, useEffect } from 'react';

interface DashboardStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    suspendedUsers: number;
    retentionRate: number;
  };
  subscriptionDistribution: Array<{
    _id: string;
    count: number;
  }>;
  userGrowth: Array<{
    _id: { year: number; month: number };
    count: number;
  }>;
  lastUpdated: string;
}

export default function AdminStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      const response = await fetch('/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      setStats(data);
      setError('');
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex">
          <div className="text-red-400 text-xl mr-3">⚠️</div>
          <div>
            <h3 className="text-lg font-medium text-red-800">Error Loading Stats</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchStats}
              className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const { overview, subscriptionDistribution, userGrowth } = stats;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={overview.totalUsers}
          icon="👥"
          color="bg-blue-500"
        />
        <StatCard
          title="Active Users"
          value={overview.activeUsers}
          icon="✅"
          color="bg-green-500"
          subtitle={`${overview.retentionRate}% retention`}
        />
        <StatCard
          title="New This Month"
          value={overview.newUsersThisMonth}
          icon="📈"
          color="bg-purple-500"
        />
        <StatCard
          title="Suspended"
          value={overview.suspendedUsers}
          icon="⚠️"
          color="bg-red-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Distribution</h3>
          <div className="space-y-3">
            {subscriptionDistribution.map((sub, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-purple-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {sub._id || 'No Plan'}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {sub.count} users
                </div>
              </div>
            ))}
            {subscriptionDistribution.length === 0 && (
              <p className="text-gray-500 text-sm">No subscription data available</p>
            )}
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth (Last 12 Months)</h3>
          <div className="space-y-2">
            {userGrowth.slice(-6).map((growth, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {growth._id.year}-{String(growth._id.month).padStart(2, '0')}
                </span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${Math.min((growth.count / Math.max(...userGrowth.map(g => g.count))) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">
                    {growth.count}
                  </span>
                </div>
              </div>
            ))}
            {userGrowth.length === 0 && (
              <p className="text-gray-500 text-sm">No growth data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-gray-500 text-center">
        Last updated: {new Date(stats.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`${color} rounded-lg p-3 text-white text-xl mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
