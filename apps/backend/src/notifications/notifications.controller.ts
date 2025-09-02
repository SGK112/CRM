import { Controller, Get, Post, Param, Req, UseGuards, Patch, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post()
  async createNotification(
    @Body()
    data: {
      type: string;
      title: string;
      message: string;
      relatedId?: string;
      relatedType?: string;
      metadata?: Record<string, unknown>;
    },
    @Req() req
  ) {
    const userId = req.user.sub || req.user._id;
    const workspaceId = req.user.workspaceId || req.user.sub || req.user._id;

    return this.notificationsService.create({
      workspaceId,
      userId,
      ...data,
    });
  }

  @Get()
  async getNotifications(@Req() req) {
    const userId = req.user.sub || req.user._id;
    const workspaceId = req.user.workspaceId || req.user.sub || req.user._id;
    return this.notificationsService.getForUser(userId, workspaceId);
  }

  @Get('count')
  async getUnreadCount(@Req() req) {
    const userId = req.user.sub || req.user._id;
    const workspaceId = req.user.workspaceId || req.user.sub || req.user._id;
    const count = await this.notificationsService.getUnreadCount(userId, workspaceId);
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req) {
    const userId = req.user.sub || req.user._id;
    const workspaceId = req.user.workspaceId || req.user.sub || req.user._id;
    return this.notificationsService.markAsRead(id, userId, workspaceId);
  }

  @Post('mark-all-read')
  async markAllAsRead(@Req() req) {
    const userId = req.user.sub || req.user._id;
    const workspaceId = req.user.workspaceId || req.user.sub || req.user._id;
    return this.notificationsService.markAllAsRead(userId, workspaceId);
  }
}
