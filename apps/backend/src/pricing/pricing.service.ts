import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PriceItem, PriceItemDocument } from './schemas/price-item.schema';

@Injectable()
export class PricingService {
  constructor(@InjectModel(PriceItem.name) private priceModel: Model<PriceItemDocument>) {}

  async upsertMany(items: Partial<PriceItem>[], workspaceId: string) {
    const ops = items
      .filter(i => i && i.sku && i.name)
      .map(i => ({
        updateOne: {
          filter: { workspaceId, sku: i.sku },
          update: { $set: { ...i, workspaceId } },
          upsert: true,
        },
      }));
    if (!ops.length) return { matched:0, upserted:0, modified:0 };
    const res:any = await this.priceModel.bulkWrite(ops);
    return { matched: res.nMatched, upserted: res.nUpserted, modified: res.nModified };
  }

  findAll(workspaceId: string, vendorId?: string) {
    const q:any = { workspaceId };
    if (vendorId) q.vendorId = vendorId;
    return this.priceModel.find(q).sort({ name:1 });
  }
}
