'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface EstimateItem {
  name: string;
  description: string;
  quantity: number;
  baseCost: number;
  sellPrice: number;
  taxable: boolean;
}

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

interface PublicEstimate {
  _id: string;
  number: string;
  status: string;
  items: EstimateItem[];
  subtotalSell: number;
  taxAmount: number;
  total: number;
  notes: string;
  client: Client;
  createdAt: string;
  validUntil?: string;
  shareToken: string;
}

export default function PublicEstimatePage() {
  const params = useParams();
  const token = params.token as string;
  const [estimate, setEstimate] = useState<PublicEstimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        // Call the backend API directly since it's a public endpoint
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://remodely-backend-api.onrender.com';
        const response = await fetch(`${backendUrl}/api/share/estimate/${token}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Estimate not found or link has expired');
          }
          throw new Error('Failed to load estimate');
        }
        const data = await response.json();
        setEstimate(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchEstimate();
    }
  }, [token]);

  const downloadPdf = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://remodely-backend-api.onrender.com';
    window.open(`${backendUrl}/api/share/estimate/${token}/pdf`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-8 text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-600 mb-4">Estimate Not Found</h1>
              <p className="text-gray-600">The estimate you're looking for doesn't exist or the link has expired.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Estimate #{estimate.number}
              </h1>
              <p className="text-gray-600 mt-1">
                Created on {formatDate(estimate.createdAt)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                estimate.status === 'sent' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-800'
              }`}>
                {estimate.status}
              </span>
              <button 
                onClick={downloadPdf} 
                className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
              >
                <span>📄</span>
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <span>🏢</span>
              <span>Client Information</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {estimate.client.firstName} {estimate.client.lastName}
                </h3>
                {estimate.client.address && (
                  <p className="text-gray-600 mt-1">
                    {estimate.client.address.street}<br />
                    {estimate.client.address.city}, {estimate.client.address.state} {estimate.client.address.zipCode}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span>📧</span>
                  <span className="text-gray-600">{estimate.client.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>📞</span>
                  <span className="text-gray-600">{estimate.client.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estimate Items */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Estimate Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 font-semibold">Description</th>
                    <th className="text-center py-3 font-semibold">Qty</th>
                    <th className="text-right py-3 font-semibold">Unit Price</th>
                    <th className="text-right py-3 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {estimate.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-4">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-gray-600 mt-1">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="text-center py-4">{item.quantity}</td>
                      <td className="text-right py-4">
                        {formatCurrency(item.sellPrice)}
                      </td>
                      <td className="text-right py-4 font-medium">
                        {formatCurrency(item.quantity * item.sellPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(estimate.subtotalSell)}</span>
                  </div>
                  {estimate.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatCurrency(estimate.taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(estimate.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes and Terms */}
        {estimate.notes && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Notes & Terms</h2>
              <p className="whitespace-pre-wrap text-gray-700">{estimate.notes}</p>
            </div>
          </div>
        )}

        {/* Validity */}
        {estimate.validUntil && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4">
              <div className="flex items-center space-x-2 text-amber-600">
                <span>📅</span>
                <span className="text-sm">
                  This estimate is valid until {formatDate(estimate.validUntil)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Powered by Remodely CRM</p>
        </div>
      </div>
    </div>
  );
}