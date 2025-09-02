import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PriceItem, PriceItemSchema } from '../pricing/schemas/price-item.schema';
import { Vendor, VendorSchema } from '../vendors/schemas/vendor.schema';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { PDFProcessingService } from './pdf-processing.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vendor.name, schema: VendorSchema },
      { name: PriceItem.name, schema: PriceItemSchema },
    ]),
  ],
  providers: [CatalogService, PDFProcessingService],
  controllers: [CatalogController],
  exports: [CatalogService, PDFProcessingService],
})
export class CatalogModule {}
