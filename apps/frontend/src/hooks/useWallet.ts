import { useState, useEffect, useCallback } from 'react';
import {
  walletService,
  type Wallet,
  type Transaction,
  type WalletStats,
} from '../lib/services/walletService';

export interface UseWalletReturn {
  wallet: Wallet | null;
  transactions: Transaction[];
  stats: WalletStats | null;
  loading: boolean;
  error: string | null;
  connectWallet: (address: string) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  createPayment: (
    amount: string,
    description: string,
    clientId?: string,
    projectId?: string
  ) => Promise<void>;
  refreshWalletData: () => Promise<void>;
  clearError: () => void;
}

export function useWallet(): UseWalletReturn {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshWalletData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated before making API calls
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('accessToken') || localStorage.getItem('token')
          : null;

      if (!walletService) {
        setLoading(false);
        return;
      }

      const [walletInfo, transactionList, walletStats] = await Promise.all([
        walletService.getWalletInfo(),
        walletService.getTransactions(50),
        walletService.getWalletStats(),
      ]);

      setWallet(walletInfo);
      setTransactions(transactionList);
      setStats(walletStats);
    } catch (err) {
      // Don't show error if it's an authentication issue
      if (
        err instanceof Error &&
        (err.message.includes('401') || err.message.includes('Unauthorized'))
      ) {
        setLoading(false);
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  }, []);

  const connectWallet = useCallback(
    async (address: string) => {
      if (!walletService) {
        throw new Error('Wallet service not initialized');
      }
      
      try {
        setError(null);
        const connectedWallet = await walletService.connectWallet(address);
        setWallet(connectedWallet);

        // Refresh all data after connecting
        await refreshWalletData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect wallet');
        throw err;
      }
    },
    [refreshWalletData]
  );

  const disconnectWallet = useCallback(async () => {
    if (!walletService) {
      throw new Error('Wallet service not initialized');
    }
    
    try {
      setError(null);
      await walletService.disconnectWallet();
      setWallet(prev => (prev ? { ...prev, isConnected: false } : null));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect wallet');
      throw err;
    }
  }, []);

  const createPayment = useCallback(
    async (amount: string, description: string, clientId?: string, projectId?: string) => {
      if (!walletService) {
        throw new Error('Wallet service not initialized');
      }
      
      try {
        setError(null);
        await walletService.createPayment({
          amount,
          description,
          clientId,
          projectId,
        });

        // Refresh data after creating payment
        await refreshWalletData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create payment');
        throw err;
      }
    },
    [refreshWalletData]
  );

  // Load wallet data on mount, but delay to allow authentication check
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshWalletData();
    }, 100); // Small delay to allow layout authentication check

    return () => clearTimeout(timer);
  }, [refreshWalletData]);

  return {
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
  };
}
