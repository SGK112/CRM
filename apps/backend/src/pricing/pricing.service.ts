import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PriceItem, PriceItemDocument } from './schemas/price-item.schema';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

interface SearchOptions {
  vendorId?: string;
  search?: string;
  tags?: string[];
}

interface ImportMapping {
  skuColumn: string;
  nameColumn: string;
  descriptionColumn?: string;
  priceColumn: string;
  unitColumn?: string;
}

interface ImportPriceListData {
  vendorId: string;
  name: string;
  description?: string;
  format: 'csv' | 'excel';
  mapping: ImportMapping;
}

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
    if (!ops.length) return { matched: 0, upserted: 0, modified: 0 };
    const res: any = await this.priceModel.bulkWrite(ops);
    return { matched: res.nMatched, upserted: res.nUpserted, modified: res.nModified };
  }

  findAll(workspaceId: string, options?: SearchOptions | string) {
    const q: any = { workspaceId };

    // Handle legacy string parameter for backward compatibility
    if (typeof options === 'string') {
      if (options) q.vendorId = options;
      return this.priceModel.find(q).sort({ name: 1 });
    }

    // Handle new SearchOptions parameter
    if (options?.vendorId) q.vendorId = options.vendorId;
    if (options?.search) {
      q.$or = [
        { name: { $regex: options.search, $options: 'i' } },
        { sku: { $regex: options.search, $options: 'i' } },
        { description: { $regex: options.search, $options: 'i' } },
      ];
    }
    if (options?.tags && options.tags.length > 0) {
      q.tags = { $in: options.tags };
    }

    return this.priceModel.find(q).sort({ name: 1 });
  }

  async searchItems(workspaceId: string, query?: string, limit: number = 50) {
    const q: any = { workspaceId };

    if (query) {
      q.$or = [
        { name: { $regex: query, $options: 'i' } },
        { sku: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    return this.priceModel
      .find(q)
      .sort({ name: 1 })
      .limit(limit)
      .populate('vendorId', 'name')
      .lean();
  }

  async importPriceList(file: any, importData: ImportPriceListData, workspaceId: string) {
    try {
      const items = await this.parseCsvFile(file.buffer, importData.mapping);

      // Transform parsed data to PriceItem format
      const priceItems = items
        .map(item => ({
          sku: item[importData.mapping.skuColumn],
          name: item[importData.mapping.nameColumn],
          description: importData.mapping.descriptionColumn
            ? item[importData.mapping.descriptionColumn]
            : '',
          baseCost: parseFloat(item[importData.mapping.priceColumn]) || 0,
          unit: importData.mapping.unitColumn ? item[importData.mapping.unitColumn] : 'ea',
          vendorId: importData.vendorId,
          workspaceId,
          defaultMarginPct: 50, // Default margin
          tags: ['imported', importData.name.toLowerCase().replace(/\s+/g, '-')],
        }))
        .filter(item => item.sku && item.name && item.baseCost > 0);

      if (priceItems.length === 0) {
        throw new BadRequestException('No valid items found in the uploaded file');
      }

      const result = await this.upsertMany(priceItems, workspaceId);

      return {
        success: true,
        imported: priceItems.length,
        result,
        message: `Successfully imported ${priceItems.length} items from ${importData.name}`,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to import price list: ${error.message}`);
    }
  }

  private async parseCsvFile(buffer: Buffer, mapping: ImportMapping): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from(buffer.toString());

      stream
        .pipe(csv())
        .on('data', data => {
          // Validate required columns exist
          if (data[mapping.skuColumn] && data[mapping.nameColumn] && data[mapping.priceColumn]) {
            results.push(data);
          }
        })
        .on('end', () => resolve(results))
        .on('error', error => reject(error));
    });
  }

  async getVendorItems(workspaceId: string, vendorId: string, search?: string) {
    const q: any = { workspaceId, vendorId };

    if (search) {
      q.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    return this.priceModel.find(q).sort({ name: 1 }).lean();
  }

  async getPopularItems(workspaceId: string, limit: number = 20) {
    // This could be enhanced to track usage in estimates/invoices
    return this.priceModel
      .find({ workspaceId })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate('vendorId', 'name')
      .lean();
  }
}
