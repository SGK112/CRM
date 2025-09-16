import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>
  ) {}

  async create(data: {
    workspaceId: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedId?: string;
    relatedType?: string;
    metadata?: Record<string, unknown>;
  }) {
    const notification = new this.notificationModel(data);
    return notification.save();
  }

  async getForUser(userId: string, workspaceId: string, limit = 50) {
    return this.notificationModel
      .find({ userId, workspaceId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async markAsRead(id: string, userId: string, workspaceId: string) {
    return this.notificationModel
      .findOneAndUpdate({ _id: id, userId, workspaceId }, { read: true }, { new: true })
      .exec();
  }

  async markAllAsRead(userId: string, workspaceId: string) {
    return this.notificationModel
      .updateMany({ userId, workspaceId, read: false }, { read: true })
      .exec();
  }

  async getUnreadCount(userId: string, workspaceId: string) {
    return this.notificationModel.countDocuments({ userId, workspaceId, read: false }).exec();
  }

  // Helper methods for common notifications
  async notifyEstimateViewed(
    workspaceId: string,
    userId: string,
    estimateId: string,
    clientName: string
  ) {
    return this.create({
      workspaceId,
      userId,
      type: 'estimate_viewed',
      title: 'Estimate Viewed',
      message: `${clientName} viewed estimate`,
      relatedId: estimateId,
      relatedType: 'estimate',
    });
  }

  async notifyPaymentReceived(
    workspaceId: string,
    userId: string,
    invoiceId: string,
    amount: number
  ) {
    return this.create({
      workspaceId,
      userId,
      type: 'payment_received',
      title: 'Payment Received',
      message: `Received payment of $${amount.toFixed(2)}`,
      relatedId: invoiceId,
      relatedType: 'invoice',
    });
  }

  async notifyNewLead(workspaceId: string, userId: string, leadName: string) {
    return this.create({
      workspaceId,
      userId,
      type: 'new_lead',
      title: 'New Lead',
      message: `New lead: ${leadName}`,
      relatedType: 'client',
    });
  }
}
