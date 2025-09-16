import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
    CreateInvoiceDto,
    InvoicesService,
    RecordPaymentDto,
    UpdateInvoiceDto,
} from './invoices.service';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private invoices: InvoicesService) {}

  @Get()
  list(@Req() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.invoices.list(workspaceId);
  }

  @Get(':id')
  get(@Param('id') id: string, @Req() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.invoices.get(id, workspaceId);
  }

  @Post()
  create(@Body() body: CreateInvoiceDto, @Req() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.invoices.create(body, workspaceId);
  }

  @Post('from-estimate/:estimateId')
  convert(@Param('estimateId') estimateId: string, @Req() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.invoices.fromEstimate(estimateId, workspaceId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateInvoiceDto, @Req() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.invoices.update(id, workspaceId, body);
  }

  @Post(':id/send')
  send(@Param('id') id: string, @Req() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.invoices.send(id, workspaceId);
  }

  @Post(':id/payments')
  recordPayment(@Param('id') id: string, @Body() body: RecordPaymentDto, @Req() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.invoices.recordPayment(id, workspaceId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.invoices.remove(id, workspaceId);
  }

  // Download invoice as PDF
  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Req() req, @Res() res: Response) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    const result = await this.invoices.getPdf(id, workspaceId);
    if (!result) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res.send(result.buffer);
  }
}
