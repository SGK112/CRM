import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { Vendor, VendorSchema } from '../vendors/schemas/vendor.schema';
import { PriceItem, PriceItemSchema } from '../pricing/schemas/price-item.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Vendor.name, schema: VendorSchema },
    { name: PriceItem.name, schema: PriceItemSchema },
  ])],
  providers: [CatalogService],
  controllers: [CatalogController],
  exports: [CatalogService]
})
export class CatalogModule {}
