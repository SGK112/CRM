'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DocumentDuplicateIcon, PaperAirplaneIcon, CurrencyDollarIcon, PencilIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  company?: string;
  email?: string;
  phone?: string;
}

interface Project {
  _id: string;
  title: string;
  status: string;
}

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
  project?: Project;
  createdAt: string;
  updatedAt: string;
}

export default function EstimateDetailPage(){
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [est, setEst] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string>('');
  
  const token = (typeof window !== 'undefined') ? 
    (localStorage.getItem('accessToken') || localStorage.getItem('token')) : '';

  const fetchOne = async () => {
    if (!token || !id) return;
    setLoading(true);
    
    try {
      const res = await fetch(`/api/estimates/${id}`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEst(data);
      } else {
        console.error('Failed to fetch estimate');
      }
    } catch (error) {
      console.error('Error fetching estimate:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (id) fetchOne(); 
  }, [id, token]);

  const recalc = async () => {
    if (!id || saving) return;
    setActionLoading('recalc');
    
    try {
      const res = await fetch(`/api/estimates/${id}/recalc`, { 
        method: 'POST', 
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchOne();
      }
    } catch (error) {
      console.error('Error recalculating estimate:', error);
    } finally {
      setActionLoading('');
    }
  };

  const sendEstimate = async () => {
    if (!id || saving) return;
    setActionLoading('send');
    
    try {
      const res = await fetch(`/api/estimates/${id}/send`, { 
        method: 'POST', 
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchOne();
      }
    } catch (error) {
      console.error('Error sending estimate:', error);
    } finally {
      setActionLoading('');
    }
  };

  const convertToInvoice = async () => {
    if (!id || saving) return;
    setActionLoading('convert');
    
    try {
      const res = await fetch(`/api/estimates/${id}/convert`, { 
        method: 'POST', 
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const invoice = await res.json();
        await fetchOne();
        // Redirect to the new invoice
        router.push(`/dashboard/invoices/${invoice._id}`);
      }
    } catch (error) {
      console.error('Error converting estimate:', error);
    } finally {
      setActionLoading('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalMargin = est ? est.subtotalSell - est.subtotalCost : 0;
  const marginPercent = est && est.subtotalSell > 0 ? (totalMargin / est.subtotalSell) * 100 : 0;

  return (
    <div className="space-y-6">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-[var(--text-dim)]">Loading estimate...</div>
          </div>
        )}
        
        {!loading && !est && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-lg font-medium text-[var(--text)]">Estimate not found</h2>
              <p className="text-[var(--text-dim)] mt-1">The estimate you're looking for doesn't exist.</p>
              <Link href="/dashboard/estimates" className="pill pill-tint-blue mt-4">
                Back to Estimates
              </Link>
            </div>
          </div>
        )}

        {!loading && est && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link 
                  href="/dashboard/estimates"
                  className="text-[var(--text-dim)] hover:text-[var(--text)]"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Link>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold">Estimate #{est.number}</h1>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(est.status)}`}>
                      {est.status.charAt(0).toUpperCase() + est.status.slice(1)}
                    </span>
                  </div>
                  {est.client && (
                    <p className="text-sm text-[var(--text-dim)] mt-1">
                      For: {est.client.firstName} {est.client.lastName}
                      {est.client.company && ` (${est.client.company})`}
                      {est.project && ` • Project: ${est.project.title}`}
                    </p>
                  )}
                  <p className="text-xs text-[var(--text-faint)] mt-1">
                    Created: {new Date(est.createdAt).toLocaleDateString()}
                    {est.updatedAt !== est.createdAt && ` • Updated: ${new Date(est.updatedAt).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/estimates/${id}/edit`}
                  className="pill pill-ghost sm"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </Link>
                <button 
                  onClick={recalc} 
                  disabled={actionLoading === 'recalc'} 
                  className="pill pill-tint-blue sm disabled:opacity-50"
                >
                  <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                  {actionLoading === 'recalc' ? 'Recalculating...' : 'Recalc'}
                </button>
                <button 
                  onClick={sendEstimate} 
                  disabled={actionLoading === 'send' || est.status === 'converted'} 
                  className="pill pill-tint-green sm disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                  {actionLoading === 'send' ? 'Sending...' : 'Send'}
                </button>
                <button 
                  onClick={convertToInvoice} 
                  disabled={actionLoading === 'convert' || est.status === 'converted'} 
                  className="pill pill-tint-purple sm disabled:opacity-50"
                >
                  <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                  {actionLoading === 'convert' ? 'Converting...' : 'Convert to Invoice'}
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Line Items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="surface-solid">
                  <div className="p-4 border-b border-[var(--border)]">
                    <h2 className="text-lg font-medium">Line Items</h2>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-xs uppercase tracking-wide text-[var(--text-faint)] bg-[var(--surface-2)]">
                        <tr>
                          <th className="py-3 px-4">Item</th>
                          <th className="py-3 px-4">Qty</th>
                          <th className="py-3 px-4">Unit Cost</th>
                          <th className="py-3 px-4">Margin%</th>
                          <th className="py-3 px-4">Unit Price</th>
                          <th className="py-3 px-4">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {est.items.map((item, i) => {
                          const lineTotal = item.sellPrice * item.quantity;
                          return (
                            <tr key={i} className="hover:bg-[var(--surface-2)]">
                              <td className="py-3 px-4">
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  {item.description && (
                                    <div className="text-xs text-[var(--text-dim)] mt-1">{item.description}</div>
                                  )}
                                  {item.sku && (
                                    <div className="text-xs text-[var(--text-faint)] mt-1">SKU: {item.sku}</div>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">{item.quantity}</td>
                              <td className="py-3 px-4">${item.baseCost.toFixed(2)}</td>
                              <td className="py-3 px-4">{item.marginPct}%</td>
                              <td className="py-3 px-4">${item.sellPrice.toFixed(2)}</td>
                              <td className="py-3 px-4 font-medium">${lineTotal.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                        {est.items.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-[var(--text-dim)]">
                              No line items found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes */}
                {est.notes && (
                  <div className="surface-solid p-4">
                    <h3 className="font-medium mb-2">Notes</h3>
                    <p className="text-sm text-[var(--text-dim)]">{est.notes}</p>
                  </div>
                )}
              </div>

              {/* Summary & Actions */}
              <div className="space-y-4">
                {/* Pricing Summary */}
                <div className="surface-solid p-4">
                  <h3 className="font-medium mb-4">Pricing Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal (Cost):</span>
                      <span>${est.subtotalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal (Sell):</span>
                      <span>${est.subtotalSell.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Total Margin:</span>
                      <span>${totalMargin.toFixed(2)} ({marginPercent.toFixed(1)}%)</span>
                    </div>
                    <div className="border-t border-[var(--border)] pt-2 mt-2">
                      <div className="flex justify-between">
                        <span>Discount ({est.discountType}):</span>
                        <span>-${est.discountAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax ({est.taxRate}%):</span>
                        <span>${est.taxAmount.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-[var(--border)]">
                      <span>Total:</span>
                      <span>${est.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Guide */}
                <div className="surface-solid p-4">
                  <h3 className="font-medium mb-3">Actions</h3>
                  <ul className="space-y-2 text-xs text-[var(--text-dim)]">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <span><strong>Recalc:</strong> Updates totals after manual edits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span><strong>Send:</strong> Mark as sent and notify client</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">•</span>
                      <span><strong>Convert:</strong> Create invoice from this estimate</span>
                    </li>
                  </ul>
                </div>

                {/* Client Info */}
                {est.client && (
                  <div className="surface-solid p-4">
                    <h3 className="font-medium mb-3">Client Details</h3>
                    <div className="text-sm space-y-1">
                      <div className="font-medium">
                        {est.client.firstName} {est.client.lastName}
                      </div>
                      {est.client.company && (
                        <div className="text-[var(--text-dim)]">{est.client.company}</div>
                      )}
                      {est.client.email && (
                        <div className="text-[var(--text-dim)]">{est.client.email}</div>
                      )}
                      {est.client.phone && (
                        <div className="text-[var(--text-dim)]">{est.client.phone}</div>
                      )}
                      <Link 
                        href={`/dashboard/clients/${est.client._id}`}
                        className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-xs"
                      >
                        View Client →
                      </Link>
                    </div>
                  </div>
                )}

                {/* Project Info */}
                {est.project && (
                  <div className="surface-solid p-4">
                    <h3 className="font-medium mb-3">Project Details</h3>
                    <div className="text-sm space-y-1">
                      <div className="font-medium">{est.project.title}</div>
                      <div className="text-[var(--text-dim)]">Status: {est.project.status}</div>
                      <Link 
                        href={`/dashboard/projects/${est.project._id}`}
                        className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-xs"
                      >
                        View Project →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
  );
}
