import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { PDFProcessingService } from './pdf-processing.service';
import { Vendor, VendorSchema } from '../vendors/schemas/vendor.schema';
import { PriceItem, PriceItemSchema } from '../pricing/schemas/price-item.schema';

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
