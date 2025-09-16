// Stripe Service for Estimates to Invoices conversion
// This is a simplified version that focuses on the core functionality

export interface EstimateToInvoiceData {
  customerEmail: string;
  customerName: string;
  items: Array<{
    description: string;
    quantity: number;
    amount: number; // in cents
  }>;
  dueDate?: Date;
  description?: string;
}

export interface InvoiceResponse {
  id: string;
  status: string;
  amount_due: number;
  hosted_invoice_url?: string;
  invoice_pdf?: string;
}

class StripeEstimateService {
  /**
   * Convert estimate to Stripe invoice
   * This would typically be called from your backend API
   */
  async convertEstimateToInvoice(estimateData: EstimateToInvoiceData): Promise<InvoiceResponse> {
    try {
      // In a real implementation, this would call your backend API
      // which would handle the Stripe integration securely
      const response = await fetch('/api/stripe/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(estimateData),
      });

      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      return await response.json();
    } catch (error) {
      throw new Error('Failed to convert estimate to invoice');
    }
  }

  /**
   * Send invoice to customer
   */
  async sendInvoice(invoiceId: string): Promise<InvoiceResponse> {
    try {
      const response = await fetch('/api/stripe/send-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to send invoice');
      }

      return await response.json();
    } catch (error) {
      throw new Error('Failed to send invoice');
    }
  }

  /**
   * Get invoice status
   */
  async getInvoiceStatus(invoiceId: string): Promise<InvoiceResponse> {
    try {
      const response = await fetch(`/api/stripe/invoice/${invoiceId}`);

      if (!response.ok) {
        throw new Error('Failed to get invoice status');
      }

      return await response.json();
    } catch (error) {
      throw new Error('Failed to get invoice status');
    }
  }

  /**
   * Create payment intent for invoice
   */
  async createPaymentIntent(amount: number, invoiceId?: string): Promise<{ client_secret: string }> {
    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, invoiceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      throw new Error('Failed to create payment intent');
    }
  }

  /**
   * Format amount for display
   */
  formatAmount(amountInCents: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amountInCents / 100);
  }

  /**
   * Convert dollars to cents
   */
  dollarsToCents(dollars: number): number {
    return Math.round(dollars * 100);
  }

  /**
   * Convert cents to dollars
   */
  centsToDollars(cents: number): number {
    return cents / 100;
  }
}

// Export a singleton instance
export const stripeEstimateService = new StripeEstimateService();
export default stripeEstimateService;