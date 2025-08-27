'use client';

import { useState } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { StandardPageWrapper, StandardCard, StandardSection, StandardGrid, StandardButton, StandardStat } from '../../../components/ui/StandardPageWrapper';

interface MetricCard {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  period: string;
}

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedChart, setSelectedChart] = useState('revenue');
  const [viewMode, setViewMode] = useState<'cards' | 'charts'>('cards');

  const periods = [
    { id: '7d', name: 'Last 7 days' },
    { id: '30d', name: 'Last 30 days' },
    { id: '90d', name: 'Last 90 days' },
    { id: '1y', name: 'Last year' }
  ];

  const metrics: MetricCard[] = [
    {
      title: 'Total Revenue',
      value: '$234,500',
      change: 12.5,
      icon: CurrencyDollarIcon,
      color: 'green',
      period: 'vs last month'
    },
    {
      title: 'Active Projects',
      value: '12',
      change: 8.2,
      icon: ClipboardDocumentListIcon,
      color: 'blue',
      period: 'vs last month'
    },
    {
      title: 'New Clients',
      value: '8',
      change: -3.1,
      icon: UserGroupIcon,
      color: 'purple',
      period: 'vs last month'
    },
    {
      title: 'Appointments',
      value: '34',
      change: 15.3,
      icon: CalendarDaysIcon,
      color: 'orange',
      period: 'vs last month'
    },
    {
      title: 'Conversion Rate',
      value: '68%',
      change: 5.7,
      icon: ArrowTrendingUpIcon,
      color: 'green',
      period: 'vs last month'
    },
    {
      title: 'Avg Project Value',
      value: '$19,542',
      change: -2.4,
      icon: ChartBarIcon,
      color: 'blue',
      period: 'vs last month'
    }
  ];

  const getColorForChange = (change: number) => {
    return change >= 0 ? 'green' : 'red';
  };

  return (
    <StandardPageWrapper>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold theme-text">Business Analytics</h1>
            <p className="theme-text-muted mt-2">
              Track performance metrics, revenue trends, and business insights across all operations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border theme-border rounded-lg theme-surface-1 theme-text focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              {periods.map(period => (
                <option key={period.id} value={period.id}>{period.name}</option>
              ))}
            </select>
            
            <div className="flex items-center gap-2 theme-surface-2 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'cards'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'theme-text-muted hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('charts')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'charts'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'theme-text-muted hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <ChartBarIcon className="w-4 h-4" />
              </button>
            </div>
            
            <StandardButton variant="secondary" icon={<ArrowDownTrayIcon className="h-4 w-4" />}>
              Export Report
            </StandardButton>
          </div>
        </div>

        {/* Key Metrics */}
        <StandardGrid cols={3} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric, index) => (
            <StandardStat
              key={index}
              label={metric.title}
              value={metric.value}
              change={metric.change}
              trend={metric.change >= 0 ? 'up' : 'down'}
              icon={<metric.icon className="h-6 w-6" />}
              color={metric.color as any}
            />
          ))}
        </StandardGrid>

        {/* Main Content */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Overview */}
            <StandardCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold theme-text">Revenue Overview</h3>
                <div className="flex items-center gap-2">
                  {['revenue', 'profit', 'expenses'].map(chart => (
                    <StandardButton
                      key={chart}
                      size="sm"
                      variant={selectedChart === chart ? 'primary' : 'secondary'}
                      onClick={() => setSelectedChart(chart)}
                    >
                      {chart.charAt(0).toUpperCase() + chart.slice(1)}
                    </StandardButton>
                  ))}
                </div>
              </div>
              
              <div className="h-80 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="theme-text-muted">Revenue Chart</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Chart visualization would go here</p>
                </div>
              </div>
            </StandardCard>

            {/* Project Performance */}
            <StandardCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold theme-text">Project Performance</h3>
                <StandardButton size="sm" variant="secondary">
                  View Details
                </StandardButton>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'Kitchen Renovations', completed: 8, active: 3, value: '$156,000', trend: 12 },
                  { name: 'Bathroom Remodels', completed: 12, active: 5, value: '$98,000', trend: -5 },
                  { name: 'Full Home Renovations', completed: 2, active: 2, value: '$180,000', trend: 25 },
                  { name: 'Commercial Projects', completed: 1, active: 1, value: '$75,000', trend: 8 }
                ].map((project, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border theme-border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium theme-text">{project.name}</h4>
                      <span className={`flex items-center text-sm ${
                        project.trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {project.trend >= 0 ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                        )}
                        {Math.abs(project.trend)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm theme-text-muted">
                      <span>{project.completed} completed, {project.active} active</span>
                      <span className="font-semibold theme-text">{project.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </StandardCard>

            {/* Client Insights */}
            <StandardCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold theme-text">Client Insights</h3>
                <StandardButton size="sm" variant="secondary">
                  View All
                </StandardButton>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">47</p>
                    <p className="text-sm theme-text-muted">Total Clients</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">8</p>
                    <p className="text-sm theme-text-muted">New This Month</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium theme-text">Top Clients by Value</h4>
                  {[
                    { name: 'Johnson Family', projects: 3, value: '$47,000' },
                    { name: 'Smith Residence', projects: 2, value: '$38,500' },
                    { name: 'Taylor Commercial', projects: 1, value: '$75,000' },
                    { name: 'Wilson Home', projects: 2, value: '$32,000' }
                  ].map((client, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium theme-text">{client.name}</p>
                        <p className="text-sm theme-text-muted">{client.projects} projects</p>
                      </div>
                      <p className="font-semibold theme-text">{client.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </StandardCard>

            {/* Recent Activity */}
            <StandardCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold theme-text">Recent Activity</h3>
                <StandardButton size="sm" variant="secondary">
                  View Timeline
                </StandardButton>
              </div>
              
              <div className="space-y-4">
                {[
                  { type: 'project_completed', client: 'Johnson Family', description: 'Kitchen renovation completed', time: '2 hours ago', icon: ClipboardDocumentListIcon, color: 'green' },
                  { type: 'new_client', client: 'Martinez Residence', description: 'New client consultation scheduled', time: '4 hours ago', icon: UserGroupIcon, color: 'blue' },
                  { type: 'payment_received', client: 'Smith Family', description: 'Payment received: $18,500', time: '6 hours ago', icon: CurrencyDollarIcon, color: 'green' },
                  { type: 'appointment', client: 'Wilson Home', description: 'Site visit appointment confirmed', time: '1 day ago', icon: CalendarDaysIcon, color: 'orange' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      activity.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                      activity.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      activity.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                      'theme-surface-2'
                    }`}>
                      <activity.icon className={`h-4 w-4 ${
                        activity.color === 'green' ? 'text-green-600 dark:text-green-400' :
                        activity.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                        activity.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                        'theme-text-muted'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium theme-text">{activity.client}</p>
                      <p className="text-sm theme-text-muted">{activity.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </StandardCard>
          </div>
        ) : (
          // Charts View
          <div className="space-y-6">
            <StandardCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold theme-text">Detailed Analytics</h3>
                <div className="flex items-center gap-2">
                  <StandardButton size="sm" variant="secondary">
                    Revenue
                  </StandardButton>
                  <StandardButton size="sm" variant="secondary">
                    Projects
                  </StandardButton>
                  <StandardButton size="sm" variant="secondary">
                    Clients
                  </StandardButton>
                </div>
              </div>
              
              <div className="h-96 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ChartBarIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg theme-text-muted mb-2">Advanced Charts View</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Interactive charts and detailed analytics would be displayed here</p>
                </div>
              </div>
            </StandardCard>
          </div>
        )}

        {/* Summary Cards */}
        <StandardGrid cols={4}>
          <StandardCard className="text-center">
            <CurrencyDollarIcon className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold theme-text mb-2">Revenue Growth</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">+12.5%</p>
            <p className="text-sm theme-text-muted">vs last month</p>
          </StandardCard>
          
          <StandardCard className="text-center">
            <ClipboardDocumentListIcon className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold theme-text mb-2">Project Success</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">94%</p>
            <p className="text-sm theme-text-muted">completion rate</p>
          </StandardCard>
          
          <StandardCard className="text-center">
            <UserGroupIcon className="h-12 w-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold theme-text mb-2">Client Satisfaction</h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">4.8</p>
            <p className="text-sm theme-text-muted">average rating</p>
          </StandardCard>
          
          <StandardCard className="text-center">
            <ArrowTrendingUpIcon className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold theme-text mb-2">Market Growth</h3>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">+18%</p>
            <p className="text-sm theme-text-muted">year over year</p>
          </StandardCard>
        </StandardGrid>
      </div>
    </StandardPageWrapper>
  );
}
