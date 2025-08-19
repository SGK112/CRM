import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveSubscriptionGuard } from '../billing/billing.service';
import { CapabilityGuard } from '../billing/guards/capability.guard';
import { RequiresFeature } from '../billing/decorators/requires-feature.decorator';

@Controller('catalog')
@UseGuards(JwtAuthGuard, ActiveSubscriptionGuard, CapabilityGuard)
export class CatalogController {
  constructor(private catalog: CatalogService) {}

  @Get()
  @RequiresFeature('pricing.read')
  search(@Req() req, @Query('q') q?: string, @Query('vendorId') vendorId?: string, @Query('tag') tag?: string, @Query('limit') limit?: string) {
    return this.catalog.search(req.user.workspaceId, { q, vendorId, tag, limit: limit? parseInt(limit): undefined });
  }
}
