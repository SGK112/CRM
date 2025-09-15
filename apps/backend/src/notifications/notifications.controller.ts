import { TwilioService } from '../services/twilio.service';
import { EmailService } from '../services/email.service';
import { testNotificationIntegrations } from './notifications.service';
import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private notificationsService: NotificationsService,
    private twilioService: TwilioService,
    private emailService: EmailService
  ) {}

  /**
   * POST /notifications/test
   * Body: { phone: string, email: string }
   * Triggers test SMS and email using Twilio and SendGrid integrations.
   */
  @Post('test')
  async testNotifications(@Body() body: { phone: string; email: string }) {
    const { phone, email } = body;
    return testNotificationIntegrations(this.twilioService, this.emailService, phone, email);
  }

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
