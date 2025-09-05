import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';

interface AdminUser {
  id: string;
  role: string;
  email: string;
}

interface AdminRequest {
  user: AdminUser;
}

interface BulkActionData {
  userIds: string[];
  action: 'suspend' | 'activate' | 'delete' | 'update-plan';
  data?: Record<string, unknown>;
}

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private async checkAdminAccess(req: AdminRequest) {
    const user = req.user;
    const isAdmin =
      user.role === 'owner' || user.role === 'admin' || user.email === 'help.remodely@gmail.com';

    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or email' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by role' })
  @ApiQuery({
    name: 'subscriptionStatus',
    required: false,
    description: 'Filter by subscription status',
  })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsers(
    @Request() req: AdminRequest,
    @Query()
    query: {
      page?: string;
      limit?: string;
      search?: string;
      role?: string;
      subscriptionStatus?: string;
    }
  ) {
    await this.checkAdminAccess(req);
    return await this.adminService.getUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details by ID' })
  @ApiResponse({ status: 200, description: 'User details retrieved successfully' })
  async getUserById(@Request() req, @Param('id') userId: string) {
    await this.checkAdminAccess(req);
    return await this.adminService.getUserById(userId);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user by admin' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async updateUser(
    @Request() req,
    @Param('id') userId: string,
    @Body()
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
    await this.checkAdminAccess(req);
    return await this.adminService.updateUser(userId, updateData);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user by admin' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async deleteUser(@Request() req, @Param('id') userId: string) {
    await this.checkAdminAccess(req);
    return await this.adminService.deleteUser(userId);
  }

  @Post('users/:id/suspend')
  @ApiOperation({ summary: 'Suspend user account' })
  @ApiResponse({ status: 200, description: 'User suspended successfully' })
  async suspendUser(@Request() req, @Param('id') userId: string) {
    await this.checkAdminAccess(req);
    return await this.adminService.suspendUser(userId);
  }

  @Post('users/:id/activate')
  @ApiOperation({ summary: 'Activate user account' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  async activateUser(@Request() req, @Param('id') userId: string) {
    await this.checkAdminAccess(req);
    return await this.adminService.activateUser(userId);
  }

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully' })
  async getDashboardStats(@Request() req) {
    await this.checkAdminAccess(req);
    return await this.adminService.getDashboardStats();
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'Get subscription analytics' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period (7d, 30d, 90d, 1y)' })
  @ApiResponse({ status: 200, description: 'Subscription analytics retrieved successfully' })
  async getSubscriptionAnalytics(@Request() req, @Query('period') period?: string) {
    await this.checkAdminAccess(req);
    return await this.adminService.getSubscriptionAnalytics(period);
  }

  @Get('activity-logs')
  @ApiOperation({ summary: 'Get user activity logs' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 50)' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'action', required: false, description: 'Filter by action type' })
  @ApiResponse({ status: 200, description: 'Activity logs retrieved successfully' })
  async getActivityLogs(
    @Request() req,
    @Query()
    query: {
      page?: string;
      limit?: string;
      userId?: string;
      action?: string;
    }
  ) {
    await this.checkAdminAccess(req);
    return await this.adminService.getActivityLogs(query);
  }

  @Post('send-notification')
  @ApiOperation({ summary: 'Send notification to users' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  async sendNotification(
    @Request() req,
    @Body()
    notificationData: {
      userIds?: string[];
      type: 'email' | 'sms' | 'push' | 'all';
      subject: string;
      message: string;
      priority?: 'low' | 'normal' | 'high';
    }
  ) {
    await this.checkAdminAccess(req);
    return await this.adminService.sendNotification(notificationData);
  }

  @Get('system/health')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200, description: 'System health status retrieved successfully' })
  async getSystemHealth(@Request() req) {
    await this.checkAdminAccess(req);
    return await this.adminService.getSystemHealth();
  }

  @Post('bulk-actions')
  @ApiOperation({ summary: 'Perform bulk actions on users' })
  @ApiResponse({ status: 200, description: 'Bulk action completed successfully' })
  async performBulkAction(
    @Request() req: AdminRequest,
    @Body() actionData: BulkActionData
  ) {
    await this.checkAdminAccess(req);
    return await this.adminService.performBulkAction(actionData);
  }
}
