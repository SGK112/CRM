import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { Estimate, EstimateSchema } from '../estimates/schemas/estimate.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Invoice.name, schema: InvoiceSchema },
    { name: Estimate.name, schema: EstimateSchema },
  ])],
  providers: [InvoicesService],
  controllers: [InvoicesController],
  exports: [InvoicesService],
})
export class InvoicesModule {}
