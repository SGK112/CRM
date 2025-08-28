'use client';

import { useState } from 'react';
import {
  WalletIcon,
  CurrencyDollarIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  LinkIcon,
  QrCodeIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChartBarIcon,
  SparklesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StandardPageWrapper, StandardCard, StandardSection, StandardGrid, StandardButton } from '../../../components/ui/StandardPageWrapper';
import { getUserPlan } from '@/lib/plans';
import { CapabilityGate } from '@/components/CapabilityGate';
import { useWallet } from '@/hooks/useWallet';

export default function WalletPage() {
  const [userPlan] = useState(getUserPlan());
  const {
    wallet,
    transactions,
    stats,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    createPayment,
    refreshWalletData,
    clearError,
  } = useWallet();

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleConnectWallet = async () => {
    try {
      setSubmitting(true);
      await connectWallet(walletAddress);
      setShowConnectModal(false);
      setWalletAddress('');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const handleCreatePayment = async () => {
    try {
      setSubmitting(true);
      await createPayment(paymentAmount, paymentDescription);
      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentDescription('');
    } catch (error) {
      console.error('Failed to create payment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <CreditCardIcon className="h-5 w-5 text-blue-600" />;
      case 'deposit':
        return <ArrowDownTrayIcon className="h-5 w-5 text-green-600" />;
      case 'withdrawal':
        return <ArrowUpTrayIcon className="h-5 w-5 text-orange-600" />;
      case 'refund':
        return <BanknotesIcon className="h-5 w-5 text-purple-600" />;
      default:
        return <CurrencyDollarIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <StandardPageWrapper title="TON Wallet">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </StandardPageWrapper>
    );
  }

  return (
    <StandardPageWrapper title="TON Wallet">
      {/* Error Banner */}
      {error && (
        <StandardSection>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <StandardButton variant="ghost" size="sm" onClick={clearError}>
                ✕
              </StandardButton>
            </div>
          </div>
        </StandardSection>
      )}
      {/* Wallet Status */}
      <StandardSection>
        <StandardCard className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <WalletIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {wallet?.isConnected ? 'Wallet Connected' : 'No Wallet Connected'}
                </h2>
                {wallet?.isConnected && wallet.tonAddress && (
                  <p className="text-sm text-gray-600">
                    {wallet.tonAddress.slice(0, 8)}...{wallet.tonAddress.slice(-8)}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Network: {wallet?.network || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {wallet?.isConnected ? (
                <>
                  <StandardButton variant="secondary" onClick={handleDisconnectWallet}>
                    Disconnect
                  </StandardButton>
                  <StandardButton onClick={() => setShowPaymentModal(true)}>
                    <CreditCardIcon className="h-4 w-4 mr-2" />
                    Create Payment
                  </StandardButton>
                </>
              ) : (
                <StandardButton onClick={() => setShowConnectModal(true)}>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Connect Wallet
                </StandardButton>
              )}
            </div>
          </div>
        </StandardCard>
      </StandardSection>

      {/* Balance & Stats */}
      {wallet?.isConnected && (
        <StandardSection title="Balance & Statistics">
          <StandardGrid>
            <StandardCard className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-4">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {wallet.balance} TON
                  </h3>
                  <p className="text-sm text-gray-600">Current Balance</p>
                </div>
              </div>
            </StandardCard>

            {stats && (
              <>
                <StandardCard className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-4">
                      <ArrowDownTrayIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {stats.totalReceived} TON
                      </h3>
                      <p className="text-sm text-gray-600">Total Received</p>
                    </div>
                  </div>
                </StandardCard>

                <StandardCard className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg mr-4">
                      <ArrowUpTrayIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {stats.totalSent} TON
                      </h3>
                      <p className="text-sm text-gray-600">Total Sent</p>
                    </div>
                  </div>
                </StandardCard>

                <StandardCard className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-4">
                      <ChartBarIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {stats.transactionCount}
                      </h3>
                      <p className="text-sm text-gray-600">Total Transactions</p>
                    </div>
                  </div>
                </StandardCard>
              </>
            )}
          </StandardGrid>
        </StandardSection>
      )}

      {/* Transaction History */}
      {wallet?.isConnected && (
        <StandardSection title="Transaction History">
          <StandardCard>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTypeIcon(transaction.type)}
                          <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                            {transaction.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{transaction.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.amount} {transaction.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(transaction.status)}
                          <span className={`ml-2 text-sm font-medium capitalize ${
                            transaction.status === 'confirmed' ? 'text-green-600' :
                            transaction.status === 'pending' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {transaction.txHash && (
                          <a
                            href={`https://tonviewer.com/transaction/${transaction.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View on Explorer
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {transactions.length === 0 && (
              <div className="text-center py-12">
                <WalletIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first payment.
                </p>
              </div>
            )}
          </StandardCard>
        </StandardSection>
      )}

      {/* Connect Wallet Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
                <WalletIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mt-5">
                Connect TON Wallet
              </h3>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter your TON wallet address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-between mt-6">
                <StandardButton
                  variant="secondary"
                  onClick={() => {
                    setShowConnectModal(false);
                    setWalletAddress('');
                  }}
                >
                  Cancel
                </StandardButton>
                <StandardButton
                  onClick={handleConnectWallet}
                  disabled={!walletAddress.trim() || submitting}
                >
                  {submitting ? 'Connecting...' : 'Connect'}
                </StandardButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
                <CreditCardIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mt-5">
                Create Payment
              </h3>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (TON)
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={paymentDescription}
                    onChange={(e) => setPaymentDescription(e.target.value)}
                    placeholder="Payment description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <StandardButton
                  variant="secondary"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentAmount('');
                    setPaymentDescription('');
                  }}
                >
                  Cancel
                </StandardButton>
                <StandardButton
                  onClick={handleCreatePayment}
                  disabled={!paymentAmount.trim() || !paymentDescription.trim() || submitting}
                >
                  {submitting ? 'Creating...' : 'Create Payment'}
                </StandardButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </StandardPageWrapper>
  );
}
