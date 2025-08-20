import { Controller, Get, Post, Param, Body, Req, UseGuards, Patch } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveSubscriptionGuard } from '../billing/billing.service';
import { CapabilityGuard } from '../billing/guards/capability.guard';
import { RequiresFeature } from '../billing/decorators/requires-feature.decorator';
import { PermissionsGuard } from '../common/permissions/permissions.guard';
import { RequiresPermissions } from '../common/permissions/permissions.decorator';

@Controller('invoices')
@UseGuards(JwtAuthGuard, ActiveSubscriptionGuard, CapabilityGuard, PermissionsGuard)
export class InvoicesController {
  constructor(private invoices: InvoicesService) {}

  @Get()
  @RequiresFeature('invoices.create')
  @RequiresPermissions('invoices.read')
  list(@Req() req) { return this.invoices.list(req.user.workspaceId); }

  @Get(':id')
  @RequiresFeature('invoices.manage')
  @RequiresPermissions('invoices.read')
  get(@Param('id') id: string, @Req() req) { return this.invoices.get(id, req.user.workspaceId); }

  @Post()
  @RequiresFeature('invoices.create')
  @RequiresPermissions('invoices.create')
  create(@Body() body: any, @Req() req) { return this.invoices.create(body, req.user.workspaceId); }

  @Post('from-estimate/:estimateId')
  @RequiresFeature('invoices.create')
  @RequiresPermissions('invoices.create')
  convert(@Param('estimateId') estimateId: string, @Req() req) { return this.invoices.fromEstimate(estimateId, req.user.workspaceId); }

  @Patch(':id')
  @RequiresFeature('invoices.manage')
  @RequiresPermissions('invoices.manage')
  update(@Param('id') id: string, @Body() body: any, @Req() req) { return this.invoices.update(id, req.user.workspaceId, body); }

  @Post(':id/send')
  @RequiresFeature('invoices.create')
  @RequiresPermissions('invoices.manage')
  send(@Param('id') id: string, @Req() req) { return this.invoices.send(id, req.user.workspaceId); }

  @Post(':id/payments')
  @RequiresFeature('invoices.create')
  @RequiresPermissions('payments.record')
  recordPayment(@Param('id') id: string, @Body() body: any, @Req() req) { return this.invoices.recordPayment(id, req.user.workspaceId, body); }
}
