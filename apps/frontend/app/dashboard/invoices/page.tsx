'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { API_BASE } from '@/lib/api';
import { downloadDataAsCSV, generateBulkPDF, generateInvoicePDF } from '@/lib/pdf-generator';
import { Download } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface Invoice {
  _id: string;
  number: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  createdAt: string;
  amountPaid: number;
}

export default function InvoicesPage() {
  const [list, setList] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';

  const fetchList = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/invoices`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setList(await res.json());
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // PDF download handlers
  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      await generateInvoicePDF({
        id: invoice._id,
        number: invoice.number,
        status: invoice.status,
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        total: invoice.total,
        amountPaid: invoice.amountPaid,
        createdAt: invoice.createdAt,
        clientName: 'Client', // You might want to fetch this from client data
        items: [], // Add actual items if available
      });
    } catch (error) {
      setError('Failed to generate PDF. Please try again.');
    }
  };

  const handleBulkDownload = async (type: 'pdf' | 'csv') => {
    try {
      if (type === 'pdf') {
        const invoiceData = list.map(inv => ({
          id: inv._id,
          number: inv.number,
          status: inv.status,
          subtotal: inv.subtotal,
          taxAmount: inv.taxAmount,
          total: inv.total,
          amountPaid: inv.amountPaid,
          createdAt: inv.createdAt,
          clientName: 'Client',
          items: [],
        }));
        await generateBulkPDF(invoiceData, 'invoices');
      } else {
        const csvData = list.map(inv => ({
          id: inv._id,
          number: inv.number,
          status: inv.status,
          subtotal: inv.subtotal,
          taxAmount: inv.taxAmount,
          total: inv.total,
          amountPaid: inv.amountPaid,
          createdAt: new Date(inv.createdAt).toLocaleDateString(),
        }));
        downloadDataAsCSV(csvData, `invoices-${new Date().toISOString().split('T')[0]}`);
      }
    } catch (error) {
      setError('Failed to generate download. Please try again.');
    }
  };
  const aggregates = useMemo(() => {
    if (!list.length) return { subtotal: 0, tax: 0, total: 0, paid: 0 };
    return list.reduce(
      (acc, i) => {
        acc.subtotal += i.subtotal;
        acc.tax += i.taxAmount;
        acc.total += i.total;
        acc.paid += i.amountPaid;
        return acc;
      },
      { subtotal: 0, tax: 0, total: 0, paid: 0 }
    );
  }, [list]);

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Delete this invoice? This cannot be undone.');
    if (!ok) return;
    try {
      const res = await fetch(`${API_BASE}/invoices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setList(prev => prev.filter(i => i._id !== id));
      } else {
        setError('Failed to delete invoice');
      }
    } catch (e) {
      setError('Error deleting invoice');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        subtitle="Billing documents & payment tracking"
        titleClassName="font-bold text-brand-700 dark:text-brand-400 mb-0"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkDownload('pdf')}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              title="Download all invoices as PDF"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>

            <button
              onClick={() => handleBulkDownload('csv')}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              title="Download all invoices as CSV"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>

            <button
              className="pill pill-tint-green sm"
              onClick={() => {
                const params = new URLSearchParams(
                  typeof window !== 'undefined' ? window.location.search : ''
                );
                const clientId = params.get('clientId');
                // Navigate to a new invoice page if/when added; for now, fallback to creating from estimate or direct API later.
                window.location.href = clientId
                  ? `/dashboard/invoices/new?clientId=${clientId}`
                  : `/dashboard/invoices/new`;
              }}
            >
              New Invoice
            </button>
          </div>
        }
        stats={[
          { label: 'Count', value: loading ? '…' : list.length },
          { label: 'Subtotal', value: aggregates.subtotal.toFixed(2) },
          { label: 'Tax', value: aggregates.tax.toFixed(2) },
          { label: 'Total', value: aggregates.total.toFixed(2) },
          { label: 'Paid', value: aggregates.paid.toFixed(2) },
        ]}
      />
      <div className="surface-solid border border-token rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wide text-gray-700 dark:text-gray-300 bg-[var(--surface-1)]">
            <tr className="border-b border-token">
              <th className="py-2 px-3">Number</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Subtotal</th>
              <th className="py-2 px-3">Tax</th>
              <th className="py-2 px-3">Total</th>
              <th className="py-2 px-3">Paid</th>
              <th className="py-2 px-3">Created</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/60">
            {loading && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-xs">
                  Loading...
                </td>
              </tr>
            )}
            {!loading &&
              list.map(inv => (
                <tr key={inv._id} className="hover:bg-[var(--surface-2)]/60">
                  <td className="py-2 px-3 font-medium">{inv.number}</td>
                  <td className="py-2 px-3 text-[11px]">{inv.status}</td>
                  <td className="py-2 px-3">{inv.subtotal.toFixed(2)}</td>
                  <td className="py-2 px-3">{inv.taxAmount.toFixed(2)}</td>
                  <td className="py-2 px-3">{inv.total.toFixed(2)}</td>
                  <td className="py-2 px-3">{inv.amountPaid.toFixed(2)}</td>
                  <td className="py-2 px-3 text-[11px]">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDownloadPDF(inv);
                        }}
                        className="text-xs text-red-600 hover:text-red-800 hover:underline"
                        title="Download PDF"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => (window.location.href = `/dashboard/invoices/${inv._id}`)}
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        View
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDelete(inv._id);
                        }}
                        className="text-xs text-red-600 hover:text-red-800 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            {!loading && list.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-xs text-gray-700">
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
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
