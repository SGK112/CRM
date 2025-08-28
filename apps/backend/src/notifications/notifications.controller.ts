import { Controller, Get, Post, Param, Req, UseGuards, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Req() req) {
    const userId = req.user.sub;
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.notificationsService.getForUser(userId, workspaceId);
  }

  @Get('count')
  async getUnreadCount(@Req() req) {
    const userId = req.user.sub;
    const workspaceId = req.user.workspaceId || req.user.sub;
    const count = await this.notificationsService.getUnreadCount(userId, workspaceId);
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req) {
    const userId = req.user.sub;
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.notificationsService.markAsRead(id, userId, workspaceId);
  }

  @Post('mark-all-read')
  async markAllAsRead(@Req() req) {
    const userId = req.user.sub;
    const workspaceId = req.user.workspaceId || req.user.sub;
    return this.notificationsService.markAllAsRead(userId, workspaceId);
  }
}
