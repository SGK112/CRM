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

@Injectable()
export class EstimatesService {
  constructor(
    @InjectModel(Estimate.name) private estimateModel: Model<EstimateDocument>,
    @InjectModel(PriceItem.name) private priceModel: Model<PriceItemDocument>,
  ) {}

  private computeTotals(doc: EstimateDocument) {
    let subtotalCost = 0; let subtotalSell = 0; let totalMargin = 0;
    doc.items.forEach(li => {
      const cost = (li.baseCost || 0) * (li.quantity || 1);
      const sell = cost * (1 + (li.marginPct||0)/100);
      li.sellPrice = sell;
      subtotalCost += cost; subtotalSell += sell; totalMargin += (sell - cost);
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
      let li = { ...input } as any;
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
}
