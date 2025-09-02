import { Controller, Post, Body, Param, Get, UseGuards, Req } from '@nestjs/common';
import { ShareLinksService } from './share-links.service';
import { CreateShareLinkDto, ClaimShareLinkDto } from './dto/create-share-link.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveSubscriptionGuard } from '../billing/billing.service';
import { PermissionsGuard } from '../common/permissions/permissions.guard';
import { RequiresPermissions } from '../common/permissions/permissions.decorator';

@Controller('share-links')
export class ShareLinksController {
  constructor(private service: ShareLinksService) {}

  @UseGuards(JwtAuthGuard, ActiveSubscriptionGuard, PermissionsGuard)
  @Post()
  @RequiresPermissions('share.create')
  create(@Req() req, @Body() body: CreateShareLinkDto) {
    return this.service.create(body, req.user.workspaceId, req.user._id || req.user.id);
  }

  @Post(':token/claim')
  claim(@Param('token') token: string, @Body() body: ClaimShareLinkDto) {
    return this.service.claim(token, body.password);
  }

  @UseGuards(JwtAuthGuard, ActiveSubscriptionGuard, PermissionsGuard)
  @Post(':token/revoke')
  @RequiresPermissions('share.create')
  revoke(@Param('token') token: string, @Req() req) {
    return this.service.revoke(token, req.user.workspaceId);
  }

  @UseGuards(JwtAuthGuard, ActiveSubscriptionGuard, PermissionsGuard)
  @Get()
  @RequiresPermissions('share.create')
  list(@Req() req) {
    return this.service.list(req.user.workspaceId);
  }
}
