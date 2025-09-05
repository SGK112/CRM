'use client';

import CustomerPortal from '@/components/payments/CustomerPortal';
import SubscriptionPage from '@/components/payments/SubscriptionPage';
import {
    CalendarIcon,
    ChartBarIcon,
    CreditCardIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface BillingStats {
  totalRevenue: number;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
  churnRate: number;
  averageRevenuePerUser: number;
  totalCustomers: number;
}

interface UserSubscription {
  plan: {
    id: string;
    name: string;
    amount: number;
    currency: string;
    interval: string;
  };
  status: 'active' | 'trialing' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
}

interface RecentActivity {
  id: string;
  type: 'subscription_created' | 'subscription_cancelled' | 'payment_succeeded' | 'payment_failed';
  description: string;
  amount?: number;
  currency?: string;
  customerEmail: string;
  timestamp: string;
}

export default function BillingPage() {
  const [activeView, setActiveView] = useState<'overview' | 'plans' | 'portal'>('overview');
  const [billingStats, setBillingStats] = useState<BillingStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);

      // Fetch billing overview data
      const statsResponse = await fetch('/api/billing/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setBillingStats(statsData.stats);
        }
      }

      // Fetch recent billing activity
      const activityResponse = await fetch('/api/billing/activity', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        if (activityData.success) {
          setRecentActivity(activityData.activities);
        }
      }

      // Fetch user's subscription
      const subResponse = await fetch('/api/billing/subscription', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (subResponse.ok) {
        const subData = await subResponse.json();
        if (subData.success) {
          setUserSubscription(subData.subscription);
        }
      }
    } catch (error) {
      // Error fetching billing data - silently handle
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'subscription_created':
        return '🎉';
      case 'subscription_cancelled':
        return '❌';
      case 'payment_succeeded':
        return '✅';
      case 'payment_failed':
        return '⚠️';
      default:
        return '📋';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'subscription_created':
        return 'text-green-600';
      case 'subscription_cancelled':
        return 'text-red-600';
      case 'payment_succeeded':
        return 'text-green-600';
      case 'payment_failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
        <p className="text-gray-600 mt-2">Manage subscriptions, payments, and billing analytics</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'plans', label: 'Subscription Plans', icon: CreditCardIcon },
            { id: 'portal', label: 'My Billing', icon: DocumentTextIcon },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as 'overview' | 'plans' | 'portal')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === tab.id
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

      {/* Overview Tab */}
      {activeView === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          {billingStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(billingStats.totalRevenue)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <UserGroupIcon className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {billingStats.activeSubscriptions}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Monthly Recurring Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(billingStats.monthlyRecurringRevenue)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <CalendarIcon className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Churn Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{billingStats.churnRate}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-orange-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg Revenue Per User</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(billingStats.averageRevenuePerUser)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <UserGroupIcon className="h-8 w-8 text-indigo-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Customers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {billingStats.totalCustomers}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Current User Subscription Status */}
          {userSubscription && (
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Current Subscription</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-blue-600">
                    {userSubscription.plan.name}
                  </p>
                  <p className="text-gray-600">
                    {formatCurrency(userSubscription.plan.amount, userSubscription.plan.currency)}/
                    {userSubscription.plan.interval}
                  </p>
                  <p className="text-sm text-gray-500">
                    Next billing: {formatDate(userSubscription.currentPeriodEnd)}
                  </p>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      userSubscription.status === 'active'
                        ? 'bg-green-100 text-green-600'
                        : userSubscription.status === 'trialing'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {userSubscription.status.charAt(0).toUpperCase() +
                      userSubscription.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Billing Activity</h3>
            </div>
            <div className="p-6">
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getActivityIcon(activity.type)}</span>
                        <div>
                          <p className={`font-medium ${getActivityColor(activity.type)}`}>
                            {activity.description}
                          </p>
                          <p className="text-sm text-gray-500">{activity.customerEmail}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {activity.amount && (
                          <p className="font-medium">
                            {formatCurrency(activity.amount, activity.currency)}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">{formatDate(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent billing activity</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subscription Plans Tab */}
      {activeView === 'plans' && (
        <SubscriptionPage
          currentPlan={userSubscription?.plan?.id}
          onSubscriptionSuccess={() => {
            fetchBillingData();
            setActiveView('portal');
          }}
        />
      )}

      {/* Customer Portal Tab */}
      {activeView === 'portal' && <CustomerPortal />}
    </div>
  );
}
