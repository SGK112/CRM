import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AdminService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getUsers(query: {
    page?: string;
    limit?: string;
    search?: string;
    role?: string;
    subscriptionStatus?: string;
  }) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build search filter
    const filter: Record<string, unknown> = {};

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ['$firstName', ' ', '$lastName'] },
              regex: query.search,
              options: 'i',
            },
          },
        },
      ];
    }

    if (query.role) {
      filter.role = query.role;
    }

    if (query.subscriptionStatus) {
      filter.subscriptionStatus = query.subscriptionStatus;
    }

    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async getUserById(userId: string) {
    const user = await this.userModel.findById(userId).select('-password').exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get additional user statistics
    const stats = {
      totalProjects: 0, // You can implement this based on your projects collection
      totalClients: 0, // You can implement this based on your clients collection
      totalEstimates: 0, // You can implement this based on your estimates collection
      lastLoginAt: user.lastLoginAt || null,
      accountAge: (user as UserDocument & { createdAt?: Date }).createdAt
        ? Math.floor((Date.now() - (user as UserDocument & { createdAt?: Date }).createdAt!.getTime()) / (1000 * 60 * 60 * 24))
        : 0,
    };

    return {
      user,
      stats,
    };
  }

  async updateUser(
    userId: string,
    updateData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      role?: string;
      isActive?: boolean;
      subscriptionStatus?: string;
      subscriptionPlan?: string;
    }
  ) {
    // Validate email uniqueness if email is being updated
    if (updateData.email) {
      const existingUser = await this.userModel.findOne({
        email: updateData.email,
        _id: { $ne: userId },
      });

      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, { $set: updateData }, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    };
  }

  async deleteUser(userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent deletion of admin users
    if (user.role === 'owner' || user.email === 'help.remodely@gmail.com') {
      throw new BadRequestException('Cannot delete admin users');
    }

    await this.userModel.findByIdAndDelete(userId);

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  async suspendUser(userId: string) {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { isActive: false, suspendedAt: new Date() } },
        { new: true }
      )
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      message: 'User suspended successfully',
      user: updatedUser,
    };
  }

  async activateUser(userId: string) {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: { isActive: true },
          $unset: { suspendedAt: 1 },
        },
        { new: true }
      )
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      message: 'User activated successfully',
      user: updatedUser,
    };
  }

  async getDashboardStats() {
    const [totalUsers, activeUsers, newUsersThisMonth, suspendedUsers] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ isActive: true }),
      this.userModel.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
      this.userModel.countDocuments({ isActive: false }),
    ]);

    // Get subscription stats
    const subscriptionStats = await this.userModel.aggregate([
      {
        $group: {
          _id: '$subscriptionPlan',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get user growth over last 12 months
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const userGrowth = await this.userModel.aggregate([
      {
        $match: {
          createdAt: { $gte: oneYearAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    return {
      overview: {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        suspendedUsers,
        retentionRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
      },
      subscriptionDistribution: subscriptionStats,
      userGrowth,
      lastUpdated: new Date(),
    };
  }

  async getSubscriptionAnalytics(period: string = '30d') {
    let dateFilter: Date;

    switch (period) {
      case '7d':
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        dateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 30d
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const analytics = await this.userModel.aggregate([
      {
        $match: {
          createdAt: { $gte: dateFilter },
        },
      },
      {
        $group: {
          _id: {
            plan: '$subscriptionPlan',
            status: '$subscriptionStatus',
          },
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $eq: ['$subscriptionPlan', 'basic'] }, then: 29 },
                  { case: { $eq: ['$subscriptionPlan', 'professional'] }, then: 99 },
                  { case: { $eq: ['$subscriptionPlan', 'enterprise'] }, then: 299 },
                ],
                default: 0,
              },
            },
          },
        },
      },
    ]);

    return {
      period,
      analytics,
      summary: {
        totalRevenue: analytics.reduce((sum, item) => sum + item.revenue, 0),
        totalSubscriptions: analytics.reduce((sum, item) => sum + item.count, 0),
      },
    };
  }

  async getActivityLogs(query: {
    page?: string;
    limit?: string;
    userId?: string;
    action?: string;
  }) {
    // This would typically come from a separate audit log collection
    // For now, we'll return user creation/update activities from user records
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (query.userId) {
      filter._id = query.userId;
    }

    const users = await this.userModel
      .find(filter)
      .select('email firstName lastName createdAt updatedAt lastLoginAt')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    // Transform user data into activity log format
    const activities = users.flatMap(user => {
      const logs = [];

      if ((user as UserDocument & { createdAt?: Date }).createdAt) {
        logs.push({
          id: `${user._id}_created`,
          userId: user._id,
          userEmail: user.email,
          userName: `${user.firstName} ${user.lastName}`,
          action: 'user_created',
          timestamp: (user as UserDocument & { createdAt?: Date }).createdAt,
          details: 'User account created',
        });
      }

      if (user.lastLoginAt) {
        logs.push({
          id: `${user._id}_login`,
          userId: user._id,
          userEmail: user.email,
          userName: `${user.firstName} ${user.lastName}`,
          action: 'user_login',
          timestamp: user.lastLoginAt,
          details: 'User logged in',
        });
      }

      return logs;
    });

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      activities: activities.slice(0, limit),
      pagination: {
        page,
        limit,
        total: activities.length,
        hasNext: activities.length > limit,
        hasPrev: page > 1,
      },
    };
  }

  async sendNotification(notificationData: {
    userIds?: string[];
    type: 'email' | 'sms' | 'push' | 'all';
    subject: string;
    message: string;
    priority?: 'low' | 'normal' | 'high';
  }) {
    // This would integrate with your notification service
    // For now, we'll just return a success response

    let targetUsers;
    if (notificationData.userIds && notificationData.userIds.length > 0) {
      targetUsers = await this.userModel
        .find({ _id: { $in: notificationData.userIds } })
        .select('email firstName lastName phone')
        .exec();
    } else {
      // Send to all active users
      targetUsers = await this.userModel
        .find({ isActive: true })
        .select('email firstName lastName phone')
        .exec();
    }

    // Log the notification (in a real app, you'd save this to a notifications collection)

    return {
      success: true,
      message: `Notification sent successfully to ${targetUsers.length} users`,
      recipientCount: targetUsers.length,
      notificationId: `admin_${Date.now()}`, // Mock notification ID
    };
  }

  async getSystemHealth() {
    // Check database connection
    const dbStatus = await this.userModel.db.db
      .admin()
      .ping()
      .then(() => 'healthy')
      .catch(() => 'unhealthy');

    // Get basic system metrics
    const metrics = {
      database: {
        status: dbStatus,
        totalUsers: await this.userModel.countDocuments(),
        activeConnections: this.userModel.db.readyState,
      },
      server: {
        uptime: process.uptime(),
        memory: {
          used: process.memoryUsage().heapUsed / 1024 / 1024, // MB
          total: process.memoryUsage().heapTotal / 1024 / 1024, // MB
        },
        nodeVersion: process.version,
      },
      timestamp: new Date(),
    };

    return metrics;
  }

  async performBulkAction(actionData: {
    userIds: string[];
    action: 'suspend' | 'activate' | 'delete' | 'update-plan';
    data?: Record<string, unknown>;
  }) {
    const { userIds, action, data } = actionData;

    if (!userIds || userIds.length === 0) {
      throw new BadRequestException('No user IDs provided');
    }

    let result;
    const results = [];

    for (const userId of userIds) {
      try {
        switch (action) {
          case 'suspend':
            result = await this.suspendUser(userId);
            break;
          case 'activate':
            result = await this.activateUser(userId);
            break;
          case 'delete':
            result = await this.deleteUser(userId);
            break;
          case 'update-plan':
            if (!data || !data.subscriptionPlan) {
              throw new BadRequestException('Subscription plan required for update-plan action');
            }
            result = await this.updateUser(userId, { subscriptionPlan: data.subscriptionPlan as string });
            break;
          default:
            throw new BadRequestException(`Unsupported action: ${action}`);
        }

        results.push({
          userId,
          success: true,
          message: result.message,
        });
      } catch (error) {
        results.push({
          userId,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return {
      success: true,
      message: `Bulk action completed: ${successCount} successful, ${failureCount} failed`,
      results,
      summary: {
        total: userIds.length,
        successful: successCount,
        failed: failureCount,
      },
    };
  }
}
