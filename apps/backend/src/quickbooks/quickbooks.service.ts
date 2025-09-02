import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { QuickBooksConfig, TestConnectionDto } from './dto/quickbooks.dto';

// Mock interfaces for the service (in a real app, these would come from your actual schemas)
interface Estimate {
  _id: string;
  title: string;
  clientName: string;
  clientId: string;
  totalAmount: number;
  items: any[];
  notes: string;
  projectScope: string;
  status: string;
  createdAt: Date;
  validUntil: Date;
  qbId?: string;
  qbSyncedAt?: Date;
  qbSyncStatus?: 'pending' | 'synced' | 'error';
}

interface Invoice {
  _id: string;
  title: string;
  invoiceNumber: string;
  clientName: string;
  clientId: string;
  total: number;
  items: any[];
  notes: string;
  status: string;
  createdAt: Date;
  dueDate: Date;
  qbId?: string;
  qbSyncedAt?: Date;
  qbSyncStatus?: 'pending' | 'synced' | 'error';
}

@Injectable()
export class QuickBooksService {
  private readonly logger = new Logger(QuickBooksService.name);

  constructor() // In a real implementation, inject your actual models
  // @InjectModel('Estimate') private estimateModel: Model<Estimate>,
  // @InjectModel('Invoice') private invoiceModel: Model<Invoice>,
  // @InjectModel('QuickBooksConfig') private qbConfigModel: Model<QuickBooksConfig>,
  {}

  async testConnection(config: TestConnectionDto, workspaceId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${config.baseUrl || 'https://sandbox-quickbooks.api.intuit.com'}/v3/company/${config.realmId}/companyinfo/${config.realmId}`,
        {
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      return {
        success: true,
        companyInfo: response.data,
      };
    } catch (error) {
      this.logger.error('QuickBooks connection test failed', error);
      throw new HttpException('QuickBooks connection failed', HttpStatus.BAD_REQUEST);
    }
  }

  async syncEstimate(estimateId: string, workspaceId: string): Promise<any> {
    try {
      // Mock implementation - in real app, fetch from database
      const estimate: Estimate = {
        _id: estimateId,
        title: 'Mock Estimate',
        clientName: 'Test Client',
        clientId: 'client-1',
        totalAmount: 5000,
        items: [
          {
            description: 'Test Item',
            quantity: 1,
            unitCost: 5000,
            totalCost: 5000,
          },
        ],
        notes: 'Test estimate for sync',
        projectScope: 'Test project',
        status: 'pending',
        createdAt: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      };

      const config = await this.getQuickBooksConfig(workspaceId);
      if (!config || !config.enabled) {
        throw new Error('QuickBooks integration not configured');
      }

      // Format estimate for QuickBooks
      const qbEstimate = {
        CustomerRef: {
          value: '1', // Mock customer ID
          name: estimate.clientName,
        },
        Line: estimate.items.map((item, index) => ({
          LineNum: index + 1,
          Amount: item.totalCost,
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: {
            ItemRef: {
              value: '1', // Mock item ID
              name: item.description,
            },
            Qty: item.quantity,
            UnitPrice: item.unitCost,
          },
        })),
        TotalAmt: estimate.totalAmount,
        TxnDate: estimate.createdAt.toISOString().split('T')[0],
        ExpirationDate: estimate.validUntil.toISOString().split('T')[0],
        PrivateNote: estimate.notes,
        CustomerMemo: {
          value: estimate.projectScope,
        },
      };

      // Send to QuickBooks
      const response = await axios.post(
        `${config.baseUrl}/v3/company/${config.realmId}/estimate`,
        qbEstimate,
        {
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      // Update estimate with QB ID
      // In real implementation: await this.estimateModel.findByIdAndUpdate(estimateId, { qbId: response.data.Estimate.Id, qbSyncedAt: new Date(), qbSyncStatus: 'synced' });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to sync estimate to QuickBooks', error);
      // In real implementation: await this.estimateModel.findByIdAndUpdate(estimateId, { qbSyncStatus: 'error' });
      throw new HttpException(
        'Failed to sync estimate to QuickBooks',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async syncInvoice(invoiceId: string, workspaceId: string): Promise<any> {
    try {
      // Mock implementation - in real app, fetch from database
      const invoice: Invoice = {
        _id: invoiceId,
        title: 'Mock Invoice',
        invoiceNumber: 'INV-001',
        clientName: 'Test Client',
        clientId: 'client-1',
        total: 5000,
        items: [
          {
            description: 'Test Item',
            quantity: 1,
            unitCost: 5000,
            totalCost: 5000,
          },
        ],
        notes: 'Test invoice for sync',
        status: 'sent',
        createdAt: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      const config = await this.getQuickBooksConfig(workspaceId);
      if (!config || !config.enabled) {
        throw new Error('QuickBooks integration not configured');
      }

      // Format invoice for QuickBooks
      const qbInvoice = {
        CustomerRef: {
          value: '1', // Mock customer ID
          name: invoice.clientName,
        },
        Line: invoice.items.map((item, index) => ({
          LineNum: index + 1,
          Amount: item.totalCost,
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: {
            ItemRef: {
              value: '1', // Mock item ID
              name: item.description,
            },
            Qty: item.quantity,
            UnitPrice: item.unitCost,
          },
        })),
        TotalAmt: invoice.total,
        TxnDate: invoice.createdAt.toISOString().split('T')[0],
        DueDate: invoice.dueDate.toISOString().split('T')[0],
        PrivateNote: invoice.notes,
      };

      // Send to QuickBooks
      const response = await axios.post(
        `${config.baseUrl}/v3/company/${config.realmId}/invoice`,
        qbInvoice,
        {
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      // Update invoice with QB ID
      // In real implementation: await this.invoiceModel.findByIdAndUpdate(invoiceId, { qbId: response.data.Invoice.Id, qbSyncedAt: new Date(), qbSyncStatus: 'synced' });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to sync invoice to QuickBooks', error);
      // In real implementation: await this.invoiceModel.findByIdAndUpdate(invoiceId, { qbSyncStatus: 'error' });
      throw new HttpException(
        'Failed to sync invoice to QuickBooks',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getCustomers(workspaceId: string): Promise<any[]> {
    try {
      const config = await this.getQuickBooksConfig(workspaceId);
      if (!config || !config.enabled) {
        throw new Error('QuickBooks integration not configured');
      }

      const response = await axios.get(
        `${config.baseUrl}/v3/company/${config.realmId}/query?query=SELECT * FROM Customer`,
        {
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      return response.data.QueryResponse?.Customer || [];
    } catch (error) {
      this.logger.error('Failed to fetch QuickBooks customers', error);
      throw new HttpException(
        'Failed to fetch QuickBooks customers',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getItems(workspaceId: string): Promise<any[]> {
    try {
      const config = await this.getQuickBooksConfig(workspaceId);
      if (!config || !config.enabled) {
        throw new Error('QuickBooks integration not configured');
      }

      const response = await axios.get(
        `${config.baseUrl}/v3/company/${config.realmId}/query?query=SELECT * FROM Item`,
        {
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      return response.data.QueryResponse?.Item || [];
    } catch (error) {
      this.logger.error('Failed to fetch QuickBooks items', error);
      throw new HttpException('Failed to fetch QuickBooks items', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async syncAll(workspaceId: string): Promise<any> {
    try {
      const config = await this.getQuickBooksConfig(workspaceId);
      if (!config || !config.enabled) {
        throw new Error('QuickBooks integration not configured');
      }

      const results = {
        customers: 0,
        items: 0,
        estimates: 0,
        invoices: 0,
        errors: [],
      };

      // Sync customers
      try {
        const customers = await this.getCustomers(workspaceId);
        results.customers = customers.length;
      } catch (error) {
        results.errors.push(`Customer sync failed: ${error.message}`);
      }

      // Sync items
      try {
        const items = await this.getItems(workspaceId);
        results.items = items.length;
      } catch (error) {
        results.errors.push(`Item sync failed: ${error.message}`);
      }

      return results;
    } catch (error) {
      this.logger.error('Full sync failed', error);
      throw new HttpException('Full sync failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getSyncStatus(workspaceId: string): Promise<any> {
    try {
      const config = await this.getQuickBooksConfig(workspaceId);

      return {
        enabled: config?.enabled || false,
        lastSyncDate: config?.lastSyncDate || null,
        autoSync: config?.autoSync || false,
        syncSettings: config?.syncSettings || {
          customers: false,
          items: false,
          estimates: false,
          invoices: false,
          payments: false,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get sync status', error);
      throw new HttpException('Failed to get sync status', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async getQuickBooksConfig(workspaceId: string): Promise<QuickBooksConfig | null> {
    // Mock implementation - in real app, fetch from database
    // return await this.qbConfigModel.findOne({ workspaceId });

    // For now, return a mock configuration
    return {
      enabled: true,
      companyId: 'mock-company',
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh',
      realmId: 'mock-realm',
      baseUrl: 'https://sandbox-quickbooks.api.intuit.com',
      autoSync: true,
      syncSettings: {
        customers: true,
        items: true,
        estimates: true,
        invoices: true,
        payments: true,
      },
    };
  }
}
