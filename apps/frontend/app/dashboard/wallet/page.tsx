'use client';

import { useWallet } from '@/hooks/useWallet';
import {
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    BanknotesIcon,
    CheckCircleIcon,
    ClockIcon,
    CreditCardIcon,
    CurrencyDollarIcon,
    ExclamationTriangleIcon,
    LinkIcon,
    WalletIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function WalletPage() {
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
      // Error handling for wallet connection
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      // Error handling for wallet disconnection
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
      // Error handling for payment creation
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-50 bg-black border-b border-slate-800">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <WalletIcon className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">TON Wallet</h1>
                <p className="text-sm text-slate-400">Crypto payments</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={refreshWalletData}
                disabled={loading}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <ArrowDownTrayIcon className={`h-4 w-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
              {wallet?.isConnected ? (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="p-2 bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
                >
                  <CreditCardIcon className="h-5 w-5 text-black" />
                </button>
              ) : (
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="p-2 bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
                >
                  <LinkIcon className="h-5 w-5 text-black" />
                </button>
              )}
            </div>
          </div>

          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            wallet?.isConnected
              ? 'bg-green-500/20 border border-green-500/50'
              : 'bg-red-500/20 border border-red-500/50'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              wallet?.isConnected ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <span className={`text-sm font-medium ${
              wallet?.isConnected ? 'text-green-400' : 'text-red-400'
            }`}>
              {wallet?.isConnected ? 'Connected' : 'Not Connected'}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-200">Error</h3>
                <p className="text-sm text-red-300 mt-1">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Connection Section */}
        {!wallet?.isConnected && (
          <div className="bg-slate-900 rounded-lg border border-slate-700 p-6">
            <div className="text-center">
              <div className="h-16 w-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <WalletIcon className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Connect TON Wallet</h3>
              <p className="text-slate-400 mb-6">
                Connect your TON wallet to receive cryptocurrency payments from clients.
              </p>
              <button
                onClick={() => setShowConnectModal(true)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <ArrowDownTrayIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <LinkIcon className="h-4 w-4" />
                )}
                Connect Wallet
              </button>
            </div>
          </div>
        )}

        {/* Wallet Balance & Stats */}
        {wallet?.isConnected && (
          <>
            <div className="bg-slate-900 rounded-lg border border-slate-700 p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white mb-1">
                  {wallet.balance} TON
                </div>
                <div className="text-slate-400 text-sm">
                  {wallet.tonAddress && (
                    <span className="font-mono">
                      {wallet.tonAddress.slice(0, 8)}...{wallet.tonAddress.slice(-8)}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-slate-800 rounded-lg p-3">
                    <div className="flex items-center justify-center mb-2">
                      <ArrowDownTrayIcon className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="text-lg font-bold text-white">{stats.totalReceived}</div>
                    <div className="text-xs text-slate-400">Received</div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3">
                    <div className="flex items-center justify-center mb-2">
                      <ArrowUpTrayIcon className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="text-lg font-bold text-white">{stats.totalSent}</div>
                    <div className="text-xs text-slate-400">Sent</div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowPaymentModal(true)}
                className="flex flex-col items-center gap-2 p-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
              >
                <CreditCardIcon className="h-6 w-6 text-amber-400" />
                <span className="text-sm font-medium text-white">Create Payment</span>
              </button>
              <button
                onClick={handleDisconnectWallet}
                className="flex flex-col items-center gap-2 p-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
              >
                <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
                <span className="text-sm font-medium text-white">Disconnect</span>
              </button>
            </div>
          </>
        )}

        {/* Transaction History */}
        {wallet?.isConnected && (
          <div className="bg-slate-900 rounded-lg border border-slate-700">
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Transaction History</h3>
                <span className="text-sm text-slate-400">{transactions.length} total</span>
              </div>
            </div>
            
            {transactions.length > 0 ? (
              <div className="divide-y divide-slate-700">
                {transactions.map((transaction) => (
                  <div key={transaction._id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'payment'
                            ? 'bg-green-500/20' 
                            : 'bg-red-500/20'
                        }`}>
                          {getTypeIcon(transaction.type)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white capitalize">
                            {transaction.type}
                          </div>
                          <div className="text-xs text-slate-400">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">
                          {transaction.amount} {transaction.currency}
                        </div>
                        <div className={`text-xs ${
                          transaction.status === 'confirmed'
                            ? 'text-green-400'
                            : transaction.status === 'pending'
                              ? 'text-yellow-400'
                              : 'text-red-400'
                        }`}>
                          {transaction.status}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-400 mb-2">
                      {transaction.description}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getStatusIcon(transaction.status)}
                      </div>
                      {transaction.txHash && (
                        <a
                          href={`https://tonviewer.com/transaction/${transaction.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-amber-400 hover:text-amber-300"
                        >
                          View Explorer
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <WalletIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No transactions yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connect Wallet Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-lg max-w-sm w-full border border-slate-700">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-medium text-white">Connect TON Wallet</h3>
              <button
                onClick={() => {
                  setShowConnectModal(false);
                  setWalletAddress('');
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="h-12 w-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <WalletIcon className="h-6 w-6 text-amber-400" />
                </div>
                <p className="text-slate-400 text-sm">
                  Enter your TON wallet address to connect
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={e => setWalletAddress(e.target.value)}
                    placeholder="Enter your TON wallet address"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowConnectModal(false);
                      setWalletAddress('');
                    }}
                    className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConnectWallet}
                    disabled={!walletAddress.trim() || submitting}
                    className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-lg max-w-sm w-full border border-slate-700">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-medium text-white">Create Payment</h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentAmount('');
                  setPaymentDescription('');
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="h-12 w-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CreditCardIcon className="h-6 w-6 text-green-400" />
                </div>
                <p className="text-slate-400 text-sm">
                  Create a new payment request
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Amount (TON)
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={paymentDescription}
                    onChange={e => setPaymentDescription(e.target.value)}
                    placeholder="Payment description"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setPaymentAmount('');
                      setPaymentDescription('');
                    }}
                    className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePayment}
                    disabled={!paymentAmount.trim() || !paymentDescription.trim() || submitting}
                    className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
