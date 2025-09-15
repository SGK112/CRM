import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from '../clients/schemas/client.schema';
import { Estimate, EstimateDocument } from '../estimates/schemas/estimate.schema';
import { EmailService } from '../services/email.service';
import { PdfTemplatesService, TemplateType } from '../services/pdf-templates.service';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

export interface CreateInvoiceDto {
  clientId: string;
  projectId?: string;
  items: {
    name: string;
    description?: string;
    quantity?: number;
    unitPrice?: number;
    taxable?: boolean;
    costPrice?: number; // optional cost for profit metrics
  }[];
  taxRate?: number;
  notes?: string;
  dueDate?: string;
  depositRequired?: number; // absolute amount required as upfront deposit
  showDepositDetails?: boolean;
  showProfitMetrics?: boolean; // internal flag
}
export interface UpdateInvoiceDto {
  items?: {
    name: string;
    description?: string;
    quantity?: number;
    unitPrice?: number;
    taxable?: boolean;
    costPrice?: number;
  }[];
  taxRate?: number;
  notes?: string;
  dueDate?: string;
  depositRequired?: number;
  showDepositDetails?: boolean;
  showProfitMetrics?: boolean;
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
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private emailService: EmailService,
    private pdfTemplatesService: PdfTemplatesService
  ) {}

  private compute(doc: InvoiceDocument) {
    let subtotal = 0;
    let costSubtotal = 0;
    interface LineItemWithCost {
      name: string;
      description?: string;
      quantity?: number;
      unitPrice?: number;
      total?: number;
      taxable?: boolean;
      costPrice?: number;
    }
    (doc.items as unknown as LineItemWithCost[]).forEach(li => {
      li.quantity = li.quantity ?? 1;
      li.unitPrice = li.unitPrice ?? 0;
      li.total = (li.quantity || 1) * (li.unitPrice || 0);
      subtotal += li.total;
      if (typeof li.costPrice === 'number') {
        costSubtotal += (li.quantity || 1) * (li.costPrice || 0);
      }
    });
    doc.subtotal = subtotal;
    const taxAmount = (doc.taxRate || 0) > 0 ? (subtotal * (doc.taxRate || 0)) / 100 : 0;
    doc.taxAmount = taxAmount;
    doc.total = subtotal + taxAmount;
    // Ensure depositRequired never exceeds total
    if (doc.depositRequired && doc.depositRequired > doc.total) {
      doc.depositRequired = doc.total;
    }
    doc.balanceRemaining = doc.total - (doc.amountPaid || 0);
    // Attach profit metrics transiently on document (not persisted schema field) for PDF generation
    (doc as unknown as { _profitMetrics?: { costSubtotal: number; profit: number; marginPercent: number | null } })._profitMetrics = {
      costSubtotal,
      profit: subtotal - costSubtotal,
      marginPercent: costSubtotal > 0 ? ((subtotal - costSubtotal) / subtotal) * 100 : null,
    };
  }

  private async generateInvoicePDF(
    invoice: InvoiceDocument,
    client?: { firstName?: string; lastName?: string; email?: string; company?: string },
    template: TemplateType = 'professional'
  ): Promise<Buffer> {
    interface ExtendedInvoice extends InvoiceDocument {
      depositRequired: number;
      depositPaid: number;
      balanceRemaining: number;
      showDepositDetails: boolean;
      showProfitMetrics: boolean;
      _profitMetrics?: { costSubtotal: number; profit: number; marginPercent: number | null };
    }
    const ext = invoice as ExtendedInvoice;
    const templateData = {
      type: 'invoice' as const,
      number: invoice.number,
      client: client ? {
        _id: (invoice as InvoiceDocument & { clientId: string }).clientId || 'unknown',
        firstName: client.firstName || 'Client',
        lastName: client.lastName || '',
        email: client.email,
        company: client.company,
      } : {
        _id: 'unknown',
        firstName: 'Client',
        lastName: '',
      },
      items: invoice.items,
      subtotal: invoice.subtotal,
      discountAmount: 0, // Invoices don't have discounts in current schema
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      notes: invoice.notes,
      dueDate: invoice.dueDate?.toISOString(),
      createdAt: (invoice as InvoiceDocument & { createdAt: Date }).createdAt?.toISOString() || new Date().toISOString(),
      depositRequired: ext.depositRequired || 0,
      depositPaid: ext.depositPaid || 0,
      balanceRemaining: ext.balanceRemaining,
      showDepositDetails: ext.showDepositDetails,
      showProfitMetrics: ext.showProfitMetrics,
      profitMetrics: ext._profitMetrics,
    };

    return this.pdfTemplatesService.generatePDF(template, templateData);
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
      depositRequired: dto.depositRequired || 0,
      showDepositDetails: !!dto.showDepositDetails,
      showProfitMetrics: !!dto.showProfitMetrics,
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
    const estWithDeposit = est as EstimateDocument & { depositRequired?: number };
    const doc = new this.invoiceModel({
      workspaceId,
      number,
      clientId: est.clientId,
      projectId: est.projectId,
      items,
      taxRate: est.taxRate,
      notes: est.notes,
      estimateId: est._id.toString(),
      // Propagate deposit if estimate specifies one
      depositRequired: estWithDeposit.depositRequired || 0,
      showDepositDetails: (estWithDeposit.depositRequired || 0) > 0,
      showProfitMetrics: false,
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
     if (dto.depositRequired !== undefined) doc.depositRequired = dto.depositRequired;
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

    // Get user's template preference
    const user = await this.userModel.findOne({ workspaceId });
    const template = (user?.pdfTemplates?.invoiceTemplate as TemplateType) || 'professional';

    // Generate PDF with selected template
    const pdfBuffer = await this.generateInvoicePDF(doc as unknown as InvoiceDocument, client, template);

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
    // Track deposit progress if applicable
    if (doc.depositRequired > 0 && doc.depositPaid < doc.depositRequired) {
      const remainingDeposit = doc.depositRequired - doc.depositPaid;
      const appliedToDeposit = Math.min(amount, remainingDeposit);
      doc.depositPaid += appliedToDeposit;
    }
    if (doc.amountPaid >= doc.total) doc.status = 'paid';
    else if (doc.amountPaid > 0) doc.status = 'partial';
    doc.balanceRemaining = doc.total - doc.amountPaid;
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
    workspaceId: string,
    options?: { internal?: boolean }
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

    // Get user's template preference
    const user = await this.userModel.findOne({ workspaceId });
    const template = (user?.pdfTemplates?.invoiceTemplate as TemplateType) || 'professional';

    // Temporarily store original flag then ensure profit metrics suppressed unless internal request
    const invoiceDoc = inv as unknown as InvoiceDocument;
    const originalShowProfit = invoiceDoc.showProfitMetrics;
    if (!options?.internal) {
      invoiceDoc.showProfitMetrics = false;
    }
    const buffer = await this.generateInvoicePDF(invoiceDoc, clientInfo, template);
    // Restore flag (no persistence change)
    invoiceDoc.showProfitMetrics = originalShowProfit;
    const filename = `Invoice-${inv.number || id}.pdf`;
    return { buffer, filename };
  }
}
