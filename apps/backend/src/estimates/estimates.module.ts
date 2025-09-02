import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModule } from '../ai/ai.module';
import { Client, ClientSchema } from '../clients/schemas/client.schema';
import { InvoicesModule } from '../invoices/invoices.module';
import { PriceItem, PriceItemSchema } from '../pricing/schemas/price-item.schema';
import { EmailService } from '../services/email.service';
import { AIEstimateController } from './ai-estimate.controller';
import { AIEstimateService } from './ai-estimate.service';
import { EstimatesController } from './estimates.controller';
import { EstimatesService } from './estimates.service';
import { Estimate, EstimateSchema } from './schemas/estimate.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Estimate.name, schema: EstimateSchema },
      { name: PriceItem.name, schema: PriceItemSchema },
      { name: Client.name, schema: ClientSchema },
    ]),
    // Needed so EstimatesController can inject InvoicesService for conversions
    InvoicesModule,
    // Needed for AI services
    AiModule,
  ],
  providers: [EstimatesService, AIEstimateService, EmailService],
  controllers: [EstimatesController, AIEstimateController],
  exports: [EstimatesService, AIEstimateService],
})
export class EstimatesModule {}
