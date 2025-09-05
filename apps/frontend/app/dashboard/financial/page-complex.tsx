'use client';

import {
    AlertCircle,
    Brain,
    Calculator,
    CheckCircle,
    Clock,
    DollarSign,
    Eye,
    FileText,
    Filter,
    Plus,
    Receipt,
    Search,
    TrendingUp,
    Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type DocumentMode = 'estimate' | 'invoice';

interface LineItem {
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
  qbItemId?: string; // QuickBooks item ID
}

interface BaseDocument {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  projectType: 'kitchen' | 'bathroom' | 'full-house' | 'addition' | 'exterior' | 'commercial';
  projectScope: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  totalAmount: number;
  markup?: number; // percentage
  items: LineItem[];
  notes: string;
  terms: string;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  viewedAt?: Date;
  qbId?: string; // QuickBooks sync ID
  qbSyncedAt?: Date;
  qbSyncStatus?: 'pending' | 'synced' | 'error';
}

interface Estimate extends BaseDocument {
  type: 'estimate';
  validUntil: Date;
  approvedAt?: Date;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'revised' | 'accepted' | 'completed';
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

interface Invoice extends BaseDocument {
  type: 'invoice';
  invoiceNumber: string;
  dueDate: Date;
  paidDate?: Date;
  status: 'draft' | 'sent' | 'viewed' | 'overdue' | 'paid' | 'cancelled';
  amountPaid: number;
  balance: number;
  paymentMethod?: string;
  estimateId?: string; // If converted from estimate
  tax: number;
  subtotal: number;
}

type Document = Estimate | Invoice;

const estimateStatusColors = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  revised: 'bg-blue-100 text-blue-800',
  accepted: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
};

const invoiceStatusColors = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  viewed: 'bg-purple-100 text-purple-800',
  overdue: 'bg-red-100 text-red-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export default function FinancialDocumentsPage() {
  const [mode, setMode] = useState<DocumentMode>('estimate');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectTypeFilter, setProjectTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [syncingQB, setSyncingQB] = useState<string | null>(null);
  const [qbEnabled, setQbEnabled] = useState(false);

  const checkQuickBooksStatus = useCallback(async () => {
    try {
      const settings = localStorage.getItem('integrationSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setQbEnabled(parsed.quickbooks?.enabled || false);
      }
    } catch (error) {
      // Silently handle error
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data - replace with actual API calls
      const mockEstimates: Estimate[] = [
        {
          id: '1',
          type: 'estimate',
          title: 'Smith Family Kitchen Renovation',
          clientId: 'client-1',
          clientName: 'Smith Family',
          projectType: 'kitchen',
          projectScope:
            'Complete kitchen renovation including cabinetry, countertops, appliances, flooring, and electrical work',
          status: 'pending',
          priority: 'high',
          totalAmount: 45750,
          markup: 20,
          validUntil: new Date(2024, 2, 15),
          createdAt: new Date(2024, 0, 10),
          updatedAt: new Date(2024, 0, 12),
          sentAt: new Date(2024, 0, 12),
          qbSyncStatus: 'synced',
          qbSyncedAt: new Date(2024, 0, 12),
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
              isAiGenerated: true,
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
              warranty: '10 years',
            },
          ],
          notes:
            'Client requested premium finishes with modern aesthetic. Timeline flexible but prefers completion before spring.',
          terms:
            'Payment: 50% deposit, 25% at rough-in, 25% on completion. All materials guaranteed.',
          aiInsights: {
            marketComparison:
              'This estimate is 8% below market average for similar kitchen renovations in your area.',
            riskFactors: [
              'Potential electrical upgrades needed',
              'Lead time on custom cabinets could extend timeline',
            ],
            recommendations: [
              'Consider upgrading electrical panel',
              'Add 10% contingency for unforeseen issues',
            ],
            confidenceScore: 0.87,
          },
        },
      ];

      const mockInvoices: Invoice[] = [
        {
          id: 'inv-1',
          type: 'invoice',
          title: 'Johnson Master Bath Renovation - Final Invoice',
          invoiceNumber: 'INV-2024-001',
          clientId: 'client-2',
          clientName: 'Johnson Family',
          projectType: 'bathroom',
          projectScope:
            'Master bathroom renovation with walk-in shower, double vanity, and luxury finishes',
          status: 'sent',
          priority: 'medium',
          totalAmount: 28900,
          subtotal: 26270,
          tax: 2630,
          balance: 14450,
          amountPaid: 14450,
          dueDate: new Date(2024, 1, 15),
          createdAt: new Date(2024, 0, 5),
          updatedAt: new Date(2024, 0, 8),
          sentAt: new Date(2024, 0, 8),
          estimateId: '2',
          qbSyncStatus: 'pending',
          items: [
            {
              id: 'item-5',
              category: 'materials',
              description: 'Porcelain Tile Flooring - Large Format',
              quantity: 120,
              unit: 'sq ft',
              unitCost: 12,
              totalCost: 1440,
              supplierInfo: 'Tile & Stone Depot',
            },
          ],
          notes: 'High-end finishes with spa-like atmosphere. Heated floors installed.',
          terms: 'Net 30 payment terms. Late fees apply after 30 days.',
        },
      ];

      if (mode === 'estimate') {
        setDocuments(mockEstimates);
      } else {
        setDocuments(mockInvoices);
      }
    } catch (error) {
      setError(`Failed to load ${mode}s`);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  const filterDocuments = useCallback(() => {
    const filtered = documents.filter(doc => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.projectScope.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      const matchesProjectType =
        projectTypeFilter === 'all' || doc.projectType === projectTypeFilter;
      const matchesPriority = priorityFilter === 'all' || doc.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesProjectType && matchesPriority;
    });

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, statusFilter, projectTypeFilter, priorityFilter]);

  useEffect(() => {
    fetchDocuments();
    checkQuickBooksStatus();
  }, [checkQuickBooksStatus, fetchDocuments]);

  useEffect(() => {
    filterDocuments();
  }, [filterDocuments]);

  const handleQuickBooksSync = async (document: Document) => {
    if (!qbEnabled) {
      setError(
        'QuickBooks integration is not enabled. Please configure it in Settings > Integrations.'
      );
      return;
    }

    setSyncingQB(document.id);
    try {
      // QuickBooks sync functionality would go here
      // For now, just simulate success
      setTimeout(() => {
        setDocuments(prev =>
          prev.map(doc =>
            doc.id === document.id
              ? { ...doc, qbSyncStatus: 'synced', qbSyncedAt: new Date() }
              : doc
          )
        );
        setSyncingQB(null);
      }, 1000);
    } catch (error) {
      setError('Failed to sync with QuickBooks');
      setSyncingQB(null);
    }
  };

  const handleConvertToInvoice = useCallback(async () => {
    try {
      // Convert estimate to invoice functionality would go here
      // For now, just simulate success
      setTimeout(() => {
        setMode('invoice');
        fetchDocuments();
      }, 500);
    } catch (error) {
      setError('Failed to convert estimate to invoice');
    }
  }, [fetchDocuments]);

  const stats = useMemo(() => {
    const total = filteredDocuments.length;
    const totalValue = filteredDocuments.reduce((sum, doc) => sum + doc.totalAmount, 0);
    const avgValue = total > 0 ? totalValue / total : 0;

    if (mode === 'estimate') {
      const pending = filteredDocuments.filter(d => d.status === 'pending').length;
      const approved = filteredDocuments.filter(d => d.status === 'approved').length;
      return { total, pending, approved, totalValue, avgValue };
    } else {
      const invoices = filteredDocuments as Invoice[];
      const paid = invoices.filter(i => i.status === 'paid').length;
      const overdue = invoices.filter(i => i.status === 'overdue').length;
      const totalPaid = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
      const outstanding = totalValue - totalPaid;
      return { total, paid, overdue, totalValue, avgValue, totalPaid, outstanding };
    }
  }, [filteredDocuments, mode]);

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
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-brand-700 dark:text-brand-400">
              Financial Documents
            </h1>
          </div>
          <p className="text-gray-800 dark:text-gray-200">
            Manage {mode}s with AI insights and QuickBooks integration
          </p>
        </div>

        <div className="flex items-center gap-3">
          {qbEnabled && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-700">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">QB Sync</span>
            </div>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          <button
            onClick={() => (window.location.href = `/dashboard/${mode}s/new`)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New {mode === 'estimate' ? 'Estimate' : 'Invoice'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-800 dark:text-gray-300">
                Total {mode === 'estimate' ? 'Estimates' : 'Invoices'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        {mode === 'estimate' ? (
          <>
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
          </>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-800 dark:text-gray-300">Paid</p>
                  <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-800 dark:text-gray-300">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </>
        )}

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-800 dark:text-gray-300">Total Value</p>
              <p className="text-2xl font-bold text-purple-600">
                ${stats.totalValue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-800 dark:text-gray-300">Avg Value</p>
              <p className="text-2xl font-bold text-indigo-600">
                ${stats.avgValue.toLocaleString()}
              </p>
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
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder={`Search ${mode}s...`}
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
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                {mode === 'estimate' ? (
                  <>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="revised">Revised</option>
                    <option value="accepted">Accepted</option>
                    <option value="completed">Completed</option>
                  </>
                ) : (
                  <>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="viewed">Viewed</option>
                    <option value="overdue">Overdue</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Type
              </label>
              <select
                value={projectTypeFilter}
                onChange={e => setProjectTypeFilter(e.target.value)}
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
                onChange={e => setPriorityFilter(e.target.value)}
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

      {/* Documents Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map(document => (
            <div
              key={document.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {document.type === 'estimate' ? (
                      <Calculator className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Receipt className="w-4 h-4 text-green-500" />
                    )}
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {document.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-300">{document.clientName}</p>
                  {document.type === 'invoice' && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      #{(document as Invoice).invoiceNumber}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="pill sm pill-tint-neutral capitalize font-medium">
                    {document.projectType}
                  </span>
                  {document.qbSyncStatus === 'synced' && (
                    <div className="p-1 bg-green-100 dark:bg-green-900 rounded">
                      <Zap className="w-3 h-3 text-green-600" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-800 dark:text-gray-300">Amount:</span>
                  <span className="font-semibold text-green-600">
                    ${document.totalAmount.toLocaleString()}
                  </span>
                </div>

                {document.type === 'invoice' && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-800 dark:text-gray-300">Balance:</span>
                    <span className="font-semibold text-red-600">
                      ${(document as Invoice).balance.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-800 dark:text-gray-300">Status:</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      document.type === 'estimate'
                        ? estimateStatusColors[
                            document.status as keyof typeof estimateStatusColors
                          ] || 'bg-gray-100 text-gray-800'
                        : invoiceStatusColors[
                            document.status as keyof typeof invoiceStatusColors
                          ] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {document.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-800 dark:text-gray-300">Priority:</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      document.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : document.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {document.priority}
                  </span>
                </div>
              </div>

              {document.type === 'estimate' && (document as Estimate).aiInsights && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                      AI Confidence:{' '}
                      {Math.round((document as Estimate).aiInsights!.confidenceScore * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    {(document as Estimate).aiInsights!.marketComparison}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-700 dark:text-gray-300">
                  Created {document.createdAt.toLocaleDateString()}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      window.location.href = `/dashboard/${document.type}s/${document.id}`;
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
                    title={`View ${document.type}`}
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>

                  {qbEnabled && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleQuickBooksSync(document);
                      }}
                      disabled={syncingQB === document.id || document.qbSyncStatus === 'synced'}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Sync to QuickBooks"
                    >
                      {syncingQB === document.id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          Sync
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3" />
                          {document.qbSyncStatus === 'synced' ? 'Synced' : 'Sync'}
                        </>
                      )}
                    </button>
                  )}

                  {document.type === 'estimate' && document.status === 'approved' && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleConvertToInvoice();
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                      title="Convert to Invoice"
                    >
                      <Receipt className="w-3 h-3" />
                      Invoice
                    </button>
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
            <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
