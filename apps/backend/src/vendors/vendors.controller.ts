import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveSubscriptionGuard } from '../billing/billing.service';
import { CapabilityGuard } from '../billing/guards/capability.guard';
import { RequiresFeature } from '../billing/decorators/requires-feature.decorator';

@Controller('vendors')
@UseGuards(JwtAuthGuard, ActiveSubscriptionGuard, CapabilityGuard)
export class VendorsController {
  constructor(private vendors: VendorsService) {}

  @Post()
  @RequiresFeature('vendors.manage')
  create(@Body() body: any, @Request() req) {
    return this.vendors.create(body, req.user.workspaceId);
  }

  @Get()
  @RequiresFeature('vendors.read')
  findAll(@Request() req) {
    return this.vendors.findAll(req.user.workspaceId);
  }
}
