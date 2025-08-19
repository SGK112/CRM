import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vendor, VendorDocument } from '../vendors/schemas/vendor.schema';
import { PriceItem, PriceItemDocument } from '../pricing/schemas/price-item.schema';

interface CatalogQuery {
  q?: string;
  vendorId?: string;
  tag?: string;
  limit?: number;
}

@Injectable()
export class CatalogService {
  constructor(
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
    @InjectModel(PriceItem.name) private priceModel: Model<PriceItemDocument>,
  ) {}

  async search(workspaceId: string, params: CatalogQuery) {
    const { q, vendorId, tag } = params;
    const limit = Math.min(params.limit || 50, 200);
    const priceQuery: any = { workspaceId };
    if (vendorId) priceQuery.vendorId = vendorId;
    if (tag) priceQuery.tags = tag;
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'i');
      priceQuery.$or = [
        { sku: regex },
        { name: regex },
        { description: regex },
      ];
    }
    const items = await this.priceModel.find(priceQuery).limit(limit).lean();
    const vendorIds = Array.from(new Set(items.filter(i=>i.vendorId).map(i=> i.vendorId!.toString())));
    const vendors = await this.vendorModel.find({ _id: { $in: vendorIds } }).lean();
    const vendorMap = new Map(vendors.map(v=> [v._id.toString(), v]));
    const enriched = items.map(it => ({
      ...it,
      vendorName: it.vendorId ? vendorMap.get(it.vendorId.toString())?.name : undefined,
      sellPrice: (it.baseCost || 0) * (1 + (it.defaultMarginPct||0)/100),
    }));
    const agg = {
      count: enriched.length,
      minCost: enriched.reduce((m,i)=> i.baseCost < m ? i.baseCost : m, enriched[0]?.baseCost ?? 0),
      maxCost: enriched.reduce((m,i)=> i.baseCost > m ? i.baseCost : m, enriched[0]?.baseCost ?? 0),
      avgMarginPct: enriched.reduce((s,i)=> s + (i.defaultMarginPct||0), 0) / (enriched.length||1),
      vendors: vendors.length,
    };
    return { items: enriched, aggregates: agg };
  }
}
