import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InboxService, InboxFilterOptions } from './inbox.service';

@ApiTags('Inbox')
@Controller('inbox')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InboxController {
  constructor(private readonly inboxService: InboxService) {}

  @Get()
  @ApiOperation({ summary: 'Get inbox messages' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  @ApiQuery({ name: 'type', required: false, enum: ['email', 'notification', 'sms', 'system'] })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean })
  @ApiQuery({ name: 'isStarred', required: false, type: Boolean })
  @ApiQuery({ name: 'isArchived', required: false, type: Boolean })
  @ApiQuery({ name: 'priority', required: false, enum: ['low', 'normal', 'high', 'urgent'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'relatedEntityType', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMessages(@Req() req, @Query() query: InboxFilterOptions) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.sub || req.user._id;

    return await this.inboxService.getMessages(workspaceId, userId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get inbox statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@Req() req) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.sub || req.user._id;

    return await this.inboxService.getStats(workspaceId, userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  @ApiQuery({ name: 'type', required: false, enum: ['email', 'notification', 'sms', 'system'] })
  async getUnreadCount(
    @Req() req,
    @Query('type') type?: 'email' | 'notification' | 'sms' | 'system'
  ) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.sub || req.user._id;

    const count = await this.inboxService.getUnreadCount(workspaceId, userId, type);
    return { count };
  }

  @Get('thread/:threadId')
  @ApiOperation({ summary: 'Get messages in a thread' })
  @ApiResponse({ status: 200, description: 'Thread messages retrieved successfully' })
  async getThreadMessages(@Req() req, @Param('threadId') threadId: string) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.sub || req.user._id;

    const messages = await this.inboxService.getThreadMessages(threadId, workspaceId, userId);
    return { messages };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific message' })
  @ApiResponse({ status: 200, description: 'Message retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async getMessage(@Req() req, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.sub || req.user._id;

    const message = await this.inboxService.getMessage(id, workspaceId, userId);
    if (!message) {
      return { success: false, message: 'Message not found' };
    }

    return { message };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  async markAsRead(@Req() req, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.sub || req.user._id;

    const success = await this.inboxService.markAsRead(id, workspaceId, userId);
    return { success, message: success ? 'Message marked as read' : 'Message not found' };
  }

  @Patch(':id/unread')
  @ApiOperation({ summary: 'Mark message as unread' })
  @ApiResponse({ status: 200, description: 'Message marked as unread' })
  async markAsUnread(@Req() req, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.sub || req.user._id;

    const success = await this.inboxService.markAsUnread(id, workspaceId, userId);
    return { success, message: success ? 'Message marked as unread' : 'Message not found' };
  }

  @Patch(':id/star')
  @ApiOperation({ summary: 'Toggle message star status' })
  @ApiResponse({ status: 200, description: 'Message star status toggled' })
  async toggleStar(@Req() req, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.sub || req.user._id;

    const success = await this.inboxService.toggleStar(id, workspaceId, userId);
    return { success, message: success ? 'Star status updated' : 'Message not found' };
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive message' })
  @ApiResponse({ status: 200, description: 'Message archived' })
  async archiveMessage(@Req() req, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.sub || req.user._id;

    const success = await this.inboxService.archiveMessage(id, workspaceId, userId);
    return { success, message: success ? 'Message archived' : 'Message not found' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete message' })
  @ApiResponse({ status: 200, description: 'Message deleted' })
  async deleteMessage(@Req() req, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.sub || req.user._id;

    const success = await this.inboxService.deleteMessage(id, workspaceId, userId);
    return { success, message: success ? 'Message deleted' : 'Message not found' };
  }

  @Post()
  @ApiOperation({ summary: 'Send a new message (email or SMS)' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  async sendMessage(
    @Req() req,
    @Body()
    messageData: {
      type: 'email' | 'sms';
      subject: string;
      content: string;
      recipient: string;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      metadata?: Record<string, unknown>;
    }
  ) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.sub || req.user._id;

    const message = await this.inboxService.sendMessage(workspaceId, userId, messageData);

    return {
      success: true,
      message: 'Message sent successfully',
      messageId: message._id,
    };
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all messages as read' })
  @ApiResponse({ status: 200, description: 'All messages marked as read' })
  async markAllAsRead(
    @Req() req,
    @Body()
    body: {
      type?: 'email' | 'notification' | 'sms' | 'system';
      isArchived?: boolean;
    } = {}
  ) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.sub || req.user._id;

    const count = await this.inboxService.markAllAsRead(workspaceId, userId, body);
    return {
      success: true,
      message: `${count} messages marked as read`,
      count,
    };
  }

  @Post('create-notification')
  @ApiOperation({ summary: 'Create a notification message (for system use)' })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  async createNotification(
    @Req() req,
    @Body()
    notificationData: {
      title: string;
      message: string;
      type: string;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      relatedId?: string;
      relatedType?: string;
      actionUrl?: string;
      actionLabel?: string;
      metadata?: Record<string, unknown>;
    }
  ) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.sub || req.user._id;

    const message = await this.inboxService.createNotificationMessage(
      workspaceId,
      userId,
      notificationData
    );

    return {
      success: true,
      message: 'Notification created successfully',
      messageId: message._id,
    };
  }
}
