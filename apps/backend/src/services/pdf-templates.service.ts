import { Injectable } from '@nestjs/common';
import { Client, LineItem } from './types';
import PDFDocument = require('pdfkit');

export type TemplateType = 'professional' | 'modern' | 'classic';

export interface TemplateData {
  type: 'estimate' | 'invoice';
  number: string;
  client: Client;
  items: LineItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  notes?: string;
  dueDate?: string;
  createdAt: string;
  companyInfo?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

@Injectable()
export class PdfTemplatesService {
  private generateProfessionalTemplate(doc: typeof PDFDocument.prototype, data: TemplateData): void {
    // Header with company branding
    doc.fontSize(24).fillColor('#1a365d').text('REMODELY CRM', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(18).fillColor('#2d3748').text(data.type.toUpperCase(), { align: 'center' });
    doc.moveDown();

    // Document info box
    doc.rect(50, doc.y, 500, 80).fillAndStroke('#f7fafc', '#e2e8f0');
    doc.fillColor('#2d3748');
    doc.fontSize(12).text(`#${data.number}`, 60, doc.y - 70);
    doc.text(`Date: ${new Date(data.createdAt).toLocaleDateString()}`, 60, doc.y - 50);
    if (data.dueDate) {
      doc.text(`Due Date: ${new Date(data.dueDate).toLocaleDateString()}`, 60, doc.y - 30);
    }
    doc.moveDown(2);

    // Client info
    doc.fontSize(14).fillColor('#1a365d').text('Bill To:', 50);
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#2d3748');
    doc.text(`${data.client.firstName} ${data.client.lastName}`, 50);
    if (data.client.company) {
      doc.text(data.client.company, 50);
    }
    if (data.client.email) {
      doc.text(data.client.email, 50);
    }
    doc.moveDown();

    // Items table
    this.drawProfessionalTable(doc, data.items);
    doc.moveDown();

    // Totals
    this.drawProfessionalTotals(doc, data);
  }

  private generateModernTemplate(doc: typeof PDFDocument.prototype, data: TemplateData): void {
    // Modern header with gradient effect
    doc.rect(0, 0, 612, 100).fill('#667eea');
    doc.fillColor('white').fontSize(28).text('REMODELY', 50, 30);
    doc.fontSize(14).text('Professional Services', 50, 60);
    doc.moveDown(2);

    // Document info
    doc.fillColor('#4a5568').fontSize(16).text(`${data.type.toUpperCase()} #${data.number}`, 50);
    doc.fontSize(10).text(`Created: ${new Date(data.createdAt).toLocaleDateString()}`, 50);
    if (data.dueDate) {
      doc.text(`Due: ${new Date(data.dueDate).toLocaleDateString()}`, 50);
    }
    doc.moveDown();

    // Client section
    doc.fillColor('#2d3748').fontSize(14).text('CLIENT INFORMATION', 50);
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`${data.client.firstName} ${data.client.lastName}`);
    if (data.client.company) doc.text(data.client.company);
    if (data.client.email) doc.text(data.client.email);
    doc.moveDown();

    // Items with modern styling
    this.drawModernTable(doc, data.items);
    doc.moveDown();

    // Modern totals
    this.drawModernTotals(doc, data);
  }

  private generateClassicTemplate(doc: typeof PDFDocument.prototype, data: TemplateData): void {
    // Classic formal header
    doc.fontSize(20).text('REMODELY CRM', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).text(`${data.type.charAt(0).toUpperCase() + data.type.slice(1)} #${data.number}`, { align: 'center' });
    doc.moveDown();

    // Formal document info
    doc.fontSize(10);
    doc.text(`Date: ${new Date(data.createdAt).toLocaleDateString()}`, 50);
    if (data.dueDate) {
      doc.text(`Due Date: ${new Date(data.dueDate).toLocaleDateString()}`, 300);
    }
    doc.moveDown();

    // Formal client info
    doc.fontSize(12).text('Bill To:', 50);
    doc.moveDown(0.5);
    doc.text(`${data.client.firstName} ${data.client.lastName}`, 50);
    if (data.client.company) {
      doc.text(data.client.company, 50);
    }
    if (data.client.email) {
      doc.text(data.client.email, 50);
    }
    doc.moveDown();

    // Classic table
    this.drawClassicTable(doc, data.items);
    doc.moveDown();

    // Classic totals
    this.drawClassicTotals(doc, data);
  }

  private drawProfessionalTable(doc: typeof PDFDocument.prototype, items: LineItem[]): void {
    const tableTop = doc.y;
    const itemX = 50;
    const qtyX = 350;
    const priceX = 420;
    const totalX = 500;

    // Header
    doc.rect(50, tableTop, 500, 25).fillAndStroke('#edf2f7', '#cbd5e0');
    doc.fillColor('#2d3748').fontSize(10);
    doc.text('Item', itemX, tableTop + 8);
    doc.text('Qty', qtyX, tableTop + 8);
    doc.text('Price', priceX, tableTop + 8);
    doc.text('Total', totalX, tableTop + 8);

    // Items
    let y = tableTop + 25;
    items.forEach((item) => {
      const rowHeight = 20;
      doc.rect(50, y, 500, rowHeight).stroke('#e2e8f0');
      doc.fillColor('#2d3748').fontSize(9);
      doc.text(item.name || item.description || 'Item', itemX, y + 5);
      doc.text(item.quantity?.toString() || '1', qtyX, y + 5);
      doc.text(`$${(item.sellPrice || item.unitPrice || 0).toFixed(2)}`, priceX, y + 5);
      const lineTotal = (item.quantity || 1) * (item.sellPrice || item.unitPrice || 0);
      doc.text(`$${lineTotal.toFixed(2)}`, totalX, y + 5);
      y += rowHeight;
    });
  }

  private drawModernTable(doc: typeof PDFDocument.prototype, items: LineItem[]): void {
    const tableTop = doc.y;
    const itemX = 50;
    const qtyX = 350;
    const totalX = 500;

    // Modern header
    doc.fillColor('#4a5568').fontSize(12).text('SERVICES & PRODUCTS', itemX, tableTop);
    doc.moveDown();

    // Items
    let y = doc.y;
    items.forEach((item) => {
      doc.fillColor('#2d3748').fontSize(10);
      doc.text(item.name || item.description || 'Item', itemX, y);
      doc.text(`${item.quantity || 1} × $${(item.sellPrice || item.unitPrice || 0).toFixed(2)}`, qtyX, y);
      const lineTotal = (item.quantity || 1) * (item.sellPrice || item.unitPrice || 0);
      doc.text(`$${lineTotal.toFixed(2)}`, totalX, y);
      y += 15;
    });
  }

  private drawClassicTable(doc: typeof PDFDocument.prototype, items: LineItem[]): void {
    const tableTop = doc.y;
    const itemX = 50;
    const qtyX = 350;
    const priceX = 420;
    const totalX = 500;

    // Classic header
    doc.fontSize(12).text('Description', itemX, tableTop);
    doc.text('Quantity', qtyX, tableTop);
    doc.text('Unit Price', priceX, tableTop);
    doc.text('Amount', totalX, tableTop);

    // Separator line
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    doc.moveDown();

    // Items
    items.forEach((item) => {
      doc.fontSize(10);
      doc.text(item.name || item.description || 'Item', itemX);
      doc.text((item.quantity || 1).toString(), qtyX);
      doc.text(`$${(item.sellPrice || item.unitPrice || 0).toFixed(2)}`, priceX);
      const lineTotal = (item.quantity || 1) * (item.sellPrice || item.unitPrice || 0);
      doc.text(`$${lineTotal.toFixed(2)}`, totalX);
      doc.moveDown(0.5);
    });
  }

  private drawProfessionalTotals(doc: typeof PDFDocument.prototype, data: TemplateData): void {
    const totalsX = 400;
    doc.fontSize(10).fillColor('#2d3748');
    doc.text(`Subtotal: $${data.subtotal.toFixed(2)}`, totalsX, doc.y);
    if (data.discountAmount > 0) {
      doc.text(`Discount: -$${data.discountAmount.toFixed(2)}`, totalsX);
    }
    if (data.taxAmount > 0) {
      doc.text(`Tax: $${data.taxAmount.toFixed(2)}`, totalsX);
    }
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#1a365d').text(`Total: $${data.total.toFixed(2)}`, totalsX);
  }

  private drawModernTotals(doc: typeof PDFDocument.prototype, data: TemplateData): void {
    const totalsX = 400;
    doc.fillColor('#4a5568').fontSize(10);
    doc.text(`Subtotal: $${data.subtotal.toFixed(2)}`, totalsX, doc.y);
    if (data.discountAmount > 0) {
      doc.text(`Discount: -$${data.discountAmount.toFixed(2)}`, totalsX);
    }
    if (data.taxAmount > 0) {
      doc.text(`Tax: $${data.taxAmount.toFixed(2)}`, totalsX);
    }
    doc.moveDown();
    doc.rect(totalsX - 10, doc.y - 5, 150, 25).fillAndStroke('#667eea', '#667eea');
    doc.fillColor('white').fontSize(12).text(`TOTAL: $${data.total.toFixed(2)}`, totalsX, doc.y);
  }

  private drawClassicTotals(doc: typeof PDFDocument.prototype, data: TemplateData): void {
    const totalsX = 400;
    doc.fontSize(10);
    doc.text(`Subtotal: $${data.subtotal.toFixed(2)}`, totalsX, doc.y);
    if (data.discountAmount > 0) {
      doc.text(`Discount: -$${data.discountAmount.toFixed(2)}`, totalsX);
    }
    if (data.taxAmount > 0) {
      doc.text(`Tax: $${data.taxAmount.toFixed(2)}`, totalsX);
    }
    doc.moveDown();
    doc.fontSize(12).text(`Total: $${data.total.toFixed(2)}`, totalsX);
  }

  generatePDF(template: TemplateType, data: TemplateData): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    switch (template) {
      case 'professional':
        this.generateProfessionalTemplate(doc, data);
        break;
      case 'modern':
        this.generateModernTemplate(doc, data);
        break;
      case 'classic':
        this.generateClassicTemplate(doc, data);
        break;
      default:
        this.generateProfessionalTemplate(doc, data);
    }

    // Add notes if present
    if (data.notes) {
      doc.moveDown(2);
      doc.fontSize(10).fillColor('#666').text('Notes:', 50);
      doc.moveDown(0.5);
      doc.fontSize(9).text(data.notes, 50, doc.y, { width: 500 });
    }

    // Footer
    const pageHeight = doc.page.height;
    doc.fontSize(8).fillColor('#999').text('Generated by Remodely CRM', 50, pageHeight - 50);

    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);
    });
  }
}
