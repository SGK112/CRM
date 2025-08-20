import { Body, Controller, Get, Post, Param, Req, UseGuards, Patch } from '@nestjs/common';
import { EstimatesService } from './estimates.service';
import { InvoicesService } from '../invoices/invoices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveSubscriptionGuard } from '../billing/billing.service';
import { CapabilityGuard } from '../billing/guards/capability.guard';
import { RequiresFeature } from '../billing/decorators/requires-feature.decorator';
import { PermissionsGuard } from '../common/permissions/permissions.guard';
import { RequiresPermissions } from '../common/permissions/permissions.decorator';

@Controller('estimates')
@UseGuards(JwtAuthGuard, ActiveSubscriptionGuard, CapabilityGuard, PermissionsGuard)
export class EstimatesController {
  constructor(private estimates: EstimatesService, private invoices: InvoicesService) {}

  @Get()
  @RequiresFeature('estimates.create')
  @RequiresPermissions('estimates.read')
  list(@Req() req) { return this.estimates.list(req.user.workspaceId); }

  @Post()
  @RequiresFeature('estimates.create')
  @RequiresPermissions('estimates.create')
  create(@Body() body: any, @Req() req) { return this.estimates.create(body, req.user.workspaceId); }

  @Post(':id/recalc')
  @RequiresFeature('estimates.manage')
  @RequiresPermissions('estimates.manage')
  recalc(@Param('id') id: string, @Req() req) { return this.estimates.recalc(id, req.user.workspaceId); }

  @Get(':id')
  @RequiresFeature('estimates.create')
  @RequiresPermissions('estimates.read')
  getOne(@Param('id') id: string, @Req() req) { return this.estimates.findOne(id, req.user.workspaceId); }

  @Post(':id/send')
  @RequiresFeature('estimates.send')
  @RequiresPermissions('estimates.manage')
  send(@Param('id') id: string, @Req() req) { return this.estimates.send(id, req.user.workspaceId); }

  @Post(':id/status/:status')
  @RequiresFeature('estimates.manage')
  @RequiresPermissions('estimates.manage')
  setStatus(@Param('id') id: string, @Param('status') status: string, @Req() req) { return this.estimates.updateStatus(id, req.user.workspaceId, status); }

  @Post(':id/convert')
  @RequiresFeature('invoices.create')
  @RequiresPermissions('invoices.create')
  convert(@Param('id') id: string, @Req() req) { return this.invoices.fromEstimate(id, req.user.workspaceId); }

  @Patch(':id')
  @RequiresFeature('estimates.manage')
  @RequiresPermissions('estimates.manage')
  update(@Param('id') id: string, @Body() body: any, @Req() req) { return this.estimates.update(id, req.user.workspaceId, body); }
}
