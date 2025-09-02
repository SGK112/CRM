import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { Estimate, EstimateDocument } from '../estimates/schemas/estimate.schema';
import PDFDocument from 'pdfkit';
import { EmailService } from '../services/email.service';
import { Client, ClientDocument } from '../clients/schemas/client.schema';

export interface CreateInvoiceDto {
  clientId: string;
  projectId?: string;
  items: {
    name: string;
    description?: string;
    quantity?: number;
    unitPrice?: number;
    taxable?: boolean;
  }[];
  taxRate?: number;
  notes?: string;
  dueDate?: string;
}
export interface UpdateInvoiceDto {
  items?: {
    name: string;
    description?: string;
    quantity?: number;
    unitPrice?: number;
    taxable?: boolean;
  }[];
  taxRate?: number;
  notes?: string;
  dueDate?: string;
}
export interface RecordPaymentDto {
  amount: number;
  note?: string;
  date?: string;
}

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Estimate.name) private estimateModel: Model<EstimateDocument>,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    private emailService: EmailService
  ) {}

  private compute(doc: InvoiceDocument) {
    let subtotal = 0;
    doc.items.forEach(li => {
      li.quantity = li.quantity || 1;
      li.unitPrice = li.unitPrice || 0;
      li.total = (li.quantity || 1) * (li.unitPrice || 0);
      subtotal += li.total;
    });
    doc.subtotal = subtotal;
    const taxAmount = (doc.taxRate || 0) > 0 ? (subtotal * (doc.taxRate || 0)) / 100 : 0;
    doc.taxAmount = taxAmount;
    doc.total = subtotal + taxAmount;
  }

  private async generateInvoicePDF(
    invoice: InvoiceDocument,
    client?: { firstName?: string; lastName?: string; email?: string; company?: string }
  ): Promise<Buffer> {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice #: ${invoice.number}`);
    if (invoice.dueDate) doc.text(`Due: ${new Date(invoice.dueDate).toLocaleDateString()}`);
    if (client) {
      doc.text(`Client: ${(client.firstName || '') + ' ' + (client.lastName || '')}`);
      if (client.email) doc.text(`Email: ${client.email}`);
      if (client.company) doc.text(`Company: ${client.company}`);
    }
    doc.moveDown();
    doc.text('Items:');
    (invoice.items || []).forEach(
      (
        item: { name: string; quantity: number; unitPrice?: number; total?: number },
        idx: number
      ) => {
        const unit = (item.unitPrice ?? 0).toFixed(2);
        const lineTotal = (item.total ?? (item.quantity || 1) * (item.unitPrice || 0)).toFixed(2);
        doc.text(
          `${idx + 1}. ${item.name} - Qty: ${item.quantity} - Unit: $${unit} - Total: $${lineTotal}`
        );
      }
    );
    doc.moveDown();
    if (typeof invoice.subtotal === 'number') doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`);
    if (typeof invoice.taxAmount === 'number') doc.text(`Tax: $${invoice.taxAmount.toFixed(2)}`);
    if (typeof invoice.total === 'number') doc.text(`Total: $${invoice.total.toFixed(2)}`);
    if (typeof invoice.amountPaid === 'number') doc.text(`Paid: $${invoice.amountPaid.toFixed(2)}`);
    doc.end();
    return await new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);
    });
  }

  private async nextNumber(workspaceId: string) {
    const count = await this.invoiceModel.countDocuments({ workspaceId });
    return `INV-${1000 + count + 1}`;
  }

  async create(dto: CreateInvoiceDto, workspaceId: string) {
    const number = await this.nextNumber(workspaceId);
    const doc = new this.invoiceModel({
      workspaceId,
      number,
      clientId: dto.clientId,
      projectId: dto.projectId,
      items: dto.items || [],
      taxRate: dto.taxRate || 0,
      notes: dto.notes,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });
    this.compute(doc as unknown as InvoiceDocument);
    await doc.save();
    return doc;
  }

  async fromEstimate(estimateId: string, workspaceId: string) {
    const est = await this.estimateModel.findOne({ _id: estimateId, workspaceId });
    if (!est) return null;
    const existingConverted = await this.invoiceModel.findOne({
      estimateId: est._id.toString(),
      workspaceId,
    });
    if (existingConverted) return existingConverted;
    const number = await this.nextNumber(workspaceId);
    const items = est.items.map(li => ({
      name: li.name,
      description: li.description,
      quantity: li.quantity,
      unitPrice: li.sellPrice,
      taxable: li.taxable,
    }));
    const doc = new this.invoiceModel({
      workspaceId,
      number,
      clientId: est.clientId,
      projectId: est.projectId,
      items,
      taxRate: est.taxRate,
      notes: est.notes,
      estimateId: est._id.toString(),
    });
    this.compute(doc as unknown as InvoiceDocument);
    await doc.save();
    est.status = 'converted';
    await est.save();
    return doc;
  }

  list(workspaceId: string) {
    return this.invoiceModel.find({ workspaceId }).sort({ createdAt: -1 });
  }
  get(id: string, workspaceId: string) {
    return this.invoiceModel.findOne({ _id: id, workspaceId });
  }

  async update(id: string, workspaceId: string, dto: UpdateInvoiceDto) {
    const doc = await this.invoiceModel.findOne({ _id: id, workspaceId });
    if (!doc) return null;
    if (dto.items) {
      doc.items = dto.items.map(li => ({
        name: li.name,
        description: li.description,
        quantity: li.quantity || 1,
        unitPrice: li.unitPrice || 0,
        total: (li.quantity || 1) * (li.unitPrice || 0),
        taxable: !!li.taxable,
      })) as unknown as InvoiceDocument['items'];
    }
    if (dto.taxRate !== undefined) doc.taxRate = dto.taxRate;
    if (dto.notes !== undefined) doc.notes = dto.notes;
    if (dto.dueDate !== undefined) doc.dueDate = dto.dueDate ? new Date(dto.dueDate) : undefined;
    this.compute(doc as unknown as InvoiceDocument);
    await doc.save();
    return doc;
  }

  async send(id: string, workspaceId: string) {
    const doc = await this.invoiceModel.findOne({ _id: id, workspaceId });
    if (!doc) return null;
    if (doc.status === 'draft') {
      doc.status = 'sent';
      await doc.save();
    }

    // Fetch client for email
    const client = await this.clientModel.findOne({ _id: doc.clientId, workspaceId });
    if (!client || !client.email) return doc; // Can't email without address

    // Generate PDF
    const pdfBuffer = await this.generateInvoicePDF(doc as unknown as InvoiceDocument, client);

    // Send email with PDF attachment
    await this.emailService.sendEmail({
      to: client.email,
      subject: `Your Invoice from Remodely CRM (#${doc.number})`,
      html: `<p>Dear ${client.firstName},</p><p>Please find your invoice attached.</p>`,
      attachments: [{ filename: `Invoice-${doc.number}.pdf`, content: pdfBuffer }],
    });

    return doc;
  }

  async recordPayment(id: string, workspaceId: string, dto: RecordPaymentDto) {
    const doc = await this.invoiceModel.findOne({ _id: id, workspaceId });
    if (!doc) return null;
    const amount = dto.amount || 0;
    doc.amountPaid = (doc.amountPaid || 0) + amount;
    if (doc.amountPaid >= doc.total) doc.status = 'paid';
    else if (doc.amountPaid > 0) doc.status = 'partial';
    await doc.save();
    // TODO: store payment record document (future)
    return doc;
  }

  async remove(id: string, workspaceId: string) {
    const res = await this.invoiceModel.deleteOne({ _id: id, workspaceId });
    return { deleted: res.deletedCount === 1 };
  }

  // Generate a PDF buffer for a given invoice id in the workspace
  async getPdf(
    id: string,
    workspaceId: string
  ): Promise<{ buffer: Buffer; filename: string } | null> {
    const inv = await this.invoiceModel.findOne({ _id: id, workspaceId });
    if (!inv) return null;
    // compute totals if missing
    this.compute(inv as unknown as InvoiceDocument);
    const client = await this.clientModel.findOne({ _id: inv.clientId, workspaceId });
    const clientInfo = client
      ? {
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          company: client.company,
        }
      : {};
    const buffer = await this.generateInvoicePDF(inv as unknown as InvoiceDocument, clientInfo);
    const filename = `Invoice-${inv.number || id}.pdf`;
    return { buffer, filename };
  }
}
