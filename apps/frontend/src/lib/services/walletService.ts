const API_BASE_URL = '/api';

interface Wallet {
  userId: string;
  tonAddress?: string;
  isConnected: boolean;
  balance: string;
  network: 'mainnet' | 'testnet';
  lastConnected?: string;
}

interface Transaction {
  _id: string;
  type: 'payment' | 'refund' | 'deposit' | 'withdrawal';
  amount: string;
  currency: 'TON' | 'USD';
  description: string;
  status: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  createdAt: string;
  confirmedAt?: string;
  clientId?: string;
  projectId?: string;
}

interface WalletStats {
  totalReceived: string;
  totalSent: string;
  transactionCount: number;
  lastTransaction?: string;
}

interface PaymentRequest {
  amount: string;
  description: string;
  clientId?: string;
  projectId?: string;
  invoiceId?: string;
}

interface PaymentResponse {
  transaction: Transaction;
  paymentUrl?: string;
}

class WalletService {
  private getAuthHeaders(): HeadersInit {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken') || localStorage.getItem('token')
        : null;

    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async connectWallet(walletAddress: string): Promise<Wallet> {
    const response = await fetch(`${API_BASE_URL}/wallet/connect`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ walletAddress }),
    });

    if (!response.ok) {
      throw new Error('Failed to connect wallet');
    }

    return response.json();
  }

  async disconnectWallet(): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/wallet/disconnect`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to disconnect wallet');
    }

    return response.json();
  }

  async getWalletInfo(): Promise<Wallet | null> {
    const response = await fetch(`${API_BASE_URL}/wallet/info`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('401: Authentication required');
      }
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to get wallet info');
    }

    return response.json();
  }

  async getBalance(): Promise<{ balance: string }> {
    const response = await fetch(`${API_BASE_URL}/wallet/balance`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get balance');
    }

    return response.json();
  }

  async updateBalance(balance: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/wallet/balance`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ balance }),
    });

    if (!response.ok) {
      throw new Error('Failed to update balance');
    }

    return response.json();
  }

  async getTransactions(limit?: number): Promise<Transaction[]> {
    const url = new URL(`${API_BASE_URL}/wallet/transactions`, window.location.origin);
    if (limit) {
      url.searchParams.append('limit', limit.toString());
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('401: Authentication required');
      }
      throw new Error('Failed to get transactions');
    }

    return response.json();
  }

  async createPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    const response = await fetch(`${API_BASE_URL}/wallet/payment`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment');
    }

    return response.json();
  }

  async updateTransactionStatus(
    transactionId: string,
    status: 'pending' | 'confirmed' | 'failed',
    txHash?: string
  ): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/wallet/transaction/${transactionId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, txHash }),
    });

    if (!response.ok) {
      throw new Error('Failed to update transaction status');
    }

    return response.json();
  }

  async getWalletStats(): Promise<WalletStats> {
    const response = await fetch(`${API_BASE_URL}/wallet/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('401: Authentication required');
      }
      throw new Error('Failed to get wallet stats');
    }

    return response.json();
  }

  async createTransaction(transactionData: {
    type: 'payment' | 'refund' | 'deposit' | 'withdrawal';
    amount: string;
    currency: 'TON' | 'USD';
    description: string;
    clientId?: string;
    projectId?: string;
    invoiceId?: string;
  }): Promise<Transaction> {
    const response = await fetch(`${API_BASE_URL}/wallet/transaction`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      throw new Error('Failed to create transaction');
    }

    return response.json();
  }

  // Helper method to format TON amounts
  formatTonAmount(amount: string): string {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0.00';
    return num.toFixed(2);
  }

  // Helper method to validate TON address
  isValidTonAddress(address: string): boolean {
    // Basic TON address validation (simplified)
    // In a real implementation, use TON SDK for proper validation
    const cleanAddress = address.replace(/[^0-9a-fA-F]/g, '');
    return cleanAddress.length === 64;
  }

  // Helper method to generate QR code for payments
  generatePaymentQR(amount: string, description: string): string {
    // Generate QR code data for TON payment
    const paymentData = {
      amount: (parseFloat(amount) * 1e9).toString(), // Convert to nanotons
      text: description,
    };

    return `ton://transfer?${new URLSearchParams(paymentData).toString()}`;
  }
}

// Lazily instantiate WalletService on client only
export const walletService = typeof window !== 'undefined' ? new WalletService() : undefined;

export function getWalletService(): WalletService | undefined {
  return walletService;
}
export type { Wallet, Transaction, WalletStats, PaymentRequest, PaymentResponse };
