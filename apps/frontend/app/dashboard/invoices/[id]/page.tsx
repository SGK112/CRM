'use client';
import { API_PREFIX } from '@/lib/api';
import {
    ArrowDownTrayIcon,
    ArrowLeftIcon,
    PaperAirplaneIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface LineItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxable: boolean;
}
interface Invoice {
  _id: string;
  number: string;
  status: string;
  items: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  notes?: string;
  dueDate?: string;
}

export default function InvoiceDetail() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [inv, setInv] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';

  // Redirect to login if not authenticated
  useEffect(() => {
    if (typeof window !== 'undefined' && !token) {
      router.push(`/auth/login?redirect=/dashboard/invoices/${id}`);
    }
  }, [token, router, id]);
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        if (!token) {
          setLoading(false);
          return;
        }

        const headers: Record<string, string> = {
          Authorization: `Bearer ${token}`
        };

        const res = await fetch(`${API_PREFIX}/invoices/${id}`, { headers });

        if (res.ok) {
          setInv(await res.json());
        }
      } catch (error) {
        // Error fetching invoice
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token]);

  const deleteInvoice = async () => {
    if (!id || deleting) return;
    const ok = window.confirm('Delete this invoice? This cannot be undone.');
    if (!ok) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_PREFIX}/invoices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        router.push('/dashboard/invoices');
      }
    } finally {
      setDeleting(false);
    }
  };
  const sendInvoice = async () => {
    if (!id) return;
    try {
      const res = await fetch(`${API_PREFIX}/invoices/${id}/send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        // refresh
        const refreshed = await fetch(`${API_PREFIX}/invoices/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (refreshed.ok) setInv(await refreshed.json());
      }
    } catch (e) {
      /* noop */
    }
  };
  const downloadPdf = async () => {
    if (!id) return;
    try {
      const res = await fetch(`${API_PREFIX}/invoices/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      /* noop */
    }
  };
  return (
    <div className="space-y-6">
      {loading && <div className="text-sm text-gray-700">Loading...</div>}
      {!loading && inv && (
        <>
          {!token && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-blue-600 text-sm">
                  🧾 <strong>Demo Mode:</strong> You're viewing demo data. For full functionality, please{' '}
                  <Link href="/auth/login" className="text-blue-700 underline hover:text-blue-800">
                    sign in
                  </Link>{' '}
                  or{' '}
                  <Link href="/auth/register" className="text-blue-700 underline hover:text-blue-800">
                    create an account
                  </Link>
                  .
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/invoices" className="text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-semibold">Invoice {inv.number}</h1>
              <p className="text-sm text-gray-800 dark:text-[var(--text-dim)]">
                Status: {inv.status}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={deleteInvoice}
                disabled={deleting}
                className="pill pill-ghost sm text-red-600"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
              <button className="pill pill-tint-blue sm" onClick={downloadPdf}>
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" /> PDF
              </button>
              <button className="pill pill-tint-green sm" onClick={sendInvoice}>
                <PaperAirplaneIcon className="h-4 w-4 mr-1" /> Send
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="surface-1 border border-token rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="text-left text-[11px] uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    <tr className="border-b border-token">
                      <th className="py-2 px-3">Item</th>
                      <th className="py-2 px-3">Qty</th>
                      <th className="py-2 px-3">Unit</th>
                      <th className="py-2 px-3">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]/60">
                    {inv.items.map((li, i) => (
                      <tr key={i}>
                        <td className="py-2 px-3">{li.name}</td>
                        <td className="py-2 px-3">{li.quantity}</td>
                        <td className="py-2 px-3">{li.unitPrice.toFixed(2)}</td>
                        <td className="py-2 px-3">{li.total.toFixed(2)}</td>
                      </tr>
                    ))}
                    {inv.items.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-xs text-gray-700">
                          No line items.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="surface-1 border border-token rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{inv.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{inv.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-token">
                  <span>Total</span>
                  <span>{inv.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paid</span>
                  <span>{inv.amountPaid.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="surface-1 border border-token rounded-xl p-4">
                <h3 className="font-semibold mb-2 text-sm">Actions</h3>
                <ul className="space-y-1 text-xs text-gray-800 dark:text-[var(--text-dim)]">
                  <li>Record payment updates amount paid.</li>
                  <li>Send will email invoice (pending integration).</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
