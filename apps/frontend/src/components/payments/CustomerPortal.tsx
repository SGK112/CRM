'use client';

import {
    CheckCircleIcon,
    CogIcon,
    CreditCardIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  plan: {
    id: string;
    name: string;
    amount: number;
    currency: string;
    interval: string;
  };
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

interface Invoice {
  id: string;
  number: string;
  status: string;
  amount: number;
  currency: string;
  created: string;
  dueDate: string;
  pdfUrl: string;
}

export default function CustomerPortal() {
  const [activeTab, setActiveTab] = useState<'subscription' | 'billing' | 'invoices'>(
    'subscription'
  );
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPortalData();
  }, []);

  const fetchPortalData = async () => {
    try {
      setLoading(true);

      // Fetch subscription data
      const subResponse = await fetch('/api/billing/subscription', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
        },
      });
      const subData = await subResponse.json();
      if (subData.success) {
        setSubscription(subData.subscription);
      }

      // Fetch payment methods
      const pmResponse = await fetch('/api/billing/payment-methods', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
        },
      });
      const pmData = await pmResponse.json();
      if (pmData.success) {
        setPaymentMethods(pmData.paymentMethods);
      }

      // Fetch invoices
      const invResponse = await fetch('/api/billing/invoices', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
        },
      });
      const invData = await invResponse.json();
      if (invData.success) {
        setInvoices(invData.invoices);
      }
    } catch (error) {
      console.error('Error fetching portal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (
      !subscription ||
      !confirm(
        'Are you sure you want to cancel your subscription? This will take effect at the end of your current billing period.'
      )
    ) {
      return;
    }

    try {
      setActionLoading('cancel');
      const response = await fetch('/api/billing/cancel-subscription', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSubscription({ ...subscription, cancelAtPeriodEnd: true });
      } else {
        alert(data.message || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Failed to cancel subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription) return;

    try {
      setActionLoading('reactivate');
      const response = await fetch('/api/billing/reactivate-subscription', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSubscription({ ...subscription, cancelAtPeriodEnd: false });
      } else {
        alert(data.message || 'Failed to reactivate subscription');
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      alert('Failed to reactivate subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenStripePortal = async () => {
    try {
      setActionLoading('portal');
      const response = await fetch('/api/billing/customer-portal', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        window.open(data.url, '_blank');
      } else {
        alert(data.message || 'Failed to open customer portal');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      alert('Failed to open customer portal');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'trialing':
        return 'text-blue-600 bg-blue-100';
      case 'canceled':
        return 'text-red-600 bg-red-100';
      case 'past_due':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-600 mt-2">
          Manage your subscription, payment methods, and billing history
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'subscription', label: 'Subscription', icon: CreditCardIcon },
            { id: 'billing', label: 'Payment Methods', icon: CogIcon },
            { id: 'invoices', label: 'Invoices', icon: DocumentTextIcon },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Subscription Tab */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          {subscription ? (
            <>
              {/* Current Subscription */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Current Subscription</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}
                  >
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">{subscription.plan.name}</h3>
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {formatCurrency(subscription.plan.amount, subscription.plan.currency)}
                      <span className="text-sm font-normal text-gray-500">
                        /{subscription.plan.interval}
                      </span>
                    </div>

                    {subscription.trialEnd && new Date(subscription.trialEnd) > new Date() && (
                      <div className="flex items-center text-sm text-blue-600 mb-2">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Trial ends {formatDate(subscription.trialEnd)}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Current period:</span>
                        <span>{formatDate(subscription.currentPeriodStart)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Renews on:</span>
                        <span>{formatDate(subscription.currentPeriodEnd)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {subscription.cancelAtPeriodEnd && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mr-2" />
                      <span className="text-orange-700 font-medium">
                        Your subscription will cancel on {formatDate(subscription.currentPeriodEnd)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex space-x-4">
                  <button
                    onClick={handleOpenStripePortal}
                    disabled={actionLoading === 'portal'}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {actionLoading === 'portal' ? 'Opening...' : 'Manage in Stripe'}
                  </button>

                  {subscription.cancelAtPeriodEnd ? (
                    <button
                      onClick={handleReactivateSubscription}
                      disabled={actionLoading === 'reactivate'}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading === 'reactivate'
                        ? 'Reactivating...'
                        : 'Reactivate Subscription'}
                    </button>
                  ) : (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={actionLoading === 'cancel'}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                      {actionLoading === 'cancel' ? 'Canceling...' : 'Cancel Subscription'}
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
              <p className="text-gray-600 mb-6">You don't have an active subscription yet.</p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
                Choose a Plan
              </button>
            </div>
          )}
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Payment Methods</h2>
            <button
              onClick={handleOpenStripePortal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
            >
              Add Payment Method
            </button>
          </div>

          {paymentMethods.length > 0 ? (
            <div className="space-y-4">
              {paymentMethods.map(pm => (
                <div key={pm.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCardIcon className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium">
                          {pm.card?.brand?.toUpperCase()} •••• {pm.card?.last4}
                        </div>
                        <div className="text-sm text-gray-500">
                          Expires {pm.card?.expMonth}/{pm.card?.expYear}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {pm.isDefault && (
                        <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Methods</h3>
              <p className="text-gray-600">Add a payment method to manage your subscription.</p>
            </div>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Billing History</h2>

          {invoices.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map(invoice => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invoice.created)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}
                        >
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a
                          href={invoice.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Download
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoices</h3>
              <p className="text-gray-600">Your billing history will appear here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
