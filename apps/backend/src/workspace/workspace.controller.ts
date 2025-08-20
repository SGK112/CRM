import { Controller, Get, UseGuards, Req, Patch, Body } from '@nestjs/common';
import { WorkspaceUsageService } from './workspace-usage.service';
import { AuthGuard } from '@nestjs/passport';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { RequiresPermissions } from '../common/permissions/permissions.decorator';
import { PermissionsGuard } from '../common/permissions/permissions.guard';

@UseGuards(AuthGuard('jwt'), WorkspaceGuard, PermissionsGuard)
@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly usage: WorkspaceUsageService) {}

  @Get('usage/seats')
  @RequiresPermissions('workspace.usage.read')
  async seats(@Req() req: any) {
    return this.usage.seatUsage(req.workspaceId);
  }

  @Get('settings')
  @RequiresPermissions('workspace.usage.read')
  async getSettings(@Req() req: any) {
    return this.usage.getSettings(req.workspaceId);
  }

  @Patch('settings')
  @RequiresPermissions('workspace.settings.update')
  async updateSettings(@Req() req: any, @Body() body: any) {
    return this.usage.updateSettings(req.workspaceId, body);
  }
}
