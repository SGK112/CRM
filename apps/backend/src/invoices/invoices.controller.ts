import { Controller, Get, Post, Param, Body, Req, UseGuards, Patch } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
  create(@Body() body: any, @Req() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.invoices.create(body, workspaceId);
  }

  @Post('from-estimate/:estimateId')
  convert(@Param('estimateId') estimateId: string, @Req() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.invoices.fromEstimate(estimateId, workspaceId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @Req() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.invoices.update(id, workspaceId, body);
  }

  @Post(':id/send')
  send(@Param('id') id: string, @Req() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.invoices.send(id, workspaceId);
  }

  @Post(':id/payments')
  recordPayment(@Param('id') id: string, @Body() body: any, @Req() req) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.invoices.recordPayment(id, workspaceId, body);
  }
}
