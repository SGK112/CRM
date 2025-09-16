'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import stripeEstimateService from '@/lib/stripe-estimates';
import {
  ArrowLeftIcon,
  PencilIcon,
  PaperAirplaneIcon,
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  CurrencyDollarIcon,
  ShareIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

interface LineItem {
  _id?: string;
  name: string;
  description?: string;
  quantity: number;
  baseCost: number;
  marginPct: number;
  sellPrice: number;
  taxable: boolean;
  sku?: string;
}

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

interface Estimate {
  _id: string;
  number: string;
  status: string;
  items: LineItem[];
  subtotalSell: number;
  subtotalCost: number;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  client?: Client;
  createdAt: string;
  updatedAt: string;
}

function getStatusBadge(status: string) {
  const statusConfig = {
    'draft': { color: 'bg-gray-100 text-gray-700 border-gray-300', label: 'Draft', icon: DocumentDuplicateIcon },
    'sent': { color: 'bg-blue-100 text-blue-700 border-blue-300', label: 'Sent', icon: PaperAirplaneIcon },
    'viewed': { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', label: 'Viewed', icon: EyeIcon },
    'accepted': { color: 'bg-green-100 text-green-700 border-green-300', label: 'Accepted', icon: CheckCircleIcon },
    'rejected': { color: 'bg-red-100 text-red-700 border-red-300', label: 'Rejected', icon: XCircleIcon },
    'converted': { color: 'bg-purple-100 text-purple-700 border-purple-300', label: 'Converted', icon: CurrencyDollarIcon }
  } as const;

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
      <Icon className="w-4 h-4 mr-1" />
      {config.label}
    </span>
  );
}

export default function EstimateReviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('accessToken') || localStorage.getItem('token')
    : '';

  useEffect(() => {
    if (id) {
      fetchEstimate();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEstimate = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/estimates/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEstimate(data);
      } else {
        setError('Failed to load estimate');
      }
    } catch (err) {
      setError('Error loading estimate');
    } finally {
      setLoading(false);
    }
  };

  const sendEstimate = async () => {
    if (!id) return;
    
    setActionLoading('send');
    try {
      const response = await fetch(`/api/estimates/${id}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchEstimate();
        setSuccess('Estimate sent successfully!');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError('Failed to send estimate');
      }
    } catch (err) {
      setError('Error sending estimate');
    } finally {
      setActionLoading('');
    }
  };

    const handleConvertToInvoice = async () => {
    if (!estimate || !estimate.client) return;
    
    setLoading(true);
    try {
      // Prepare data for Stripe invoice conversion
      const invoiceData = {
        customerEmail: estimate.client.email || '',
        customerName: estimate.client.company || `${estimate.client.firstName} ${estimate.client.lastName}`,
        items: estimate.items.map((item: LineItem) => ({
          description: item.description || item.name || 'Service',
          quantity: item.quantity,
          amount: stripeEstimateService.dollarsToCents(item.sellPrice || 0),
        })),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        description: `Invoice for Estimate #${estimate.number || estimate._id}`,
      };

      // Convert estimate to Stripe invoice
      const stripeInvoice = await stripeEstimateService.convertEstimateToInvoice(invoiceData);
      
      // Update estimate status to converted
      const response = await fetch(`/api/estimates/${estimate._id}/convert`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stripeInvoiceId: stripeInvoice.id,
          status: 'converted'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update estimate status');
      }

      // Show success message with Stripe invoice URL
      alert(`Successfully converted to invoice! ${stripeInvoice.hosted_invoice_url ? 'View at: ' + stripeInvoice.hosted_invoice_url : ''}`);
      
      // Refresh the estimate data
      await fetchEstimate();
      
    } catch (error) {
      alert('Failed to convert estimate to invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const duplicateEstimate = async () => {
    if (!estimate) return;
    
    setActionLoading('duplicate');
    try {
      // Create a new estimate based on current one
      const duplicateData = {
        clientId: estimate.client?._id,
        items: estimate.items.map(item => ({
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          baseCost: item.baseCost,
          marginPct: item.marginPct,
          taxable: item.taxable,
          sku: item.sku
        })),
        discountType: estimate.discountType,
        discountValue: estimate.discountValue,
        taxRate: estimate.taxRate,
        notes: estimate.notes
      };

      const response = await fetch('/api/estimates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(duplicateData)
      });

      if (response.ok) {
        const newEstimate = await response.json();
        setSuccess('Estimate duplicated!');
        setTimeout(() => {
          router.push(`/dashboard/estimates/${newEstimate._id}/edit`);
        }, 1500);
      } else {
        setError('Failed to duplicate estimate');
      }
    } catch (err) {
      setError('Error duplicating estimate');
    } finally {
      setActionLoading('');
    }
  };

  const generatePDF = async () => {
    if (!id) return;
    
    setActionLoading('pdf');
    try {
      const response = await fetch(`/api/estimates/${id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `estimate-${estimate?.number || id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setSuccess('PDF downloaded successfully!');
      } else {
        setError('Failed to generate PDF');
      }
    } catch (err) {
      setError('Error generating PDF');
    } finally {
      setActionLoading('');
    }
  };

  const printEstimate = () => {
    window.print();
  };

  const shareEstimate = async () => {
    if (!estimate) return;
    
    const shareUrl = `${window.location.origin}/share/estimate/${estimate._id}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setSuccess('Share link copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to copy share link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Estimate Not Found</h2>
          <p className="text-gray-600 mb-4">The estimate you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link
            href="/dashboard/estimates"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Estimates
          </Link>
        </div>
      </div>
    );
  }

  const totalMargin = estimate.subtotalSell - estimate.subtotalCost;
  const marginPercent = estimate.subtotalSell > 0 ? (totalMargin / estimate.subtotalSell) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/estimates"
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Estimate #{estimate.number}
                  </h1>
                  {getStatusBadge(estimate.status)}
                </div>
                {estimate.client && (
                  <p className="text-sm text-gray-600 mt-1">
                    For: {estimate.client.firstName} {estimate.client.lastName}
                    {estimate.client.company && ` (${estimate.client.company})`}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={printEstimate}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print
              </button>
              
              <button
                onClick={shareEstimate}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                Share
              </button>

              <button
                onClick={generatePDF}
                disabled={actionLoading === 'pdf'}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                {actionLoading === 'pdf' ? 'Generating...' : 'Download PDF'}
              </button>

              <button
                onClick={duplicateEstimate}
                disabled={actionLoading === 'duplicate'}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                {actionLoading === 'duplicate' ? 'Duplicating...' : 'Duplicate'}
              </button>

              <Link
                href={`/dashboard/estimates/${id}/edit`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Link>

              {estimate.status === 'draft' && (
                <button
                  onClick={sendEstimate}
                  disabled={actionLoading === 'send'}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  {actionLoading === 'send' ? 'Sending...' : 'Send Estimate'}
                </button>
              )}

              {(estimate.status === 'accepted' || estimate.status === 'sent' || estimate.status === 'viewed') && (
                <button
                  onClick={handleConvertToInvoice}
                  disabled={actionLoading === 'convert'}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                  {actionLoading === 'convert' ? 'Converting...' : 'Convert to Invoice'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Estimate Header */}
          <div className="px-6 py-8 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">ESTIMATE</h2>
                <p className="text-gray-600 mt-1">#{estimate.number}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Created: {new Date(estimate.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              {/* Business Info */}
              <div className="text-right">
                <h3 className="text-lg font-semibold text-gray-900">Your Business Name</h3>
                <p className="text-sm text-gray-600">123 Business Street</p>
                <p className="text-sm text-gray-600">City, State 12345</p>
                <p className="text-sm text-gray-600">business@example.com</p>
                <p className="text-sm text-gray-600">(555) 123-4567</p>
              </div>
            </div>
          </div>

          {/* Client Information */}
          {estimate.client && (
            <div className="px-6 py-6 bg-gray-50 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Bill To:</h4>
              <div className="text-sm">
                <p className="font-medium text-gray-900">
                  {estimate.client.firstName} {estimate.client.lastName}
                </p>
                {estimate.client.company && (
                  <p className="text-gray-600">{estimate.client.company}</p>
                )}
                {estimate.client.address && (
                  <>
                    <p className="text-gray-600">{estimate.client.address.street}</p>
                    <p className="text-gray-600">
                      {estimate.client.address.city}, {estimate.client.address.state} {estimate.client.address.zipCode}
                    </p>
                  </>
                )}
                {estimate.client.email && (
                  <p className="text-gray-600">{estimate.client.email}</p>
                )}
                {estimate.client.phone && (
                  <p className="text-gray-600">{estimate.client.phone}</p>
                )}
              </div>
            </div>
          )}

          {/* Line Items */}
          <div className="px-6 py-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {estimate.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                          )}
                          {item.sku && (
                            <div className="text-xs text-gray-400 mt-1">SKU: {item.sku}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">
                        ${item.sellPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        ${(item.sellPrice * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="px-6 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">${estimate.subtotalSell.toFixed(2)}</span>
                </div>
                
                {estimate.discountAmount > 0 && (
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-gray-600">
                      Discount ({estimate.discountType === 'percent' ? `${estimate.discountValue}%` : 'Fixed'}):
                    </span>
                    <span className="text-red-600">-${estimate.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                {estimate.taxRate > 0 && (
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-gray-600">Tax ({estimate.taxRate}%):</span>
                    <span className="text-gray-900">${estimate.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between py-3 text-lg font-bold border-t border-gray-200">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">${estimate.total.toFixed(2)}</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between py-1 text-sm">
                    <span className="text-gray-600">Cost:</span>
                    <span className="text-gray-900">${estimate.subtotalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-sm">
                    <span className="text-gray-600">Margin:</span>
                    <span className="text-green-600">
                      ${totalMargin.toFixed(2)} ({marginPercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {estimate.notes && (
            <div className="px-6 py-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Notes:</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{estimate.notes}</p>
            </div>
          )}

          {/* Terms */}
          <div className="px-6 py-6 bg-gray-50 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Terms & Conditions:</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• This estimate is valid for 30 days from the date of creation.</p>
              <p>• Prices are subject to change based on material costs and availability.</p>
              <p>• A 50% deposit is required to begin work.</p>
              <p>• Final payment is due upon completion of work.</p>
              <p>• Any changes to the scope of work may result in additional charges.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-3 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          <div className="flex items-center justify-between">
            <span>{success}</span>
            <button
              onClick={() => setSuccess('')}
              className="ml-3 text-green-500 hover:text-green-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}