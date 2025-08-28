'use client';

import { useState } from 'react';
import {
  DocumentArrowDownIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  EyeIcon,
  ShareIcon,
  PrinterIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface Report {
  id: string;
  name: string;
  type: 'financial' | 'project' | 'client' | 'custom';
  description: string;
  lastGenerated: string;
  status: 'ready' | 'generating' | 'scheduled';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}

export default function ReportsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const reportTypes = [
    { id: 'all', name: 'All Reports' },
    { id: 'financial', name: 'Financial' },
    { id: 'project', name: 'Project' },
    { id: 'client', name: 'Client' },
    { id: 'custom', name: 'Custom' }
  ];

  const reports: Report[] = [
    {
      id: '1',
      name: 'Monthly Financial Summary',
      type: 'financial',
      description: 'Complete overview of revenue, expenses, and profit margins',
      lastGenerated: '2024-01-15',
      status: 'ready',
      icon: CurrencyDollarIcon,
      color: 'bg-green-500'
    },
    {
      id: '2',
      name: 'Project Performance Report',
      type: 'project',
      description: 'Analysis of project timelines, budgets, and completion rates',
      lastGenerated: '2024-01-14',
      status: 'ready',
      icon: ClipboardDocumentListIcon,
      color: 'bg-blue-500'
    },
    {
      id: '3',
      name: 'Client Satisfaction Survey',
      type: 'client',
      description: 'Client feedback and satisfaction metrics compilation',
      lastGenerated: '2024-01-13',
      status: 'generating',
      icon: UserGroupIcon,
      color: 'bg-purple-500'
    },
    {
      id: '4',
      name: 'Quarterly Tax Report',
      type: 'financial',
      description: 'Tax-ready financial statements and deductions summary',
      lastGenerated: '2024-01-01',
      status: 'scheduled',
      icon: DocumentTextIcon,
      color: 'bg-orange-500'
    },
    {
      id: '5',
      name: 'Equipment & Materials Usage',
      type: 'project',
      description: 'Analysis of equipment utilization and material costs',
      lastGenerated: '2024-01-12',
      status: 'ready',
      icon: ChartBarIcon,
      color: 'bg-indigo-500'
    },
    {
      id: '6',
      name: 'Lead Generation Analysis',
      type: 'client',
      description: 'Source tracking and conversion rate analysis',
      lastGenerated: '2024-01-11',
      status: 'ready',
      icon: UserGroupIcon,
      color: 'bg-pink-500'
    }
  ];

  const quickReports = [
    {
      name: 'Today\'s Activity',
      description: 'Quick overview of today\'s projects and activities',
      icon: CalendarDaysIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Weekly Financial',
      description: 'This week\'s revenue and expenses summary',
      icon: CurrencyDollarIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Active Projects',
      description: 'Status report of all ongoing projects',
      icon: ClipboardDocumentListIcon,
      color: 'bg-purple-500'
    },
    {
      name: 'Client Invoices',
      description: 'Outstanding invoices and payment status',
      icon: DocumentTextIcon,
      color: 'bg-orange-500'
    }
  ];

  const filteredReports = reports.filter(report => {
    const matchesFilter = selectedFilter === 'all' || report.type === selectedFilter;
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Ready</span>;
      case 'generating':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Generating</span>;
      case 'scheduled':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Scheduled</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderReportCard = (report: Report) => (
    <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${report.color}`}>
            <report.icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
            <p className="text-sm text-gray-800 mt-1">{report.description}</p>
          </div>
        </div>
        {getStatusBadge(report.status)}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700 >
          Last generated: {formatDate(report.lastGenerated)}
        </div>
        <div className="flex items-center space-x-2">
          <button 
            className="inline-flex items-center px-3 py-2 text-sm text-gray-800 hover:text-blue-600 transition-colors"
            disabled={report.status === 'generating'}
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            View
          </button>
          <button 
            className="inline-flex items-center px-3 py-2 text-sm text-gray-800 hover:text-green-600 transition-colors"
            disabled={report.status === 'generating'}
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
            Download
          </button>
          <button 
            className="inline-flex items-center px-3 py-2 text-sm text-gray-800 hover:text-purple-600 transition-colors"
            disabled={report.status === 'generating'}
          >
            <ShareIcon className="h-4 w-4 mr-1" />
            Share
          </button>
        </div>
      </div>
    </div>
  );

  const renderQuickReportCard = (report: any, index: number) => (
    <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${report.color}`}>
          <report.icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
          <p className="text-sm text-gray-800 mt-1">{report.description}</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          Generate
        </button>
      </div>
    </div>
  );

  const CreateReportModal = () => (
    showCreateModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Create Custom Report</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
              <input
                type="text"
                className="input"
                placeholder="Enter report name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select className="input">
                <option value="financial">Financial Report</option>
                <option value="project">Project Report</option>
                <option value="client">Client Report</option>
                <option value="custom">Custom Report</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  className="input"
                />
                <input
                  type="date"
                  className="input"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Include Data</label>
              <div className="space-y-2">
                {['Revenue & Expenses', 'Project Details', 'Client Information', 'Material Costs', 'Labor Hours', 'Equipment Usage'].map((item) => (
                  <label key={item} className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Create Report
            </button>
          </div>
        </div>
      </div>
    )
  );

  return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-700 dark:text-brand-400">Reports & Analytics</h1>
            <p className="text-gray-800 mt-1">
              Generate and manage business reports and analytics
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Report
          </button>
        </div>

        {/* Quick Reports */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickReports.map(renderQuickReportCard)}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {reportTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedFilter(type.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedFilter === type.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
              <button className="inline-flex items-center px-3 py-2 text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">All Reports</h2>
            <div className="text-sm text-gray-700 >
              {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          {filteredReports.length > 0 ? (
            <div className="space-y-4">
              {filteredReports.map(renderReportCard)}
            </div>
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-800 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first report to get started'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Report
              </button>
            </div>
          )}
        </div>

        {/* Report Templates */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Report Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Monthly P&L Statement', description: 'Profit and loss overview' },
              { name: 'Project Timeline Report', description: 'Project progress tracking' },
              { name: 'Client Communication Log', description: 'Client interaction history' },
              { name: 'Material Usage Report', description: 'Construction material analysis' },
              { name: 'Labor Cost Analysis', description: 'Labor hours and costs breakdown' },
              { name: 'Equipment Maintenance', description: 'Equipment service tracking' }
            ].map((template, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer">
                <h3 className="font-medium text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-800 mt-1">{template.description}</p>
                <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Create Report Modal */}
        <CreateReportModal />
      </div>
  );
}
