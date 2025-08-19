import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Estimate, EstimateSchema } from './schemas/estimate.schema';
import { EstimatesService } from './estimates.service';
import { EstimatesController } from './estimates.controller';
import { PriceItem, PriceItemSchema } from '../pricing/schemas/price-item.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Estimate.name, schema: EstimateSchema },
    { name: PriceItem.name, schema: PriceItemSchema },
  ])],
  providers: [EstimatesService],
  controllers: [EstimatesController],
  exports: [EstimatesService]
})
export class EstimatesModule {}
