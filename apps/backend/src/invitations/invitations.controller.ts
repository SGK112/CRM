import { Body, Controller, Get, Post, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto, AcceptInvitationDto } from './dto/create-invitation.dto';
import { AuthGuard } from '@nestjs/passport';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { RequiresPermissions } from '../common/permissions/permissions.decorator';
import { PermissionsGuard } from '../common/permissions/permissions.guard';

@UseGuards(AuthGuard('jwt'), WorkspaceGuard, PermissionsGuard)
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @RequiresPermissions('invitations.create')
  create(@Body() dto: CreateInvitationDto, @Req() req: any) {
    return this.invitationsService.create(dto, req.workspaceId, req.user?.sub || req.user?._id);
  }

  @Get()
  @RequiresPermissions('invitations.read')
  list(@Req() req: any) {
    return this.invitationsService.list(req.workspaceId);
  }

  @Delete(':id')
  @RequiresPermissions('invitations.delete')
  revoke(@Param('id') id: string, @Req() req: any) {
    return this.invitationsService.revoke(id, req.workspaceId);
  }

  // Public acceptance (no auth) - separate controller path could be used
  @Post('accept')
  accept(@Body() dto: AcceptInvitationDto) {
    return this.invitationsService.accept(dto);
  }
}
