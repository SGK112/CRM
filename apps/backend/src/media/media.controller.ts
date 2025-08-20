import { Controller, Post, Get, Body, Query, Param, UseGuards, Req } from '@nestjs/common';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveSubscriptionGuard } from '../billing/billing.service';
import { CapabilityGuard } from '../billing/guards/capability.guard';
import { PermissionsGuard } from '../common/permissions/permissions.guard';
import { RequiresPermissions } from '../common/permissions/permissions.decorator';

@UseGuards(JwtAuthGuard, ActiveSubscriptionGuard, CapabilityGuard, PermissionsGuard)
@Controller('media')
export class MediaController {
  constructor(private media: MediaService) {}

  @Post('sign-upload')
  @RequiresPermissions('media.upload')
  sign(@Req() req, @Body() body: any): any {
    return this.media.signUpload(req.user.workspaceId, req.user._id || req.user.id, body || {});
  }

  @Post('record')
  @RequiresPermissions('media.upload')
  record(@Req() req, @Body() body: any) {
    return this.media.createRecord(req.user.workspaceId, req.user._id || req.user.id, body);
  }

  @Get()
  @RequiresPermissions('media.read')
  list(@Req() req, @Query('projectId') projectId?: string) {
    return this.media.list(req.user.workspaceId, projectId);
  }

  @Get(':id')
  @RequiresPermissions('media.read')
  get(@Req() req, @Param('id') id: string) {
    return this.media.get(req.user.workspaceId, id);
  }
}
