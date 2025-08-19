import { Body, Controller, Get, Post, Param, Req, UseGuards } from '@nestjs/common';
import { EstimatesService } from './estimates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveSubscriptionGuard } from '../billing/billing.service';
import { CapabilityGuard } from '../billing/guards/capability.guard';
import { RequiresFeature } from '../billing/decorators/requires-feature.decorator';

@Controller('estimates')
@UseGuards(JwtAuthGuard, ActiveSubscriptionGuard, CapabilityGuard)
export class EstimatesController {
  constructor(private estimates: EstimatesService) {}

  @Get()
  @RequiresFeature('estimates.create')
  list(@Req() req) { return this.estimates.list(req.user.workspaceId); }

  @Post()
  @RequiresFeature('estimates.create')
  create(@Body() body: any, @Req() req) { return this.estimates.create(body, req.user.workspaceId); }

  @Post(':id/recalc')
  @RequiresFeature('estimates.manage')
  recalc(@Param('id') id: string, @Req() req) { return this.estimates.recalc(id, req.user.workspaceId); }
}
