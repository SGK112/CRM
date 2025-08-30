import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Estimate, EstimateDocument } from './schemas/estimate.schema';
import { PriceItem, PriceItemDocument } from '../pricing/schemas/price-item.schema';

interface CreateEstimateDto {
  number?: string;
  clientId: string;
  projectId?: string;
  items: { priceItemId?: string; name?: string; description?: string; quantity?: number; baseCost?: number; marginPct?: number; taxable?: boolean; sku?: string; }[];
  discountType?: 'percent'|'fixed';
  discountValue?: number;
  taxRate?: number;
  notes?: string;
}
interface UpdateEstimateDto {
  items?: { priceItemId?: string; name?: string; description?: string; quantity?: number; baseCost?: number; marginPct?: number; taxable?: boolean; sku?: string; }[];
  discountType?: 'percent'|'fixed';
  discountValue?: number;
  taxRate?: number;
  notes?: string;
}

@Injectable()
export class EstimatesService {
  constructor(
    @InjectModel(Estimate.name) private estimateModel: Model<EstimateDocument>,
    @InjectModel(PriceItem.name) private priceModel: Model<PriceItemDocument>,
  ) {}

  private computeTotals(doc: EstimateDocument) {
    let subtotalCost = 0; let subtotalSell = 0; let totalMargin = 0;
    doc.items.forEach(li => {
      const unitCost = li.baseCost || 0;
      const quantity = li.quantity || 1;
      const unitSellPrice = unitCost * (1 + (li.marginPct||0)/100);
      li.sellPrice = unitSellPrice; // Store per-unit sell price
      
      const totalCost = unitCost * quantity;
      const totalSell = unitSellPrice * quantity;
      
      subtotalCost += totalCost; 
      subtotalSell += totalSell; 
      totalMargin += (totalSell - totalCost);
    });
    doc.subtotalCost = subtotalCost;
    doc.subtotalSell = subtotalSell;
    doc.totalMargin = totalMargin;
    // discount
    let discountAmount = 0;
    if (doc.discountType === 'percent') {
      discountAmount = (doc.discountValue||0) > 0 ? subtotalSell * (doc.discountValue||0)/100 : 0;
    } else if (doc.discountType === 'fixed') {
      discountAmount = doc.discountValue||0;
    }
    doc.discountAmount = discountAmount;
    const afterDiscount = Math.max(0, subtotalSell - discountAmount);
    // tax
    const taxAmount = (doc.taxRate||0) > 0 ? afterDiscount * (doc.taxRate||0)/100 : 0;
    doc.taxAmount = taxAmount;
    doc.total = afterDiscount + taxAmount;
  }

  async create(dto: CreateEstimateDto, workspaceId: string) {
    // generate number if not provided
    if (!dto.number) {
      const count = await this.estimateModel.countDocuments({ workspaceId });
      dto.number = `EST-${(1000 + count + 1)}`;
    }
    // Build line items, enriching from price items if provided
    const items = [] as any[];
    for (const input of dto.items || []) {
      const li = { ...input } as any;
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
    this.computeTotals(doc as any);
    await doc.save();
    return doc;
  }

  async recalc(id: string, workspaceId: string) {
    const doc = await this.estimateModel.findOne({ _id: id, workspaceId });
    if (!doc) return null;
    this.computeTotals(doc as any);
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
    // TODO: integrate email service or notification dispatch
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
      })) as any;
    }
    if (dto.discountType) doc.discountType = dto.discountType;
    if (dto.discountValue !== undefined) doc.discountValue = dto.discountValue;
    if (dto.taxRate !== undefined) doc.taxRate = dto.taxRate;
    if (dto.notes !== undefined) doc.notes = dto.notes;
    this.computeTotals(doc as any);
    await doc.save();
    return doc;
  }
}
