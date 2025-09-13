import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from '../clients/schemas/client.schema';
import { PriceItem, PriceItemDocument } from '../pricing/schemas/price-item.schema';
import { EmailService } from '../services/email.service';
import { PdfTemplatesService, TemplateType } from '../services/pdf-templates.service';
import { User, UserDocument } from '../users/schemas/user.schema';
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

export interface EstimateWithClient extends Estimate {
  client?: {
    _id: string;
    firstName: string;
    lastName: string;
    company?: string;
    email?: string;
    phone?: string;
  };
}

@Injectable()
export class EstimatesService {
  constructor(
    @InjectModel(Estimate.name) private estimateModel: Model<EstimateDocument>,
    @InjectModel(PriceItem.name) private priceModel: Model<PriceItemDocument>,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private emailService: EmailService,
    private pdfTemplatesService: PdfTemplatesService
  ) {}

  private async generateEstimatePDF(
    estimate: EstimateDocument,
    client: { firstName: string; lastName: string; email?: string; company?: string },
    template: TemplateType = 'professional'
  ): Promise<Buffer> {
    const templateData = {
      type: 'estimate' as const,
      number: estimate.number,
      client: {
        _id: (estimate as EstimateDocument & { clientId: string }).clientId || 'unknown',
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        company: client.company,
      },
      items: estimate.items,
      subtotal: estimate.subtotalSell,
      discountAmount: estimate.discountAmount,
      taxAmount: estimate.taxAmount,
      total: estimate.total,
      notes: estimate.notes,
      createdAt: (estimate as EstimateDocument & { createdAt: Date }).createdAt?.toISOString() || new Date().toISOString(),
    };

    return this.pdfTemplatesService.generatePDF(template, templateData);
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
      shareToken: randomBytes(16).toString('hex'),
    });
    this.computeTotals(doc);
    await doc.save();
    return doc;
  }

  async findByShareToken(token: string) {
    const estimate = await this.estimateModel.findOne({ shareToken: token });
    if (!estimate) return null;
    const client = await this.clientModel.findOne({ _id: estimate.clientId, workspaceId: estimate.workspaceId });
    const estimateObj = estimate.toObject() as EstimateWithClient;
    if (client) {
      estimateObj.client = {
        _id: client._id.toString(),
        firstName: client.firstName,
        lastName: client.lastName,
        company: client.company,
        email: client.email,
        phone: client.phone,
      };
    }
    return estimateObj;
  }

  async recalc(id: string, workspaceId: string) {
    const doc = await this.estimateModel.findOne({ _id: id, workspaceId });
    if (!doc) return null;
    this.computeTotals(doc);
    await doc.save();
    return doc;
  }

  async list(workspaceId: string) {
    const estimates = await this.estimateModel.find({ workspaceId }).sort({ createdAt: -1 });

    // Populate client data for each estimate
    const populatedEstimates = await Promise.all(
      estimates.map(async (estimate) => {
        const client = await this.clientModel.findOne({ _id: estimate.clientId, workspaceId });
        const estimateObj = estimate.toObject() as EstimateWithClient;

        if (client) {
          // Add client data to the response
          estimateObj.client = {
            _id: client._id.toString(),
            firstName: client.firstName,
            lastName: client.lastName,
            company: client.company,
            email: client.email,
            phone: client.phone,
          };
        }

        return estimateObj;
      })
    );

    return { estimates: populatedEstimates };
  }

  async findOne(id: string, workspaceId: string) {
    const estimate = await this.estimateModel.findOne({ _id: id, workspaceId });
    if (!estimate) return null;

    // Populate client data
    const client = await this.clientModel.findOne({ _id: estimate.clientId, workspaceId });
    const estimateObj = estimate.toObject() as EstimateWithClient;

    if (client) {
      estimateObj.client = {
        _id: client._id.toString(),
        firstName: client.firstName,
        lastName: client.lastName,
        company: client.company,
        email: client.email,
        phone: client.phone,
      };
    }

    return estimateObj;
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

    // Get user's template preference
    const user = await this.userModel.findOne({ workspaceId });
    const template = (user?.pdfTemplates?.estimateTemplate as TemplateType) || 'professional';

    // Generate PDF with selected template
    const pdfBuffer = await this.generateEstimatePDF(doc, client, template);

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

  async approve(id: string, workspaceId: string) {
    const doc = await this.estimateModel.findOne({ _id: id, workspaceId });
    if (!doc) return null;
    if (doc.status !== 'accepted') {
      doc.status = 'accepted';
      await doc.save();
      // Notify client if possible
      const client = await this.clientModel.findOne({ _id: doc.clientId, workspaceId });
      if (client?.email) {
        try {
          await this.emailService.sendEmail({
            to: client.email,
            subject: `Estimate ${doc.number} Approved`,
            html: `<p>Hi ${client.firstName},</p><p>Your estimate <strong>${doc.number}</strong> has been approved. We'll be in touch shortly regarding next steps.</p>`,
          });
        } catch (_) {
          /* silent */
        }
      }
    }
    return doc;
  }

  async reject(id: string, workspaceId: string) {
    const doc = await this.estimateModel.findOne({ _id: id, workspaceId });
    if (!doc) return null;
    if (doc.status !== 'rejected') {
      doc.status = 'rejected';
      await doc.save();
      const client = await this.clientModel.findOne({ _id: doc.clientId, workspaceId });
      if (client?.email) {
        try {
          await this.emailService.sendEmail({
            to: client.email,
            subject: `Estimate ${doc.number} Updated`,
            html: `<p>Hi ${client.firstName},</p><p>Your estimate <strong>${doc.number}</strong> has been updated with status: Rejected. Feel free to reply if you have questions or would like revisions.</p>`,
          });
        } catch (_) {
          /* silent */
        }
      }
    }
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

    // Get user's template preference
    const user = await this.userModel.findOne({ workspaceId });
    const template = (user?.pdfTemplates?.estimateTemplate as TemplateType) || 'professional';

    const buffer = await this.generateEstimatePDF(doc, clientInfo, template);
    const filename = `Estimate-${doc.number || id}.pdf`;
    return { buffer, filename };
  }

  async remove(id: string, workspaceId: string) {
    const res = await this.estimateModel.deleteOne({ _id: id, workspaceId });
    return { deleted: res.deletedCount === 1 };
  }
}
