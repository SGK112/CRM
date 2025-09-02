import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Client, ClientSchema } from '../clients/schemas/client.schema';
import { Estimate, EstimateSchema } from '../estimates/schemas/estimate.schema';
import { EmailService } from '../services/email.service';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Estimate.name, schema: EstimateSchema },
      { name: Client.name, schema: ClientSchema },
    ]),
  ],
  providers: [InvoicesService, EmailService],
  controllers: [InvoicesController],
  exports: [InvoicesService],
})
export class InvoicesModule {}
