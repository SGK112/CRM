'use client';

import { useState } from 'react';
import Layout from '../../../components/Layout';
import {
  MegaphoneIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface Campaign {
  _id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'social' | 'direct_mail' | 'referral';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  targetAudience: {
    totalContacts: number;
    segments: string[];
  };
  budget: {
    allocated: number;
    spent: number;
    currency: string;
  };
  schedule: {
    startDate: string;
    endDate: string;
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  };
  metrics: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const mockCampaigns: Campaign[] = [
  {
    _id: '1',
    name: 'Summer Kitchen Remodel Special',
    description: 'Promotional campaign for summer kitchen renovation packages with 15% discount',
    type: 'email',
    status: 'active',
    targetAudience: {
      totalContacts: 1250,
      segments: ['Kitchen Interest', 'High Value Clients', 'Past Customers']
    },
    budget: {
      allocated: 5000,
      spent: 2100,
      currency: 'USD'
    },
    schedule: {
      startDate: '2025-08-01T00:00:00Z',
      endDate: '2025-08-31T23:59:59Z',
      frequency: 'weekly'
    },
    metrics: {
      sent: 1200,
      opened: 480,
      clicked: 96,
      converted: 12,
      revenue: 45000
    },
    createdBy: 'Marketing Team',
    createdAt: '2025-07-25T10:00:00Z',
    updatedAt: '2025-08-14T15:30:00Z'
  },
  {
    _id: '2',
    name: 'Bathroom Renovation Follow-up',
    description: 'SMS campaign to follow up with bathroom renovation leads from trade shows',
    type: 'sms',
    status: 'active',
    targetAudience: {
      totalContacts: 450,
      segments: ['Trade Show Leads', 'Bathroom Interest']
    },
    budget: {
      allocated: 1500,
      spent: 890,
      currency: 'USD'
    },
    schedule: {
      startDate: '2025-08-10T00:00:00Z',
      endDate: '2025-08-24T23:59:59Z',
      frequency: 'once'
    },
    metrics: {
      sent: 420,
      opened: 380,
      clicked: 76,
      converted: 8,
      revenue: 28000
    },
    createdBy: 'Sales Team',
    createdAt: '2025-08-08T14:20:00Z',
    updatedAt: '2025-08-14T11:45:00Z'
  },
  {
    _id: '3',
    name: 'Referral Reward Program',
    description: 'Customer referral program offering $500 credit for successful referrals',
    type: 'referral',
    status: 'active',
    targetAudience: {
      totalContacts: 850,
      segments: ['Completed Projects', 'Satisfied Customers', 'High Value Clients']
    },
    budget: {
      allocated: 10000,
      spent: 3500,
      currency: 'USD'
    },
    schedule: {
      startDate: '2025-07-15T00:00:00Z',
      endDate: '2025-12-31T23:59:59Z',
      frequency: 'monthly'
    },
    metrics: {
      sent: 800,
      opened: 640,
      clicked: 128,
      converted: 7,
      revenue: 35000
    },
    createdBy: 'Customer Success',
    createdAt: '2025-07-10T09:30:00Z',
    updatedAt: '2025-08-14T16:20:00Z'
  }
];

const campaignTypeIcons = {
  email: EnvelopeIcon,
  sms: PhoneIcon,
  social: ChatBubbleLeftRightIcon,
  direct_mail: MegaphoneIcon,
  referral: UserGroupIcon
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || campaign.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalMetrics = campaigns.reduce((acc, campaign) => ({
    sent: acc.sent + campaign.metrics.sent,
    opened: acc.opened + campaign.metrics.opened,
    clicked: acc.clicked + campaign.metrics.clicked,
    converted: acc.converted + campaign.metrics.converted,
    revenue: acc.revenue + campaign.metrics.revenue,
    budget: acc.budget + campaign.budget.allocated,
    spent: acc.spent + campaign.budget.spent
  }), { sent: 0, opened: 0, clicked: 0, converted: 0, revenue: 0, budget: 0, spent: 0 });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (numerator: number, denominator: number): string => {
    if (denominator === 0) return '0%';
    return `${((numerator / denominator) * 100).toFixed(1)}%`;
  };

  const handleToggleStatus = (campaignId: string) => {
    setCampaigns(prev => 
      prev.map(campaign => {
        if (campaign._id === campaignId) {
          const newStatus = campaign.status === 'active' ? 'paused' : 'active';
          return { ...campaign, status: newStatus };
        }
        return campaign;
      })
    );
  };

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-700 dark:text-brand-400 mb-2">Marketing Campaigns</h1>
            <p className="text-gray-800">Manage your marketing campaigns and track performance</p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4 md:mt-0">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Campaign
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MegaphoneIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-800">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <EnvelopeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-800">Messages Sent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalMetrics.sent.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-800">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(totalMetrics.converted, totalMetrics.sent)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-800">Revenue Generated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalMetrics.revenue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-800">Open Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatPercentage(totalMetrics.opened, totalMetrics.sent)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(totalMetrics.opened / totalMetrics.sent) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-800">Click Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatPercentage(totalMetrics.clicked, totalMetrics.sent)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(totalMetrics.clicked / totalMetrics.sent) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-800">Conversion Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatPercentage(totalMetrics.converted, totalMetrics.sent)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${(totalMetrics.converted / totalMetrics.sent) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-800">Total Budget</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(totalMetrics.budget)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-800">Amount Spent</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(totalMetrics.spent)}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full" 
                  style={{ width: `${(totalMetrics.spent / totalMetrics.budget) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-800">Remaining</span>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(totalMetrics.budget - totalMetrics.spent)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-800">ROI</span>
                <div className="flex items-center">
                  {totalMetrics.revenue > totalMetrics.spent ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    totalMetrics.revenue > totalMetrics.spent ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {totalMetrics.spent > 0 ? `${(((totalMetrics.revenue - totalMetrics.spent) / totalMetrics.spent) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Types</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="social">Social Media</option>
              <option value="direct_mail">Direct Mail</option>
              <option value="referral">Referral</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="space-y-4">
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <MegaphoneIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
              <p className="text-gray-800 mb-4">Create your first marketing campaign to get started.</p>
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Campaign
              </button>
            </div>
          ) : (
            filteredCampaigns.map((campaign) => {
              const TypeIcon = campaignTypeIcons[campaign.type];
              
              return (
                <div key={campaign._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <TypeIcon className="h-5 w-5 text-gray-800" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[campaign.status]}`}>
                              {campaign.status}
                            </span>
                            <span className="text-xs text-gray-700 capitalize">
                              {campaign.type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-800 mb-4">{campaign.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-700 >Audience</p>
                          <p className="font-medium text-gray-900">
                            {campaign.targetAudience.totalContacts.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-700 >Sent</p>
                          <p className="font-medium text-gray-900">
                            {campaign.metrics.sent.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-700 >Conversions</p>
                          <p className="font-medium text-gray-900">
                            {campaign.metrics.converted} ({formatPercentage(campaign.metrics.converted, campaign.metrics.sent)})
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-700 >Revenue</p>
                          <p className="font-medium text-green-600">
                            {formatCurrency(campaign.metrics.revenue)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center space-x-4 text-xs text-gray-700 >
                        <span>Budget: {formatCurrency(campaign.budget.spent)} / {formatCurrency(campaign.budget.allocated)}</span>
                        <span>•</span>
                        <span>
                          {new Date(campaign.schedule.startDate).toLocaleDateString()} - {new Date(campaign.schedule.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleToggleStatus(campaign._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          campaign.status === 'active'
                            ? 'text-yellow-600 hover:bg-yellow-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={campaign.status === 'active' ? 'Pause' : 'Resume'}
                      >
                        {campaign.status === 'active' ? (
                          <PauseIcon className="h-5 w-5" />
                        ) : (
                          <PlayIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
