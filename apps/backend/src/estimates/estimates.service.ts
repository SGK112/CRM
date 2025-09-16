import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(EstimatesService.name);

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
    // Generate unique number if not provided
    if (!dto.number) {
      // Find the highest existing estimate number for this workspace
      const lastEstimate = await this.estimateModel
        .findOne({ workspaceId }, { number: 1 })
        .sort({ number: -1 })
        .exec();
      
      let nextNumber = 1001;
      if (lastEstimate?.number) {
        // Extract number from format EST-XXXX
        const match = lastEstimate.number.match(/EST-(\d+)/);
        if (match) {
          nextNumber = Math.max(parseInt(match[1]) + 1, 1001);
        }
      }
      
      // Ensure uniqueness by checking if number already exists
      let attempts = 0;
      while (attempts < 10) {
        const candidateNumber = `EST-${nextNumber + attempts}`;
        const existing = await this.estimateModel.findOne({ 
          workspaceId, 
          number: candidateNumber 
        });
        if (!existing) {
          dto.number = candidateNumber;
          break;
        }
        attempts++;
      }
      
      // Fallback if all attempts failed
      if (!dto.number) {
        dto.number = `EST-${Date.now()}`;
      }
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
    // Retry logic for duplicate key errors
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      try {
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
      } catch (error) {
        if (error.code === 11000 && attempts < maxAttempts - 1) {
          // Duplicate key error - regenerate number
          attempts++;
          this.logger.warn(`Duplicate key error for estimate number ${dto.number}, attempt ${attempts}/${maxAttempts}`);
          
          // Find the highest number again and increment
          const latestEstimate = await this.estimateModel
            .findOne({ workspaceId })
            .sort({ number: -1 })
            .exec();
          
          const latestNumber = latestEstimate ? 
            parseInt(latestEstimate.number.replace('EST-', ''), 10) : 
            1000;
          
          dto.number = `EST-${latestNumber + attempts + 1}`;
          continue;
        }
        throw error;
      }
    }
    
    throw new Error(`Failed to create estimate after ${maxAttempts} attempts due to duplicate key conflicts`);
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
    try {
      const doc = await this.estimateModel.findOne({ _id: id, workspaceId });
      if (!doc) {
        this.logger.warn(`Estimate not found: ${id} for workspace: ${workspaceId}`);
        return null;
      }
      
      // Update status to sent if still draft
      if (doc.status === 'draft') {
        doc.status = 'sent';
        await doc.save();
        this.logger.log(`Estimate ${doc.number} status updated to 'sent'`);
      }
      
      // Fetch client info
      const client = await this.clientModel.findOne({ _id: doc.clientId, workspaceId });
      if (!client || !client.email) {
        this.logger.warn(`Cannot send estimate ${doc.number}: Client email not found`);
        return doc; // Return doc but indicate email not sent
      }

      // Get user's template preference
      const user = await this.userModel.findOne({ workspaceId });
      const template = (user?.pdfTemplates?.estimateTemplate as TemplateType) || 'professional';

      // Generate PDF with selected template
      const pdfBuffer = await this.generateEstimatePDF(doc, client, template);

      // Create professional email template
      const emailSubject = `Your Project Estimate - ${doc.number}`;
      const emailHtml = this.createEstimateEmailTemplate(doc, client);

      // Send email with PDF attachment via SendGrid
      const emailSent = await this.emailService.sendEmail({
        to: client.email,
        subject: emailSubject,
        html: emailHtml,
        attachments: [
          {
            filename: `Estimate-${doc.number}.pdf`,
            content: pdfBuffer,
          },
        ],
      });

      if (emailSent) {
        this.logger.log(`✅ Estimate ${doc.number} sent successfully to ${client.email}`);
        
        // Mark estimate as sent with timestamp
        doc.sentAt = new Date();
        await doc.save();
      } else {
        this.logger.error(`❌ Failed to send estimate ${doc.number} to ${client.email}`);
      }

      return doc;
    } catch (error) {
      this.logger.error(`Error sending estimate ${id}:`, error);
      throw new Error(`Failed to send estimate: ${error.message}`);
    }
  }

  private createEstimateEmailTemplate(estimate: EstimateDocument, client: ClientDocument): string {
    const clientName = client.firstName || 'Valued Client';
    const companyName = client.company || '';
    const estimateTotal = estimate.total ? `$${estimate.total.toLocaleString()}` : 'TBD';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Project Estimate</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .header p { margin: 5px 0 0; opacity: 0.9; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .greeting { font-size: 18px; margin-bottom: 20px; }
            .highlight-box { background: #f8f9fa; border-left: 4px solid #d97706; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .estimate-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .estimate-number { font-size: 24px; font-weight: bold; color: #d97706; }
            .estimate-total { font-size: 20px; font-weight: bold; color: #059669; }
            .cta-button { display: inline-block; background: #d97706; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .cta-button:hover { background: #b45309; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
            .attachment-note { background: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏗️ Your Project Estimate</h1>
                <p>Professional Remodeling Services</p>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Dear ${clientName}${companyName ? ` from ${companyName}` : ''},
                </div>
                
                <p>Thank you for considering our services for your remodeling project. We're excited to work with you and bring your vision to life.</p>
                
                <div class="estimate-details">
                    <div class="estimate-number">Estimate #${estimate.number}</div>
                    <div class="estimate-total">Total: ${estimateTotal}</div>
                </div>
                
                <div class="highlight-box">
                    <strong>📎 Your detailed estimate is attached as a PDF</strong><br>
                    This document includes:
                    <ul>
                        <li>Complete project breakdown</li>
                        <li>Materials and labor costs</li>
                        <li>Timeline and milestones</li>
                        <li>Terms and conditions</li>
                    </ul>
                </div>
                
                <div class="attachment-note">
                    <strong>📋 Next Steps:</strong><br>
                    Please review the attached estimate carefully. If you have any questions or would like to discuss modifications, we're here to help. Once you're ready to proceed, simply reply to this email or give us a call.
                </div>
                
                <p>We pride ourselves on delivering quality workmanship and exceptional customer service. This estimate is valid for 30 days from the date issued.</p>
                
                <p>Questions? Feel free to reach out anytime. We're looking forward to hearing from you!</p>
                
                <div style="margin-top: 30px;">
                    <strong>Best regards,</strong><br>
                    The Remodely Team<br>
                    <em>Making your remodeling dreams reality</em>
                </div>
            </div>
            
            <div class="footer">
                <p>This estimate was generated using Remodely CRM - AI-Powered Construction Management</p>
                <p style="font-size: 12px; color: #9ca3af;">
                    Please add our email to your contacts to ensure you receive all project communications.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
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
