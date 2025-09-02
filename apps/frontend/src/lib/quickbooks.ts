export interface QuickBooksConfig {
  enabled: boolean;
  companyId: string;
  accessToken: string;
  refreshToken: string;
  realmId: string;
  baseUrl: string;
  lastSyncDate?: Date;
  autoSync: boolean;
  syncSettings: {
    customers: boolean;
    items: boolean;
    estimates: boolean;
    invoices: boolean;
    payments: boolean;
  };
}

export interface QuickBooksItem {
  Id: string;
  Name: string;
  Description?: string;
  UnitPrice?: number;
  QtyOnHand?: number;
  Type: 'Inventory' | 'NonInventory' | 'Service';
  IncomeAccountRef?: {
    value: string;
    name?: string;
  };
  ExpenseAccountRef?: {
    value: string;
    name?: string;
  };
}

export interface QuickBooksCustomer {
  Id: string;
  Name: string;
  CompanyName?: string;
  DisplayName?: string;
  PrimaryEmailAddr?: {
    Address: string;
  };
  PrimaryPhone?: {
    FreeFormNumber: string;
  };
  BillAddr?: {
    Line1?: string;
    Line2?: string;
    City?: string;
    CountrySubDivisionCode?: string;
    PostalCode?: string;
    Country?: string;
  };
}

export interface QuickBooksEstimate {
  Id?: string;
  DocNumber?: string;
  CustomerRef: {
    value: string;
    name?: string;
  };
  Line: Array<{
    Id?: string;
    LineNum?: number;
    Amount: number;
    DetailType: 'SalesItemLineDetail';
    SalesItemLineDetail: {
      ItemRef: {
        value: string;
        name?: string;
      };
      Qty?: number;
      UnitPrice?: number;
    };
  }>;
  TotalAmt?: number;
  TxnDate?: string;
  ExpirationDate?: string;
  AcceptedBy?: string;
  AcceptedDate?: string;
  EmailStatus?: 'NotSet' | 'NeedToSend' | 'EmailSent';
  PrintStatus?: 'NotSet' | 'NeedToPrint' | 'PrintComplete';
  PrivateNote?: string;
  CustomerMemo?: {
    value: string;
  };
}

export interface QuickBooksInvoice {
  Id?: string;
  DocNumber?: string;
  CustomerRef: {
    value: string;
    name?: string;
  };
  Line: Array<{
    Id?: string;
    LineNum?: number;
    Amount: number;
    DetailType: 'SalesItemLineDetail';
    SalesItemLineDetail: {
      ItemRef: {
        value: string;
        name?: string;
      };
      Qty?: number;
      UnitPrice?: number;
    };
  }>;
  TotalAmt?: number;
  TxnDate?: string;
  DueDate?: string;
  Balance?: number;
  EmailStatus?: 'NotSet' | 'NeedToSend' | 'EmailSent';
  PrintStatus?: 'NotSet' | 'NeedToPrint' | 'PrintComplete';
  PrivateNote?: string;
  CustomerMemo?: {
    value: string;
  };
  BillAddr?: {
    Line1?: string;
    Line2?: string;
    City?: string;
    CountrySubDivisionCode?: string;
    PostalCode?: string;
    Country?: string;
  };
  ShipAddr?: {
    Line1?: string;
    Line2?: string;
    City?: string;
    CountrySubDivisionCode?: string;
    PostalCode?: string;
    Country?: string;
  };
}

export interface QuickBooksSyncResult {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
  syncedAt: Date;
}

export class QuickBooksService {
  private config: QuickBooksConfig;

  constructor(config: QuickBooksConfig) {
    this.config = config;
  }

  // Format CRM estimate data for QuickBooks
  static formatEstimateForQB(estimate: any, customerRef: string): QuickBooksEstimate {
    const lines = estimate.items.map((item: any, index: number) => ({
      LineNum: index + 1,
      Amount: item.totalCost,
      DetailType: 'SalesItemLineDetail' as const,
      SalesItemLineDetail: {
        ItemRef: {
          value: item.qbItemId || 'GENERAL_SERVICE', // Fallback to general service item
          name: item.description,
        },
        Qty: item.quantity,
        UnitPrice: item.unitCost,
      },
    }));

    return {
      CustomerRef: {
        value: customerRef,
        name: estimate.clientName,
      },
      Line: lines,
      TotalAmt: estimate.totalAmount,
      TxnDate: estimate.createdAt.toISOString().split('T')[0],
      ExpirationDate: estimate.validUntil.toISOString().split('T')[0],
      PrivateNote: estimate.notes,
      CustomerMemo: {
        value: estimate.projectScope,
      },
    };
  }

  // Format CRM invoice data for QuickBooks
  static formatInvoiceForQB(invoice: any, customerRef: string): QuickBooksInvoice {
    const lines = invoice.items.map((item: any, index: number) => ({
      LineNum: index + 1,
      Amount: item.totalCost,
      DetailType: 'SalesItemLineDetail' as const,
      SalesItemLineDetail: {
        ItemRef: {
          value: item.qbItemId || 'GENERAL_SERVICE',
          name: item.description,
        },
        Qty: item.quantity,
        UnitPrice: item.unitCost,
      },
    }));

    return {
      CustomerRef: {
        value: customerRef,
        name: invoice.clientName,
      },
      Line: lines,
      TotalAmt: invoice.total,
      TxnDate: invoice.createdAt.toISOString().split('T')[0],
      DueDate: invoice.dueDate?.toISOString().split('T')[0],
      PrivateNote: invoice.notes,
      CustomerMemo: {
        value: invoice.description || '',
      },
    };
  }

  // Convert QuickBooks estimate to CRM format
  static formatQBEstimateForCRM(qbEstimate: QuickBooksEstimate): any {
    return {
      qbId: qbEstimate.Id,
      number: qbEstimate.DocNumber,
      clientName: qbEstimate.CustomerRef.name,
      qbCustomerId: qbEstimate.CustomerRef.value,
      totalAmount: qbEstimate.TotalAmt || 0,
      validUntil: qbEstimate.ExpirationDate ? new Date(qbEstimate.ExpirationDate) : null,
      createdAt: qbEstimate.TxnDate ? new Date(qbEstimate.TxnDate) : new Date(),
      notes: qbEstimate.PrivateNote || '',
      projectScope: qbEstimate.CustomerMemo?.value || '',
      status: qbEstimate.AcceptedDate ? 'accepted' : 'pending',
      items: qbEstimate.Line.map(line => ({
        description: line.SalesItemLineDetail.ItemRef.name || '',
        quantity: line.SalesItemLineDetail.Qty || 1,
        unitCost: line.SalesItemLineDetail.UnitPrice || 0,
        totalCost: line.Amount,
        qbItemId: line.SalesItemLineDetail.ItemRef.value,
      })),
    };
  }

  // Convert QuickBooks invoice to CRM format
  static formatQBInvoiceForCRM(qbInvoice: QuickBooksInvoice): any {
    return {
      qbId: qbInvoice.Id,
      number: qbInvoice.DocNumber,
      clientName: qbInvoice.CustomerRef.name,
      qbCustomerId: qbInvoice.CustomerRef.value,
      total: qbInvoice.TotalAmt || 0,
      balance: qbInvoice.Balance || 0,
      dueDate: qbInvoice.DueDate ? new Date(qbInvoice.DueDate) : null,
      createdAt: qbInvoice.TxnDate ? new Date(qbInvoice.TxnDate) : new Date(),
      notes: qbInvoice.PrivateNote || '',
      description: qbInvoice.CustomerMemo?.value || '',
      status: qbInvoice.Balance === 0 ? 'paid' : 'pending',
      items: qbInvoice.Line.map(line => ({
        description: line.SalesItemLineDetail.ItemRef.name || '',
        quantity: line.SalesItemLineDetail.Qty || 1,
        unitCost: line.SalesItemLineDetail.UnitPrice || 0,
        totalCost: line.Amount,
        qbItemId: line.SalesItemLineDetail.ItemRef.value,
      })),
    };
  }

  // Validation helpers
  static validateEstimateForSync(estimate: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!estimate.clientName) {
      errors.push('Client name is required for QuickBooks sync');
    }

    if (!estimate.items || estimate.items.length === 0) {
      errors.push('At least one line item is required');
    }

    if (estimate.totalAmount <= 0) {
      errors.push('Total amount must be greater than zero');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static validateInvoiceForSync(invoice: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!invoice.clientName) {
      errors.push('Client name is required for QuickBooks sync');
    }

    if (!invoice.items || invoice.items.length === 0) {
      errors.push('At least one line item is required');
    }

    if (invoice.total <= 0) {
      errors.push('Total amount must be greater than zero');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// QuickBooks API helper functions
export const quickBooksAPI = {
  // Test connection to QuickBooks
  async testConnection(config: QuickBooksConfig): Promise<boolean> {
    try {
      const response = await fetch('/api/quickbooks/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(config),
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('QuickBooks connection test failed:', error);
      return false;
    }
  },

  // Sync estimate to QuickBooks
  async syncEstimate(estimateId: string): Promise<QuickBooksSyncResult> {
    try {
      const response = await fetch(`/api/quickbooks/sync/estimate/${estimateId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      const result = await response.json();
      return {
        success: result.success,
        message: result.message,
        data: result.data,
        errors: result.errors,
        syncedAt: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to sync estimate to QuickBooks',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        syncedAt: new Date(),
      };
    }
  },

  // Sync invoice to QuickBooks
  async syncInvoice(invoiceId: string): Promise<QuickBooksSyncResult> {
    try {
      const response = await fetch(`/api/quickbooks/sync/invoice/${invoiceId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      const result = await response.json();
      return {
        success: result.success,
        message: result.message,
        data: result.data,
        errors: result.errors,
        syncedAt: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to sync invoice to QuickBooks',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        syncedAt: new Date(),
      };
    }
  },

  // Convert estimate to invoice
  async convertEstimateToInvoice(
    estimateId: string
  ): Promise<{ success: boolean; invoiceId?: string; message: string }> {
    try {
      const response = await fetch(`/api/estimates/${estimateId}/convert`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to convert estimate to invoice',
      };
    }
  },
};
