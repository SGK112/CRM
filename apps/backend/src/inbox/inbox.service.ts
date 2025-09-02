import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InboxMessage, InboxMessageDocument } from './schemas/inbox-message.schema';
import { NotificationsService } from '../notifications/notifications.service';

export interface CreateInboxMessageDto {
  type: 'email' | 'notification' | 'sms' | 'system';
  subject: string;
  content: string;
  sender: string;
  senderName?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  threadId?: string;
  replyTo?: string;
  externalId?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  metadata?: Record<string, unknown>;
  scheduledFor?: Date;
}

export interface InboxFilterOptions {
  type?: 'email' | 'notification' | 'sms' | 'system';
  isRead?: boolean;
  isStarred?: boolean;
  isArchived?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  search?: string;
  relatedEntityType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

@Injectable()
export class InboxService {
  private readonly logger = new Logger('InboxService');

  constructor(
    @InjectModel(InboxMessage.name) private inboxMessageModel: Model<InboxMessageDocument>,
    private notificationsService: NotificationsService
  ) {}

  async createMessage(
    workspaceId: string,
    userId: string,
    messageData: CreateInboxMessageDto
  ): Promise<InboxMessageDocument> {
    const message = new this.inboxMessageModel({
      workspaceId,
      userId,
      lastActivity: new Date(),
      ...messageData,
    });

    return await message.save();
  }

  async getMessages(workspaceId: string, userId: string, options: InboxFilterOptions = {}) {
    const {
      type,
      isRead,
      isStarred,
      isArchived = false,
      priority,
      search,
      relatedEntityType,
      dateFrom,
      dateTo,
      page = 1,
      limit = 50,
    } = options;

    // Get inbox messages
    const filter: Record<string, unknown> = {
      workspaceId,
      userId,
      isDeleted: false,
      isArchived,
    };

    if (type) filter.type = type;
    if (typeof isRead === 'boolean') filter.isRead = isRead;
    if (typeof isStarred === 'boolean') filter.isStarred = isStarred;
    if (priority) filter.priority = priority;
    if (relatedEntityType) filter.relatedEntityType = relatedEntityType;

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) (filter.createdAt as Record<string, unknown>).$gte = dateFrom;
      if (dateTo) (filter.createdAt as Record<string, unknown>).$lte = dateTo;
    }

    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { sender: { $regex: search, $options: 'i' } },
        { senderName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    // Get both inbox messages and notifications
    const [inboxMessages, notifications] = await Promise.all([
      this.inboxMessageModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.notificationsService.getForUser(userId, workspaceId, limit),
    ]);

    // Convert notifications to inbox message format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const convertedNotifications = notifications.map((notification: any) => ({
      _id: notification._id,
      workspaceId: notification.workspaceId,
      userId: notification.userId,
      type: 'notification',
      subject: notification.title,
      content: notification.message,
      sender: 'System',
      senderName: 'Remodely CRM',
      isRead: notification.read || false,
      isStarred: false,
      isArchived: false,
      isDeleted: false,
      priority: 'normal',
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      lastActivity: notification.updatedAt || notification.createdAt,
      metadata: {
        actionUrl: notification.relatedId
          ? `/dashboard/${notification.relatedType}s/${notification.relatedId}`
          : undefined,
        actionLabel: notification.relatedId ? `View ${notification.relatedType}` : undefined,
      },
    }));

    // Combine and sort by creation date
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allMessages = [...inboxMessages, ...convertedNotifications]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    const totalInbox = await this.inboxMessageModel.countDocuments(filter);
    const totalNotifications = notifications.length;
    const total = totalInbox + totalNotifications;

    return {
      messages: allMessages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getMessage(
    messageId: string,
    workspaceId: string,
    userId: string
  ): Promise<InboxMessageDocument | null> {
    return await this.inboxMessageModel
      .findOne({
        _id: messageId,
        workspaceId,
        userId,
        isDeleted: false,
      })
      .exec();
  }

  async markAsRead(messageId: string, workspaceId: string, userId: string): Promise<boolean> {
    const result = await this.inboxMessageModel
      .updateOne(
        { _id: messageId, workspaceId, userId, isDeleted: false },
        {
          isRead: true,
          lastActivity: new Date(),
        }
      )
      .exec();

    return result.modifiedCount > 0;
  }

  async markAsUnread(messageId: string, workspaceId: string, userId: string): Promise<boolean> {
    const result = await this.inboxMessageModel
      .updateOne(
        { _id: messageId, workspaceId, userId, isDeleted: false },
        {
          isRead: false,
          lastActivity: new Date(),
        }
      )
      .exec();

    return result.modifiedCount > 0;
  }

  async toggleStar(messageId: string, workspaceId: string, userId: string): Promise<boolean> {
    const message = await this.getMessage(messageId, workspaceId, userId);
    if (!message) return false;

    const result = await this.inboxMessageModel
      .updateOne(
        { _id: messageId, workspaceId, userId, isDeleted: false },
        {
          isStarred: !message.isStarred,
          lastActivity: new Date(),
        }
      )
      .exec();

    return result.modifiedCount > 0;
  }

  async archiveMessage(messageId: string, workspaceId: string, userId: string): Promise<boolean> {
    const result = await this.inboxMessageModel
      .updateOne(
        { _id: messageId, workspaceId, userId, isDeleted: false },
        {
          isArchived: true,
          lastActivity: new Date(),
        }
      )
      .exec();

    return result.modifiedCount > 0;
  }

  async deleteMessage(messageId: string, workspaceId: string, userId: string): Promise<boolean> {
    const result = await this.inboxMessageModel
      .updateOne(
        { _id: messageId, workspaceId, userId, isDeleted: false },
        {
          isDeleted: true,
          lastActivity: new Date(),
        }
      )
      .exec();

    return result.modifiedCount > 0;
  }

  async markAllAsRead(
    workspaceId: string,
    userId: string,
    filter: Partial<InboxFilterOptions> = {}
  ): Promise<number> {
    const updateFilter: Record<string, unknown> = {
      workspaceId,
      userId,
      isDeleted: false,
      isRead: false,
    };

    if (filter.type) updateFilter.type = filter.type;
    if (filter.isArchived !== undefined) updateFilter.isArchived = filter.isArchived;

    const result = await this.inboxMessageModel
      .updateMany(updateFilter, {
        isRead: true,
        lastActivity: new Date(),
      })
      .exec();

    return result.modifiedCount;
  }

  async getUnreadCount(
    workspaceId: string,
    userId: string,
    type?: 'email' | 'notification' | 'sms' | 'system'
  ): Promise<number> {
    const filter: Record<string, unknown> = {
      workspaceId,
      userId,
      isRead: false,
      isDeleted: false,
      isArchived: false,
    };

    if (type) filter.type = type;

    return await this.inboxMessageModel.countDocuments(filter);
  }

  async getThreadMessages(
    threadId: string,
    workspaceId: string,
    userId: string
  ): Promise<InboxMessageDocument[]> {
    return await this.inboxMessageModel
      .find({
        threadId,
        workspaceId,
        userId,
        isDeleted: false,
      })
      .sort({ createdAt: 1 })
      .exec();
  }

  async createEmailMessage(
    workspaceId: string,
    userId: string,
    emailData: {
      from: string;
      fromName?: string;
      to: string;
      subject: string;
      content: string;
      messageId: string;
      threadId?: string;
      inReplyTo?: string;
      attachments?: Array<{
        fileName: string;
        fileSize: number;
        mimeType: string;
        url: string;
      }>;
      clientId?: string;
    }
  ): Promise<InboxMessageDocument> {
    return await this.createMessage(workspaceId, userId, {
      type: 'email',
      subject: emailData.subject,
      content: emailData.content,
      sender: emailData.from,
      senderName: emailData.fromName,
      threadId: emailData.threadId,
      replyTo: emailData.from,
      externalId: emailData.messageId,
      relatedEntityId: emailData.clientId,
      relatedEntityType: emailData.clientId ? 'client' : undefined,
      metadata: {
        attachments: emailData.attachments,
        originalHeaders: {
          to: emailData.to,
          inReplyTo: emailData.inReplyTo,
        },
        clientInfo: emailData.clientId ? { id: emailData.clientId } : undefined,
      },
    });
  }

  async createNotificationMessage(
    workspaceId: string,
    userId: string,
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
  ): Promise<InboxMessageDocument> {
    return await this.createMessage(workspaceId, userId, {
      type: 'notification',
      subject: notificationData.title,
      content: notificationData.message,
      sender: 'Remodely CRM',
      senderName: 'System',
      priority: notificationData.priority || 'normal',
      relatedEntityId: notificationData.relatedId,
      relatedEntityType: notificationData.relatedType,
      metadata: {
        actionUrl: notificationData.actionUrl,
        actionLabel: notificationData.actionLabel,
        ...notificationData.metadata,
      },
    });
  }

  async createSmsMessage(
    workspaceId: string,
    userId: string,
    smsData: {
      from: string;
      to: string;
      content: string;
      messageId: string;
      clientId?: string;
      direction: 'inbound' | 'outbound';
    }
  ): Promise<InboxMessageDocument> {
    return await this.createMessage(workspaceId, userId, {
      type: 'sms',
      subject: `SMS ${smsData.direction === 'inbound' ? 'from' : 'to'} ${smsData.from}`,
      content: smsData.content,
      sender: smsData.from,
      replyTo: smsData.from,
      externalId: smsData.messageId,
      relatedEntityId: smsData.clientId,
      relatedEntityType: smsData.clientId ? 'client' : undefined,
      metadata: {
        direction: smsData.direction,
        to: smsData.to,
        clientInfo: smsData.clientId ? { id: smsData.clientId } : undefined,
      },
    });
  }

  async getStats(
    workspaceId: string,
    userId: string
  ): Promise<{
    total: number;
    unread: number;
    starred: number;
    archived: number;
    byType: {
      email: number;
      notification: number;
      sms: number;
      system: number;
    };
    byPriority: {
      urgent: number;
      high: number;
      normal: number;
      low: number;
    };
  }> {
    const baseFilter = { workspaceId, userId, isDeleted: false };

    const [inboxStats, notificationStats] = await Promise.all([
      // Get inbox message stats
      Promise.all([
        this.inboxMessageModel.countDocuments(baseFilter),
        this.inboxMessageModel.countDocuments({ ...baseFilter, isRead: false }),
        this.inboxMessageModel.countDocuments({ ...baseFilter, isStarred: true }),
        this.inboxMessageModel.countDocuments({ ...baseFilter, isArchived: true }),
        this.inboxMessageModel.countDocuments({ ...baseFilter, type: 'email' }),
        this.inboxMessageModel.countDocuments({ ...baseFilter, type: 'notification' }),
        this.inboxMessageModel.countDocuments({ ...baseFilter, type: 'sms' }),
        this.inboxMessageModel.countDocuments({ ...baseFilter, type: 'system' }),
        this.inboxMessageModel.countDocuments({ ...baseFilter, priority: 'urgent' }),
        this.inboxMessageModel.countDocuments({ ...baseFilter, priority: 'high' }),
        this.inboxMessageModel.countDocuments({ ...baseFilter, priority: 'normal' }),
        this.inboxMessageModel.countDocuments({ ...baseFilter, priority: 'low' }),
      ]),
      // Get notification stats
      this.notificationsService.getUnreadCount(userId, workspaceId).then(count =>
        this.notificationsService.getForUser(userId, workspaceId).then(notifications => ({
          total: notifications.length,
          unread: count,
          read: notifications.filter((n: any) => n.read).length,
        }))
      ),
    ]);

    const [
      inboxTotal,
      inboxUnread,
      inboxStarred,
      inboxArchived,
      inboxEmailCount,
      inboxNotificationCount,
      inboxSmsCount,
      inboxSystemCount,
      inboxUrgentCount,
      inboxHighCount,
      inboxNormalCount,
      inboxLowCount,
    ] = inboxStats;

    return {
      total: inboxTotal + notificationStats.total,
      unread: inboxUnread + notificationStats.unread,
      starred: inboxStarred, // Notifications don't have starring
      archived: inboxArchived, // Notifications don't have archiving
      byType: {
        email: inboxEmailCount,
        notification: inboxNotificationCount + notificationStats.total,
        sms: inboxSmsCount,
        system: inboxSystemCount,
      },
      byPriority: {
        urgent: inboxUrgentCount,
        high: inboxHighCount,
        normal: inboxNormalCount + notificationStats.total, // Most notifications are normal priority
        low: inboxLowCount,
      },
    };
  }

  async sendMessage(
    workspaceId: string,
    userId: string,
    messageData: {
      type: 'email' | 'sms';
      subject: string;
      content: string;
      recipient: string;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      metadata?: Record<string, unknown>;
    }
  ): Promise<InboxMessageDocument> {
    this.logger.log(`Sending ${messageData.type} message to ${messageData.recipient}`);

    // Create the message record
    const message = new this.inboxMessageModel({
      workspaceId,
      userId,
      type: messageData.type,
      subject: messageData.subject,
      content: messageData.content,
      sender: messageData.metadata?.from || 'admin@remodely.ai',
      senderName: 'Remodely CRM',
      priority: messageData.priority || 'normal',
      isRead: false,
      isStarred: false,
      isArchived: false,
      isDeleted: false,
      metadata: {
        ...messageData.metadata,
        to: messageData.recipient,
        sentAt: new Date(),
        direction: 'outbound',
        status: 'sent',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await message.save();

    // In a real implementation, you would integrate with email/SMS services here:
    // - For emails: SendGrid, AWS SES, Mailgun, etc.
    // - For SMS: Twilio, AWS SNS, etc.

    this.logger.log(`${messageData.type} message sent successfully with ID: ${message._id}`);

    return message;
  }
}
