'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  UsersIcon, 
  BriefcaseIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { StandardPageWrapper, StandardCard, StandardSection, StandardGrid } from '../../../components/ui/StandardPageWrapper';

// Mock data for analytics
const mockData = {
  overview: {
    totalRevenue: 125420,
    totalClients: 145,
    activeProjects: 28,
    completedProjects: 156
  },
  revenueChart: [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Apr', revenue: 22000 },
    { month: 'May', revenue: 25000 },
    { month: 'Jun', revenue: 28000 }
  ],
  clientsChart: [
    { month: 'Jan', clients: 120 },
    { month: 'Feb', clients: 125 },
    { month: 'Mar', clients: 132 },
    { month: 'Apr', clients: 138 },
    { month: 'May', clients: 142 },
    { month: 'Jun', clients: 145 }
  ],
  recentActivity: [
    { id: 1, type: 'project', description: 'New project started with ABC Corp', date: '2024-06-15' },
    { id: 2, type: 'client', description: 'New client onboarded: XYZ Industries', date: '2024-06-14' },
    { id: 3, type: 'revenue', description: 'Payment received: $5,000', date: '2024-06-13' },
    { id: 4, type: 'project', description: 'Project completed for DEF Company', date: '2024-06-12' }
  ]
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(mockData);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <StandardPageWrapper title="Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </StandardPageWrapper>
    );
  }

  return (
    <StandardPageWrapper title="Analytics & Reports">
      {/* Overview Cards */}
      <StandardSection title="Overview">
        <StandardGrid>
          <StandardCard className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  ${data.overview.totalRevenue.toLocaleString()}
                </h3>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <div className="flex items-center mt-1">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+12.5% from last month</span>
                </div>
              </div>
            </div>
          </StandardCard>

          <StandardCard className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {data.overview.totalClients}
                </h3>
                <p className="text-sm text-gray-600">Total Clients</p>
                <div className="flex items-center mt-1">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+8 new this month</span>
                </div>
              </div>
            </div>
          </StandardCard>

          <StandardCard className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg mr-4">
                <BriefcaseIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {data.overview.activeProjects}
                </h3>
                <p className="text-sm text-gray-600">Active Projects</p>
                <div className="flex items-center mt-1">
                  <EyeIcon className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-xs text-blue-600">5 starting this week</span>
                </div>
              </div>
            </div>
          </StandardCard>

          <StandardCard className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-4">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {data.overview.completedProjects}
                </h3>
                <p className="text-sm text-gray-600">Completed Projects</p>
                <div className="flex items-center mt-1">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">12 completed this month</span>
                </div>
              </div>
            </div>
          </StandardCard>
        </StandardGrid>
      </StandardSection>

      {/* Revenue Chart */}
      <StandardSection title="Revenue Trend">
        <StandardCard className="p-6">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Revenue Chart</h3>
              <p className="text-gray-600">Interactive revenue chart would be displayed here</p>
              <div className="mt-4 text-sm text-gray-500">
                {data.revenueChart.map((item, index) => (
                  <span key={index} className="inline-block mx-2">
                    {item.month}: ${item.revenue.toLocaleString()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </StandardCard>
      </StandardSection>

      {/* Clients Growth */}
      <StandardSection title="Client Growth">
        <StandardCard className="p-6">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Client Growth Chart</h3>
              <p className="text-gray-600">Interactive client growth chart would be displayed here</p>
              <div className="mt-4 text-sm text-gray-500">
                {data.clientsChart.map((item, index) => (
                  <span key={index} className="inline-block mx-2">
                    {item.month}: {item.clients} clients
                  </span>
                ))}
              </div>
            </div>
          </div>
        </StandardCard>
      </StandardSection>

      {/* Recent Activity */}
      <StandardSection title="Recent Activity">
        <StandardCard>
          <div className="divide-y divide-gray-200">
            {data.recentActivity.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-3 ${
                      activity.type === 'project' ? 'bg-blue-100' :
                      activity.type === 'client' ? 'bg-green-100' :
                      'bg-yellow-100'
                    }`}>
                      {activity.type === 'project' ? (
                        <BriefcaseIcon className={`h-5 w-5 ${
                          activity.type === 'project' ? 'text-blue-600' : ''
                        }`} />
                      ) : activity.type === 'client' ? (
                        <UsersIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <CurrencyDollarIcon className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </StandardCard>
      </StandardSection>
    </StandardPageWrapper>
  );
}