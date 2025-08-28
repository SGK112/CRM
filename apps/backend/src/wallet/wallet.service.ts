import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WalletTransaction, WalletTransactionDocument } from './schemas/wallet-transaction.schema';
import { Wallet, WalletDocument } from './schemas/wallet.schema';

export interface TonWalletConnection {
  address: string;
  balance: string;
  network: 'mainnet' | 'testnet';
  isConnected: boolean;
}

export interface CreateTransactionDto {
  userId: string;
  type: 'payment' | 'refund' | 'deposit' | 'withdrawal';
  amount: string;
  currency: 'TON' | 'USD';
  description: string;
  clientId?: string;
  projectId?: string;
  invoiceId?: string;
}

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(WalletTransaction.name) private transactionModel: Model<WalletTransactionDocument>,
  ) {}

  async connectTonWallet(userId: string, walletAddress: string): Promise<Wallet> {
    // Validate TON wallet address format
    if (!this.isValidTonAddress(walletAddress)) {
      throw new BadRequestException('Invalid TON wallet address format');
    }

    // Check if wallet already exists
    let wallet = await this.walletModel.findOne({ userId });
    
    if (wallet) {
      // Update existing wallet
      wallet.tonAddress = walletAddress;
      wallet.isConnected = true;
      wallet.lastConnected = new Date();
    } else {
      // Create new wallet
      wallet = new this.walletModel({
        userId,
        tonAddress: walletAddress,
        isConnected: true,
        lastConnected: new Date(),
        balance: '0',
        network: 'mainnet'
      });
    }

    return await wallet.save();
  }

  async disconnectWallet(userId: string): Promise<boolean> {
    const wallet = await this.walletModel.findOne({ userId });
    if (wallet) {
      wallet.isConnected = false;
      await wallet.save();
      return true;
    }
    return false;
  }

  async getWalletInfo(userId: string): Promise<Wallet | null> {
    return await this.walletModel.findOne({ userId });
  }

  async getWalletBalance(userId: string): Promise<string> {
    const wallet = await this.walletModel.findOne({ userId });
    if (!wallet || !wallet.isConnected) {
      return '0';
    }

    // In a real implementation, you would call TON blockchain API
    // For now, return the stored balance
    return wallet.balance || '0';
  }

  async updateBalance(userId: string, balance: string): Promise<void> {
    await this.walletModel.updateOne(
      { userId },
      { balance, lastBalanceUpdate: new Date() }
    );
  }

  async createTransaction(transactionData: CreateTransactionDto): Promise<WalletTransaction> {
    const transaction = new this.transactionModel({
      ...transactionData,
      status: 'pending',
      createdAt: new Date(),
      txHash: null // Will be set when transaction is confirmed
    });

    return await transaction.save();
  }

  async getTransactionHistory(userId: string, limit: number = 50): Promise<WalletTransaction[]> {
    return await this.transactionModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async updateTransactionStatus(
    transactionId: string, 
    status: 'pending' | 'confirmed' | 'failed',
    txHash?: string
  ): Promise<void> {
    const updateData: any = { status };
    if (txHash) {
      updateData.txHash = txHash;
    }
    if (status === 'confirmed') {
      updateData.confirmedAt = new Date();
    }

    await this.transactionModel.updateOne(
      { _id: transactionId },
      updateData
    );
  }

  async processPayment(
    userId: string,
    amount: string,
    description: string,
    clientId?: string,
    projectId?: string,
    invoiceId?: string
  ): Promise<{ transaction: WalletTransaction; paymentUrl?: string }> {
    // Create transaction record
    const transaction = await this.createTransaction({
      userId,
      type: 'payment',
      amount,
      currency: 'TON',
      description,
      clientId,
      projectId,
      invoiceId
    });

    // In a real implementation, you would:
    // 1. Generate a payment URL for TON wallet
    // 2. Create a transaction on TON blockchain
    // 3. Return payment URL for user to complete transaction

    const paymentUrl = this.generateTonPaymentUrl(amount, description, (transaction as any)._id.toString());

    return {
      transaction,
      paymentUrl
    };
  }

  private isValidTonAddress(address: string): boolean {
    // TON address validation (simplified)
    // Real implementation should use TON SDK for proper validation
    const tonAddressRegex = /^[0-9a-fA-F]{64}$/; // Simplified regex
    return tonAddressRegex.test(address.replace(/[^0-9a-fA-F]/g, ''));
  }

  private generateTonPaymentUrl(amount: string, description: string, transactionId: string): string {
    // Generate TON payment URL
    // In a real implementation, use TON Connect or similar
    const baseUrl = 'ton://transfer';
    const params = new URLSearchParams({
      amount: (parseFloat(amount) * 1e9).toString(), // Convert to nanotons
      text: description,
      transaction_id: transactionId
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async getWalletStats(userId: string): Promise<{
    totalReceived: string;
    totalSent: string;
    transactionCount: number;
    lastTransaction?: Date;
  }> {
    const transactions = await this.transactionModel.find({ userId });
    
    let totalReceived = 0;
    let totalSent = 0;
    let lastTransaction: Date | undefined;

    transactions.forEach(tx => {
      const amount = parseFloat(tx.amount);
      if (tx.type === 'payment' || tx.type === 'deposit') {
        totalReceived += amount;
      } else if (tx.type === 'withdrawal' || tx.type === 'refund') {
        totalSent += amount;
      }

      if (!lastTransaction || tx.createdAt > lastTransaction) {
        lastTransaction = tx.createdAt;
      }
    });

    return {
      totalReceived: totalReceived.toFixed(2),
      totalSent: totalSent.toFixed(2),
      transactionCount: transactions.length,
      lastTransaction
    };
  }
}
