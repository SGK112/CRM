'use client';

import { useState } from 'react';
import Button from '../../../components/ui/button';
import Layout from '../../../components/Layout';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

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
      color: 'bg-green-500',
      period: 'vs last month'
    },
    {
      title: 'Active Projects',
      value: '12',
      change: 8.2,
      icon: ClipboardDocumentListIcon,
      color: 'bg-blue-500',
      period: 'vs last month'
    },
    {
      title: 'New Clients',
      value: '8',
      change: 15.3,
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      period: 'vs last month'
    },
    {
      title: 'Avg Project Value',
      value: '$19,542',
      change: -3.2,
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      period: 'vs last month'
    },
    {
      title: 'Client Satisfaction',
      value: '4.8/5',
      change: 5.1,
      icon: ArrowTrendingUpIcon,
      color: 'bg-pink-500',
      period: 'vs last month'
    },
    {
      title: 'Project Completion',
      value: '94%',
      change: 2.3,
      icon: CalendarDaysIcon,
      color: 'bg-indigo-500',
      period: 'on-time delivery'
    }
  ];

  const chartTypes = [
    { id: 'revenue', name: 'Revenue Trends', icon: CurrencyDollarIcon },
    { id: 'projects', name: 'Project Pipeline', icon: ClipboardDocumentListIcon },
    { id: 'clients', name: 'Client Acquisition', icon: UserGroupIcon },
    { id: 'performance', name: 'Performance', icon: ChartBarIcon }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 185000, projects: 8 },
    { month: 'Feb', revenue: 195000, projects: 9 },
    { month: 'Mar', revenue: 210000, projects: 11 },
    { month: 'Apr', revenue: 225000, projects: 10 },
    { month: 'May', revenue: 240000, projects: 12 },
    { month: 'Jun', revenue: 235000, projects: 12 }
  ];

  const projectsByType = [
    { type: 'Kitchen Renovation', count: 15, percentage: 35, color: 'bg-blue-500' },
    { type: 'Bathroom Remodel', count: 12, percentage: 28, color: 'bg-green-500' },
    { type: 'Full House', count: 8, percentage: 19, color: 'bg-purple-500' },
    { type: 'Commercial', count: 5, percentage: 12, color: 'bg-orange-500' },
    { type: 'Other', count: 3, percentage: 6, color: 'bg-gray-500' }
  ];

  const clientSources = [
    { source: 'Referrals', count: 18, percentage: 45, color: 'bg-green-500' },
    { source: 'Website', count: 12, percentage: 30, color: 'bg-blue-500' },
    { source: 'Social Media', count: 6, percentage: 15, color: 'bg-purple-500' },
    { source: 'Direct', count: 4, percentage: 10, color: 'bg-orange-500' }
  ];

  const topPerformingProjects = [
    {
      name: 'Smith Kitchen Renovation',
      client: 'John & Mary Smith',
      revenue: '$45,000',
      profit: '$12,500',
      margin: '28%',
      status: 'In Progress'
    },
    {
      name: 'Johnson Bathroom Remodel',
      client: 'Sarah Johnson',
      revenue: '$28,000',
      profit: '$8,400',
      margin: '30%',
      status: 'Planning'
    },
    {
      name: 'Davis Deck Construction',
      client: 'Mike Davis',
      revenue: '$22,000',
      profit: '$6,200',
      margin: '28%',
      status: 'Review'
    },
    {
      name: 'Wilson Kitchen Extension',
      client: 'Lisa Wilson',
      revenue: '$65,000',
      profit: '$19,500',
      margin: '30%',
      status: 'In Progress'
    }
  ];

  const renderMetricCard = (metric: MetricCard) => (
  <div key={metric.title} className="surface-1 rounded-xl shadow-sm border border-token p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-full ${metric.color}`}>
            <metric.icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{metric.title}</p>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`flex items-center ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {metric.change >= 0 ? (
              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
            )}
            <span className="text-sm font-semibold">
              {Math.abs(metric.change)}%
            </span>
          </div>
          <p className="text-xs text-gray-500">{metric.period}</p>
        </div>
      </div>
    </div>
  );

  const renderRevenueChart = () => (
  <div className="surface-1 rounded-xl shadow-sm border border-token p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
        <div className="flex space-x-2">
          <Button size="sm" intent="primary">Revenue</Button>
          <Button size="sm" intent="neutral">Projects</Button>
        </div>
      </div>
      
      <div className="h-80">
        <div className="flex items-end justify-between h-full space-x-2">
          {revenueData.map((data, index) => {
            const maxRevenue = Math.max(...revenueData.map(d => d.revenue));
            const height = (data.revenue / maxRevenue) * 100;
            
            return (
              <div key={data.month} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-200 dark:bg-[color-mix(in_oklab,var(--border),transparent_70%)] rounded-t-lg relative" style={{ height: '240px' }}>
                  <div 
                    className="w-full bg-blue-500 rounded-t-lg absolute bottom-0 transition-all duration-500"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs font-medium text-gray-900 dark:text-[var(--text)]">{data.month}</p>
                  <p className="text-xs text-gray-500 dark:text-[var(--text-dim)]">${(data.revenue / 1000).toFixed(0)}k</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderProjectTypeChart = () => (
  <div className="surface-1 rounded-xl shadow-sm border border-token p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Projects by Type</h3>
      <div className="space-y-4">
        {projectsByType.map((project, index) => (
          <div key={project.type} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${project.color}`} />
              <span className="text-sm font-medium text-gray-900">{project.type}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-24 bg-gray-200 dark:bg-[color-mix(in_oklab,var(--border),transparent_70%)] rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${project.color}`}
                  style={{ width: `${project.percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">{project.count}</span>
              <span className="text-sm text-gray-500 w-8 text-right">{project.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderClientSourceChart = () => (
  <div className="surface-1 rounded-xl shadow-sm border border-token p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Client Acquisition Sources</h3>
      <div className="space-y-4">
        {clientSources.map((source, index) => (
          <div key={source.source} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${source.color}`} />
              <span className="text-sm font-medium text-gray-900">{source.source}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-24 bg-gray-200 dark:bg-[color-mix(in_oklab,var(--border),transparent_70%)] rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${source.color}`}
                  style={{ width: `${source.percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-8 text-right">{source.count}</span>
              <span className="text-sm text-gray-500 w-12 text-right">{source.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTopProjectsTable = () => (
  <div className="surface-1 rounded-xl shadow-sm border border-token">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Top Performing Projects</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-[color-mix(in_oklab,var(--border),transparent_40%)]">
          <thead className="bg-gray-50 dark:bg-[var(--surface-2)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Margin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="surface-1 divide-y divide-gray-200 dark:divide-[color-mix(in_oklab,var(--border),transparent_40%)]">
            {topPerformingProjects.map((project, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-[var(--surface-2)]">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{project.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{project.client}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{project.revenue}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-green-600 font-medium">{project.profit}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{project.margin}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'Planning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {project.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Track your business performance and growth metrics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input"
            >
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.name}
                </option>
              ))}
            </select>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-token text-gray-700 dark:text-[var(--text)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--surface-2)] transition-colors">
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map(renderMetricCard)}
        </div>

        {/* Chart Navigation */}
  <div className="surface-1 rounded-xl shadow-sm border border-token p-6">
          <div className="flex items-center space-x-1 border-b border-gray-200">
            {chartTypes.map((chart) => {
              const IconComponent = chart.icon;
              return (
                <button
                  key={chart.id}
                  onClick={() => setSelectedChart(chart.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    selectedChart === chart.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{chart.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Chart */}
        {selectedChart === 'revenue' && renderRevenueChart()}

        {/* Secondary Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {renderProjectTypeChart()}
          {renderClientSourceChart()}
        </div>

        {/* Top Projects Table */}
        {renderTopProjectsTable()}

        {/* Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="surface-1 rounded-xl shadow-sm border border-token p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-600/20 rounded-lg">
                <ArrowTrendingUpIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-[var(--text)]">Growth Rate</h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">+24%</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-[var(--text-dim)]">
              Year-over-year revenue growth showing strong business expansion
            </p>
          </div>

          <div className="surface-1 rounded-xl shadow-sm border border-token p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-600/20 rounded-lg">
                <CalendarDaysIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-[var(--text)]">Avg Project Duration</h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">45 days</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-[var(--text-dim)]">
              Average time from project start to completion
            </p>
          </div>

          <div className="surface-1 rounded-xl shadow-sm border border-token p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-600/20 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-[var(--text)]">Client Retention</h3>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">87%</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-[var(--text-dim)]">
              Percentage of clients who return for additional projects
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
