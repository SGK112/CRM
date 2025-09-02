import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';
import { PriceItem, PriceItemSchema } from './schemas/price-item.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: PriceItem.name, schema: PriceItemSchema }])],
  providers: [PricingService],
  controllers: [PricingController],
  exports: [PricingService],
})
export class PricingModule {}
