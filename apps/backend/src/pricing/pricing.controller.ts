import { Body, Controller, Get, Post, Query, Req, UseGuards, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveSubscriptionGuard } from '../billing/billing.service';
import { CapabilityGuard } from '../billing/guards/capability.guard';
import { RequiresFeature } from '../billing/decorators/requires-feature.decorator';

class BulkUpsertDto {
  items: { sku: string; name: string; description?: string; vendorId?: string; baseCost?: number; unit?: string; defaultMarginPct?: number; tags?: string[] }[];
}

class ImportPriceListDto {
  vendorId: string;
  name: string;
  description?: string;
  format: 'csv' | 'excel'; // for future expansion
  mapping: {
    skuColumn: string;
    nameColumn: string;
    descriptionColumn?: string;
    priceColumn: string;
    unitColumn?: string;
  };
}

@Controller('pricing')
@UseGuards(JwtAuthGuard)
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('items')
  @UseGuards(ActiveSubscriptionGuard, CapabilityGuard)
  @RequiresFeature('pricing.read')
  findAll(@Req() req, @Query('vendorId') vendorId?: string, @Query('search') search?: string, @Query('tags') tags?: string) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.pricingService.findAll(workspaceId, { vendorId, search, tags: tags?.split(',') });
  }

  @Post('items/bulk-upsert')
  @UseGuards(ActiveSubscriptionGuard, CapabilityGuard)
  @RequiresFeature('pricing.manage')
  bulkUpsert(@Req() req, @Body() body: BulkUpsertDto) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.pricingService.upsertMany(body.items || [], workspaceId);
  }

  @Post('items/import')
  @UseGuards(ActiveSubscriptionGuard, CapabilityGuard)
  @RequiresFeature('pricing.manage')
  @UseInterceptors(FileInterceptor('file'))
  async importPriceList(
    @Req() req,
    @UploadedFile() file: any,
    @Body() importData: ImportPriceListDto
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.pricingService.importPriceList(file, importData, workspaceId);
  }

  @Get('vendors/:vendorId/items')
  @UseGuards(ActiveSubscriptionGuard, CapabilityGuard)
  @RequiresFeature('pricing.read')
  findByVendor(@Req() req, @Query('vendorId') vendorId: string, @Query('search') search?: string) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.pricingService.findAll(workspaceId, { vendorId, search });
  }

  @Get('search')
  @UseGuards(ActiveSubscriptionGuard, CapabilityGuard)
  @RequiresFeature('pricing.read')
  searchItems(@Req() req, @Query('q') query?: string, @Query('limit') limit?: string) {
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.pricingService.searchItems(workspaceId, query, limit ? parseInt(limit) : 50);
  }
}
