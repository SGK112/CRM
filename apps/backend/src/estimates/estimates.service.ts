import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import PDFDocument = require('pdfkit');
import { Client, ClientDocument } from '../clients/schemas/client.schema';
import { PriceItem, PriceItemDocument } from '../pricing/schemas/price-item.schema';
import { EmailService } from '../services/email.service';
import { Estimate, EstimateDocument } from './schemas/estimate.schema';

export interface CreateEstimateDto {
  number?: string;
  clientId: string;
  projectId?: string;
  items: {
    priceItemId?: string;
    name?: string;
    description?: string;
    quantity?: number;
    baseCost?: number;
    marginPct?: number;
    taxable?: boolean;
    sku?: string;
  }[];
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  taxRate?: number;
  notes?: string;
}
export interface UpdateEstimateDto {
  items?: {
    priceItemId?: string;
    name?: string;
    description?: string;
    quantity?: number;
    baseCost?: number;
    marginPct?: number;
    taxable?: boolean;
    sku?: string;
  }[];
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  taxRate?: number;
  notes?: string;
}

@Injectable()
export class EstimatesService {
  constructor(
    @InjectModel(Estimate.name) private estimateModel: Model<EstimateDocument>,
    @InjectModel(PriceItem.name) private priceModel: Model<PriceItemDocument>,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    private emailService: EmailService
    // Optionally inject ClientsService if needed for more client info
  ) {}

  private async generateEstimatePDF(
    estimate: EstimateDocument,
    client: { firstName: string; lastName: string; email?: string; company?: string }
  ): Promise<Buffer> {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    doc.fontSize(20).text('Estimate', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Estimate #: ${estimate.number}`);
    doc.text(`Client: ${client.firstName} ${client.lastName}`);
    if (client.email) doc.text(`Email: ${client.email}`);
    if (client.company) doc.text(`Company: ${client.company}`);
    doc.moveDown();
    doc.text('Items:');
    estimate.items.forEach(
      (item: { name: string; quantity: number; sellPrice?: number }, idx: number) => {
        doc.text(
          `${idx + 1}. ${item.name} - Qty: ${item.quantity} - $${item.sellPrice?.toFixed(2)}`
        );
      }
    );
    doc.moveDown();
    if (typeof estimate.subtotalSell === 'number')
      doc.text(`Subtotal: $${estimate.subtotalSell.toFixed(2)}`);
    if (typeof estimate.discountAmount === 'number')
      doc.text(`Discount: $${estimate.discountAmount.toFixed(2)}`);
    if (typeof estimate.taxAmount === 'number') doc.text(`Tax: $${estimate.taxAmount.toFixed(2)}`);
    if (typeof estimate.total === 'number') doc.text(`Total: $${estimate.total.toFixed(2)}`);
    doc.end();
    return await new Promise((resolve, reject) => {
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on('error', reject);
    });
  }

  private computeTotals(doc: EstimateDocument) {
    let subtotalCost = 0;
    let subtotalSell = 0;
    let totalMargin = 0;
    doc.items.forEach(li => {
      const unitCost = li.baseCost || 0;
      const quantity = li.quantity || 1;
      const unitSellPrice = unitCost * (1 + (li.marginPct || 0) / 100);
      li.sellPrice = unitSellPrice; // Store per-unit sell price

      const totalCost = unitCost * quantity;
      const totalSell = unitSellPrice * quantity;

      subtotalCost += totalCost;
      subtotalSell += totalSell;
      totalMargin += totalSell - totalCost;
    });
    doc.subtotalCost = subtotalCost;
    doc.subtotalSell = subtotalSell;
    doc.totalMargin = totalMargin;
    // discount
    let discountAmount = 0;
    if (doc.discountType === 'percent') {
      discountAmount =
        (doc.discountValue || 0) > 0 ? (subtotalSell * (doc.discountValue || 0)) / 100 : 0;
    } else if (doc.discountType === 'fixed') {
      discountAmount = doc.discountValue || 0;
    }
    doc.discountAmount = discountAmount;
    const afterDiscount = Math.max(0, subtotalSell - discountAmount);
    // tax
    const taxAmount = (doc.taxRate || 0) > 0 ? (afterDiscount * (doc.taxRate || 0)) / 100 : 0;
    doc.taxAmount = taxAmount;
    doc.total = afterDiscount + taxAmount;
  }

  async create(dto: CreateEstimateDto, workspaceId: string) {
    // generate number if not provided
    if (!dto.number) {
      const count = await this.estimateModel.countDocuments({ workspaceId });
      dto.number = `EST-${1000 + count + 1}`;
    }
    // Build line items, enriching from price items if provided
    const items: Array<{
      priceItemId?: string;
      name?: string;
      description?: string;
      quantity?: number;
      baseCost?: number;
      marginPct?: number;
      taxable?: boolean;
      sku?: string;
    }> = [];
    for (const input of dto.items || []) {
      const li = { ...input };
      if (input.priceItemId) {
        const pi = await this.priceModel.findOne({ _id: input.priceItemId, workspaceId });
        if (pi) {
          li.name = li.name || pi.name;
          li.baseCost = li.baseCost ?? pi.baseCost;
          li.marginPct = li.marginPct ?? pi.defaultMarginPct;
          li.sku = li.sku || pi.sku;
        }
      }
      li.quantity = li.quantity ?? 1;
      li.marginPct = li.marginPct ?? 50;
      li.baseCost = li.baseCost ?? 0;
      if (!li.name) li.name = li.sku || 'Item';
      items.push(li);
    }
    const doc = new this.estimateModel({
      workspaceId,
      number: dto.number,
      clientId: dto.clientId,
      projectId: dto.projectId,
      status: 'draft',
      items,
      discountType: dto.discountType || 'percent',
      discountValue: dto.discountValue || 0,
      taxRate: dto.taxRate || 0,
      notes: dto.notes,
    });
    this.computeTotals(doc);
    await doc.save();
    return doc;
  }

  async recalc(id: string, workspaceId: string) {
    const doc = await this.estimateModel.findOne({ _id: id, workspaceId });
    if (!doc) return null;
    this.computeTotals(doc);
    await doc.save();
    return doc;
  }

  async list(workspaceId: string) {
    return this.estimateModel.find({ workspaceId }).sort({ createdAt: -1 });
  }

  async findOne(id: string, workspaceId: string) {
    return this.estimateModel.findOne({ _id: id, workspaceId });
  }

  async send(id: string, workspaceId: string) {
    const doc = await this.estimateModel.findOne({ _id: id, workspaceId });
    if (!doc) return null;
    if (doc.status === 'draft') {
      doc.status = 'sent';
      await doc.save();
    }
    // Fetch client info
    const client = await this.clientModel.findOne({ _id: doc.clientId, workspaceId });
    if (!client || !client.email) return doc; // Can't send without client email

    // Generate PDF
    const pdfBuffer = await this.generateEstimatePDF(doc, client);

    // Send email with PDF attachment
    await this.emailService.sendEmail({
      to: client.email,
      subject: `Your Estimate from Remodely CRM (#${doc.number})`,
      html: `<p>Dear ${client.firstName},</p><p>Please find your estimate attached.</p>`,
      attachments: [
        {
          filename: `Estimate-${doc.number}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
    return doc;
  }

  async updateStatus(id: string, workspaceId: string, status: string) {
    const doc = await this.estimateModel.findOne({ _id: id, workspaceId });
    if (!doc) return null;
    doc.status = status;
    await doc.save();
    return doc;
  }

  async update(id: string, workspaceId: string, dto: UpdateEstimateDto) {
    const doc = await this.estimateModel.findOne({ _id: id, workspaceId });
    if (!doc) return null;
    if (dto.items) {
      // replace items with new list (simplified)
      doc.items = dto.items.map(li => ({
        priceItemId: li.priceItemId,
        name: li.name || li.sku || 'Item',
        description: li.description || '',
        quantity: li.quantity ?? 1,
        baseCost: li.baseCost ?? 0,
        marginPct: li.marginPct ?? 50,
        sellPrice: 0,
        taxable: !!li.taxable,
        sku: li.sku,
      }));
    }
    if (dto.discountType) doc.discountType = dto.discountType;
    if (dto.discountValue !== undefined) doc.discountValue = dto.discountValue;
    if (dto.taxRate !== undefined) doc.taxRate = dto.taxRate;
    if (dto.notes !== undefined) doc.notes = dto.notes;
    this.computeTotals(doc);
    await doc.save();
    return doc;
  }

  // Generate a PDF buffer for a given estimate id in the workspace
  async getPdf(
    id: string,
    workspaceId: string
  ): Promise<{ buffer: Buffer; filename: string } | null> {
    const doc = await this.estimateModel.findOne({ _id: id, workspaceId });
    if (!doc) return null;
    // Ensure totals are up to date before generating
    this.computeTotals(doc);
    const client = await this.clientModel.findOne({ _id: doc.clientId, workspaceId });
    const clientInfo = client
      ? {
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          company: client.company,
        }
      : { firstName: 'Client', lastName: '', email: undefined, company: undefined };
    const buffer = await this.generateEstimatePDF(doc, clientInfo);
    const filename = `Estimate-${doc.number || id}.pdf`;
    return { buffer, filename };
  }

  async remove(id: string, workspaceId: string) {
    const res = await this.estimateModel.deleteOne({ _id: id, workspaceId });
    return { deleted: res.deletedCount === 1 };
  }
}
