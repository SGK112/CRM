'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateEstimatePDF, generateBulkPDF, downloadDataAsCSV } from '@/lib/pdf-generator';
import {
  Calculator,
  FileText,
  Download,
  Share2,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Clock,
  Users,
  Wrench,
  Hammer,
  Building,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Copy,
  Trash2,
  Bot,
  Brain,
  Target,
  TrendingUp,
  Home,
  MapPin,
  Settings,
  MoreVertical,
  Send
} from 'lucide-react';

interface EstimateItem {
  id: string;
  category: 'labor' | 'materials' | 'permits' | 'equipment' | 'overhead' | 'other';
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  notes?: string;
  supplierInfo?: string;
  leadTime?: number; // in days
  warranty?: string;
  isAiGenerated?: boolean;
}

interface Estimate {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  projectType: 'kitchen' | 'bathroom' | 'full-house' | 'addition' | 'exterior' | 'commercial';
  projectScope: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'revised' | 'accepted' | 'completed';
  priority: 'low' | 'medium' | 'high';
  totalAmount: number;
  markup: number; // percentage
  validUntil: Date;
  items: EstimateItem[];
  notes: string;
  terms: string;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  viewedAt?: Date;
  approvedAt?: Date;
  aiInsights?: {
    marketComparison: string;
    riskFactors: string[];
    recommendations: string[];
    confidenceScore: number;
  };
  timeline?: {
    startDate: Date;
    endDate: Date;
    phases: Array<{
      name: string;
      duration: number;
      dependencies: string[];
    }>;
  };
}

const projectTypeColors = {
  kitchen: 'bg-orange-500',
  bathroom: 'bg-blue-500',
  'full-house': 'bg-purple-500',
  addition: 'bg-green-500',
  exterior: 'bg-yellow-500',
  commercial: 'bg-gray-500'
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  revised: 'bg-blue-100 text-blue-800',
  accepted: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800'
};

const categoryIcons = {
  labor: Hammer,
  materials: Building,
  permits: FileText,
  equipment: Wrench,
  overhead: Calculator,
  other: Settings
};

export default function EstimatesPage() {
  const router = useRouter();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [filteredEstimates, setFilteredEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectTypeFilter, setProjectTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [showEstimateModal, setShowEstimateModal] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // PDF download handlers
  const handleDownloadPDF = async (estimate: Estimate) => {
    try {
      await generateEstimatePDF(estimate);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  const handleBulkDownload = async (type: 'pdf' | 'csv') => {
    try {
      if (type === 'pdf') {
        await generateBulkPDF(filteredEstimates, 'estimates');
      } else {
        const csvData = filteredEstimates.map(est => ({
          id: est.id,
          title: est.title,
          clientName: est.clientName,
          projectType: est.projectType,
          status: est.status,
          totalAmount: est.totalAmount,
          createdAt: est.createdAt.toLocaleDateString(),
          validUntil: est.validUntil.toLocaleDateString()
        }));
        downloadDataAsCSV(csvData, `estimates-${new Date().toISOString().split('T')[0]}`);
      }
    } catch (error) {
      console.error('Error generating bulk download:', error);
      setError('Failed to generate download. Please try again.');
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, []);

  useEffect(() => {
    filterEstimates();
  }, [estimates, searchTerm, statusFilter, projectTypeFilter, priorityFilter]);

  const fetchEstimates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data with comprehensive estimates for kitchen/bath remodeling
      const mockEstimates: Estimate[] = [
        {
          id: '1',
          title: 'Smith Family Kitchen Renovation',
          clientId: 'client-1',
          clientName: 'Smith Family',
          projectType: 'kitchen',
          projectScope: 'Complete kitchen renovation including cabinetry, countertops, appliances, flooring, and electrical work',
          status: 'pending',
          priority: 'high',
          totalAmount: 45750,
          markup: 20,
          validUntil: new Date(2024, 1, 15),
          createdAt: new Date(2024, 0, 10),
          updatedAt: new Date(2024, 0, 12),
          sentAt: new Date(2024, 0, 12),
          items: [
            {
              id: 'item-1',
              category: 'materials',
              description: 'Custom Shaker Style Cabinets - Upper & Lower',
              quantity: 18,
              unit: 'linear feet',
              unitCost: 450,
              totalCost: 8100,
              supplierInfo: 'Premier Cabinet Co.',
              leadTime: 21,
              warranty: '2 years',
              isAiGenerated: true
            },
            {
              id: 'item-2',
              category: 'materials',
              description: 'Quartz Countertops - Premium Grade',
              quantity: 35,
              unit: 'sq ft',
              unitCost: 85,
              totalCost: 2975,
              supplierInfo: 'Stone Masters Inc.',
              leadTime: 14,
              warranty: '10 years'
            },
            {
              id: 'item-3',
              category: 'labor',
              description: 'Kitchen Installation & Demo',
              quantity: 40,
              unit: 'hours',
              unitCost: 75,
              totalCost: 3000,
              notes: 'Includes demolition, installation, and cleanup'
            }
          ],
          notes: 'Client requested premium finishes with modern aesthetic. Timeline flexible but prefers completion before spring.',
          terms: 'Payment: 50% deposit, 25% at rough-in, 25% on completion. All materials guaranteed. Change orders require written approval.',
          aiInsights: {
            marketComparison: 'This estimate is 8% below market average for similar kitchen renovations in your area.',
            riskFactors: ['Potential electrical upgrades needed', 'Lead time on custom cabinets could extend timeline'],
            recommendations: ['Consider upgrading electrical panel', 'Add 10% contingency for unforeseen issues'],
            confidenceScore: 0.87
          },
          timeline: {
            startDate: new Date(2024, 1, 20),
            endDate: new Date(2024, 2, 25),
            phases: [
              { name: 'Demolition', duration: 3, dependencies: [] },
              { name: 'Electrical & Plumbing', duration: 5, dependencies: ['Demolition'] },
              { name: 'Cabinet Installation', duration: 3, dependencies: ['Electrical & Plumbing'] },
              { name: 'Final Details', duration: 3, dependencies: ['Cabinet Installation'] }
            ]
          }
        },
        {
          id: '2',
          title: 'Johnson Master Bath Renovation',
          clientId: 'client-2',
          clientName: 'Johnson Family',
          projectType: 'bathroom',
          projectScope: 'Master bathroom renovation with walk-in shower, double vanity, and luxury finishes',
          status: 'approved',
          priority: 'medium',
          totalAmount: 28900,
          markup: 25,
          validUntil: new Date(2024, 2, 1),
          createdAt: new Date(2024, 0, 5),
          updatedAt: new Date(2024, 0, 8),
          sentAt: new Date(2024, 0, 8),
          approvedAt: new Date(2024, 0, 10),
          items: [
            {
              id: 'item-5',
              category: 'materials',
              description: 'Porcelain Tile Flooring - Large Format',
              quantity: 120,
              unit: 'sq ft',
              unitCost: 12,
              totalCost: 1440,
              supplierInfo: 'Tile & Stone Depot'
            },
            {
              id: 'item-6',
              category: 'materials',
              description: 'Custom Double Vanity with Quartz Top',
              quantity: 1,
              unit: 'unit',
              unitCost: 3200,
              totalCost: 3200,
              leadTime: 18
            }
          ],
          notes: 'High-end finishes with spa-like atmosphere. Client wants heated floors.',
          terms: 'Standard payment terms apply. All fixtures include installation.',
          aiInsights: {
            marketComparison: 'This estimate aligns with market rates for luxury bathroom renovations.',
            riskFactors: ['Potential plumbing complications behind walls'],
            recommendations: ['Budget for heated floor system', 'Consider waterproofing upgrade'],
            confidenceScore: 0.92
          }
        },
        {
          id: '3',
          title: 'Martinez Kitchen Cabinet Refresh',
          clientId: 'client-3',
          clientName: 'Martinez Family',
          projectType: 'kitchen',
          projectScope: 'Cabinet refacing, new countertops, and backsplash installation',
          status: 'draft',
          priority: 'low',
          totalAmount: 18500,
          markup: 18,
          validUntil: new Date(2024, 2, 20),
          createdAt: new Date(2024, 0, 15),
          updatedAt: new Date(2024, 0, 15),
          items: [
            {
              id: 'item-8',
              category: 'materials',
              description: 'Cabinet Refacing - Shaker Style Doors',
              quantity: 22,
              unit: 'doors',
              unitCost: 180,
              totalCost: 3960,
              isAiGenerated: true
            }
          ],
          notes: 'Budget-conscious renovation focusing on maximum impact updates.',
          terms: 'Flexible payment schedule available.',
          aiInsights: {
            marketComparison: 'Competitive pricing for cabinet refacing projects.',
            riskFactors: ['Existing cabinet condition may affect timeline'],
            recommendations: ['Include cabinet hardware upgrade', 'Consider soft-close hinges'],
            confidenceScore: 0.84
          }
        }
      ];

      setEstimates(mockEstimates);
    } catch (error) {
      console.error('Error fetching estimates:', error);
      setError('Failed to load estimates');
    } finally {
      setLoading(false);
    }
  };

  const filterEstimates = () => {
    let filtered = estimates.filter(estimate => {
      const matchesSearch = estimate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           estimate.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           estimate.projectScope.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || estimate.status === statusFilter;
      const matchesProjectType = projectTypeFilter === 'all' || estimate.projectType === projectTypeFilter;
      const matchesPriority = priorityFilter === 'all' || estimate.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesProjectType && matchesPriority;
    });

    setFilteredEstimates(filtered);
  };

  const stats = useMemo(() => {
    const total = filteredEstimates.length;
    const pending = filteredEstimates.filter(e => e.status === 'pending').length;
    const approved = filteredEstimates.filter(e => e.status === 'approved').length;
    const totalValue = filteredEstimates.reduce((sum, e) => sum + e.totalAmount, 0);
    const avgValue = total > 0 ? totalValue / total : 0;

    return { total, pending, approved, totalValue, avgValue };
  }, [filteredEstimates]);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-700 dark:text-brand-400">
            Professional Estimates
          </h1>
          <p className="text-gray-800 dark:text-gray-200 mt-1">
            AI-driven estimation for kitchen & bath remodeling projects
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkDownload('pdf')}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              title="Download all estimates as PDF"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
            
            <button
              onClick={() => handleBulkDownload('csv')}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              title="Download all estimates as CSV"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          <button
            onClick={() => setShowAiAssistant(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Bot className="w-4 h-4" />
            AI Assistant
          </button>

          <button
            onClick={() => router.push('/dashboard/estimates/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Estimate
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-800 dark:text-gray-300">Total Estimates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-800 dark:text-gray-300">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-800 dark:text-gray-300">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-800 dark:text-gray-300">Total Value</p>
              <p className="text-2xl font-bold text-purple-600">${stats.totalValue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-800 dark:text-gray-300">Avg Value</p>
              <p className="text-2xl font-bold text-indigo-600">${stats.avgValue.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search estimates..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="revised">Revised</option>
                <option value="accepted">Accepted</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Type
              </label>
              <select
                value={projectTypeFilter}
                onChange={(e) => setProjectTypeFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="kitchen">Kitchen</option>
                <option value="bathroom">Bathroom</option>
                <option value="full-house">Full House</option>
                <option value="addition">Addition</option>
                <option value="exterior">Exterior</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Professional estimates display */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEstimates.map((estimate) => (
            <div
              key={estimate.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedEstimate(estimate);
                setShowEstimateModal(true);
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {estimate.title}
                  </h3>
                  <p className="text-sm text-gray-800 dark:text-gray-300">
                    {estimate.clientName}
                  </p>
                </div>

                <span
                  className="px-2 py-1 text-xs rounded-full text-white"
                  style={{ backgroundColor: projectTypeColors[estimate.projectType] }}
                >
                  {estimate.projectType}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-800 dark:text-gray-300">Amount:</span>
                  <span className="font-semibold text-green-600">
                    ${estimate.totalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-800 dark:text-gray-300">Status:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${statusColors[estimate.status]}`}>
                    {estimate.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-800 dark:text-gray-300">Priority:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    estimate.priority === 'high' ? 'bg-red-100 text-red-800' :
                    estimate.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {estimate.priority}
                  </span>
                </div>
              </div>

              {estimate.aiInsights && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                      AI Confidence: {Math.round(estimate.aiInsights.confidenceScore * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    {estimate.aiInsights.marketComparison}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-gray-700 dark:text-gray-300">
                  Created {estimate.createdAt.toLocaleDateString()}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadPDF(estimate);
                    }}
                    className="p-1.5 bg-red-100 dark:bg-red-900 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                    title="Download PDF"
                  >
                    <Download className="w-3 h-3 text-red-600" />
                  </button>
                  {estimate.sentAt && (
                    <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                      <Send className="w-3 h-3 text-blue-600" />
                    </div>
                  )}
                  {estimate.approvedAt && (
                    <div className="p-1 bg-green-100 dark:bg-green-900 rounded">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
