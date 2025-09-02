// PDF generation utilities for estimates and invoices
// This is a client-side PDF generator using popular PDF libraries

interface EstimateData {
  id: string;
  title: string;
  clientName: string;
  projectType: string;
  totalAmount: number;
  items: Array<{
    description: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
  createdAt: Date;
  validUntil: Date;
  notes?: string;
  terms?: string;
}

interface InvoiceData {
  id: string;
  number: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  createdAt: string;
  clientName?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
}

// Basic PDF generation using browser's print functionality
export const generateEstimatePDF = async (estimate: EstimateData): Promise<void> => {
  // Create a new window with the estimate content
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Unable to open print window. Please check your browser settings.');
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Estimate ${estimate.id} - ${estimate.clientName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          line-height: 1.6;
          color: #333;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          border-bottom: 3px solid #f97316;
          padding-bottom: 20px;
          margin-bottom: 30px;
          text-align: center;
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #f97316;
          margin-bottom: 5px;
        }
        .document-title {
          font-size: 24px;
          font-weight: bold;
          margin: 20px 0 10px;
        }
        .client-info {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .estimate-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 20px 0;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
        }
        .items-table th, .items-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        .items-table th {
          background: #f8fafc;
          font-weight: bold;
          color: #374151;
        }
        .items-table tr:hover {
          background: #f9fafb;
        }
        .total-section {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin: 30px 0;
          text-align: right;
        }
        .total-amount {
          font-size: 24px;
          font-weight: bold;
          color: #059669;
          margin-top: 10px;
        }
        .notes-section {
          margin: 30px 0;
          padding: 20px;
          background: #fef3c7;
          border-radius: 8px;
        }
        .terms-section {
          margin: 30px 0;
          padding: 20px;
          background: #e0f2fe;
          border-radius: 8px;
          font-size: 14px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">Remodely CRM</div>
        <div>Professional Kitchen & Bath Remodeling</div>
      </div>

      <div class="document-title">ESTIMATE</div>

      <div class="client-info">
        <h3>Project Details</h3>
        <p><strong>Client:</strong> ${estimate.clientName}</p>
        <p><strong>Project:</strong> ${estimate.title}</p>
        <p><strong>Type:</strong> ${estimate.projectType}</p>
        <p><strong>Estimate ID:</strong> ${estimate.id}</p>
      </div>

      <div class="estimate-details">
        <div>
          <h4>Dates</h4>
          <p><strong>Created:</strong> ${estimate.createdAt.toLocaleDateString()}</p>
          <p><strong>Valid Until:</strong> ${estimate.validUntil.toLocaleDateString()}</p>
        </div>
        <div>
          <h4>Project Type</h4>
          <p><strong>${estimate.projectType.charAt(0).toUpperCase() + estimate.projectType.slice(1)}</strong> Remodeling</p>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantity</th>
            <th>Unit Cost</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${estimate.items
            .map(
              item => `
            <tr>
              <td>${item.description}</td>
              <td>${item.quantity}</td>
              <td>$${item.unitCost.toLocaleString()}</td>
              <td>$${item.totalCost.toLocaleString()}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <div class="total-section">
        <h3>Total Estimate</h3>
        <div class="total-amount">$${estimate.totalAmount.toLocaleString()}</div>
      </div>

      ${
        estimate.notes
          ? `
        <div class="notes-section">
          <h4>Project Notes</h4>
          <p>${estimate.notes}</p>
        </div>
      `
          : ''
      }

      ${
        estimate.terms
          ? `
        <div class="terms-section">
          <h4>Terms & Conditions</h4>
          <p>${estimate.terms}</p>
        </div>
      `
          : ''
      }

      <div class="footer">
        <p>Generated by Remodely CRM • ${new Date().toLocaleDateString()}</p>
        <p>Professional Kitchen & Bath Remodeling Solutions</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export const generateInvoicePDF = async (invoice: InvoiceData): Promise<void> => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Unable to open print window. Please check your browser settings.');
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          line-height: 1.6;
          color: #333;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          border-bottom: 3px solid #f97316;
          padding-bottom: 20px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .company-info {
          text-align: left;
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #f97316;
          margin-bottom: 5px;
        }
        .invoice-info {
          text-align: right;
        }
        .document-title {
          font-size: 36px;
          font-weight: bold;
          color: #f97316;
        }
        .invoice-number {
          font-size: 18px;
          margin-top: 5px;
        }
        .invoice-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 20px 0;
        }
        .bill-to {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
        }
        .invoice-meta {
          text-align: right;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
        }
        .items-table th, .items-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        .items-table th {
          background: #f8fafc;
          font-weight: bold;
          color: #374151;
        }
        .items-table .amount {
          text-align: right;
        }
        .totals-section {
          margin: 30px 0;
          text-align: right;
        }
        .totals-table {
          margin-left: auto;
          min-width: 300px;
        }
        .totals-table tr td {
          padding: 8px 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        .total-row {
          font-weight: bold;
          font-size: 18px;
          color: #059669;
          border-top: 2px solid #f97316 !important;
        }
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-paid { background: #d1fae5; color: #059669; }
        .status-pending { background: #fef3c7; color: #d97706; }
        .status-overdue { background: #fee2e2; color: #dc2626; }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <div class="company-name">Remodely CRM</div>
          <div>Professional Kitchen & Bath Remodeling</div>
        </div>
        <div class="invoice-info">
          <div class="document-title">INVOICE</div>
          <div class="invoice-number"># ${invoice.number}</div>
        </div>
      </div>

      <div class="invoice-details">
        <div class="bill-to">
          <h3>Bill To</h3>
          <p><strong>${invoice.clientName || 'Client'}</strong></p>
          <p>Invoice Date: ${new Date(invoice.createdAt).toLocaleDateString()}</p>
        </div>
        <div class="invoice-meta">
          <p><strong>Status:</strong>
            <span class="status-badge status-${invoice.status}">
              ${invoice.status}
            </span>
          </p>
          <p><strong>Amount Paid:</strong> $${invoice.amountPaid.toFixed(2)}</p>
          <p><strong>Balance Due:</strong> $${(invoice.total - invoice.amountPaid).toFixed(2)}</p>
        </div>
      </div>

      ${
        invoice.items && invoice.items.length > 0
          ? `
        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Cost</th>
              <th class="amount">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items
              .map(
                item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>$${item.unitCost.toFixed(2)}</td>
                <td class="amount">$${item.totalCost.toFixed(2)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `
          : ''
      }

      <div class="totals-section">
        <table class="totals-table">
          <tr>
            <td>Subtotal:</td>
            <td class="amount">$${invoice.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Tax:</td>
            <td class="amount">$${invoice.taxAmount.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td>Total:</td>
            <td class="amount">$${invoice.total.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Amount Paid:</td>
            <td class="amount">-$${invoice.amountPaid.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td>Balance Due:</td>
            <td class="amount">$${(invoice.total - invoice.amountPaid).toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <div class="footer">
        <p>Generated by Remodely CRM • ${new Date().toLocaleDateString()}</p>
        <p>Thank you for your business!</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

// Generate comprehensive PDF report with multiple estimates or invoices
export const generateBulkPDF = async (
  data: EstimateData[] | InvoiceData[],
  type: 'estimates' | 'invoices'
): Promise<void> => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Unable to open print window. Please check your browser settings.');
  }

  const totalValue =
    type === 'estimates'
      ? (data as EstimateData[]).reduce((sum, item) => sum + item.totalAmount, 0)
      : (data as InvoiceData[]).reduce((sum, item) => sum + item.total, 0);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${type.charAt(0).toUpperCase() + type.slice(1)} Report</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          line-height: 1.6;
          color: #333;
          padding: 40px;
          max-width: 1000px;
          margin: 0 auto;
        }
        .header {
          border-bottom: 3px solid #f97316;
          padding-bottom: 20px;
          margin-bottom: 30px;
          text-align: center;
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #f97316;
          margin-bottom: 5px;
        }
        .report-title {
          font-size: 24px;
          font-weight: bold;
          margin: 20px 0;
        }
        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        .stat-card {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #f97316;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
          font-size: 14px;
        }
        .data-table th, .data-table td {
          padding: 12px 8px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        .data-table th {
          background: #f8fafc;
          font-weight: bold;
          color: #374151;
        }
        .amount { text-align: right; }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">Remodely CRM</div>
        <div>Professional Kitchen & Bath Remodeling</div>
      </div>

      <div class="report-title">${type.charAt(0).toUpperCase() + type.slice(1)} Report</div>

      <div class="summary-stats">
        <div class="stat-card">
          <div class="stat-value">${data.length}</div>
          <div>Total ${type}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">$${totalValue.toLocaleString()}</div>
          <div>Total Value</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">$${data.length > 0 ? (totalValue / data.length).toLocaleString() : '0'}</div>
          <div>Average Value</div>
        </div>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            ${
              type === 'estimates'
                ? `
              <th>Title</th>
              <th>Client</th>
              <th>Type</th>
              <th>Status</th>
              <th class="amount">Amount</th>
              <th>Created</th>
            `
                : `
              <th>Number</th>
              <th>Client</th>
              <th>Status</th>
              <th class="amount">Subtotal</th>
              <th class="amount">Tax</th>
              <th class="amount">Total</th>
              <th class="amount">Paid</th>
              <th>Created</th>
            `
            }
          </tr>
        </thead>
        <tbody>
          ${data
            .map(item => {
              if (type === 'estimates') {
                const estimate = item as EstimateData;
                return `
                <tr>
                  <td>${estimate.title}</td>
                  <td>${estimate.clientName}</td>
                  <td>${estimate.projectType}</td>
                  <td>Draft</td>
                  <td class="amount">$${estimate.totalAmount.toLocaleString()}</td>
                  <td>${estimate.createdAt.toLocaleDateString()}</td>
                </tr>
              `;
              } else {
                const invoice = item as InvoiceData;
                return `
                <tr>
                  <td>${invoice.number}</td>
                  <td>${invoice.clientName || 'N/A'}</td>
                  <td>${invoice.status}</td>
                  <td class="amount">$${invoice.subtotal.toFixed(2)}</td>
                  <td class="amount">$${invoice.taxAmount.toFixed(2)}</td>
                  <td class="amount">$${invoice.total.toFixed(2)}</td>
                  <td class="amount">$${invoice.amountPaid.toFixed(2)}</td>
                  <td>${new Date(invoice.createdAt).toLocaleDateString()}</td>
                </tr>
              `;
              }
            })
            .join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>Generated by Remodely CRM • ${new Date().toLocaleDateString()}</p>
        <p>Professional Kitchen & Bath Remodeling Solutions</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export const downloadDataAsCSV = (data: Record<string, unknown>[], filename: string): void => {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers
        .map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
