import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveSubscriptionGuard } from '../billing/billing.service';
import { CapabilityGuard } from '../billing/guards/capability.guard';
import { RequiresFeature } from '../billing/decorators/requires-feature.decorator';

class BulkUpsertDto {
  items: { sku: string; name: string; description?: string; vendorId?: string; baseCost?: number; unit?: string; defaultMarginPct?: number; tags?: string[] }[];
}

@Controller('pricing')
@UseGuards(JwtAuthGuard, ActiveSubscriptionGuard, CapabilityGuard)
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('items')
  @RequiresFeature('pricing.read')
  findAll(@Req() req, @Query('vendorId') vendorId?: string) {
    return this.pricingService.findAll(req.user.workspaceId, vendorId);
  }

  @Post('items/bulk-upsert')
  @RequiresFeature('pricing.manage')
  bulkUpsert(@Req() req, @Body() body: BulkUpsertDto) {
    return this.pricingService.upsertMany(body.items || [], req.user.workspaceId);
  }
}
